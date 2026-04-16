export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

export type ActivityType =
  | 'invoice_created'
  | 'payment_received'
  | 'expense_added'
  | 'client_added';

export interface MockInvoice {
  readonly id: string;
  readonly number: string;
  readonly client: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: InvoiceStatus;
  readonly date: string; // ISO date YYYY-MM-DD
  readonly dueDate: string; // ISO date YYYY-MM-DD
}

export interface MockClient {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly totalInvoices: number;
  readonly totalRevenue: number;
}

export interface MockActivity {
  readonly id: string;
  readonly type: ActivityType;
  readonly description: string;
  readonly amount?: number;
  readonly date: string; // ISO date YYYY-MM-DD
}

export interface DashboardStats {
  readonly monthlyIncome: number;
  readonly expenses: number;
  readonly estimatedTax: number;
  readonly netProfit: number;
  readonly currency: string;
}
