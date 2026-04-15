import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Request } from 'express';

/** Express Request extended with the verified Firebase token payload. */
export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}
