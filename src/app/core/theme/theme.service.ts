import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly systemDark = signal(false);

  /** Explicit user preference. `null` means "follow system". */
  readonly preference = signal<'light' | 'dark' | null>(this.readStored());

  /** Resolved dark state — combines explicit preference with system default. */
  readonly isDark = computed(() => {
    const pref = this.preference();
    return pref !== null ? pref === 'dark' : this.systemDark();
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(mq.matches);
      mq.addEventListener('change', e => this.systemDark.set(e.matches));
    }

    effect(() => this.apply(this.preference()));
  }

  toggle(): void {
    this.preference.set(this.isDark() ? 'light' : 'dark');
  }

  private readStored(): 'light' | 'dark' | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const v = localStorage.getItem('theme');
    return v === 'dark' || v === 'light' ? v : null;
  }

  private apply(pref: 'light' | 'dark' | null): void {
    const html = this.document.documentElement;
    if (pref) {
      html.setAttribute('data-theme', pref);
    } else {
      html.removeAttribute('data-theme');
    }
    if (isPlatformBrowser(this.platformId)) {
      if (pref) {
        localStorage.setItem('theme', pref);
      } else {
        localStorage.removeItem('theme');
      }
    }
  }
}
