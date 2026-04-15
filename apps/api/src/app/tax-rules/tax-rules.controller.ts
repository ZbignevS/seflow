import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import type { TaxRulesDto } from '@seflow/shared/api-types';
import { TaxRulesService } from './tax-rules.service';

@Controller('tax-rules')
export class TaxRulesController {
  constructor(private readonly taxRulesService: TaxRulesService) {}

  // GET /api/tax-rules?country=MT&year=2026
  @Get()
  find(
    @Query('country') country: string,
    @Query('year', ParseIntPipe) year: number,
  ): TaxRulesDto {
    return this.taxRulesService.find(country, year);
  }
}
