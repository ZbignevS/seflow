import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { AuthService } from '@core/auth/services/auth.service';
import { IconComponent } from '@seflow/ui';
import {
  DASHBOARD_STATS,
  RECENT_ACTIVITY,
  RECENT_CLIENTS,
  RECENT_INVOICES,
} from '../../data/dashboard.data';
import type { InvoiceStatus } from '../../data/portal.types';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatButtonModule, TranslatePipe, IconComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);

  protected readonly currentUser = toSignal(this.authService.currentUser$, {
    initialValue: null,
  });

  protected readonly stats = DASHBOARD_STATS;
  protected readonly invoices = RECENT_INVOICES;
  protected readonly clients = RECENT_CLIENTS;
  protected readonly activity = RECENT_ACTIVITY;

  protected statusLabel(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
      paid: 'Paid',
      pending: 'Pending',
      overdue: 'Overdue',
      draft: 'Draft',
    };
    return labels[status];
  }
}
