import type { TaxBracket, TaxInput, TaxObligation, TaxResult, TaxRules } from '../models/tax.models';

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

export function calculatePartTimeTax(taxableIncome: number, rules: TaxRules): number {
  if (taxableIncome <= 0) return 0;
  return Math.min(taxableIncome, rules.partTimeIncomeLimit) * rules.partTimeRate;
}

export function calculateSocialSecurity(taxableIncome: number, rules: TaxRules): number {
  if (taxableIncome <= 0) return 0;
  const ssc = taxableIncome * rules.sscRate;
  return rules.sscCap !== null ? Math.min(ssc, rules.sscCap) : ssc;
}

export function buildObligations(
  incomeTax: number,
  socialSecurity: number,
): readonly TaxObligation[] {
  const obligations: TaxObligation[] = [];
  if (incomeTax > 0) {
    obligations.push({
      type: 'income_tax',
      label: 'Income Tax',
      authority: 'Commissioner for Revenue',
      amount: incomeTax,
    });
  }
  if (socialSecurity > 0) {
    obligations.push({
      type: 'social_security',
      label: 'Social Security',
      authority: 'Social Security Department',
      amount: socialSecurity,
    });
  }
  return obligations;
}

export function buildInsights(
  isPartTime: boolean,
  taxableIncome: number,
  incomeTax: number,
  socialSecurity: number,
  brackets: readonly TaxBracket[],
): readonly string[] {
  if (taxableIncome <= 0) return [];
  const keys: string[] = [];
  if (isPartTime) {
    keys.push('taxCalculator.insights.partTimeRegime');
  } else if (incomeTax === 0) {
    keys.push('taxCalculator.insights.belowThreshold');
  } else {
    keys.push('taxCalculator.insights.multipleBrackets');
  }
  if (socialSecurity > 0) {
    keys.push('taxCalculator.insights.sscRequired');
  }
  return keys;
}

export function calculateTax(input: TaxInput, rules: TaxRules): TaxResult {
  const grossIncome = Math.max(0, input.annualIncome);
  const expenses = Math.max(0, Math.min(input.expenses, grossIncome));
  const taxableIncome = grossIncome - expenses;

  const incomeTax = input.isPartTime
    ? calculatePartTimeTax(taxableIncome, rules)
    : calculateProgressiveTax(taxableIncome, rules.brackets);

  const socialSecurity = calculateSocialSecurity(taxableIncome, rules);
  const obligations = buildObligations(incomeTax, socialSecurity);
  const totalDue = obligations.reduce((sum, ob) => sum + ob.amount, 0);
  const netIncome = taxableIncome - totalDue;
  const effectiveRate = taxableIncome > 0 ? (totalDue / taxableIncome) * 100 : 0;
  const insights = buildInsights(input.isPartTime, taxableIncome, incomeTax, socialSecurity, rules.brackets);

  return {
    grossIncome,
    expenses,
    taxableIncome,
    obligations,
    totalDue,
    netIncome,
    effectiveRate,
    insights,
  };
}
