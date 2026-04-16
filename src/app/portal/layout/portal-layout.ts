import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/auth/services/auth.service';
import { UserStore } from '../state/user.store';
import { PortalNavbarComponent } from './portal-navbar/portal-navbar';

@Component({
  selector: 'app-portal-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PortalNavbarComponent],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.scss',
})
export class PortalLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly userStore = inject(UserStore);

  private readonly currentUser = toSignal(this.authService.currentUser$, {
    initialValue: null,
  });

  constructor() {
    // Runs once when the portal is entered and again whenever auth state
    // changes (e.g. token refresh, sign-out).
    // loadUser() is a no-op when state.loaded === true, so navigating between
    // portal pages never triggers a second API call.
    effect(() => {
      if (this.currentUser()) {
        this.userStore.loadUser();
      } else {
        this.userStore.clearUser();
      }
    });
  }
}
