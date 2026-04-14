import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import { TranslationService } from '@shared/i18n/translation.service';
import { IconComponent } from '@shared/ui/icon/icon';
import { PLAN_IDS, PRICING_PLAN_DATA } from '../../data/landing.data';
import type { PlanId } from '../../data/landing.data';

@Component({
  selector: 'app-pricing-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatButtonToggleModule, MatCardModule, TranslatePipe, IconComponent],
  templateUrl: './pricing-section.html',
  styleUrl: './pricing-section.scss',
})
export class PricingSectionComponent {
  private readonly ts = inject(TranslationService);

  protected readonly billingYearly = signal(false);

  protected readonly plans = computed(() =>
    PLAN_IDS.map((id) => {
      const data = PRICING_PLAN_DATA[id];
      const text = this.ts.t().pricing.plans[id];
      const badge = id === 'pro' ? (this.ts.t().pricing.plans.pro as { badge: string }).badge : null;
      return { ...data, ...text, badge };
    }),
  );

  protected displayPrice(id: PlanId): string {
    const prices = PRICING_PLAN_DATA[id];
    return (this.billingYearly() ? prices.yearlyPrice : prices.monthlyPrice).toFixed(2);
  }

  protected yearlySaving(id: PlanId): number {
    const p = PRICING_PLAN_DATA[id];
    return Math.round(p.monthlyPrice * 12 - p.yearlyTotal);
  }
}
