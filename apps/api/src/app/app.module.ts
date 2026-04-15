import { Module } from '@nestjs/common';
import { PlansModule } from './plans/plans.module';
import { TaxRulesModule } from './tax-rules/tax-rules.module';

@Module({
  imports: [PlansModule, TaxRulesModule],
})
export class AppModule {}
