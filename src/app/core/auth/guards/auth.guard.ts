import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

/**
 * Protects routes that require authentication.
 * Uses Firebase's `authStateReady()` to wait for the auth state to be
 * resolved before checking, avoiding a false redirect on first load.
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  await auth.authStateReady();

  if (auth.currentUser) return true;
  return router.createUrlTree(['/']);
};
