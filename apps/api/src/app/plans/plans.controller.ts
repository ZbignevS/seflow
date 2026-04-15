import { Controller, Get } from '@nestjs/common';
import type { PricingPlanDto } from '@seflow/shared/api-types';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll(): PricingPlanDto[] {
    return this.plansService.findAll();
  }
}
