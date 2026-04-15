export type PlanId = 'starter' | 'pro';

export interface PricingPlanData {
  readonly id: PlanId;
  readonly monthlyPrice: number;
  readonly yearlyPrice: number;
  readonly yearlyTotal: number;
  readonly highlighted: boolean;
}

export const PRICING_PLAN_DATA: Record<PlanId, PricingPlanData> = {
  starter: {
    id: 'starter',
    monthlyPrice: 7.99,
    yearlyPrice: 6.67,
    yearlyTotal: 79.99,
    highlighted: false,
  },
  pro: {
    id: 'pro',
    monthlyPrice: 15.99,
    yearlyPrice: 12.83,
    yearlyTotal: 153.99,
    highlighted: true,
  },
};

export const PLAN_IDS: readonly PlanId[] = ['starter', 'pro'] as const;
