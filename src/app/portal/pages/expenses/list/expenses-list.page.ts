import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { TranslationService } from '@core/i18n/services/translation.service';
import { SnackbarService } from '@core/snackbar/snackbar.service';
import { ExpenseStore, type ExpenseDateFilter } from '../../../state/expense.store';
import type { ExpenseListItemDto, ExpenseType } from '@seflow/contracts';

@Component({
  selector: 'app-expenses-list',
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
  templateUrl: './expenses-list.page.html',
  styleUrl: './expenses-list.page.scss',
})
export class ExpensesListPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(ExpenseStore);
  private readonly snackbar = inject(SnackbarService);
  private readonly ts = inject(TranslationService);

  protected readonly items = this.store.items;
  protected readonly filteredItems = this.store.filteredItems;
  protected readonly loading = this.store.listLoading;
  protected readonly saving = this.store.saving;
  protected readonly deleting = this.store.deleting;
  protected readonly filters = this.store.filters;
  protected readonly totalAmount = this.store.totalAmount;
  protected readonly filteredTotal = this.store.filteredTotal;
  protected readonly paidCount = this.store.paidCount;
  protected readonly unpaidCount = this.store.unpaidCount;

  /** Track which expense row is being toggled (for optimistic spinner) */
  protected readonly togglingId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected readonly typeFilterOptions: Array<{ value: ExpenseType | 'all'; labelKey: string }> = [
    { value: 'all', labelKey: 'portal.expenses.filter.all' },
    { value: 'general', labelKey: 'portal.expenses.type.general' },
    { value: 'representation', labelKey: 'portal.expenses.type.representation' },
    { value: 'supplies', labelKey: 'portal.expenses.type.supplies' },
    { value: 'fixed_asset', labelKey: 'portal.expenses.type.fixed_asset' },
  ];

  protected readonly dateFilterOptions: Array<{ value: ExpenseDateFilter; labelKey: string }> = [
    { value: 'this_month', labelKey: 'portal.expenses.filter.thisMonth' },
    { value: 'this_year', labelKey: 'portal.expenses.filter.thisYear' },
    { value: 'prev_month', labelKey: 'portal.expenses.filter.prevMonth' },
    { value: 'prev_year', labelKey: 'portal.expenses.filter.prevYear' },
    { value: 'all', labelKey: 'portal.expenses.filter.allTime' },
  ];

  constructor() {
    this.store.loadList();
  }

  protected openAddExpense(): void {
    import('../editor/expense-editor.dialog').then(({ ExpenseEditorDialogComponent }) => {
      const ref = this.dialog.open(ExpenseEditorDialogComponent, {
        width: '680px',
        maxWidth: '100vw',
        panelClass: 'expense-editor-panel',
        data: { expense: null },
      });

      ref.afterClosed().subscribe((result) => {
        if (result) {
          this.store.createExpense(
            result,
            () => {
              this.snackbar.success(this.ts.t().portal.expenses.createSuccess);
              this.store.invalidateList();
              this.store.loadList();
            },
            (msg) => this.snackbar.error(msg),
          );
        }
      });
    });
  }

  protected openEditExpense(item: ExpenseListItemDto, event: MouseEvent): void {
    event.stopPropagation();

    this.store.loadExpense(item.id);

    import('../editor/expense-editor.dialog').then(({ ExpenseEditorDialogComponent }) => {
      const ref = this.dialog.open(ExpenseEditorDialogComponent, {
        width: '680px',
        maxWidth: '100vw',
        panelClass: 'expense-editor-panel',
        data: { expenseId: item.id, store: this.store },
      });

      ref.afterClosed().subscribe((result) => {
        if (result) {
          this.store.saveExpense(
            item.id,
            result,
            () => this.snackbar.success(this.ts.t().portal.expenses.updateSuccess),
            (msg) => this.snackbar.error(msg),
          );
        }
      });
    });
  }

  protected togglePaid(item: ExpenseListItemDto, event: MouseEvent): void {
    event.stopPropagation();
    if (this.togglingId()) return;
    this.togglingId.set(item.id);

    this.store.togglePaid(
      item.id,
      () => {
        this.togglingId.set(null);
        this.snackbar.success(
          item.isPaid
            ? this.ts.t().portal.expenses.markedUnpaid
            : this.ts.t().portal.expenses.markedPaid,
        );
      },
      (msg) => {
        this.togglingId.set(null);
        this.snackbar.error(msg);
      },
    );
  }

  protected deleteExpense(item: ExpenseListItemDto, event: MouseEvent): void {
    event.stopPropagation();
    if (this.deletingId()) return;
    this.deletingId.set(item.id);

    this.store.removeExpense(
      item.id,
      () => {
        this.deletingId.set(null);
        this.snackbar.success(this.ts.t().portal.expenses.deleteSuccess);
      },
      (msg) => {
        this.deletingId.set(null);
        this.snackbar.error(msg);
      },
    );
  }

  protected setTypeFilter(type: ExpenseType | 'all'): void {
    this.store.setFilter({ type });
  }

  protected setDateFilter(dateFilter: ExpenseDateFilter): void {
    this.store.setFilter({ dateFilter });
  }
}
