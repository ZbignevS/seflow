export type AuthProvider = 'password' | 'google';
export type UserRole = 'user' | 'admin';

export interface UserDto {
  readonly firebaseUid: string;
  readonly email: string;
  readonly name: string;
  readonly provider: AuthProvider;
  readonly createdAt: string; // ISO 8601
  readonly role: UserRole;
}

/** Body sent to POST /users/sync after a successful Firebase login */
export interface SyncUserRequestDto {
  readonly name: string;
  readonly provider: AuthProvider;
}
