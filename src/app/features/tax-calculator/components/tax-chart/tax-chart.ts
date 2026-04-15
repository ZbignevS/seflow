import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { ChartItem } from '../../models/tax.models';

interface ChartBar extends ChartItem {
  readonly pct: number; // height as % of tallest bar (0–100)
}

@Component({
  selector: 'app-tax-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './tax-chart.html',
  styleUrl: './tax-chart.scss',
})
export class TaxChartComponent {
  readonly items = input<ChartItem[] | null>(null);

  /** Normalises values so the tallest bar always reaches 100%. */
  protected readonly bars = computed((): ChartBar[] => {
    const raw = this.items() ?? [];
    const max = Math.max(...raw.map((i) => i.value), 1);
    return raw.map((i) => ({ ...i, pct: Math.max(0, (i.value / max) * 100) }));
  });
}
