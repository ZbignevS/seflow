import { Injectable } from '@nestjs/common';
import type { PricingPlanDto } from '@seflow/contracts';

const PLANS: PricingPlanDto[] = [
  {
    id: 'starter',
    monthlyPrice: 7.99,
    yearlyPrice: 6.67,
    yearlyTotal: 79.99,
    highlighted: false,
  },
  {
    id: 'pro',
    monthlyPrice: 15.99,
    yearlyPrice: 12.83,
    yearlyTotal: 153.99,
    highlighted: true,
  },
];

@Injectable()
export class PlansService {
  findAll(): PricingPlanDto[] {
    return PLANS;
  }
}
