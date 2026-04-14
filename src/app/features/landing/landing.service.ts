import { Injectable } from '@angular/core';

export interface ChartBar {
  readonly height: number;
  readonly active: boolean;
}

export interface DashboardTransaction {
  readonly label: string;
  readonly amount: string;
  readonly income: boolean;
}

@Injectable({ providedIn: 'root' })
export class LandingService {
  readonly chartBars: readonly ChartBar[] = [
    { height: 50, active: false },
    { height: 68, active: false },
    { height: 42, active: false },
    { height: 82, active: false },
    { height: 58, active: false },
    { height: 100, active: true },
  ];

  readonly chartLabels: readonly string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  readonly transactions: readonly DashboardTransaction[] = [
    { label: 'Design project', amount: '€1,200', income: true },
    { label: 'Software subscriptions', amount: '€89', income: false },
    { label: 'Client retainer', amount: '€800', income: true },
  ];
}
