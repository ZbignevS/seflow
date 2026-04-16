export type AuthProvider = 'password' | 'google';
export type UserRole = 'user' | 'admin';
export type UserPlan = 'starter' | 'pro';

export interface UserDto {
  readonly firebaseUid: string;
  readonly email: string;
  readonly name: string;
  readonly provider: AuthProvider;
  readonly createdAt: string; // ISO 8601
  readonly role: UserRole;
  readonly fullName?: string;
  readonly phone?: string;
  readonly plan?: UserPlan;
}

/** Body sent to POST /users/sync after a successful Firebase login */
export interface SyncUserRequestDto {
  readonly name: string;
  readonly provider: AuthProvider;
}

/** Body sent to PATCH /users/me */
export interface UpdateUserRequest {
  readonly fullName?: string;
  readonly phone?: string;
}

/** Body sent to PATCH /users/change-password */
export interface ChangePasswordRequest {
  readonly newPassword: string;
}
