import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { PricingPlanDto } from '@seflow/shared/api-types';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlansService {
  private readonly http = inject(HttpClient);

  getPlans(): Observable<PricingPlanDto[]> {
    return this.http.get<PricingPlanDto[]>(`${environment.apiUrl}/plans`);
  }
}
