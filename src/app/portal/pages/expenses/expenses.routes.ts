import { Routes } from '@angular/router';

export const expensesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/expenses-list.page').then((m) => m.ExpensesListPageComponent),
  },
];
