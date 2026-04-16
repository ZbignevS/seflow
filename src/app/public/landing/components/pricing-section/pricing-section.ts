import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { TranslationService } from '@core/i18n/services/translation.service';
import { IconComponent } from '@seflow/ui';
import { PlansService } from '../../services/plans.service';
import type { PlanId } from '@seflow/contracts';

@Component({
  selector: 'app-pricing-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatButtonToggleModule, MatCardModule, TranslatePipe, IconComponent],
  templateUrl: './pricing-section.html',
  styleUrl: './pricing-section.scss',
})
export class PricingSectionComponent {
  private readonly ts = inject(TranslationService);
  private readonly plansService = inject(PlansService);

  /** 'public' = marketing landing page (default). 'portal' = authenticated portal. */
  readonly mode = input<'public' | 'portal'>('public');

  /** The plan ID the current user is subscribed to. Only relevant in portal mode. */
  readonly currentPlan = input<PlanId | null>(null);

  /** Emitted when the user clicks "Upgrade" on a plan in portal mode. */
  readonly upgradeRequested = output<PlanId>();

  protected readonly billingYearly = signal(false);

  private readonly planData = toSignal(this.plansService.getPlans(), { initialValue: [] });

  protected readonly plans = computed(() => {
    const t = this.ts.t().pricing;
    return this.planData().map((data) => {
      const text = t.plans[data.id];
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
    const plan = this.planData().find((p) => p.id === id);
    if (!plan) return '—';
    return (this.billingYearly() ? plan.yearlyPrice : plan.monthlyPrice).toFixed(2);
  }

  protected yearlySaving(id: PlanId): number {
    const plan = this.planData().find((p) => p.id === id);
    if (!plan) return 0;
    return Math.round(plan.monthlyPrice * 12 - plan.yearlyTotal);
  }

  protected requestUpgrade(id: PlanId): void {
    this.upgradeRequested.emit(id);
  }
}
