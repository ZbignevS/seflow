// ── Primitives ────────────────────────────────────────────────────────────────

export type InvoiceType = 'standard' | 'advance' | 'credit';
export type InvoiceStatus = 'draft' | 'issued' | 'finalized';
export type VatMode = 'article_10' | 'article_11' | 'not_registered';
export type ReceiverType = 'local' | 'eu_business' | 'foreign_company' | 'foreign_person';
export type Currency = 'EUR' | 'USD' | 'GBP';

// ── Sub-models ────────────────────────────────────────────────────────────────

export interface InvoiceReceiver {
  readonly type: ReceiverType;
  readonly name: string;
  readonly address?: string;
  readonly companyCode?: string;
  readonly vatNumber?: string;
  readonly phone?: string;
  /** ID of the linked client document (optional — allows inline receivers) */
  readonly clientId?: string;
}

export interface InvoiceItem {
  readonly id: string;
  readonly title: string;
  readonly unit: string;
  readonly quantity: number;
  readonly price: number;
  /** Discount percentage 0–100 */
  readonly discount: number;
  /** VAT rate applied (%, e.g. 18 or 0) — set by backend */
  readonly vatRate: number;
  /** Calculated VAT amount — set by backend */
  readonly vatAmount: number;
  /** price × quantity × (1 − discount/100) — set by backend */
  readonly subtotal: number;
  /** subtotal + vatAmount — set by backend */
  readonly total: number;
}

export interface VatBreakdownLine {
  readonly rate: number;
  readonly taxableAmount: number;
  readonly vatAmount: number;
  readonly label?: string;
}

export interface InvoiceTotals {
  readonly subtotal: number;
  readonly discountTotal: number;
  readonly vatTotal: number;
  readonly total: number;
  readonly vatBreakdown: VatBreakdownLine[];
  readonly amountInWords: string;
}

export interface VatStatus {
  /** Effective VAT rate (%) */
  readonly effectiveRate: number;
  /** Human-readable label, e.g. "VAT Exempt (Article 11)" */
  readonly label?: string;
  readonly reverseCharge: boolean;
  readonly exempt: boolean;
}

// ── Main DTO ──────────────────────────────────────────────────────────────────

export interface InvoiceDto {
  readonly id: string;
  readonly type: InvoiceType;
  readonly currency: Currency;
  readonly serialNumber: string;
  readonly status: InvoiceStatus;
  readonly sellerId: string;
  readonly vatMode: VatMode;
  readonly vatStatus: VatStatus;
  readonly receiver: InvoiceReceiver;
  readonly items: InvoiceItem[];
  readonly totals: InvoiceTotals;
  readonly notes?: string;
  readonly dueDate?: string;
  readonly isAccounting: boolean;
  readonly issueDate: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly finalizedAt?: string;
}

// ── Input items (sent by client — no calculated fields required) ──────────────

export interface InvoiceItemInput {
  readonly id?: string;
  readonly title: string;
  readonly unit: string;
  readonly quantity: number;
  readonly price: number;
  readonly discount: number;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface CreateInvoiceRequest {
  readonly type?: InvoiceType;
  readonly currency?: Currency;
  readonly vatMode?: VatMode;
  readonly receiver?: Partial<InvoiceReceiver>;
  readonly items?: InvoiceItemInput[];
  readonly notes?: string;
  readonly dueDate?: string;
  readonly isAccounting?: boolean;
  readonly issueDate?: string;
}

export interface UpdateInvoiceRequest {
  readonly type?: InvoiceType;
  readonly currency?: Currency;
  readonly vatMode?: VatMode;
  readonly receiver?: Partial<InvoiceReceiver>;
  readonly items?: InvoiceItemInput[];
  readonly notes?: string;
  readonly dueDate?: string;
  readonly isAccounting?: boolean;
  readonly issueDate?: string;
}

// ── Preview payload (returned by POST /invoices/:id/preview) ─────────────────

export interface InvoicePreviewPayload {
  readonly invoice: InvoiceDto;
  readonly sellerName: string;
  readonly sellerEmail: string;
  readonly sellerVatNumber?: string;
  readonly sellerBankAccount?: string;
  readonly generatedAt: string;
}

// ── List item (lightweight, for list views) ───────────────────────────────────

export interface InvoiceListItemDto {
  readonly id: string;
  readonly serialNumber: string;
  readonly status: InvoiceStatus;
  readonly type: InvoiceType;
  readonly currency: Currency;
  readonly receiverName: string;
  readonly total: number;
  readonly issueDate: string;
  readonly dueDate?: string;
  readonly createdAt: string;
  /** ID of the linked client document, if the receiver was linked to a client. */
  readonly clientId?: string;
}
