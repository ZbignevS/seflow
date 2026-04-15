import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, map, shareReplay, type Observable } from 'rxjs';
import type { TaxRulesDto } from '@seflow/shared/api-types';
import type { TaxInput, TaxResult } from '../models/tax.models';
import { calculateTax } from '../utils/tax-calculations';
import { environment } from '../../../../environments/environment';

const DEFAULT_INPUT: TaxInput = {
  annualIncome: 10_000,
  expenses: 0,
  isPartTime: false,
};

/**
 * Provided at the page level (not root) so its state resets on navigation.
 * Rules are fetched once from the API and cached via shareReplay.
 */
@Injectable()
export class TaxCalculatorService {
  private readonly http = inject(HttpClient);
  private readonly input$ = new BehaviorSubject<TaxInput>(DEFAULT_INPUT);

  /** Fetched once; replays the cached value to all late subscribers. */
  readonly activeRules$: Observable<TaxRulesDto> = this.http
    .get<TaxRulesDto>(`${environment.apiUrl}/tax-rules?country=MT&year=2026`)
    .pipe(shareReplay(1));

  /** Emits a fresh TaxResult whenever input or rules change. */
  readonly result$: Observable<TaxResult> = combineLatest([this.input$, this.activeRules$]).pipe(
    map(([input, rules]) => calculateTax(input, rules)),
  );

  updateInput(input: TaxInput): void {
    this.input$.next(input);
  }
}
