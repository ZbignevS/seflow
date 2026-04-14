export interface TaxBracket {
  readonly from: number;
  readonly to: number | null; // null = unlimited (top bracket)
  readonly rate: number; // decimal, e.g. 0.15 = 15%
}

export interface TaxRules {
  readonly country: string;
  readonly countryCode: string;
  readonly currency: string;
  readonly year: number;
  readonly brackets: readonly TaxBracket[];
  readonly sscRate: number; // Social Security rate (decimal)
  readonly sscCap: number | null; // null = no cap; add a number to enforce a cap later
  readonly partTimeRate: number; // flat rate for part-time regime (decimal)
  readonly partTimeIncomeLimit: number; // max income eligible for part-time rate
}

export interface TaxInput {
  readonly annualIncome: number;
  readonly expenses: number;
  readonly isPartTime: boolean;
}

export interface TaxResult {
  readonly grossIncome: number; // = annualIncome (passed through for display)
  readonly expenses: number;
  readonly taxableIncome: number; // = grossIncome - expenses
  readonly incomeTax: number;
  readonly socialSecurity: number;
  readonly netIncome: number; // = taxableIncome - incomeTax - socialSecurity
  readonly effectiveRate: number; // (incomeTax + socialSecurity) / taxableIncome * 100
}
