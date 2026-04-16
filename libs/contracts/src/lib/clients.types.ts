export type ClientType = 'company' | 'individual';
export type TaxResidency = 'domestic' | 'foreign';

export interface InvoiceSummary {
  readonly totalInvoicesCount: number;
  readonly totalAmount: number;
  readonly unpaidAmount: number;
}

export interface ClientDto {
  readonly id: string;
  readonly name: string;
  readonly address?: string;
  readonly companyCode?: string;
  readonly vatCode?: string;
  readonly phone?: string;
  readonly clientType: ClientType;
  readonly taxResidency: TaxResidency;
  readonly invoiceSummary: InvoiceSummary;
}

/** Body sent to POST /clients */
export interface CreateClientRequest {
  readonly name: string;
  readonly address?: string;
  readonly companyCode?: string;
  readonly vatCode?: string;
  readonly phone?: string;
  readonly clientType: ClientType;
  readonly taxResidency: TaxResidency;
}

/** Body sent to PATCH /clients/:id */
export interface UpdateClientRequest {
  readonly name?: string;
  readonly address?: string;
  readonly companyCode?: string;
  readonly vatCode?: string;
  readonly phone?: string;
  readonly clientType?: ClientType;
  readonly taxResidency?: TaxResidency;
}
