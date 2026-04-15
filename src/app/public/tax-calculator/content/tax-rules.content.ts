import type { TaxRules } from '../models/tax.models';

/**
 * Malta 2026 tax rules for self-employed individuals (single person).
 *
 * Structured to support multiple countries — add a new constant for each
 * country and swap it in TaxCalculatorService via setRules().
 */
export const MALTA_TAX_RULES_2026: TaxRules = {
  country: 'Malta',
  countryCode: 'MT',
  currency: 'EUR',
  year: 2026,

  // Progressive income tax brackets (single person)
  // Calculation: each bracket taxes only the slice of income that falls within it.
  brackets: [
    { from: 0, to: 12_000, rate: 0 },
    { from: 12_000, to: 16_000, rate: 0.15 },
    { from: 16_000, to: 60_000, rate: 0.25 },
    { from: 60_000, to: null, rate: 0.35 },
  ],

  // Social Security (Class 2 – self-employed)
  sscRate: 0.15,
  sscCap: null, // No annual cap applied; set a number (e.g. 4_000) to enforce one

  // Part-time regime
  partTimeRate: 0.1, // 10% flat rate
  partTimeIncomeLimit: 12_000, // applies only on income up to this amount
};
