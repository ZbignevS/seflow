import { Routes } from '@angular/router';

export const invoicesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/invoices-list.page').then((m) => m.InvoicesListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./editor/invoice-editor.page').then((m) => m.InvoiceEditorPageComponent),
  },
  {
    path: 'preview/:id',
    loadComponent: () =>
      import('./preview/invoice-preview.page').then((m) => m.InvoicePreviewPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./editor/invoice-editor.page').then((m) => m.InvoiceEditorPageComponent),
  },
];
