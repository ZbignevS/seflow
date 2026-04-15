import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SnackbarService } from './snackbar.service';

@Component({
  selector: 'app-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.scss',
  host: {
    'aria-live': 'polite',
    'aria-atomic': 'false',
  },
})
export class SnackbarComponent {
  protected readonly snackbar = inject(SnackbarService);

  protected dismiss(id: number): void {
    this.snackbar.dismiss(id);
  }
}
