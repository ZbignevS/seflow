import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  InvoiceDto,
  InvoiceItemInput,
  InvoiceListItemDto,
  InvoicePreviewPayload,
  InvoiceReceiver,
  ReceiverType,
  VatMode,
} from '@seflow/contracts';
import { FirebaseAdminService } from '../../auth/firebase-admin.service';
import { VatCalculationService } from './services/vat-calculation.service';
import { InvoiceTotalsService } from './services/invoice-totals.service';
import { InvoiceFinalizationService } from './services/invoice-finalization.service';
import { SerialNumberService } from './services/serial-number.service';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { UpdateInvoiceDto } from './dto/update-invoice.dto';

const INVOICES_COLLECTION = 'invoices';

/** Full Firestore document — includes server-only fields not in InvoiceDto. */
interface InvoiceDocument extends InvoiceDto {
  readonly userId: string;
}

/** Strips the server-only userId field before sending to the client. */
function toDto(doc: InvoiceDocument): InvoiceDto {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId: _uid, ...dto } = doc;
  return dto as InvoiceDto;
}

@Injectable()
export class InvoicesService {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly vatCalc: VatCalculationService,
    private readonly totalsCalc: InvoiceTotalsService,
    private readonly finalization: InvoiceFinalizationService,
    private readonly serialNumbers: SerialNumberService,
  ) {}

  // ── Queries ────────────────────────────────────────────────────────────────

  async list(userId: string): Promise<InvoiceListItemDto[]> {
    const snap = await this.firebaseAdmin.firestore
      .collection(INVOICES_COLLECTION)
      .where('userId', '==', userId)
      .get();

    return snap.docs
      .map((doc) => {
        const inv = doc.data() as InvoiceDocument;
        return { inv, createdAt: inv.createdAt };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ inv }): InvoiceListItemDto => ({
        id: inv.id,
        serialNumber: inv.serialNumber,
        status: inv.status,
        type: inv.type,
        currency: inv.currency,
        receiverName: inv.receiver?.name ?? '',
        total: inv.totals?.total ?? 0,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        createdAt: inv.createdAt,
        clientId: inv.receiver?.clientId,
      }));
  }

  async getById(userId: string, id: string): Promise<InvoiceDto> {
    return toDto(await this.requireOwned(userId, id));
  }

  // ── Commands ───────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateInvoiceDto): Promise<InvoiceDto> {
    const ref = this.firebaseAdmin.firestore.collection(INVOICES_COLLECTION).doc();
    const now = new Date().toISOString();

    const vatMode: VatMode = dto.vatMode ?? 'article_10';
    const receiverType: ReceiverType = dto.receiver?.type ?? 'local';
    const vatStatus = this.vatCalc.calculateVatStatus(
      vatMode,
      receiverType,
      dto.receiver?.vatNumber,
    );

    const itemInputs: InvoiceItemInput[] = dto.items ?? [];
    const currency = dto.currency ?? 'EUR';
    const { items, totals } = this.totalsCalc.calculate(itemInputs, vatStatus, currency);

    const receiver: InvoiceReceiver = {
      type: receiverType,
      name: dto.receiver?.name ?? '',
      ...(dto.receiver?.address && { address: dto.receiver.address }),
      ...(dto.receiver?.companyCode && { companyCode: dto.receiver.companyCode }),
      ...(dto.receiver?.vatNumber && { vatNumber: dto.receiver.vatNumber }),
      ...(dto.receiver?.phone && { phone: dto.receiver.phone }),
      ...(dto.receiver?.clientId && { clientId: dto.receiver.clientId }),
    };

    const document: InvoiceDocument = {
      id: ref.id,
      userId,
      type: dto.type ?? 'standard',
      currency: dto.currency ?? 'EUR',
      serialNumber: `DRAFT-${ref.id.slice(0, 8).toUpperCase()}`,
      status: 'draft',
      sellerId: userId,
      vatMode,
      vatStatus,
      receiver,
      items,
      totals,
      notes: dto.notes,
      dueDate: dto.dueDate,
      isAccounting: dto.isAccounting ?? false,
      issueDate: dto.issueDate ?? now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(document);
    return toDto(document);
  }

  async update(userId: string, id: string, dto: UpdateInvoiceDto): Promise<InvoiceDto> {
    const existing = await this.requireOwned(userId, id);

    if (existing.status === 'finalized') {
      throw new BadRequestException('Finalized invoices cannot be edited.');
    }

    const vatMode: VatMode = dto.vatMode ?? existing.vatMode;
    const receiverType: ReceiverType = dto.receiver?.type ?? existing.receiver?.type ?? 'local';
    const vatNumber = dto.receiver?.vatNumber ?? existing.receiver?.vatNumber;

    const vatStatus = this.vatCalc.calculateVatStatus(vatMode, receiverType, vatNumber);

    const itemInputs: InvoiceItemInput[] = dto.items ?? existing.items.map((i) => ({
      id: i.id,
      title: i.title,
      unit: i.unit,
      quantity: i.quantity,
      price: i.price,
      discount: i.discount,
    }));

    const currency = dto.currency ?? existing.currency;
    const { items, totals } = this.totalsCalc.calculate(itemInputs, vatStatus, currency);

    const receiver: InvoiceReceiver = {
      type: receiverType,
      name: dto.receiver?.name ?? existing.receiver?.name ?? '',
      address: dto.receiver?.address ?? existing.receiver?.address,
      companyCode: dto.receiver?.companyCode ?? existing.receiver?.companyCode,
      vatNumber: vatNumber,
      phone: dto.receiver?.phone ?? existing.receiver?.phone,
      clientId: dto.receiver?.clientId ?? existing.receiver?.clientId,
    };

    const updates: Partial<InvoiceDocument> = {
      updatedAt: new Date().toISOString(),
      vatMode,
      vatStatus,
      receiver,
      items,
      totals,
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.currency !== undefined && { currency: dto.currency }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
      ...(dto.isAccounting !== undefined && { isAccounting: dto.isAccounting }),
      ...(dto.issueDate !== undefined && { issueDate: dto.issueDate }),
    };

    await this.firebaseAdmin.firestore
      .collection(INVOICES_COLLECTION)
      .doc(id)
      .update(updates as Record<string, unknown>);

    return { ...existing, ...updates } as InvoiceDto;
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await this.requireOwned(userId, id);

    if (existing.status === 'finalized') {
      throw new BadRequestException('Finalized invoices cannot be deleted.');
    }

    await this.firebaseAdmin.firestore
      .collection(INVOICES_COLLECTION)
      .doc(id)
      .delete();
  }

  async finalize(userId: string, id: string): Promise<InvoiceDto> {
    const existing = await this.requireOwned(userId, id);
    const changes = await this.finalization.prepareFinalization(existing, userId);

    await this.firebaseAdmin.firestore
      .collection(INVOICES_COLLECTION)
      .doc(id)
      .update(changes as Record<string, unknown>);

    return { ...existing, ...changes } as InvoiceDto;
  }

  async preview(userId: string, id: string): Promise<InvoicePreviewPayload> {
    const existing = await this.requireOwned(userId, id);

    // Fetch seller info from users collection
    const userSnap = await this.firebaseAdmin.firestore
      .collection('users')
      .where('firebaseUid', '==', userId)
      .limit(1)
      .get();

    const userDoc = userSnap.docs[0]?.data() ?? {};

    return {
      invoice: toDto(existing),
      sellerName: (userDoc['fullName'] as string) ?? (userDoc['name'] as string) ?? '',
      sellerEmail: (userDoc['email'] as string) ?? '',
      sellerVatNumber: userDoc['vatNumber'] as string | undefined,
      sellerBankAccount: userDoc['bankAccount'] as string | undefined,
      generatedAt: new Date().toISOString(),
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async requireOwned(userId: string, id: string): Promise<InvoiceDocument> {
    const snap = await this.firebaseAdmin.firestore
      .collection(INVOICES_COLLECTION)
      .doc(id)
      .get();

    if (!snap.exists) throw new NotFoundException('Invoice not found.');

    const doc = snap.data() as InvoiceDocument;
    if (doc.userId !== userId) throw new NotFoundException('Invoice not found.');

    return doc;
  }
}
