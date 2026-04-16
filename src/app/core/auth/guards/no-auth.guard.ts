import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

/**
 * Blocks authenticated users from accessing public/marketing routes.
 * Redirects them to the portal dashboard if already signed in.
 */
export const noAuthGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  await auth.authStateReady();

  if (!auth.currentUser) return true;
  return router.createUrlTree(['/portal/dashboard']);
};
