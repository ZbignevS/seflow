import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { ClientDto } from '@seflow/contracts';
import { ClientsService } from '../services/clients.service';

interface ClientsState {
  clients: ClientDto[];
  selectedClientId: string | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  selectedClientId: null,
  loading: false,
  loaded: false,
  error: null,
};

export const ClientsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    selectedClient: computed(() => {
      const id = store.selectedClientId();
      return id ? (store.clients().find((c) => c.id === id) ?? null) : null;
    }),
  })),

  withMethods((store, clientsService = inject(ClientsService)) => ({
    /**
     * Fetches the full client list from the backend once per session.
     * No-ops if state is already loaded — prevents duplicate API calls
     * when navigating between portal pages.
     */
    loadClients(): void {
      if (store.loaded()) return;

      patchState(store, { loading: true, error: null });

      clientsService.getClients().subscribe({
        next: (clients) =>
          patchState(store, { clients, loading: false, loaded: true }),
        error: (err: { message?: string }) =>
          patchState(store, {
            loading: false,
            error: err.message ?? 'Failed to load clients',
          }),
      });
    },

    /** Sets the active client in the right panel. Pass null to deselect. */
    selectClient(id: string | null): void {
      patchState(store, { selectedClientId: id });
    },

    /** Prepends a newly created client to the cached list. */
    addClient(client: ClientDto): void {
      patchState(store, { clients: [client, ...store.clients()] });
    },

    /** Replaces a single client in the cache after a successful PATCH. */
    updateClient(updated: ClientDto): void {
      patchState(store, {
        clients: store.clients().map((c) => (c.id === updated.id ? updated : c)),
      });
    },

    /** Removes a client from the cache and clears selection if it was selected. */
    removeClient(id: string): void {
      patchState(store, {
        clients: store.clients().filter((c) => c.id !== id),
        selectedClientId: store.selectedClientId() === id ? null : store.selectedClientId(),
      });
    },

    /** Resets to initial state on sign-out so the next session starts fresh. */
    clearClients(): void {
      patchState(store, initialState);
    },
  })),
);
