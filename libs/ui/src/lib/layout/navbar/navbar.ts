import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { TranslationService } from '@core/i18n/services/translation.service';
import type { Locale } from '@core/i18n/models/locale.model';
import { AuthService } from '@core/auth/services/auth.service';
import { AuthModalService } from '@core/auth/services/auth-modal.service';
import { SnackbarService } from '@core/snackbar/snackbar.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  host: {
    '(window:scroll)': 'onWindowScroll()',
    '[class.scrolled]': 'scrolled()',
  },
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ts = inject(TranslationService);
  private readonly authService = inject(AuthService);
  private readonly authModalService = inject(AuthModalService);
  private readonly snackbar = inject(SnackbarService);

  protected readonly locale = this.ts.locale;
  protected readonly scrolled = signal(false);

  /** Null = loading / not yet resolved. */
  protected readonly currentUser = toSignal(this.authService.currentUser$, {
    initialValue: null,
  });

  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled.set(window.scrollY > 20);
    }
  }

  protected switchLocale(locale: Locale): void {
    this.ts.setLocale(locale);
  }

  protected openLogin(): void {
    this.authModalService.open('login');
  }

  protected openRegister(): void {
    this.authModalService.open('register');
  }

  protected signOut(): void {
    this.authService.signOut().subscribe({
      next: () => this.snackbar.success(this.ts.t().notifications.logoutSuccess),
    });
  }
}
