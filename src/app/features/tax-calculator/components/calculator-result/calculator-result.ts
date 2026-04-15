import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { DecimalPipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import { TaxChartComponent } from '../tax-chart/tax-chart';
import type { TaxResult, ChartItem } from '../../models/tax.models';

@Component({
  selector: 'app-calculator-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, CurrencyPipe, TranslatePipe, TaxChartComponent],
  templateUrl: './calculator-result.html',
  styleUrl: './calculator-result.scss',
})
export class CalculatorResultComponent {
  readonly result = input<TaxResult | null>(null);

  protected readonly hasData = computed(() => {
    const r = this.result();
    return r !== null && r.grossIncome > 0;
  });

  protected readonly incomeTaxPct = computed(() => {
    const r = this.result();
    if (!r || r.taxableIncome === 0) return 0;
    const amount = r.obligations.find((o) => o.type === 'income_tax')?.amount ?? 0;
    return (amount / r.taxableIncome) * 100;
  });

  protected readonly socialSecPct = computed(() => {
    const r = this.result();
    if (!r || r.taxableIncome === 0) return 0;
    const amount = r.obligations.find((o) => o.type === 'social_security')?.amount ?? 0;
    return (amount / r.taxableIncome) * 100;
  });

  protected readonly netBarPct = computed(() =>
    Math.max(0, 100 - this.incomeTaxPct() - this.socialSecPct()),
  );

  protected readonly chartItems = computed((): ChartItem[] | null => {
    const r = this.result();
    if (!r || r.taxableIncome === 0) return null;
    const incomeTax = r.obligations.find((o) => o.type === 'income_tax')?.amount ?? 0;
    const ssc = r.obligations.find((o) => o.type === 'social_security')?.amount ?? 0;
    return [
      { label: 'Income Tax', value: incomeTax, colorKey: 'red' },
      { label: 'Social Security', value: ssc, colorKey: 'orange' },
      { label: 'Net Income', value: r.netIncome, colorKey: 'green' },
    ];
  });
}
