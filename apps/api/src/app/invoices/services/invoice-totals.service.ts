import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  InvoiceItem,
  InvoiceItemInput,
  InvoiceTotals,
  VatBreakdownLine,
  VatStatus,
} from '@seflow/contracts';

/**
 * Calculates all monetary totals for an invoice.
 * This is the single source of truth — frontend MUST NOT replicate this logic.
 */
@Injectable()
export class InvoiceTotalsService {
  /**
   * Converts raw item inputs into fully-calculated InvoiceItem objects
   * and computes aggregate InvoiceTotals.
   */
  calculate(
    inputs: InvoiceItemInput[],
    vatStatus: VatStatus,
    currency = 'EUR',
  ): { items: InvoiceItem[]; totals: InvoiceTotals } {
    const vatRate = vatStatus.effectiveRate;

    const items: InvoiceItem[] = inputs.map((input) => {
      const discountFactor = 1 - input.discount / 100;
      const subtotal = this.round(input.price * input.quantity * discountFactor);
      const vatAmount = this.round(subtotal * vatRate / 100);
      const total = this.round(subtotal + vatAmount);

      return {
        id: input.id ?? randomUUID(),
        title: input.title,
        unit: input.unit,
        quantity: input.quantity,
        price: input.price,
        discount: input.discount,
        vatRate,
        vatAmount,
        subtotal,
        total,
      };
    });

    const subtotal = this.round(items.reduce((sum, i) => sum + i.subtotal, 0));
    const vatTotal = this.round(items.reduce((sum, i) => sum + i.vatAmount, 0));
    const total = this.round(subtotal + vatTotal);

    const discountTotal = this.round(
      inputs.reduce(
        (sum, input) => sum + input.price * input.quantity * (input.discount / 100),
        0,
      ),
    );

    // Build VAT breakdown (grouped by rate)
    const vatBreakdown = this.buildVatBreakdown(items, vatStatus);

    const totals: InvoiceTotals = {
      subtotal,
      discountTotal,
      vatTotal,
      total,
      vatBreakdown,
      amountInWords: this.amountInWords(total, currency),
    };

    return { items, totals };
  }

  private buildVatBreakdown(items: InvoiceItem[], vatStatus: VatStatus): VatBreakdownLine[] {
    const groupMap = new Map<number, { taxableAmount: number; vatAmount: number }>();

    for (const item of items) {
      const existing = groupMap.get(item.vatRate) ?? { taxableAmount: 0, vatAmount: 0 };
      groupMap.set(item.vatRate, {
        taxableAmount: this.round(existing.taxableAmount + item.subtotal),
        vatAmount: this.round(existing.vatAmount + item.vatAmount),
      });
    }

    return Array.from(groupMap.entries()).map(([rate, data]) => ({
      rate,
      taxableAmount: data.taxableAmount,
      vatAmount: data.vatAmount,
      label: rate === 0 ? vatStatus.label : undefined,
    }));
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Converts a numeric total to English words for invoice footer.
   * Handles amounts up to 999,999.99.
   */
  private amountInWords(amount: number, currency: string): string {
    const units = Math.floor(amount);
    const cents = Math.round((amount - units) * 100);
    const unitName = this.currencyUnitName(currency, units);
    const body = cents === 0
      ? `${this.numberToWords(units)} ${unitName}`
      : `${this.numberToWords(units)} ${unitName} and ${this.numberToWords(cents)} ${cents === 1 ? 'cent' : 'cents'}`;
    return body.charAt(0).toUpperCase() + body.slice(1);
  }

  private currencyUnitName(currency: string, units: number): string {
    const map: Record<string, { one: string; many: string }> = {
      EUR: { one: 'euro',   many: 'euro'    },
      GBP: { one: 'pound',  many: 'pounds'  },
      USD: { one: 'dollar', many: 'dollars' },
    };
    const names = map[currency] ?? { one: currency.toLowerCase(), many: currency.toLowerCase() };
    return units === 1 ? names.one : names.many;
  }

  private numberToWords(n: number): string {
    if (n === 0) return 'zero';
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
      'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1_000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' ' + this.numberToWords(n % 100) : '');
    if (n < 1_000_000) return this.numberToWords(Math.floor(n / 1_000)) + ' thousand' + (n % 1_000 !== 0 ? ' ' + this.numberToWords(n % 1_000) : '');
    return n.toString();
  }
}
