import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Auth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { catchError, from, Observable, switchMap, tap, throwError } from 'rxjs';

import { environment } from '@env';
import type { AuthProvider, SyncUserRequestDto, UserDto } from '@seflow/contracts';
import { UserStore } from '../../../portal/state/user.store';

/** Synthetic error code emitted when the user's email is registered via Google only. */
export const WRONG_PROVIDER_GOOGLE = 'auth/provider-mismatch-google';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  private readonly userStore = inject(UserStore);

  /**
   * Emits the current Firebase user (null when signed out).
   * Wrapped in runInInjectionContext so AngularFire's internal zone/injection
   * checks pass correctly during SSR and in the RC build.
   */
  readonly currentUser$: Observable<User | null> = runInInjectionContext(
    this.injector,
    () => user(this.auth),
  );

  signUpWithEmail(email: string, password: string, name: string): Observable<UserDto> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(credential => this.syncUser(credential.user, name, 'password')),
    );
  }

  /**
   * Signs the user in with email and password.
   *
   * If the credentials are invalid AND the email is registered exclusively via
   * Google, re-throws a synthetic `auth/provider-mismatch-google` error so the
   * UI can show a targeted message instead of a generic "wrong password".
   *
   * Note: the provider check uses `fetchSignInMethodsForEmail` which returns an
   * empty array when Firebase Email Enumeration Protection is enabled. In that
   * case we fall back to the original Firebase error.
   */
  signInWithEmail(email: string, password: string): Observable<UserDto> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(credential =>
        this.syncUser(credential.user, credential.user.displayName ?? '', 'password'),
      ),
      catchError((err: { code?: string }) => {
        const isInvalidCredential =
          err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password';

        if (!isInvalidCredential) return throwError(() => err);

        // Secondary check: is this email registered with Google only?
        return from(fetchSignInMethodsForEmail(this.auth, email)).pipe(
          switchMap(methods => {
            const googleOnly =
              methods.includes('google.com') && !methods.includes('password');
            return throwError(() =>
              googleOnly ? { code: WRONG_PROVIDER_GOOGLE } : err,
            );
          }),
          // If fetchSignInMethodsForEmail itself fails (e.g. enumeration
          // protection is on), surface the original credential error.
          catchError(inner =>
            throwError(() => (inner.code === WRONG_PROVIDER_GOOGLE ? inner : err)),
          ),
        );
      }),
    );
  }

  signInWithGoogle(): Observable<UserDto> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      switchMap(credential =>
        this.syncUser(credential.user, credential.user.displayName ?? '', 'google'),
      ),
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => this.userStore.clearUser()),
    );
  }

  private syncUser(firebaseUser: User, name: string, provider: AuthProvider): Observable<UserDto> {
    const body: SyncUserRequestDto = { name, provider };
    return from(firebaseUser.getIdToken()).pipe(
      switchMap(token =>
        this.http.post<UserDto>(`${environment.apiUrl}/users/sync`, body, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
      // Seed the store immediately so portal pages never need a separate
      // GET /users/me call after a fresh login.
      tap(userDto => this.userStore.setUser(userDto)),
    );
  }
}
