import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NavbarComponent } from '../landing/components/navbar/navbar';
import { SiteFooterComponent } from '../landing/components/site-footer/site-footer';
import { CalculatorFormComponent } from './components/calculator-form/calculator-form';
import { CalculatorResultComponent } from './components/calculator-result/calculator-result';
import { TaxCalculatorService } from './services/tax-calculator.service';
import { TranslationService } from '@shared/i18n/translation.service';
import type { TaxInput } from './models/tax.models';

@Component({
  selector: 'app-tax-calculator-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, NavbarComponent, SiteFooterComponent, CalculatorFormComponent, CalculatorResultComponent],
  providers: [TaxCalculatorService],
  templateUrl: './tax-calculator.page.html',
  styleUrl: './tax-calculator.page.scss',
})
export class TaxCalculatorPageComponent {
  private readonly ts = inject(TranslationService);
  private readonly service = inject(TaxCalculatorService);

  protected readonly result$ = this.service.result$;

  protected readonly hero = computed(() => this.ts.t().taxCalculator.hero);
  protected readonly form = computed(() => this.ts.t().taxCalculator.form);
  protected readonly resultLabels = computed(() => this.ts.t().taxCalculator.result);
  protected readonly info = computed(() => this.ts.t().taxCalculator.info);

  protected onInputChange(input: TaxInput): void {
    this.service.updateInput(input);
  }
}
