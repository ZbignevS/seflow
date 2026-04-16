import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@core/confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { TranslationService } from '@core/i18n/services/translation.service';
import { debounceTime, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { InvoiceStore } from '../../../state/invoice.store';
import { ClientsStore } from '../../../state/clients.store';
import { UserStore } from '../../../state/user.store';
import { SnackbarService } from '@core/snackbar/snackbar.service';
import type {
  ClientDto,
  Currency,
  InvoiceDto,
  InvoiceItemInput,
  InvoiceReceiver,
  InvoiceType,
  ReceiverType,
  UpdateInvoiceRequest,
  VatMode,
} from '@seflow/contracts';

type ItemFormGroup = FormGroup<{
  id: import('@angular/forms').FormControl<string>;
  title: import('@angular/forms').FormControl<string>;
  unit: import('@angular/forms').FormControl<string>;
  quantity: import('@angular/forms').FormControl<number>;
  price: import('@angular/forms').FormControl<number>;
  discount: import('@angular/forms').FormControl<number>;
}>;

@Component({
  selector: 'app-invoice-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatAutocompleteModule,
  ],
  templateUrl: './invoice-editor.page.html',
  styleUrl: './invoice-editor.page.scss',
})
export class InvoiceEditorPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly invoiceStore = inject(InvoiceStore);
  private readonly clientsStore = inject(ClientsStore);
  private readonly userStore = inject(UserStore);
  private readonly snackbar = inject(SnackbarService);
  private readonly ts = inject(TranslationService);

  // ── Store selectors ────────────────────────────────────────────────────────
  protected readonly invoice = this.invoiceStore.activeInvoice;
  protected readonly saving = this.invoiceStore.saving;
  protected readonly finalizing = this.invoiceStore.finalizing;
  protected readonly activeLoading = this.invoiceStore.activeLoading;
  protected readonly user = this.userStore.user;
  protected readonly clients = this.clientsStore.clients;

  protected readonly isFinalized = computed(
    () => this.invoice()?.status === 'finalized',
  );

  // ── Local UI ───────────────────────────────────────────────────────────────
  protected readonly isNewMode = signal(false);
  protected readonly clientQuery = signal('');
  protected readonly showClientPanel = signal(false);

  protected readonly filteredClients = computed(() => {
    const q = this.clientQuery().toLowerCase().trim();
    return q
      ? this.clients().filter((c) => c.name.toLowerCase().includes(q))
      : this.clients().slice(0, 10);
  });

  // ── Form ───────────────────────────────────────────────────────────────────
  protected readonly headerForm = this.fb.group({
    type: ['standard' as InvoiceType, Validators.required],
    currency: ['EUR' as Currency, Validators.required],
    vatMode: ['article_10' as VatMode, Validators.required],
    issueDate: [new Date().toISOString().slice(0, 10), Validators.required],
    dueDate: [''],
    isAccounting: [false],
    notes: [''],
  });

  protected readonly receiverForm = this.fb.group({
    type: ['local' as ReceiverType, Validators.required],
    name: ['', Validators.required],
    address: [''],
    companyCode: [''],
    vatNumber: [''],
    phone: [''],
    clientId: [''],
  });

  protected readonly itemsArray = this.fb.array<ItemFormGroup>([]);

  protected readonly vatModeKeys: VatMode[] = ['article_10', 'article_11', 'not_registered'];
  protected readonly receiverTypeKeys: ReceiverType[] = ['local', 'eu_business', 'foreign_company', 'foreign_person'];
  protected readonly invoiceTypeKeys: InvoiceType[] = ['standard', 'advance', 'credit'];
  protected readonly currencies: Currency[] = ['EUR', 'USD', 'GBP'];

  /** Live currency — updates on user selection AND on form patch from the backend. */
  protected readonly liveCurrency = signal(
    this.headerForm.controls.currency.value as string,
  );

  // Incremented whenever itemsArray changes (including after patchFormsFromInvoice).
  private readonly _itemsTick = signal(0);

  /** Live totals recomputed on every keystroke — no network round-trip needed. */
  protected readonly liveTotals = computed(() => {
    void this._itemsTick(); // reactive dependency
    const items = this.itemsArray.getRawValue();
    const vatRate = this.invoice()?.vatStatus?.effectiveRate ?? 0;

    let subtotal = 0;
    let discountTotal = 0;
    for (const item of items) {
      const factor = 1 - (item.discount || 0) / 100;
      subtotal     += item.quantity * item.price * factor;
      discountTotal += item.quantity * item.price * (item.discount / 100);
    }
    subtotal      = Math.round(subtotal * 100) / 100;
    discountTotal = Math.round(discountTotal * 100) / 100;
    const vatAmount = Math.round(subtotal * vatRate) / 100;
    const total     = Math.round((subtotal + vatAmount) * 100) / 100;

    return { subtotal, discountTotal, vatAmount, vatRate, total };
  });

  protected readonly liveAmountInWords = computed(() =>
    this.amountInWords(this.liveTotals().total, this.liveCurrency() ?? 'EUR'),
  );

  // Fires whenever the header OR any item row changes — drives auto-save.
  private readonly formValueChanges = toSignal(
    merge(this.headerForm.valueChanges, this.itemsArray.valueChanges).pipe(
      debounceTime(7000),
    ),
    { initialValue: null },
  );

  constructor() {
    // Load dependencies
    this.clientsStore.loadClients();

    // Keep liveCurrency in sync when the user changes the dropdown.
    this.headerForm.controls.currency.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.liveCurrency.set(v ?? 'EUR'));

    // Keep _itemsTick in sync with itemsArray so liveTotals recomputes on keystrokes.
    this.itemsArray.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._itemsTick.update((v) => v + 1));

    // Sync form → store when form changes (auto-save).
    // formValueChanges starts as null (initialValue) — skip that first emission
    // so we don't fire a PATCH immediately on component init before the user
    // has changed anything. Only debounced real changes (non-null) trigger a save.
    effect(() => {
      const changed = this.formValueChanges();
      if (changed === null) return;
      untracked(() => {
        const inv = this.invoice();
        if (!inv || this.isFinalized() || this.isNewMode() || this.saving()) return;
        this.autoSave(inv.id);
      });
    });

    // Patch form when invoice loads from backend
    effect(
      () => {
        const inv = this.invoice();
        if (!inv) return;
        this.patchFormsFromInvoice(inv);
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      // /invoices/new — create a draft immediately
      this.isNewMode.set(true);
      this.addItem(); // start with one empty row
      this.invoiceStore.createDraft(
        (inv) => {
          this.isNewMode.set(false);
          void this.router.navigate(['/portal/invoices', inv.id], { replaceUrl: true });
        },
        (msg) => this.snackbar.error(msg),
      );
    } else {
      this.invoiceStore.loadInvoice(id);
    }
  }

  // ── Items table ────────────────────────────────────────────────────────────

  protected get itemControls() {
    return this.itemsArray.controls as ItemFormGroup[];
  }

  protected addItem(): void {
    const group = this.fb.group({
      id: [crypto.randomUUID()],
      title: ['', Validators.required],
      unit: ['hrs'],
      quantity: [1, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
    }) as ItemFormGroup;

    this.itemsArray.push(group);
  }

  protected removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  /** Optimistic line total before backend responds */
  protected lineSubtotal(i: number): number {
    const ctrl = this.itemControls[i];
    if (!ctrl) return 0;
    const { quantity, price, discount } = ctrl.getRawValue();
    const factor = 1 - (discount || 0) / 100;
    return Math.round(quantity * price * factor * 100) / 100;
  }

  // ── Client selector ────────────────────────────────────────────────────────

  protected onClientQueryChange(event: Event): void {
    this.clientQuery.set((event.target as HTMLInputElement).value);
  }

  protected selectClient(client: ClientDto): void {
    const type: ReceiverType =
      client.taxResidency === 'domestic'
        ? 'local'
        : client.clientType === 'company'
          ? 'eu_business'
          : 'foreign_person';

    this.receiverForm.patchValue({
      type,
      name: client.name,
      address: client.address ?? '',
      companyCode: client.companyCode ?? '',
      vatNumber: client.vatCode ?? '',
      phone: client.phone ?? '',
      clientId: client.id,
    });

    this.clientQuery.set(client.name);
    this.showClientPanel.set(false);
  }

  protected clearClient(): void {
    this.receiverForm.reset({ type: 'local' });
    this.clientQuery.set('');
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  protected saveDraft(): void {
    const inv = this.invoice();
    if (!inv) return;
    this.autoSave(inv.id);
    this.snackbar.success(this.ts.t().portal.invoices.saveSuccess);
  }

  protected openPreview(): void {
    const inv = this.invoice();
    if (!inv) return;
    void this.router.navigate(['/portal/invoices/preview', inv.id]);
  }

  protected generateInvoice(): void {
    const inv = this.invoice();
    if (!inv) return;

    if (this.itemsArray.length === 0) {
      this.snackbar.error(this.ts.t().portal.invoices.finalizeError);
      return;
    }

    if (!this.validateForFinalization()) return;

    // Save the latest form state first, then finalize inside the callback so
    // the finalize request always sees up-to-date data and there is no race
    // between the PATCH response and the finalize response.
    const body = this.buildUpdateBody();
    this.invoiceStore.saveDraft(inv.id, body, () => {
      this.invoiceStore.finalizeInvoice(
        inv.id,
        (finalized) => {
          this.snackbar.success(
            `Invoice ${finalized.serialNumber} finalized successfully.`,
          );
          this.invoiceStore.invalidateList();
        },
        (msg) => this.snackbar.error(msg),
      );
    });
  }

  private validateForFinalization(): boolean {
    // Touch client name so mat-error becomes visible
    this.receiverForm.controls.name.markAsTouched();

    // Touch all item title cells so the red-border CSS kicks in
    for (const ctrl of this.itemControls) {
      ctrl.controls.title.markAsTouched();
    }

    const totalZero = this.liveTotals().total <= 0;
    if (totalZero) {
      this.snackbar.error(this.ts.t().portal.invoices.finalizeTotalZero);
      return false;
    }

    const nameInvalid = this.receiverForm.controls.name.invalid;
    const titlesInvalid = this.itemControls.some((c) => c.controls.title.invalid);
    if (nameInvalid || titlesInvalid) {
      this.snackbar.error(this.ts.t().portal.invoices.finalizeInvalidFields);
      return false;
    }

    return true;
  }

  protected deleteInvoice(): void {
    const inv = this.invoice();
    if (!inv || this.isFinalized()) return;

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
        inv.id,
        () => void this.router.navigate(['/portal/invoices']),
        (msg) => this.snackbar.error(msg),
      );
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private autoSave(id: string): void {
    const body = this.buildUpdateBody();
    this.invoiceStore.saveDraft(id, body);
  }

  private buildUpdateBody(): UpdateInvoiceRequest {
    const h = this.headerForm.getRawValue();
    const r = this.receiverForm.getRawValue();

    const receiver: Partial<InvoiceReceiver> = {
      type: r.type as ReceiverType,
      name: r.name ?? '',
      ...(r.address && { address: r.address }),
      ...(r.companyCode && { companyCode: r.companyCode }),
      ...(r.vatNumber && { vatNumber: r.vatNumber }),
      ...(r.phone && { phone: r.phone }),
      ...(r.clientId && { clientId: r.clientId }),
    };

    const items: InvoiceItemInput[] = this.itemControls.map((ctrl) => {
      const v = ctrl.getRawValue();
      return {
        id: v.id,
        title: v.title,
        unit: v.unit,
        quantity: v.quantity,
        price: v.price,
        discount: v.discount,
      };
    });

    return {
      type: h.type as InvoiceType,
      currency: h.currency as Currency,
      vatMode: h.vatMode as VatMode,
      issueDate: h.issueDate || undefined,
      dueDate: h.dueDate || undefined,
      isAccounting: h.isAccounting ?? false,
      notes: h.notes || undefined,
      receiver,
      items,
    };
  }

  private patchFormsFromInvoice(inv: InvoiceDto): void {
    this.headerForm.patchValue(
      {
        type: inv.type,
        currency: inv.currency,
        vatMode: inv.vatMode,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate ?? '',
        isAccounting: inv.isAccounting,
        notes: inv.notes ?? '',
      },
      { emitEvent: false },
    );

    if (inv.receiver) {
      this.receiverForm.patchValue(
        {
          type: inv.receiver.type,
          name: inv.receiver.name,
          address: inv.receiver.address ?? '',
          companyCode: inv.receiver.companyCode ?? '',
          vatNumber: inv.receiver.vatNumber ?? '',
          phone: inv.receiver.phone ?? '',
          clientId: inv.receiver.clientId ?? '',
        },
        { emitEvent: false },
      );
      if (inv.receiver.name) {
        this.clientQuery.set(inv.receiver.name);
      }
    }

    // Sync items array
    this.itemsArray.clear({ emitEvent: false });
    for (const item of inv.items) {
      const group = this.fb.group({
        id: [item.id],
        title: [item.title, Validators.required],
        unit: [item.unit],
        quantity: [item.quantity, [Validators.required, Validators.min(0)]],
        price: [item.price, [Validators.required, Validators.min(0)]],
        discount: [item.discount, [Validators.min(0), Validators.max(100)]],
      }) as ItemFormGroup;
      this.itemsArray.push(group, { emitEvent: false });
    }

    if (inv.items.length === 0) {
      this.addItem();
    }

    // patchFormsFromInvoice uses emitEvent:false throughout so manually update
    // the signals that depend on form values so they stay in sync.
    this.liveCurrency.set(inv.currency ?? 'EUR');
    this._itemsTick.update((v) => v + 1);
  }

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
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + this.numberToWords(n % 100) : '');
    return this.numberToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + this.numberToWords(n % 1000) : '');
  }
}
