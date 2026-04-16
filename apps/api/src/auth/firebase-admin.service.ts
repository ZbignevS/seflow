import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

/**
 * Initialises the Firebase Admin SDK once and exposes typed handles for Auth
 * and Firestore. Uses environment variables so credentials are never stored in
 * source code.
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (the raw key from the JSON — newlines as \n)
 */
@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app!: App;

  onModuleInit(): void {
    const projectId = process.env['FIREBASE_PROJECT_ID'];
    const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
    const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, ' +
          'FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY env vars.',
      );
    }

    if (getApps().length === 0) {
      this.app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
      this.logger.log('Firebase Admin initialised');
    } else {
      this.app = getApp();
      this.logger.log('Reusing existing Firebase Admin app');
    }

    // Firestore throws on undefined field values by default — ignore them so
    // optional fields (notes, dueDate, etc.) don't need explicit null-checks.
    getFirestore(this.app).settings({ ignoreUndefinedProperties: true });
  }

  get auth(): Auth {
    return getAuth(this.app);
  }

  get firestore(): Firestore {
    return getFirestore(this.app);
  }
}
