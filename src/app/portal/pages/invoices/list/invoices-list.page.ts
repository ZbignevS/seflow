import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { TranslationService } from '@core/i18n/services/translation.service';
import { ConfirmDialogComponent } from '@core/confirm-dialog/confirm-dialog.component';
import { InvoiceStore } from '../../../state/invoice.store';
import { SnackbarService } from '@core/snackbar/snackbar.service';
import type { InvoiceListItemDto, InvoiceStatus } from '@seflow/contracts';

@Component({
  selector: 'app-invoices-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './invoices-list.page.html',
  styleUrl: './invoices-list.page.scss',
})
export class InvoicesListPageComponent {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly invoiceStore = inject(InvoiceStore);
  private readonly snackbar = inject(SnackbarService);
  private readonly ts = inject(TranslationService);

  protected readonly items = this.invoiceStore.items;
  protected readonly loading = this.invoiceStore.listLoading;
  protected readonly creating = this.invoiceStore.saving;
  protected readonly deletingId = this.invoiceStore.deletingId;
  protected readonly totalRevenue = this.invoiceStore.totalRevenue;
  protected readonly draftCount = this.invoiceStore.draftCount;
  protected readonly finalizedCount = this.invoiceStore.finalizedCount;

  protected readonly filterStatus = signal<InvoiceStatus | 'all'>('all');
  protected readonly searchQuery = signal('');

  protected readonly filtered = computed(() => {
    const status = this.filterStatus();
    const q = this.searchQuery().toLowerCase().trim();

    return this.items()
      .filter((i) => status === 'all' || i.status === status)
      .filter(
        (i) =>
          !q ||
          i.receiverName.toLowerCase().includes(q) ||
          i.serialNumber.toLowerCase().includes(q),
      );
  });

  constructor() {
    this.invoiceStore.loadList();
  }

  protected newInvoice(): void {
    if (this.creating()) return;
    this.invoiceStore.createDraft(
      (inv) => void this.router.navigate(['/portal/invoices', inv.id]),
      (msg) => this.snackbar.error(msg),
    );
  }

  protected openInvoice(item: InvoiceListItemDto): void {
    void this.router.navigate(['/portal/invoices', item.id]);
  }

  protected openPreview(item: InvoiceListItemDto, event: MouseEvent): void {
    event.stopPropagation();
    void this.router.navigate(['/portal/invoices/preview', item.id]);
  }

  protected deleteInvoice(item: InvoiceListItemDto, event: MouseEvent): void {
    event.stopPropagation();
    const t = this.ts.t().portal.invoices;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: t.deleteConfirmTitle,
        message: t.deleteConfirm,
        confirmLabel: t.deleteConfirmBtn,
        cancelLabel: t.deleteCancelBtn,
      },
      width: '400px',
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.invoiceStore.deleteDraft(
        item.id,
        () => this.snackbar.success(t.deleteSuccess),
        (msg) => this.snackbar.error(msg),
      );
    });
  }

  protected setFilter(status: InvoiceStatus | 'all'): void {
    this.filterStatus.set(status);
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
