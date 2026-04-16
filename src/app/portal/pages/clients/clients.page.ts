import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { SnackbarService } from '@core/snackbar/snackbar.service';
import { TranslationService } from '@core/i18n/services/translation.service';
import { ConfirmDialogComponent } from '@core/confirm-dialog/confirm-dialog.component';
import { ClientsStore } from '../../state/clients.store';
import { ClientsService } from '../../services/clients.service';
import { InvoiceStore } from '../../state/invoice.store';
import type { ClientDto, ClientType, CreateClientRequest, TaxResidency } from '@seflow/contracts';

@Component({
  selector: 'app-clients-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './clients.page.html',
  styleUrl: './clients.page.scss',
})
export class ClientsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly clientsStore = inject(ClientsStore);
  private readonly invoiceStore = inject(InvoiceStore);
  private readonly clientsService = inject(ClientsService);
  private readonly snackbar = inject(SnackbarService);
  private readonly ts = inject(TranslationService);

  // ── Store selectors ──────────────────────────────────────────────────────────

  protected readonly clients = this.clientsStore.clients;
  protected readonly selectedClient = this.clientsStore.selectedClient;
  protected readonly loading = this.clientsStore.loading;
  protected readonly error = this.clientsStore.error;

  // ── Local UI state ───────────────────────────────────────────────────────────

  /** True when the right panel shows a blank "new client" form (no selection). */
  protected readonly isNewClientMode = signal(false);

  protected readonly searchQuery = signal('');

  /** Clients filtered by search, sorted A→Z, grouped by first letter. */
  protected readonly groupedClients = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const filtered = this.clients()
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));

    const map = new Map<string, ClientDto[]>();
    for (const client of filtered) {
      const letter = client.name[0]?.toUpperCase() ?? '#';
      const group = map.get(letter) ?? [];
      group.push(client);
      map.set(letter, group);
    }

    return Array.from(map.entries()).map(([letter, items]) => ({ letter, items }));
  });

  protected readonly isSaving = signal(false);
  protected readonly isDeleting = signal(false);

  /** True when either a client is selected or "Add new" was clicked. */
  protected readonly showPanel = computed(
    () => this.selectedClient() !== null || this.isNewClientMode(),
  );

  /** Header tint — red when selected client has unpaid invoices. */
  protected readonly hasUnpaid = computed(
    () => (this.selectedClient()?.invoiceSummary.unpaidAmount ?? 0) > 0,
  );

  /** Invoices belonging to the currently selected client. */
  protected readonly clientInvoices = computed(() => {
    const clientId = this.selectedClient()?.id;
    if (!clientId) return [];
    return this.invoiceStore.items().filter((inv) => inv.clientId === clientId);
  });

  protected readonly invoicesLoading = this.invoiceStore.listLoading;

  // ── Form ─────────────────────────────────────────────────────────────────────

  protected readonly clientForm = this.fb.group({
    name: ['', Validators.required],
    address: [''],
    companyCode: [''],
    vatCode: [''],
    phone: [''],
    clientType: ['company' as ClientType, Validators.required],
    taxResidency: ['domestic' as TaxResidency, Validators.required],
  });

  constructor() {
    // Load once per session — no-op when already loaded.
    this.clientsStore.loadClients();
    this.invoiceStore.loadList();

    // Patch form whenever a different client is selected.
    effect(() => {
      const client = this.selectedClient();
      if (!client) return;

      this.clientForm.patchValue(
        {
          name: client.name,
          address: client.address ?? '',
          companyCode: client.companyCode ?? '',
          vatCode: client.vatCode ?? '',
          phone: client.phone ?? '',
          clientType: client.clientType,
          taxResidency: client.taxResidency,
        },
        { emitEvent: false },
      );
    }, { allowSignalWrites: true });
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  protected openInvoice(id: string): void {
    void this.router.navigate(['/portal/invoices', id]);
  }

  protected startNewClient(): void {
    this.clientsStore.selectClient(null);
    this.clientForm.reset({ clientType: 'company', taxResidency: 'domestic' });
    this.isNewClientMode.set(true);
  }

  protected selectClient(client: ClientDto): void {
    this.clientsStore.selectClient(client.id);
    this.isNewClientMode.set(false);
  }

  protected saveClient(): void {
    if (this.clientForm.invalid || this.isSaving()) return;

    const raw = this.clientForm.getRawValue();
    const payload: CreateClientRequest = {
      name: raw.name!,
      address: raw.address || undefined,
      companyCode: raw.companyCode || undefined,
      vatCode: raw.vatCode || undefined,
      phone: raw.phone || undefined,
      clientType: raw.clientType as ClientType,
      taxResidency: raw.taxResidency as TaxResidency,
    };

    const selected = this.selectedClient();
    this.isSaving.set(true);

    if (selected) {
      this.clientsService.updateClient(selected.id, payload).subscribe({
        next: (updated) => {
          this.clientsStore.updateClient(updated);
          this.snackbar.success(this.ts.t().portal.clients.updateSuccess);
          this.isSaving.set(false);
        },
        error: () => {
          this.snackbar.error(this.ts.t().notifications.genericError);
          this.isSaving.set(false);
        },
      });
    } else {
      this.clientsService.createClient(payload).subscribe({
        next: (created) => {
          this.clientsStore.addClient(created);
          this.clientsStore.selectClient(created.id);
          this.isNewClientMode.set(false);
          this.snackbar.success(this.ts.t().portal.clients.createSuccess);
          this.isSaving.set(false);
        },
        error: () => {
          this.snackbar.error(this.ts.t().notifications.genericError);
          this.isSaving.set(false);
        },
      });
    }
  }

  protected deleteClient(): void {
    const selected = this.selectedClient();
    if (!selected || this.isDeleting()) return;

    const t = this.ts.t().portal.clients.deleteConfirm;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: t.title,
        message: `"${selected.name}" — ${t.message}`,
        confirmLabel: t.confirm,
        cancelLabel: t.cancel,
        confirmColor: 'warn',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.isDeleting.set(true);
      this.clientsService.deleteClient(selected.id).subscribe({
        next: () => {
          this.clientsStore.removeClient(selected.id);
          this.snackbar.success(this.ts.t().portal.clients.deleteSuccess);
          this.isDeleting.set(false);
        },
        error: () => {
          this.snackbar.error(this.ts.t().notifications.genericError);
          this.isDeleting.set(false);
        },
      });
    });
  }
}
