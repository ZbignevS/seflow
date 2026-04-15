import { isPlatformBrowser } from '@angular/common';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { catchError, from, of, switchMap } from 'rxjs';

/**
 * Attaches a Firebase Bearer token to every outgoing HTTP request.
 *
 * - Skipped entirely in SSR (server has no Firebase session).
 * - Skipped when no user is signed in.
 * - Falls back to the original request if token retrieval fails
 *   (e.g. network issue during token refresh) so the server can return
 *   a proper 401 rather than the app breaking silently.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(Auth);

  if (!isPlatformBrowser(platformId) || !auth.currentUser) {
    return next(req);
  }

  return from(auth.currentUser.getIdToken()).pipe(
    switchMap(token =>
      next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })),
    ),
    catchError(() => next(req)),
  );
};
