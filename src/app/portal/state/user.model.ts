import type { UserDto } from '@seflow/contracts';

/**
 * UserModel is the canonical user type used throughout the portal.
 * It is a direct alias for UserDto so shared contracts remain the single
 * source of truth — no duplication of field definitions.
 */
export type UserModel = UserDto;
