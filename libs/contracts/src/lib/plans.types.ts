export type PlanId = 'starter' | 'pro';

export interface PricingPlanDto {
  readonly id: PlanId;
  readonly monthlyPrice: number;
  readonly yearlyPrice: number;
  readonly yearlyTotal: number;
  readonly highlighted: boolean;
}
