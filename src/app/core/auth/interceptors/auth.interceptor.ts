import { isPlatformBrowser } from '@angular/common';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { catchError, from, switchMap } from 'rxjs';

/**
 * Attaches a Firebase Bearer token to every outgoing HTTP request.
 *
 * - Skipped entirely in SSR (server has no Firebase session).
 * - Skipped when no user is signed in.
 * - Uses authStateReady() to ensure Firebase has restored the persisted
 *   session before checking currentUser — avoids the race condition where
 *   currentUser is null during the brief initialization window.
 * - Falls back to the original request if token retrieval fails so the
 *   server can return a proper 401 rather than the app breaking silently.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(Auth);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  return from(auth.authStateReady()).pipe(
    switchMap(() => {
      if (!auth.currentUser) return next(req);

      return from(auth.currentUser.getIdToken()).pipe(
        switchMap(token =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })),
        ),
        catchError(() => next(req)),
      );
    }),
  );
};
