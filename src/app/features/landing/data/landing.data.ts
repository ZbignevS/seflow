import type { ColorKey, IconType } from '../models/landing.models';

export interface FeatureItem {
  readonly id: 'ui' | 'security' | 'automation';
  readonly iconType: IconType;
  readonly colorKey: ColorKey;
}

export const FEATURE_ITEMS: readonly FeatureItem[] = [
  { id: 'ui', iconType: 'layout', colorKey: 'blue' },
  { id: 'security', iconType: 'shield', colorKey: 'green' },
  { id: 'automation', iconType: 'zap', colorKey: 'purple' },
] as const;

export interface TestimonialAvatar {
  readonly id: string;
  readonly initials: string;
  readonly avatarColor: string;
}

export const TESTIMONIAL_AVATARS: readonly TestimonialAvatar[] = [
  { id: 't1', initials: 'MK', avatarColor: '#2563eb' },
  { id: 't2', initials: 'JT', avatarColor: '#7c3aed' },
] as const;

export type PlanId = 'mini' | 'pro';

export interface PricingPlanData {
  readonly id: PlanId;
  readonly monthlyPrice: number;
  readonly yearlyPrice: number;
  readonly yearlyTotal: number;
  readonly highlighted: boolean;
}

export const PRICING_PLAN_DATA: Record<PlanId, PricingPlanData> = {
  mini: {
    id: 'mini',
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

export const PLAN_IDS: readonly PlanId[] = ['mini', 'pro'] as const;

export const FOOTER_COL_HREFS: readonly (readonly string[])[] = [
  ['#features', '#how-it-works', '#pricing', '/security'],
  ['/about', '/blog', '/careers', '/press'],
  ['/help', '/contact', '/privacy', '/terms'],
] as const;
