import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { noAuthGuard } from './core/auth/guards/no-auth.guard';

export const routes: Routes = [
  // Public / marketing area — blocked for authenticated users
  {
    path: '',
    canActivate: [noAuthGuard],
    children: [
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
    ],
  },
  // Authenticated portal area
  {
    path: 'portal',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./portal/portal.routes').then((m) => m.portalRoutes),
  },
];
