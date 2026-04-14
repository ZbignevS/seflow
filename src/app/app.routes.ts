import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'self-employed',
    loadComponent: () =>
      import('./features/individual-activity/individual-activity').then(
        (m) => m.IndividualActivityComponent,
      ),
  },
  {
    path: 'tax-calculator',
    loadComponent: () =>
      import('./features/tax-calculator/tax-calculator.page').then(
        (m) => m.TaxCalculatorPageComponent,
      ),
  },
];
