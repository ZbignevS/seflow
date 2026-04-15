import { Injectable } from '@nestjs/common';
import type { AuthProvider, UserDto } from '@seflow/contracts';
import { FirebaseAdminService } from '../auth/firebase-admin.service';

const USERS_COLLECTION = 'users';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  /**
   * Returns the existing Firestore user document for the given UID, or
   * creates a new one with the provided details if it does not yet exist.
   */
  async createUserIfNotExists(
    firebaseUid: string,
    email: string,
    name: string,
    provider: AuthProvider,
  ): Promise<UserDto> {
    const ref = this.firebaseAdmin.firestore
      .collection(USERS_COLLECTION)
      .doc(firebaseUid);

    const snap = await ref.get();
    if (snap.exists) {
      return snap.data() as UserDto;
    }

    const newUser: UserDto = {
      firebaseUid,
      email,
      name,
      provider,
      createdAt: new Date().toISOString(),
      role: 'user',
    };

    await ref.set(newUser);
    return newUser;
  }

  async getUserById(firebaseUid: string): Promise<UserDto | null> {
    const snap = await this.firebaseAdmin.firestore
      .collection(USERS_COLLECTION)
      .doc(firebaseUid)
      .get();

    return snap.exists ? (snap.data() as UserDto) : null;
  }
}
