import { Routes } from '@angular/router';

export const portalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/portal-layout').then((m) => m.PortalLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPageComponent,
          ),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./pages/invoices/invoices.page').then(
            (m) => m.InvoicesPageComponent,
          ),
      },
      {
        path: 'income-expenses',
        loadComponent: () =>
          import('./pages/income-expenses/income-expenses.page').then(
            (m) => m.IncomeExpensesPageComponent,
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/clients/clients.page').then(
            (m) => m.ClientsPageComponent,
          ),
      },
    ],
  },
];
