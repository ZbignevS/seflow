import { Injectable, NotFoundException } from '@nestjs/common';
import type { ClientDto } from '@seflow/contracts';
import { FirebaseAdminService } from '../../auth/firebase-admin.service';
import type { CreateClientDto } from './dto/create-client.dto';
import type { UpdateClientDto } from './dto/update-client.dto';

const CLIENTS_COLLECTION = 'clients';

/** Firestore document shape — extends ClientDto with server-only fields. */
interface ClientDocument extends ClientDto {
  readonly userId: string;
  readonly createdAt: string;
}

@Injectable()
export class ClientsService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async getClients(userId: string): Promise<ClientDto[]> {
    const snap = await this.firebaseAdmin.firestore
      .collection(CLIENTS_COLLECTION)
      .where('userId', '==', userId)
      .get();

    return snap.docs
      .map((doc) => {
        const { userId: _uid, createdAt: _ts, ...client } = doc.data() as ClientDocument;
        return { client: client as ClientDto, createdAt: _ts };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ client }) => client);
  }

  async getClientById(userId: string, clientId: string): Promise<ClientDto> {
    const snap = await this.firebaseAdmin.firestore
      .collection(CLIENTS_COLLECTION)
      .doc(clientId)
      .get();

    if (!snap.exists || (snap.data() as ClientDocument).userId !== userId) {
      throw new NotFoundException('Client not found');
    }

    const { userId: _uid, createdAt: _ts, ...client } = snap.data() as ClientDocument;
    return client as ClientDto;
  }

  async createClient(userId: string, dto: CreateClientDto): Promise<ClientDto> {
    const ref = this.firebaseAdmin.firestore.collection(CLIENTS_COLLECTION).doc();

    const document: ClientDocument = {
      id: ref.id,
      userId,
      name: dto.name,
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.companyCode !== undefined && { companyCode: dto.companyCode }),
      ...(dto.vatCode !== undefined && { vatCode: dto.vatCode }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      clientType: dto.clientType,
      taxResidency: dto.taxResidency,
      createdAt: new Date().toISOString(),
      invoiceSummary: {
        totalInvoicesCount: 0,
        totalAmount: 0,
        unpaidAmount: 0,
      },
    };

    await ref.set(document);

    const { userId: _uid, createdAt: _ts, ...client } = document;
    return client as ClientDto;
  }

  async updateClient(
    userId: string,
    clientId: string,
    dto: UpdateClientDto,
  ): Promise<ClientDto> {
    const ref = this.firebaseAdmin.firestore
      .collection(CLIENTS_COLLECTION)
      .doc(clientId);

    const snap = await ref.get();
    if (!snap.exists || (snap.data() as ClientDocument).userId !== userId) {
      throw new NotFoundException('Client not found');
    }

    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates['name'] = dto.name;
    if (dto.address !== undefined) updates['address'] = dto.address;
    if (dto.companyCode !== undefined) updates['companyCode'] = dto.companyCode;
    if (dto.vatCode !== undefined) updates['vatCode'] = dto.vatCode;
    if (dto.phone !== undefined) updates['phone'] = dto.phone;
    if (dto.clientType !== undefined) updates['clientType'] = dto.clientType;
    if (dto.taxResidency !== undefined) updates['taxResidency'] = dto.taxResidency;

    if (Object.keys(updates).length > 0) {
      await ref.update(updates);
    }

    const updated = await ref.get();
    const { userId: _uid, createdAt: _ts, ...client } = updated.data() as ClientDocument;
    return client as ClientDto;
  }

  async deleteClient(userId: string, clientId: string): Promise<void> {
    const ref = this.firebaseAdmin.firestore
      .collection(CLIENTS_COLLECTION)
      .doc(clientId);

    const snap = await ref.get();
    if (!snap.exists || (snap.data() as ClientDocument).userId !== userId) {
      throw new NotFoundException('Client not found');
    }

    await ref.delete();
  }
}
