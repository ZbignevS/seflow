import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, type Observable } from 'rxjs';
import type { TaxInput, TaxResult, TaxRules } from '../models/tax.models';
import { MALTA_TAX_RULES_2026 } from '../data/tax-rules.data';
import { calculateTax } from '../utils/tax-calculations';

const DEFAULT_INPUT: TaxInput = {
  annualIncome: 10_000,
  expenses: 0,
  isPartTime: false,
};

/**
 * Provided at the page level (not root) so its state resets on navigation.
 * To support additional countries, call setRules() with a different TaxRules object.
 */
@Injectable()
export class TaxCalculatorService {
  private readonly input$ = new BehaviorSubject<TaxInput>(DEFAULT_INPUT);
  private readonly rules$ = new BehaviorSubject<TaxRules>(MALTA_TAX_RULES_2026);

  /** Emits a fresh TaxResult whenever input or rules change. */
  readonly result$: Observable<TaxResult> = combineLatest([this.input$, this.rules$]).pipe(
    map(([input, rules]) => calculateTax(input, rules)),
  );

  /** Exposes active rules for display (country, year, etc.). */
  readonly activeRules$: Observable<TaxRules> = this.rules$.asObservable();

  updateInput(input: TaxInput): void {
    this.input$.next(input);
  }

  setRules(rules: TaxRules): void {
    this.rules$.next(rules);
  }
}
