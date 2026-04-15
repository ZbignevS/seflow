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

/** Discriminated union of all supported obligation types. */
export type ObligationType = 'income_tax' | 'social_security';

/** A single payment obligation: what it is, who receives it, and how much. */
export interface TaxObligation {
  readonly type: ObligationType;
  readonly label: string; // display name (e.g. "Income Tax")
  readonly authority: string; // receiving body (e.g. "Commissioner for Revenue")
  readonly amount: number;
}

/** Color token for a chart bar. Maps to a CSS modifier class in TaxChartComponent. */
export type ChartColorKey = 'red' | 'orange' | 'green';

export interface ChartItem {
  readonly label: string;
  readonly value: number;
  readonly colorKey: ChartColorKey;
}

export interface TaxResult {
  readonly grossIncome: number;
  readonly expenses: number;
  readonly taxableIncome: number;
  /** Itemised list of payment obligations (only non-zero entries are included). */
  readonly obligations: readonly TaxObligation[];
  /** Sum of all obligation amounts. */
  readonly totalDue: number;
  readonly netIncome: number;
  readonly effectiveRate: number; // (totalDue / taxableIncome) * 100
  /** Array of i18n keys for contextual insights shown below the result. */
  readonly insights: readonly string[];
}
