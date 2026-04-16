import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '../../../auth/firebase-admin.service';

const COUNTERS_COLLECTION = 'invoice_counters';

/**
 * Generates sequential, year-scoped invoice serial numbers.
 *
 * Format: INV-{YEAR}-{ZERO_PADDED_SEQUENCE}
 * Example: INV-2026-0001, INV-2026-0042
 *
 * Uses a Firestore atomic counter document per user per year so numbers
 * are collision-free even under concurrent saves.
 */
@Injectable()
export class SerialNumberService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async next(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const docId = `${userId}_${year}`;
    const ref = this.firebaseAdmin.firestore.collection(COUNTERS_COLLECTION).doc(docId);

    // Atomic increment via Firestore transaction
    const next = await this.firebaseAdmin.firestore.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const current: number = snap.exists ? (snap.data()!['seq'] as number) : 0;
      const incremented = current + 1;
      tx.set(ref, { seq: incremented, year, userId });
      return incremented;
    });

    return `INV-${year}-${String(next).padStart(4, '0')}`;
  }
}
