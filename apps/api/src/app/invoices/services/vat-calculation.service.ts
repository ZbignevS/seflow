import { Injectable } from '@nestjs/common';
import type { ReceiverType, VatMode, VatStatus } from '@seflow/contracts';

/** Standard Maltese VAT rate (18%). Configurable here as the single source. */
const MALTA_STANDARD_VAT_RATE = 18;

/**
 * Malta-compliant VAT engine.
 *
 * Rules (backend is the single source of truth — never duplicate in frontend):
 *
 * - article_11  → always exempt (VAT = 0%)
 * - not_registered → no VAT at all (VAT = 0%)
 * - article_10 + local → 18%
 * - article_10 + eu_business + valid EU VAT → reverse charge (0%, Article 44)
 * - article_10 + eu_business + no valid VAT → 18% (treat as local)
 * - article_10 + foreign_company | foreign_person → export (0%)
 */
@Injectable()
export class VatCalculationService {
  /**
   * Determines the effective VAT status for a transaction.
   *
   * @param vatMode Seller's VAT registration mode
   * @param receiverType Type of the receiver (determines supply rules)
   * @param receiverVatNumber VAT/VIES number provided by the receiver (optional)
   */
  calculateVatStatus(
    vatMode: VatMode,
    receiverType: ReceiverType,
    receiverVatNumber?: string,
  ): VatStatus {
    // Article 11 exemption — seller is exempt regardless of receiver
    if (vatMode === 'article_11') {
      return {
        effectiveRate: 0,
        label: 'VAT Exempt (Article 11)',
        reverseCharge: false,
        exempt: true,
      };
    }

    // Not registered — no VAT mechanism applies
    if (vatMode === 'not_registered') {
      return {
        effectiveRate: 0,
        label: undefined,
        reverseCharge: false,
        exempt: false,
      };
    }

    // article_10 — apply place-of-supply rules
    switch (receiverType) {
      case 'local':
        return {
          effectiveRate: MALTA_STANDARD_VAT_RATE,
          label: undefined,
          reverseCharge: false,
          exempt: false,
        };

      case 'eu_business': {
        const hasValidVat = this.isValidEuVatFormat(receiverVatNumber);
        if (hasValidVat) {
          return {
            effectiveRate: 0,
            label: 'Reverse Charge (Art. 44 EU VAT Directive 2006/112/EC)',
            reverseCharge: true,
            exempt: false,
          };
        }
        // No valid VAT number — charge Maltese VAT as if local
        return {
          effectiveRate: MALTA_STANDARD_VAT_RATE,
          label: undefined,
          reverseCharge: false,
          exempt: false,
        };
      }

      case 'foreign_company':
      case 'foreign_person':
        return {
          effectiveRate: 0,
          label: 'Export — Zero-rated',
          reverseCharge: false,
          exempt: false,
        };

      default:
        return {
          effectiveRate: MALTA_STANDARD_VAT_RATE,
          label: undefined,
          reverseCharge: false,
          exempt: false,
        };
    }
  }

  /**
   * Checks whether the provided string looks like a valid EU VAT number.
   * Format: 2-letter country code + alphanumeric (e.g. MT12345678, DE123456789).
   * Full VIES validation is handled by VatValidationService.
   */
  isValidEuVatFormat(vatNumber?: string): boolean {
    if (!vatNumber || vatNumber.trim().length < 4) return false;
    return /^[A-Z]{2}[A-Z0-9+*]{2,12}$/i.test(vatNumber.trim().toUpperCase());
  }
}
