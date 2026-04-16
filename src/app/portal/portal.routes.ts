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
        loadChildren: () =>
          import('./pages/invoices/invoices.routes').then(
            (m) => m.invoicesRoutes,
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
        path: 'expenses',
        loadChildren: () =>
          import('./pages/expenses/expenses.routes').then(
            (m) => m.expensesRoutes,
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/clients/clients.page').then(
            (m) => m.ClientsPageComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.page').then(
            (m) => m.ProfilePageComponent,
          ),
      },
    ],
  },
];
