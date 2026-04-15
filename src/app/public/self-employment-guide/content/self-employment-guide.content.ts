import type { FeatureCardColor, IconName } from '@seflow/ui';

export type SelfEmploymentStepId = 'ssn' | 'jobsplus' | 'tax' | 'vat';

export interface SelfEmploymentStep {
  readonly id: SelfEmploymentStepId;
  readonly icon: IconName;
  readonly colorKey: FeatureCardColor;
  readonly officialLink: string;
}

export const SELF_EMPLOYMENT_STEPS: readonly SelfEmploymentStep[] = [
  {
    id: 'ssn',
    icon: 'shield',
    colorKey: 'blue',
    officialLink: 'https://socialsecurity.gov.mt',
  },
  {
    id: 'jobsplus',
    icon: 'file-text',
    colorKey: 'green',
    officialLink: 'https://jobsplus.gov.mt/knowledge-base/how-can-i-register-as-self-employed',
  },
  {
    id: 'tax',
    icon: 'trending-up',
    colorKey: 'purple',
    officialLink: 'https://mtca.gov.mt/personal-tax/self-employed/registration',
  },
  {
    id: 'vat',
    icon: 'zap',
    colorKey: 'blue',
    officialLink: 'https://mtca.gov.mt',
  },
] as const;
