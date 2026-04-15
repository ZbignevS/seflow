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


export const FOOTER_COL_HREFS: readonly (readonly string[])[] = [
  ['#features', '#how-it-works', '#pricing', '/security'],
  ['/about', '/blog', '/careers', '/press'],
  ['/help', '/contact', '/privacy', '/terms'],
] as const;
