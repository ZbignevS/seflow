import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import type {
  InvoiceDto,
  InvoiceListItemDto,
  UpdateInvoiceRequest,
} from '@seflow/contracts';
import { InvoicesService } from '../services/invoices.service';

interface InvoiceState {
  /** Lightweight list items shown in the invoice list view */
  items: InvoiceListItemDto[];
  /** Full invoice currently open in the editor/viewer */
  activeInvoice: InvoiceDto | null;
  /** ID of the invoice being opened (prevents duplicate loads) */
  activeId: string | null;
  listLoaded: boolean;
  listLoading: boolean;
  activeLoading: boolean;
  saving: boolean;
  finalizing: boolean;
  /** ID of the invoice currently being deleted, null if none */
  deletingId: string | null;
  error: string | null;
}

const initialState: InvoiceState = {
  items: [],
  activeInvoice: null,
  activeId: null,
  listLoaded: false,
  listLoading: false,
  activeLoading: false,
  saving: false,
  finalizing: false,
  deletingId: null,
  error: null,
};

export const InvoiceStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    /** Total amount across all listed invoices */
    totalRevenue: computed(() =>
      store.items().reduce((sum, inv) => sum + inv.total, 0),
    ),
    /** Count of invoices by status */
    draftCount: computed(
      () => store.items().filter((i) => i.status === 'draft').length,
    ),
    finalizedCount: computed(
      () => store.items().filter((i) => i.status === 'finalized').length,
    ),
  })),

  withMethods((store, svc = inject(InvoicesService)) => ({
    /**
     * Loads the invoice list once per session.
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
            error: err.message ?? 'Failed to load invoices',
          }),
      });
    },

    /**
     * Loads a single full invoice into activeInvoice.
     * No-ops when the same invoice is already active.
     */
    loadInvoice(id: string): void {
      if (store.activeId() === id && store.activeInvoice()) return;

      patchState(store, { activeLoading: true, activeId: id, error: null });

      svc.getById(id).subscribe({
        next: (inv) =>
          patchState(store, { activeInvoice: inv, activeLoading: false }),
        error: (err: { message?: string }) =>
          patchState(store, {
            activeLoading: false,
            error: err.message ?? 'Failed to load invoice',
          }),
      });
    },

    /**
     * Creates a new draft invoice immediately.
     * Returns the created invoice via onCreated so the caller can navigate to it.
     * Calls onError (if provided) when the request fails.
     */
    createDraft(
      onCreated: (inv: InvoiceDto) => void,
      onError?: (message: string) => void,
    ): void {
      patchState(store, { saving: true, error: null });

      svc.create().subscribe({
        next: (inv) => {
          const listItem: InvoiceListItemDto = {
            id: inv.id,
            serialNumber: inv.serialNumber,
            status: inv.status,
            type: inv.type,
            currency: inv.currency,
            receiverName: inv.receiver?.name ?? '',
            total: inv.totals?.total ?? 0,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            createdAt: inv.createdAt,
            clientId: inv.receiver?.clientId,
          };
          patchState(store, {
            saving: false,
            items: [listItem, ...store.items()],
            activeInvoice: inv,
            activeId: inv.id,
          });
          onCreated(inv);
        },
        error: (err: { message?: string }) => {
          const message = err.message ?? 'Failed to create invoice';
          patchState(store, { saving: false, error: message });
          onError?.(message);
        },
      });
    },

    /**
     * Saves changes to the active draft. Backend recalculates all totals.
     * Merges the response back into activeInvoice (backend is source of truth).
     */
    saveDraft(id: string, body: UpdateInvoiceRequest, onSaved?: () => void): void {
      patchState(store, { saving: true, error: null });

      svc.update(id, body).subscribe({
        next: (inv) => {
          // Guard: don't overwrite a finalized invoice with a stale PATCH response
          // (can happen if finalize raced ahead of the save response).
          const alreadyFinalized = store.activeInvoice()?.status === 'finalized';
          patchState(store, {
            saving: false,
            ...(!alreadyFinalized && { activeInvoice: inv }),
            // Keep list item in sync with updated totals
            items: store.items().map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: inv.status,
                    receiverName: inv.receiver?.name ?? item.receiverName,
                    total: inv.totals?.total ?? item.total,
                    dueDate: inv.dueDate,
                  }
                : item,
            ),
          });
          onSaved?.();
        },
        error: (err: { message?: string }) =>
          patchState(store, {
            saving: false,
            error: err.message ?? 'Failed to save invoice',
          }),
      });
    },

    /**
     * Finalizes the active invoice — makes it immutable.
     * Returns the finalized invoice via callback.
     */
    finalizeInvoice(
      id: string,
      onFinalized: (inv: InvoiceDto) => void,
      onError?: (msg: string) => void,
    ): void {
      patchState(store, { finalizing: true, error: null });

      svc.finalize(id).subscribe({
        next: (inv) => {
          patchState(store, {
            finalizing: false,
            activeInvoice: inv,
            items: store.items().map((item) =>
              item.id === id
                ? { ...item, status: 'finalized', serialNumber: inv.serialNumber }
                : item,
            ),
          });
          onFinalized(inv);
        },
        error: (err: { error?: { message?: string | string[] }; message?: string }) => {
          const serverMsg = err.error?.message;
          const msg = (Array.isArray(serverMsg) ? serverMsg[0] : serverMsg)
            ?? err.message
            ?? 'Failed to finalize invoice';
          patchState(store, { finalizing: false, error: msg });
          onError?.(msg);
        },
      });
    },

    /**
     * Deletes a draft invoice via the API, then removes it from state.
     */
    deleteDraft(
      id: string,
      onDeleted?: () => void,
      onError?: (msg: string) => void,
    ): void {
      patchState(store, { deletingId: id, error: null });

      svc.delete(id).subscribe({
        next: () => {
          patchState(store, {
            deletingId: null,
            items: store.items().filter((i) => i.id !== id),
            activeInvoice: store.activeInvoice()?.id === id ? null : store.activeInvoice(),
            activeId: store.activeId() === id ? null : store.activeId(),
          });
          onDeleted?.();
        },
        error: (err: { error?: { message?: string | string[] }; message?: string }) => {
          const serverMsg = err.error?.message;
          const msg = (Array.isArray(serverMsg) ? serverMsg[0] : serverMsg)
            ?? err.message
            ?? 'Failed to delete invoice';
          patchState(store, { deletingId: null, error: msg });
          onError?.(msg);
        },
      });
    },

    /** Forces a fresh list reload (e.g. after finalization). */
    invalidateList(): void {
      patchState(store, { listLoaded: false });
    },

    /** Resets to initial state on sign-out. */
    clearInvoices(): void {
      patchState(store, initialState);
    },
  })),
);
