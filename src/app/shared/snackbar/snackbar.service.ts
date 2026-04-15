import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarItem {
  readonly id: number;
  readonly message: string;
  readonly type: SnackbarType;
  /** True while the exit animation is playing. */
  dismissing: boolean;
}

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 220;

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private counter = 0;
  private readonly _items = signal<SnackbarItem[]>([]);

  readonly items = this._items.asReadonly();

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  dismiss(id: number): void {
    const item = this._items().find(i => i.id === id);
    if (!item || item.dismissing) return;

    // Play exit animation first, then remove from DOM.
    this._items.update(list =>
      list.map(i => (i.id === id ? { ...i, dismissing: true } : i)),
    );
    setTimeout(() => {
      this._items.update(list => list.filter(i => i.id !== id));
    }, EXIT_ANIMATION_MS);
  }

  private add(message: string, type: SnackbarType): void {
    const id = ++this.counter;
    this._items.update(list => [...list, { id, message, type, dismissing: false }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}
