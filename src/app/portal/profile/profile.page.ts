import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { AbstractControl, ReactiveFormsModule, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '@core/auth/services/auth.service';
import { SnackbarService } from '@core/snackbar/snackbar.service';
import { TranslationService } from '@core/i18n/services/translation.service';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { PricingSectionComponent } from '@features/landing/components/pricing-section/pricing-section';
import { UserStore } from '../state/user.store';
import { ProfileService } from './services/profile.service';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';
import type { PlanId } from '@seflow/contracts';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newPassword')?.value as string;
  const repeat = group.get('repeatPassword')?.value as string;
  if (pw && repeat && pw !== repeat) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
    PricingSectionComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userStore = inject(UserStore);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly snackbar = inject(SnackbarService);
  private readonly ts = inject(TranslationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  // ── Store selectors ──────────────────────────────────────────────────────────

  /** True when the user signed in via Google (provider-managed password). */
  protected readonly isGoogleUser = computed(() =>
    this.userStore.user()?.provider === 'google',
  );

  protected readonly currentPlan = computed<PlanId>(() => this.userStore.plan());

  // ── Form setup ───────────────────────────────────────────────────────────────

  protected readonly profileForm = this.fb.group({
    fullName: [''],
    email: [{ value: '', disabled: true }],
    phone: [''],
  });

  protected readonly passwordForm = this.fb.group(
    {
      newPassword: ['', [Validators.minLength(6)]],
      repeatPassword: [''],
    },
    { validators: passwordMatchValidator },
  );

  protected readonly promoCode = signal('');
  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);

  protected readonly passwordMismatch = computed(() => {
    return this.passwordForm.errors?.['passwordMismatch'] === true &&
      (this.passwordForm.get('repeatPassword')?.dirty ?? false);
  });

  constructor() {
    // Patch the form exactly once when the store has loaded user data.
    // The guard prevents overwriting any edits the user has already typed.
    effect(() => {
      const user = this.userStore.user();
      if (!user) return;

      this.profileForm.patchValue({
        fullName: user.fullName ?? user.name ?? '',
        phone: user.phone ?? '',
        email: user.email,
      }, { emitEvent: false });
    }, { allowSignalWrites: true });
  }

  // ── Save profile ─────────────────────────────────────────────────────────────

  protected saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) return;

    const { fullName, phone } = this.profileForm.getRawValue() as {
      fullName: string;
      phone: string;
    };

    this.savingProfile.set(true);
    this.profileService.updateUser({ fullName: fullName || undefined, phone: phone || undefined })
      .subscribe({
        next: (updated) => {
          // Keep store in sync — no refetch needed
          this.userStore.updateUser(updated);
          this.snackbar.success(this.ts.t().portal.profile.saveSuccess);
          this.savingProfile.set(false);
        },
        error: () => {
          this.snackbar.error(this.ts.t().notifications.genericError);
          this.savingProfile.set(false);
        },
      });
  }

  // ── Change password ───────────────────────────────────────────────────────────

  protected savePassword(): void {
    if (this.passwordForm.invalid || this.savingPassword()) return;
    const { newPassword } = this.passwordForm.value as { newPassword: string };
    if (!newPassword) return;

    this.savingPassword.set(true);
    this.profileService.changePassword({ newPassword }).subscribe({
      next: () => {
        this.snackbar.success(this.ts.t().portal.profile.passwordChanged);
        this.passwordForm.reset();
        this.savingPassword.set(false);
      },
      error: () => {
        this.snackbar.error(this.ts.t().notifications.genericError);
        this.savingPassword.set(false);
      },
    });
  }

  // ── Promo code ────────────────────────────────────────────────────────────────

  protected applyPromo(): void {
    // UI-only — no backend logic yet
  }

  // ── Upgrade plan ─────────────────────────────────────────────────────────────

  protected onUpgradeRequested(planId: PlanId): void {
    this.snackbar.info(`Upgrade to ${planId} — coming soon`);
  }

  // ── Delete account ────────────────────────────────────────────────────────────

  protected openDeleteDialog(): void {
    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      autoFocus: 'dialog',
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.profileService.deleteAccount().subscribe({
        next: () => {
          this.authService.signOut().subscribe(() => {
            this.router.navigate(['/']);
          });
        },
        error: () => {
          this.snackbar.error(this.ts.t().notifications.genericError);
        },
      });
    });
  }
}
