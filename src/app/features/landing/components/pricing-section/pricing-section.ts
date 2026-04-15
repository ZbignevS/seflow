import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import { TranslationService } from '@shared/i18n/translation.service';
import { IconComponent } from '@shared/ui/icon/icon';
import { PLAN_IDS, PRICING_PLAN_DATA } from '../../data/plans';
import type { PlanId } from '../../data/plans';

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

  protected readonly plans = computed(() => {
    const t = this.ts.t().pricing;
    return PLAN_IDS.map((id) => {
      const data = PRICING_PLAN_DATA[id];
      const text = t.plans[id];
      return {
        ...data,
        name: text.name,
        targetLabel: text.targetLabel,
        description: text.description,
        features: text.features,
        ctaLabel: text.ctaLabel,
        badge: 'badge' in text ? text.badge : null,
        inheritsLabel: 'inheritsLabel' in text ? text.inheritsLabel : null,
      };
    });
  });

  protected displayPrice(id: PlanId): string {
    const prices = PRICING_PLAN_DATA[id];
    return (this.billingYearly() ? prices.yearlyPrice : prices.monthlyPrice).toFixed(2);
  }

  protected yearlySaving(id: PlanId): number {
    const p = PRICING_PLAN_DATA[id];
    return Math.round(p.monthlyPrice * 12 - p.yearlyTotal);
  }
}
