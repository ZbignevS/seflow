import type { TaxBracket, TaxInput, TaxResult, TaxRules } from '../models/tax.models';

/**
 * Calculates progressive income tax by taxing only the slice of income
 * that falls within each bracket.
 *
 * Example (Malta, income = €20,000):
 *   Bracket 0–12k  @ 0%:  12,000 × 0.00 = €0
 *   Bracket 12–16k @ 15%:  4,000 × 0.15 = €600
 *   Bracket 16–60k @ 25%:  4,000 × 0.25 = €1,000
 *   Total = €1,600
 */
export function calculateProgressiveTax(
  income: number,
  brackets: readonly TaxBracket[],
): number {
  if (income <= 0) return 0;

  return brackets.reduce((total, bracket) => {
    const upper = bracket.to ?? Infinity;
    const taxableSlice = Math.max(0, Math.min(income, upper) - bracket.from);
    return total + taxableSlice * bracket.rate;
  }, 0);
}

/**
 * Calculates income tax under the part-time flat-rate regime.
 * The flat rate applies only up to `rules.partTimeIncomeLimit`.
 * Income above the limit is not taxed further under this regime.
 */
export function calculatePartTimeTax(taxableIncome: number, rules: TaxRules): number {
  if (taxableIncome <= 0) return 0;
  return Math.min(taxableIncome, rules.partTimeIncomeLimit) * rules.partTimeRate;
}

/**
 * Calculates Social Security contributions.
 * Respects an optional cap: set `rules.sscCap` to a number to enforce it.
 */
export function calculateSocialSecurity(taxableIncome: number, rules: TaxRules): number {
  if (taxableIncome <= 0) return 0;
  const ssc = taxableIncome * rules.sscRate;
  return rules.sscCap !== null ? Math.min(ssc, rules.sscCap) : ssc;
}

/**
 * Main entry point — derives a full TaxResult from user input and country rules.
 * All intermediate values are preserved in the result for display purposes.
 */
export function calculateTax(input: TaxInput, rules: TaxRules): TaxResult {
  const grossIncome = Math.max(0, input.annualIncome);
  const expenses = Math.max(0, Math.min(input.expenses, grossIncome));
  const taxableIncome = grossIncome - expenses;

  const incomeTax = input.isPartTime
    ? calculatePartTimeTax(taxableIncome, rules)
    : calculateProgressiveTax(taxableIncome, rules.brackets);

  const socialSecurity = calculateSocialSecurity(taxableIncome, rules);
  const netIncome = taxableIncome - incomeTax - socialSecurity;

  const effectiveRate =
    taxableIncome > 0 ? ((incomeTax + socialSecurity) / taxableIncome) * 100 : 0;

  return {
    grossIncome,
    expenses,
    taxableIncome,
    incomeTax,
    socialSecurity,
    netIncome,
    effectiveRate,
  };
}
