// ── Primitives ────────────────────────────────────────────────────────────────

export type ExpenseType = 'general' | 'representation' | 'supplies' | 'fixed_asset';

// ── Sub-models ────────────────────────────────────────────────────────────────

export interface FixedAssetData {
  readonly assetGroup: string;
  readonly assetName: string;
  readonly acquisitionDate: string;
  /** Depreciation period in months */
  readonly depreciationPeriod: number;
  /** Usage percentage 0–100 */
  readonly usagePercent: number;
}

// ── Main DTO ──────────────────────────────────────────────────────────────────

export interface ExpenseDto {
  readonly id: string;
  readonly type: ExpenseType;
  readonly supplierName: string;
  readonly supplierCode?: string;
  readonly receiptNumber?: string;
  /** Short description of the expense */
  readonly name: string;
  /** Net amount (pre-VAT) */
  readonly amount: number;
  /** VAT rate in % (e.g. 18) */
  readonly vatRate: number;
  /** Calculated: amount × vatRate / 100 */
  readonly vatAmount: number;
  /** Calculated: amount + vatAmount */
  readonly totalAmount: number;
  readonly date: string;
  readonly isPaid: boolean;
  readonly attachmentUrl?: string;
  readonly fixedAssetData?: FixedAssetData;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface CreateExpenseRequest {
  readonly type?: ExpenseType;
  readonly supplierName?: string;
  readonly supplierCode?: string;
  readonly receiptNumber?: string;
  readonly name?: string;
  readonly amount?: number;
  readonly vatRate?: number;
  readonly date?: string;
  readonly isPaid?: boolean;
  readonly attachmentUrl?: string;
  readonly fixedAssetData?: Partial<FixedAssetData>;
}

export type UpdateExpenseRequest = CreateExpenseRequest;

// ── List item (lightweight, for list views) ───────────────────────────────────

export interface ExpenseListItemDto {
  readonly id: string;
  readonly type: ExpenseType;
  readonly supplierName: string;
  readonly receiptNumber?: string;
  readonly name: string;
  readonly amount: number;
  readonly vatAmount: number;
  readonly totalAmount: number;
  readonly date: string;
  readonly isPaid: boolean;
  readonly createdAt: string;
}
