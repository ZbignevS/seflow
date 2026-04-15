import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PlansModule } from './plans/plans.module';
import { TaxRulesModule } from './tax-rules/tax-rules.module';

@Module({
  imports: [AuthModule, UsersModule, PlansModule, TaxRulesModule],
})
export class AppModule {}
