import { Injectable, Logger } from '@nestjs/common';

export interface ViesCheckResult {
  readonly valid: boolean;
  readonly countryCode?: string;
  readonly vatNumber?: string;
  readonly name?: string;
  readonly address?: string;
  readonly checkedAt: string;
}

/**
 * VIES (VAT Information Exchange System) validation service.
 *
 * Currently a stub — returns a format-based result without calling
 * the live VIES SOAP endpoint. Replace the `checkVies` method body
 * with a real HTTP call when the integration is ready.
 *
 * To integrate: POST to https://ec.europa.eu/taxation_customs/vies/rest-api/ms/{countryCode}/vat/{vatNumber}
 */
@Injectable()
export class VatValidationService {
  private readonly logger = new Logger(VatValidationService.name);

  async validateEuVat(rawVatNumber: string): Promise<ViesCheckResult> {
    const cleaned = rawVatNumber.trim().toUpperCase().replace(/\s+/g, '');
    const countryCode = cleaned.slice(0, 2);
    const vatNumber = cleaned.slice(2);

    // Basic format check
    if (!/^[A-Z]{2}$/.test(countryCode) || vatNumber.length < 2) {
      return { valid: false, checkedAt: new Date().toISOString() };
    }

    this.logger.log(`VIES stub check for ${countryCode}${vatNumber}`);

    // TODO: Replace with live VIES REST API call
    // const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`;
    // const response = await fetch(url);
    // const data = await response.json();

    // Stub: treat any well-formed number as valid for now
    return {
      valid: true,
      countryCode,
      vatNumber,
      checkedAt: new Date().toISOString(),
    };
  }
}
