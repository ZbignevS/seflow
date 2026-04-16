import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { UserModel } from './user.model';
import { ProfileService } from '../profile/services/profile.service';

interface UserState {
  user: UserModel | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  loaded: false,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    /**
     * Display name — prefers the user-edited fullName, falls back to the
     * name captured at sign-up, then empty string.
     */
    displayName: computed(() => {
      const u = store.user();
      return u?.fullName ?? u?.name ?? '';
    }),

    email: computed(() => store.user()?.email ?? ''),
    phone: computed(() => store.user()?.phone ?? ''),
    plan:  computed(() => store.user()?.plan ?? 'starter'),
  })),

  withMethods((store, profileService = inject(ProfileService)) => ({
    /**
     * Fetches the current user profile from the backend.
     * No-ops if state is already loaded — prevents duplicate API calls
     * when navigating between portal pages.
     */
    loadUser(): void {
      if (store.loaded()) return;

      patchState(store, { loading: true, error: null });

      profileService.getMe().subscribe({
        next: (user) =>
          patchState(store, { user, loading: false, loaded: true }),
        error: (err: { message?: string }) =>
          patchState(store, {
            loading: false,
            error: err.message ?? 'Failed to load user profile',
          }),
      });
    },

    /**
     * Seeds the store with a UserDto that is already available (e.g. returned
     * by POST /users/sync right after login). Avoids an extra GET /users/me.
     */
    setUser(user: UserModel): void {
      patchState(store, { user, loading: false, loaded: true, error: null });
    },

    /**
     * Merges a partial update into the cached user.
     * Call this after a successful PATCH /users/me to keep the store in sync
     * without a refetch.
     */
    updateUser(partial: Partial<UserModel>): void {
      const current = store.user();
      if (!current) return;
      patchState(store, { user: { ...current, ...partial } });
    },

    /**
     * Resets state to initial. Called on sign-out so the next session starts
     * fresh.
     */
    clearUser(): void {
      patchState(store, initialState);
    },
  })),
);
