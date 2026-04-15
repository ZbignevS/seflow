import { Injectable, NotFoundException } from '@nestjs/common';
import type { TaxRulesDto } from '@seflow/contracts';

const TAX_RULES: TaxRulesDto[] = [
  {
    country: 'Malta',
    countryCode: 'MT',
    currency: 'EUR',
    year: 2026,
    // Progressive income tax brackets (single person)
    brackets: [
      { from: 0, to: 12_000, rate: 0 },
      { from: 12_000, to: 16_000, rate: 0.15 },
      { from: 16_000, to: 60_000, rate: 0.25 },
      { from: 60_000, to: null, rate: 0.35 },
    ],
    // Social Security (Class 2 – self-employed)
    sscRate: 0.15,
    sscCap: null,
    // Part-time regime
    partTimeRate: 0.1,
    partTimeIncomeLimit: 12_000,
  },
];

@Injectable()
export class TaxRulesService {
  find(countryCode: string, year: number): TaxRulesDto {
    const rules = TAX_RULES.find(
      (r) => r.countryCode === countryCode.toUpperCase() && r.year === year,
    );
    if (!rules) {
      throw new NotFoundException(`No tax rules found for ${countryCode} ${year}`);
    }
    return rules;
  }
}
