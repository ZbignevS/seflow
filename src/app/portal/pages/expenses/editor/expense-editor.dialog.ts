import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import type { ExpenseDto, ExpenseType, UpdateExpenseRequest } from '@seflow/contracts';
import type { ExpenseStore } from '../../../state/expense.store';

export interface ExpenseEditorDialogData {
  /** If null — "new" mode; if set — load from store */
  expenseId?: string;
  /** Pass in the store so the dialog can read activeExpense when editing */
  store?: InstanceType<typeof ExpenseStore>;
  /** Pre-populated expense (for edit) */
  expense?: ExpenseDto | null;
}

const VAT_RATES = [0, 5, 7, 18];

const EXPENSE_TYPES: ExpenseType[] = ['general', 'representation', 'supplies', 'fixed_asset'];

const ASSET_GROUPS = [
  'Buildings',
  'Machinery & Equipment',
  'Vehicles',
  'Furniture & Fixtures',
  'Computers & IT',
  'Other',
];

@Component({
  selector: 'app-expense-editor-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './expense-editor.dialog.html',
  styleUrl: './expense-editor.dialog.scss',
})
export class ExpenseEditorDialogComponent implements OnInit {
  private readonly dialogRef = inject<MatDialogRef<ExpenseEditorDialogComponent>>(MatDialogRef);
  protected readonly data = inject<ExpenseEditorDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  protected readonly isNew = signal(!this.data.expenseId);
  protected readonly saving = signal(false);

  protected readonly expenseTypes = EXPENSE_TYPES;
  protected readonly vatRates = VAT_RATES;
  protected readonly assetGroups = ASSET_GROUPS;

  // ── Form ──────────────────────────────────────────────────────────────────
  protected readonly form = this.fb.group({
    // Expense type (tab selection)
    type: ['general' as ExpenseType, Validators.required],

    // Supplier
    supplierName: ['', Validators.required],
    supplierCode: [''],
    receiptNumber: [''],

    // Expense details
    name: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    vatRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],

    // Date
    date: [new Date().toISOString().slice(0, 10), Validators.required],

    // Payment
    isPaid: [false],

    // Attachment
    attachmentUrl: [''],

    // Fixed asset sub-form
    assetGroup: [''],
    assetName: [''],
    acquisitionDate: [''],
    depreciationPeriod: [60, [Validators.min(1)]],
    usagePercent: [100, [Validators.min(0), Validators.max(100)]],
  });

  // ── Derived signals ───────────────────────────────────────────────────────

  protected readonly selectedType = toSignal(
    this.form.controls.type.valueChanges,
    { initialValue: this.form.controls.type.value as ExpenseType },
  );

  protected readonly isFixedAsset = computed(
    () => this.selectedType() === 'fixed_asset',
  );

  protected readonly liveAmount = toSignal(
    this.form.controls.amount.valueChanges,
    { initialValue: this.form.controls.amount.value ?? 0 },
  );

  protected readonly liveVatRate = toSignal(
    this.form.controls.vatRate.valueChanges,
    { initialValue: this.form.controls.vatRate.value ?? 0 },
  );

  protected readonly liveCalc = computed(() => {
    const amount = this.liveAmount() ?? 0;
    const vatRate = this.liveVatRate() ?? 0;
    const vatAmount = Math.round(amount * vatRate) / 100;
    const totalAmount = Math.round((amount + vatAmount) * 100) / 100;
    return { vatAmount, totalAmount };
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Pre-fill if editing existing expense
    const existing = this.data.expense;
    if (existing) {
      this.patchFromExpense(existing);
      return;
    }

    // If an id was passed, pull from store once loaded
    if (this.data.expenseId && this.data.store) {
      const storeExp = this.data.store.activeExpense();
      if (storeExp?.id === this.data.expenseId) {
        this.patchFromExpense(storeExp);
      }
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  protected selectType(type: ExpenseType): void {
    this.form.controls.type.setValue(type);
  }

  protected setVatRate(rate: number): void {
    this.form.controls.vatRate.setValue(rate);
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const { vatAmount, totalAmount } = this.liveCalc();

    const result: UpdateExpenseRequest = {
      type: v.type as ExpenseType,
      supplierName: v.supplierName ?? '',
      supplierCode: v.supplierCode || undefined,
      receiptNumber: v.receiptNumber || undefined,
      name: v.name ?? '',
      amount: v.amount ?? 0,
      vatRate: v.vatRate ?? 0,
      date: v.date ?? new Date().toISOString().slice(0, 10),
      isPaid: v.isPaid ?? false,
      attachmentUrl: v.attachmentUrl || undefined,
      ...(v.type === 'fixed_asset' && {
        fixedAssetData: {
          assetGroup: v.assetGroup ?? '',
          assetName: v.assetName ?? '',
          acquisitionDate: v.acquisitionDate ?? '',
          depreciationPeriod: v.depreciationPeriod ?? 60,
          usagePercent: v.usagePercent ?? 100,
        },
      }),
    };

    this.dialogRef.close(result);
  }

  protected hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private patchFromExpense(exp: ExpenseDto): void {
    this.form.patchValue(
      {
        type: exp.type,
        supplierName: exp.supplierName,
        supplierCode: exp.supplierCode ?? '',
        receiptNumber: exp.receiptNumber ?? '',
        name: exp.name,
        amount: exp.amount,
        vatRate: exp.vatRate,
        date: exp.date,
        isPaid: exp.isPaid,
        attachmentUrl: exp.attachmentUrl ?? '',
        assetGroup: exp.fixedAssetData?.assetGroup ?? '',
        assetName: exp.fixedAssetData?.assetName ?? '',
        acquisitionDate: exp.fixedAssetData?.acquisitionDate ?? '',
        depreciationPeriod: exp.fixedAssetData?.depreciationPeriod ?? 60,
        usagePercent: exp.fixedAssetData?.usagePercent ?? 100,
      },
      { emitEvent: false },
    );
  }
}
