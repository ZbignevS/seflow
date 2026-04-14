import type { FeatureCardColor } from '@shared/ui/feature-grid/feature-grid';
import type { IconName } from '@shared/ui/icon/icons';

export type IaFeatureId = 'invoicing' | 'taxCalc' | 'scheduling' | 'reports' | 'security' | 'automation';

export interface IaFeatureStructure {
  readonly id: IaFeatureId;
  readonly icon: IconName;
  readonly colorKey: FeatureCardColor;
}

export const IA_FEATURE_STRUCTURE: readonly IaFeatureStructure[] = [
  { id: 'invoicing', icon: 'file-text', colorKey: 'blue' },
  { id: 'taxCalc', icon: 'trending-up', colorKey: 'green' },
  { id: 'scheduling', icon: 'calendar', colorKey: 'purple' },
  { id: 'reports', icon: 'layout', colorKey: 'blue' },
  { id: 'security', icon: 'shield', colorKey: 'green' },
  { id: 'automation', icon: 'zap', colorKey: 'purple' },
] as const;
