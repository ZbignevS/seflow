import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ExpenseDto,
  ExpenseListItemDto,
  ExpenseType,
  FixedAssetData,
} from '@seflow/contracts';
import { FirebaseAdminService } from '../../auth/firebase-admin.service';
import type { CreateExpenseDto } from './dto/create-expense.dto';
import type { UpdateExpenseDto } from './dto/update-expense.dto';

const EXPENSES_COLLECTION = 'expenses';

/** Full Firestore document — includes server-only fields not in ExpenseDto. */
interface ExpenseDocument extends ExpenseDto {
  readonly userId: string;
}

/** Strips the server-only userId field before sending to the client. */
function toDto(doc: ExpenseDocument): ExpenseDto {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId: _uid, ...dto } = doc;
  return dto as ExpenseDto;
}

/** Calculates vatAmount and totalAmount from amount + vatRate. */
function calcTotals(amount: number, vatRate: number): { vatAmount: number; totalAmount: number } {
  const vatAmount = Math.round(amount * vatRate) / 100;
  const totalAmount = Math.round((amount + vatAmount) * 100) / 100;
  return { vatAmount, totalAmount };
}

@Injectable()
export class ExpensesService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  // ── Queries ────────────────────────────────────────────────────────────────

  async list(userId: string): Promise<ExpenseListItemDto[]> {
    const snap = await this.firebaseAdmin.firestore
      .collection(EXPENSES_COLLECTION)
      .where('userId', '==', userId)
      .get();

    return snap.docs
      .map((doc) => {
        const exp = doc.data() as ExpenseDocument;
        return { exp, date: exp.date };
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ exp }): ExpenseListItemDto => ({
        id: exp.id,
        type: exp.type,
        supplierName: exp.supplierName,
        receiptNumber: exp.receiptNumber,
        name: exp.name,
        amount: exp.amount,
        vatAmount: exp.vatAmount,
        totalAmount: exp.totalAmount,
        date: exp.date,
        isPaid: exp.isPaid,
        createdAt: exp.createdAt,
      }));
  }

  async getById(userId: string, id: string): Promise<ExpenseDto> {
    return toDto(await this.requireOwned(userId, id));
  }

  // ── Commands ───────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateExpenseDto): Promise<ExpenseDto> {
    const ref = this.firebaseAdmin.firestore.collection(EXPENSES_COLLECTION).doc();
    const now = new Date().toISOString();

    const amount = dto.amount ?? 0;
    const vatRate = dto.vatRate ?? 0;
    const { vatAmount, totalAmount } = calcTotals(amount, vatRate);

    const document: ExpenseDocument = {
      id: ref.id,
      userId,
      type: (dto.type ?? 'general') as ExpenseType,
      supplierName: dto.supplierName ?? '',
      ...(dto.supplierCode && { supplierCode: dto.supplierCode }),
      ...(dto.receiptNumber && { receiptNumber: dto.receiptNumber }),
      name: dto.name ?? '',
      amount,
      vatRate,
      vatAmount,
      totalAmount,
      date: dto.date ?? now.slice(0, 10),
      isPaid: dto.isPaid ?? false,
      ...(dto.attachmentUrl && { attachmentUrl: dto.attachmentUrl }),
      ...(dto.fixedAssetData && { fixedAssetData: dto.fixedAssetData as FixedAssetData }),
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(document);
    return toDto(document);
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto): Promise<ExpenseDto> {
    const existing = await this.requireOwned(userId, id);

    const amount = dto.amount !== undefined ? dto.amount : existing.amount;
    const vatRate = dto.vatRate !== undefined ? dto.vatRate : existing.vatRate;
    const { vatAmount, totalAmount } = calcTotals(amount, vatRate);

    const updates: Partial<ExpenseDocument> = {
      updatedAt: new Date().toISOString(),
      amount,
      vatRate,
      vatAmount,
      totalAmount,
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.supplierName !== undefined && { supplierName: dto.supplierName }),
      ...(dto.supplierCode !== undefined && { supplierCode: dto.supplierCode }),
      ...(dto.receiptNumber !== undefined && { receiptNumber: dto.receiptNumber }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.date !== undefined && { date: dto.date }),
      ...(dto.isPaid !== undefined && { isPaid: dto.isPaid }),
      ...(dto.attachmentUrl !== undefined && { attachmentUrl: dto.attachmentUrl }),
      ...(dto.fixedAssetData !== undefined && { fixedAssetData: dto.fixedAssetData as FixedAssetData }),
    };

    await this.firebaseAdmin.firestore
      .collection(EXPENSES_COLLECTION)
      .doc(id)
      .update(updates as Record<string, unknown>);

    return { ...existing, ...updates } as ExpenseDto;
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.requireOwned(userId, id);

    await this.firebaseAdmin.firestore
      .collection(EXPENSES_COLLECTION)
      .doc(id)
      .delete();
  }

  async togglePaid(userId: string, id: string): Promise<ExpenseDto> {
    const existing = await this.requireOwned(userId, id);

    const updates = {
      isPaid: !existing.isPaid,
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseAdmin.firestore
      .collection(EXPENSES_COLLECTION)
      .doc(id)
      .update(updates);

    return { ...existing, ...updates } as ExpenseDto;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async requireOwned(userId: string, id: string): Promise<ExpenseDocument> {
    const snap = await this.firebaseAdmin.firestore
      .collection(EXPENSES_COLLECTION)
      .doc(id)
      .get();

    if (!snap.exists) throw new NotFoundException('Expense not found.');

    const doc = snap.data() as ExpenseDocument;
    if (doc.userId !== userId) throw new NotFoundException('Expense not found.');

    return doc;
  }
}
