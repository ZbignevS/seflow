import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService, WRONG_PROVIDER_GOOGLE } from '../services/auth.service';
import { SnackbarService } from '../../snackbar/snackbar.service';
import { TranslationService } from '../../i18n/services/translation.service';
import type { AuthDialogData, AuthTab } from '../services/auth-modal.service';

@Component({
  selector: 'app-auth-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.scss',
})
export class AuthModalComponent {
  private readonly dialogRef = inject(MatDialogRef<AuthModalComponent>);
  private readonly data = inject<AuthDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackbar = inject(SnackbarService);
  private readonly ts = inject(TranslationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly activeTab = signal<AuthTab>(this.data.initialTab ?? 'login');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected setTab(tab: AuthTab): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  protected onLogin(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService
      .signInWithEmail(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.ts.t().notifications.loginSuccess);
          this.dialogRef.close();
        },
        error: (err: { code?: string }) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.toErrorMessage(err));
        },
      });
  }

  protected onRegister(): void {
    if (this.registerForm.invalid || this.isLoading()) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { email, password, name } = this.registerForm.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService
      .signUpWithEmail(email, password, name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.ts.t().notifications.registerSuccess);
          this.dialogRef.close();
        },
        error: (err: { code?: string }) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.toErrorMessage(err));
        },
      });
  }

  protected onGoogleSignIn(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService
      .signInWithGoogle()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.ts.t().notifications.loginSuccess);
          this.dialogRef.close();
        },
        error: (err: { code?: string }) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.toErrorMessage(err));
        },
      });
  }

  private toErrorMessage(err: { code?: string }): string {
    switch (err?.code) {
      case WRONG_PROVIDER_GOOGLE:
        return 'This email is registered via Google. Use "Continue with Google" to sign in.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password must be at least 8 characters.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      case 'auth/network-request-failed':
        return 'Network error — please try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
