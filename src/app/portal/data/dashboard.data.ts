import type {
  DashboardStats,
  MockActivity,
  MockClient,
  MockInvoice,
} from './portal.types';

export const DASHBOARD_STATS: DashboardStats = {
  monthlyIncome: 4850,
  expenses: 620,
  estimatedTax: 712,
  netProfit: 3518,
  currency: 'EUR',
};

export const RECENT_INVOICES: readonly MockInvoice[] = [
  {
    id: '1',
    number: 'INV-2026-001',
    client: 'Acme Corp',
    amount: 1200,
    currency: 'EUR',
    status: 'paid',
    date: '2026-04-01',
    dueDate: '2026-04-15',
  },
  {
    id: '2',
    number: 'INV-2026-002',
    client: 'Blue Sky Ltd',
    amount: 850,
    currency: 'EUR',
    status: 'pending',
    date: '2026-04-05',
    dueDate: '2026-04-20',
  },
  {
    id: '3',
    number: 'INV-2026-003',
    client: 'Nova Digital',
    amount: 2100,
    currency: 'EUR',
    status: 'paid',
    date: '2026-03-28',
    dueDate: '2026-04-12',
  },
  {
    id: '4',
    number: 'INV-2026-004',
    client: 'Green Tech',
    amount: 450,
    currency: 'EUR',
    status: 'overdue',
    date: '2026-03-15',
    dueDate: '2026-03-29',
  },
  {
    id: '5',
    number: 'INV-2026-005',
    client: 'Pixel Studio',
    amount: 700,
    currency: 'EUR',
    status: 'draft',
    date: '2026-04-10',
    dueDate: '2026-04-25',
  },
];

export const RECENT_CLIENTS: readonly MockClient[] = [
  {
    id: '1',
    name: 'Maria Borg',
    email: 'maria@acmecorp.com',
    company: 'Acme Corp',
    totalInvoices: 5,
    totalRevenue: 6400,
  },
  {
    id: '2',
    name: 'John Farrugia',
    email: 'john@bluesky.com',
    company: 'Blue Sky Ltd',
    totalInvoices: 3,
    totalRevenue: 2550,
  },
  {
    id: '3',
    name: 'Sofia Vella',
    email: 'sofia@novadigital.mt',
    company: 'Nova Digital',
    totalInvoices: 7,
    totalRevenue: 14700,
  },
  {
    id: '4',
    name: 'Marco Mifsud',
    email: 'marco@greentech.eu',
    company: 'Green Tech',
    totalInvoices: 2,
    totalRevenue: 900,
  },
  {
    id: '5',
    name: 'Anna Camilleri',
    email: 'anna@pixelstudio.com',
    company: 'Pixel Studio',
    totalInvoices: 4,
    totalRevenue: 2800,
  },
];

export const RECENT_ACTIVITY: readonly MockActivity[] = [
  {
    id: '1',
    type: 'payment_received',
    description: 'Payment received from Acme Corp',
    amount: 1200,
    date: '2026-04-12',
  },
  {
    id: '2',
    type: 'invoice_created',
    description: 'Invoice INV-2026-005 created for Pixel Studio',
    amount: 700,
    date: '2026-04-10',
  },
  {
    id: '3',
    type: 'expense_added',
    description: 'Software subscription added',
    amount: 49,
    date: '2026-04-08',
  },
  {
    id: '4',
    type: 'client_added',
    description: 'New client added: Anna Camilleri',
    date: '2026-04-06',
  },
  {
    id: '5',
    type: 'payment_received',
    description: 'Payment received from Nova Digital',
    amount: 2100,
    date: '2026-04-03',
  },
];
