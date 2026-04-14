import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { DecimalPipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import type { TaxResult } from '../../models/tax.models';

@Component({
  selector: 'app-calculator-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, CurrencyPipe, TranslatePipe],
  templateUrl: './calculator-result.html',
  styleUrl: './calculator-result.scss',
})
export class CalculatorResultComponent {
  readonly result = input<TaxResult | null>(null);

  protected readonly hasData = computed(() => {
    const r = this.result();
    return r !== null && r.grossIncome > 0;
  });

  /** Width % of the "taxes + SSC" slice in the visual bar (0–100). */
  protected readonly taxBarPct = computed(() => {
    const r = this.result();
    if (!r || r.grossIncome === 0) return 0;
    return Math.min(100, ((r.incomeTax + r.socialSecurity) / r.grossIncome) * 100);
  });

  /** Width % of the "net income" slice in the visual bar (0–100). */
  protected readonly netBarPct = computed(() => Math.max(0, 100 - this.taxBarPct()));
}
