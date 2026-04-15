// ── Pricing ───────────────────────────────────────────────────────────────────

export type PlanId = 'starter' | 'pro';

export interface PricingPlanDto {
  readonly id: PlanId;
  readonly monthlyPrice: number;
  readonly yearlyPrice: number;
  readonly yearlyTotal: number;
  readonly highlighted: boolean;
}

// ── Tax rules ─────────────────────────────────────────────────────────────────

export interface TaxBracketDto {
  readonly from: number;
  readonly to: number | null;
  readonly rate: number;
}

export interface TaxRulesDto {
  readonly country: string;
  readonly countryCode: string;
  readonly currency: string;
  readonly year: number;
  readonly brackets: readonly TaxBracketDto[];
  readonly sscRate: number;
  readonly sscCap: number | null;
  readonly partTimeRate: number;
  readonly partTimeIncomeLimit: number;
}

// ── Tax calculation I/O ───────────────────────────────────────────────────────

export interface TaxInputDto {
  readonly annualIncome: number;
  readonly expenses: number;
  readonly isPartTime: boolean;
}

export type ObligationType = 'income_tax' | 'social_security';

export interface TaxObligationDto {
  readonly type: ObligationType;
  readonly label: string;
  readonly authority: string;
  readonly amount: number;
}

export interface TaxResultDto {
  readonly grossIncome: number;
  readonly expenses: number;
  readonly taxableIncome: number;
  readonly obligations: readonly TaxObligationDto[];
  readonly totalDue: number;
  readonly netIncome: number;
  readonly effectiveRate: number;
  readonly insights: readonly string[];
}
