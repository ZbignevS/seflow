import { BadRequestException, Injectable } from '@nestjs/common';
import type { InvoiceDto } from '@seflow/contracts';
import { SerialNumberService } from './serial-number.service';

/**
 * Handles the invoice finalization lifecycle transition:
 *   draft / issued  →  finalized
 *
 * Once finalized an invoice is immutable. The finalized invoice receives
 * a permanent serial number (assigned here if not already set).
 */
@Injectable()
export class InvoiceFinalizationService {
  constructor(private readonly serialNumbers: SerialNumberService) {}

  /**
   * Validates that the invoice can be finalized and returns the updated
   * field set. The caller is responsible for persisting these changes.
   */
  async prepareFinalization(
    invoice: InvoiceDto,
    userId: string,
  ): Promise<Partial<InvoiceDto>> {
    if (invoice.status === 'finalized') {
      throw new BadRequestException('Invoice is already finalized.');
    }

    this.validateForFinalization(invoice);

    // Assign a permanent serial number if the invoice only has a draft placeholder
    const serialNumber =
      invoice.serialNumber.startsWith('DRAFT-')
        ? await this.serialNumbers.next(userId)
        : invoice.serialNumber;

    const now = new Date().toISOString();

    return {
      status: 'finalized',
      serialNumber,
      finalizedAt: now,
      updatedAt: now,
    };
  }

  private validateForFinalization(invoice: InvoiceDto): void {
    const errors: string[] = [];

    if (!invoice.receiver?.name) {
      errors.push('Receiver name is required.');
    }
    if (!invoice.items || invoice.items.length === 0) {
      errors.push('At least one invoice item is required.');
    }
    if (invoice.totals.total <= 0) {
      errors.push('Invoice total must be greater than zero.');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(' '));
    }
  }
}
