import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import type {
  CreateExpenseRequest,
  ExpenseDto,
  ExpenseListItemDto,
  ExpenseType,
  UpdateExpenseRequest,
} from '@seflow/contracts';
import { ExpensesService } from '../services/expenses.service';

export type ExpenseDateFilter = 'this_month' | 'this_year' | 'prev_month' | 'prev_year' | 'all';

interface ExpenseFilters {
  type: ExpenseType | 'all';
  dateFilter: ExpenseDateFilter;
}

interface ExpenseState {
  items: ExpenseListItemDto[];
  activeExpense: ExpenseDto | null;
  activeId: string | null;
  filters: ExpenseFilters;
  listLoaded: boolean;
  listLoading: boolean;
  activeLoading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  items: [],
  activeExpense: null,
  activeId: null,
  filters: { type: 'all', dateFilter: 'this_month' },
  listLoaded: false,
  listLoading: false,
  activeLoading: false,
  saving: false,
  deleting: false,
  error: null,
};

function matchesDateFilter(date: string, filter: ExpenseDateFilter): boolean {
  if (filter === 'all') return true;

  const d = new Date(date);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (filter) {
    case 'this_month':
      return d.getFullYear() === year && d.getMonth() === month;
    case 'this_year':
      return d.getFullYear() === year;
    case 'prev_month': {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    }
    case 'prev_year':
      return d.getFullYear() === year - 1;
  }
}

export const ExpenseStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    /** Filtered items based on current filter state */
    filteredItems: computed(() => {
      const { type, dateFilter } = store.filters();
      return store
        .items()
        .filter((e) => type === 'all' || e.type === type)
        .filter((e) => matchesDateFilter(e.date, dateFilter));
    }),

    /** Total net amount of all listed expenses */
    totalAmount: computed(() =>
      store.items().reduce((sum, e) => sum + e.totalAmount, 0),
    ),

    /** Total amount of filtered expenses */
    filteredTotal: computed(() => {
      const { type, dateFilter } = store.filters();
      return store
        .items()
        .filter((e) => type === 'all' || e.type === type)
        .filter((e) => matchesDateFilter(e.date, dateFilter))
        .reduce((sum, e) => sum + e.totalAmount, 0);
    }),

    paidCount: computed(
      () => store.items().filter((e) => e.isPaid).length,
    ),

    unpaidCount: computed(
      () => store.items().filter((e) => !e.isPaid).length,
    ),
  })),

  withMethods((store, svc = inject(ExpensesService)) => ({
    /**
     * Loads the expense list once per session.
     * No-ops when already loaded — prevents duplicate API calls on navigation.
     */
    loadList(): void {
      if (store.listLoaded()) return;
      patchState(store, { listLoading: true, error: null });

      svc.list().subscribe({
        next: (items) =>
          patchState(store, { items, listLoading: false, listLoaded: true }),
        error: (err: { message?: string }) =>
          patchState(store, {
            listLoading: false,
            error: err.message ?? 'Failed to load expenses',
          }),
      });
    },

    /** Loads a single full expense into activeExpense. */
    loadExpense(id: string): void {
      if (store.activeId() === id && store.activeExpense()) return;

      patchState(store, { activeLoading: true, activeId: id, error: null });

      svc.getById(id).subscribe({
        next: (exp) =>
          patchState(store, { activeExpense: exp, activeLoading: false }),
        error: (err: { message?: string }) =>
          patchState(store, {
            activeLoading: false,
            error: err.message ?? 'Failed to load expense',
          }),
      });
    },

    /** Creates a new expense and adds it to the list. */
    createExpense(
      body: CreateExpenseRequest,
      onSuccess?: (exp: ExpenseDto) => void,
      onError?: (message: string) => void,
    ): void {
      patchState(store, { saving: true, error: null });

      svc.create(body).subscribe({
        next: (exp) => {
          const listItem: ExpenseListItemDto = {
            id: exp.id,
            type: exp.type,
            supplierName: exp.supplierName,
            receiptNumber: exp.receiptNumber,
            name: exp.name,
            amount: exp.amount,
            vatAmount: exp.vatAmount,
            totalAmount: exp.totalAmount,
            date: exp.date,
            isPaid: exp.isPaid,
            createdAt: exp.createdAt,
          };
          patchState(store, {
            saving: false,
            items: [listItem, ...store.items()],
            activeExpense: exp,
            activeId: exp.id,
          });
          onSuccess?.(exp);
        },
        error: (err: { message?: string }) => {
          const message = err.message ?? 'Failed to create expense';
          patchState(store, { saving: false, error: message });
          onError?.(message);
        },
      });
    },

    /** Saves (full replace) changes to an existing expense. */
    saveExpense(
      id: string,
      body: UpdateExpenseRequest,
      onSuccess?: (exp: ExpenseDto) => void,
      onError?: (message: string) => void,
    ): void {
      patchState(store, { saving: true, error: null });

      svc.update(id, body).subscribe({
        next: (exp) => {
          patchState(store, {
            saving: false,
            activeExpense: exp,
            items: store.items().map((item) =>
              item.id === id
                ? {
                    ...item,
                    type: exp.type,
                    supplierName: exp.supplierName,
                    receiptNumber: exp.receiptNumber,
                    name: exp.name,
                    amount: exp.amount,
                    vatAmount: exp.vatAmount,
                    totalAmount: exp.totalAmount,
                    date: exp.date,
                    isPaid: exp.isPaid,
                  }
                : item,
            ),
          });
          onSuccess?.(exp);
        },
        error: (err: { message?: string }) => {
          const message = err.message ?? 'Failed to save expense';
          patchState(store, { saving: false, error: message });
          onError?.(message);
        },
      });
    },

    /** Toggles paid status on an expense. */
    togglePaid(
      id: string,
      onSuccess?: () => void,
      onError?: (message: string) => void,
    ): void {
      svc.togglePaid(id).subscribe({
        next: (exp) => {
          patchState(store, {
            items: store.items().map((item) =>
              item.id === id ? { ...item, isPaid: exp.isPaid } : item,
            ),
            activeExpense: store.activeExpense()?.id === id
              ? { ...store.activeExpense()!, isPaid: exp.isPaid }
              : store.activeExpense(),
          });
          onSuccess?.();
        },
        error: (err: { message?: string }) =>
          onError?.(err.message ?? 'Failed to update status'),
      });
    },

    /** Removes a deleted expense from state. */
    removeExpense(
      id: string,
      onSuccess?: () => void,
      onError?: (message: string) => void,
    ): void {
      patchState(store, { deleting: true, error: null });

      svc.delete(id).subscribe({
        next: () => {
          patchState(store, {
            deleting: false,
            items: store.items().filter((e) => e.id !== id),
            activeExpense: store.activeExpense()?.id === id ? null : store.activeExpense(),
            activeId: store.activeId() === id ? null : store.activeId(),
          });
          onSuccess?.();
        },
        error: (err: { message?: string }) => {
          const message = err.message ?? 'Failed to delete expense';
          patchState(store, { deleting: false, error: message });
          onError?.(message);
        },
      });
    },

    /** Updates filter state (does not trigger API call). */
    setFilter(partial: Partial<ExpenseFilters>): void {
      patchState(store, { filters: { ...store.filters(), ...partial } });
    },

    /** Clears active expense (e.g. when modal closes). */
    clearActive(): void {
      patchState(store, { activeExpense: null, activeId: null });
    },

    /** Forces a fresh list reload. */
    invalidateList(): void {
      patchState(store, { listLoaded: false });
    },

    /** Resets to initial state on sign-out. */
    clearExpenses(): void {
      patchState(store, initialState);
    },
  })),
);
