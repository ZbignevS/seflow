import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnackbarComponent } from './core/snackbar/snackbar';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SnackbarComponent],
  template: `
    <router-outlet />
    <app-snackbar />
  `,
})
export class App {}
