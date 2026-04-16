import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { AuthService } from '@core/auth/services/auth.service';
import { SnackbarService } from '@core/snackbar/snackbar.service';
import { TranslationService } from '@core/i18n/services/translation.service';
import { ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'app-portal-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './portal-navbar.html',
  styleUrl: './portal-navbar.scss',
})
export class PortalNavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly snackbar = inject(SnackbarService);
  private readonly ts = inject(TranslationService);
  private readonly router = inject(Router);

  protected readonly themeService = inject(ThemeService);

  protected readonly currentUser = toSignal(this.authService.currentUser$, {
    initialValue: null,
  });

  protected signOut(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.snackbar.success(this.ts.t().notifications.logoutSuccess);
        this.router.navigate(['/']);
      },
    });
  }
}
