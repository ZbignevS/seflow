import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { AuthService } from '@core/auth/services/auth.service';
import { IconComponent } from '@seflow/ui';
import { BaseChartDirective } from 'ng2-charts';
import { InvoiceStore } from '../../state/invoice.store';
import { ExpenseStore } from '../../state/expense.store';
import { ClientsStore } from '../../state/clients.store';
import type { ChartData, ChartOptions } from 'chart.js';
import type { InvoiceStatus } from '@seflow/contracts';

type ActivityType = 'invoice_created' | 'expense_added';

interface ActivityItem {
  readonly id: string;
  readonly type: ActivityType;
  readonly description: string;
  readonly amount: number;
  readonly date: string;
}

/** Returns the last N calendar months (oldest → newest). */
function lastNMonths(n: number): { year: number; month: number; label: string }[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });
}

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    TranslatePipe,
    IconComponent,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly invoiceStore = inject(InvoiceStore);
  private readonly expenseStore = inject(ExpenseStore);
  private readonly clientsStore = inject(ClientsStore);

  protected readonly currentUser = toSignal(this.authService.currentUser$, {
    initialValue: null,
  });

  constructor() {
    this.invoiceStore.loadList();
    this.expenseStore.loadList();
    this.clientsStore.loadClients();
  }

  // ── Loading ──────────────────────────────────────────────────────────────────

  protected readonly loading = computed(
    () =>
      this.invoiceStore.listLoading() ||
      this.expenseStore.listLoading() ||
      this.clientsStore.loading(),
  );

  // ── Totals ───────────────────────────────────────────────────────────────────

  protected readonly totalRevenue = this.invoiceStore.totalRevenue;
  protected readonly totalExpenses = this.expenseStore.totalAmount;
  protected readonly netProfit = computed(() => this.totalRevenue() - this.totalExpenses());
  protected readonly clientCount = computed(() => this.clientsStore.clients().length);

  protected readonly profitLineColor = computed(() =>
    this.netProfit() >= 0 ? '#22c55e' : '#ef4444',
  );

  // ── Chart time-series (last 6 months) ────────────────────────────────────────

  private readonly monthRange = computed(() => lastNMonths(6));

  private readonly revenueByMonth = computed(() => {
    const months = this.monthRange();
    const items = this.invoiceStore.items();
    return months.map(({ year, month }) =>
      items
        .filter((inv) => {
          const d = new Date(inv.issueDate);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((s, inv) => s + inv.total, 0),
    );
  });

  private readonly expensesByMonth = computed(() => {
    const months = this.monthRange();
    const items = this.expenseStore.items();
    return months.map(({ year, month }) =>
      items
        .filter((exp) => {
          const d = new Date(exp.date);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((s, exp) => s + exp.totalAmount, 0),
    );
  });

  private readonly profitByMonth = computed(() =>
    this.revenueByMonth().map((r, i) => r - this.expensesByMonth()[i]),
  );

  private readonly clientsByMonth = computed(() => {
    const months = this.monthRange();
    const items = this.invoiceStore.items();
    return months.map(({ year, month }) =>
      new Set(
        items
          .filter((inv) => {
            const d = new Date(inv.issueDate);
            return d.getFullYear() === year && d.getMonth() === month;
          })
          .map((inv) => inv.receiverName),
      ).size,
    );
  });

  private readonly monthLabels = computed(() =>
    this.monthRange().map((m) => m.label),
  );

  // ── Combined overview chart ───────────────────────────────────────────────────

  protected readonly overviewChartData = computed((): ChartData<'line'> => ({
    labels: this.monthLabels(),
    datasets: [
      {
        label: 'Revenue',
        data: this.revenueByMonth(),
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: this.expensesByMonth(),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        borderWidth: 2,
      },
      {
        label: 'Net profit',
        data: this.profitByMonth(),
        borderColor: this.profitLineColor(),
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: this.profitLineColor(),
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        borderWidth: 2,
      },
      {
        label: 'Active clients',
        data: this.clientsByMonth(),
        borderColor: '#a855f7',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        borderWidth: 2,
        borderDash: [5, 4],
      },
    ],
  }));

  protected readonly overviewChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 28,
          boxHeight: 2,
          font: { size: 12, family: 'inherit' },
          color: '#64748b',
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y ?? 0;
            if (ctx.dataset.yAxisID === 'y1') {
              return `  ${ctx.dataset.label}: ${Math.round(val)}`;
            }
            return `  ${ctx.dataset.label}: €${val.toLocaleString('en', { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, family: 'inherit' },
          color: '#94a3b8',
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(148,163,184,0.12)' },
        ticks: {
          font: { size: 11, family: 'inherit' },
          color: '#94a3b8',
          maxTicksLimit: 5,
          callback: (v) =>
            `€${(v as number).toLocaleString('en', { maximumFractionDigits: 0 })}`,
        },
        border: { display: false },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          font: { size: 11, family: 'inherit' },
          color: '#a855f7',
          maxTicksLimit: 5,
          precision: 0,
          callback: (v) => String(Math.round(v as number)),
        },
        border: { display: false },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // ── Recent data ───────────────────────────────────────────────────────────────

  protected readonly recentInvoices = computed(() =>
    [...this.invoiceStore.items()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  );

  protected readonly recentClients = computed(() =>
    [...this.clientsStore.clients()]
      .sort(
        (a, b) =>
          b.invoiceSummary.totalInvoicesCount - a.invoiceSummary.totalInvoicesCount,
      )
      .slice(0, 5),
  );

  protected readonly recentActivity = computed((): ActivityItem[] => {
    const invoiceItems = this.invoiceStore.items().map(
      (inv): ActivityItem => ({
        id: `inv-${inv.id}`,
        type: 'invoice_created',
        description: inv.receiverName
          ? `${inv.serialNumber} – ${inv.receiverName}`
          : inv.serialNumber,
        amount: inv.total,
        date: inv.createdAt,
      }),
    );

    const expenseItems = this.expenseStore.items().map(
      (exp): ActivityItem => ({
        id: `exp-${exp.id}`,
        type: 'expense_added',
        description: exp.name,
        amount: exp.totalAmount,
        date: exp.createdAt,
      }),
    );

    return [...invoiceItems, ...expenseItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────

  protected statusLabel(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
      draft: 'Draft',
      issued: 'Issued',
      finalized: 'Finalized',
    };
    return labels[status];
  }

  protected clientTypeLabel(type: 'company' | 'individual'): string {
    return type === 'company' ? 'Company' : 'Individual';
  }
}
