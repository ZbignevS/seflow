import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./public/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'self-employed',
    loadComponent: () =>
      import('./public/individual-activity/individual-activity').then(
        (m) => m.IndividualActivityComponent,
      ),
  },
  {
    path: 'tax-calculator',
    loadComponent: () =>
      import('./public/tax-calculator/tax-calculator.page').then(
        (m) => m.TaxCalculatorPageComponent,
      ),
  },
  {
    path: 'how-to-register',
    loadComponent: () =>
      import('./public/self-employment-guide/self-employment-guide').then(
        (m) => m.SelfEmploymentGuideComponent,
      ),
  },
];
