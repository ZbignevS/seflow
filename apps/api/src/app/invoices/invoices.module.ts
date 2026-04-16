import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { VatCalculationService } from './services/vat-calculation.service';
import { InvoiceTotalsService } from './services/invoice-totals.service';
import { VatValidationService } from './services/vat-validation.service';
import { InvoiceFinalizationService } from './services/invoice-finalization.service';
import { SerialNumberService } from './services/serial-number.service';

@Module({
  imports: [AuthModule],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    VatCalculationService,
    InvoiceTotalsService,
    VatValidationService,
    InvoiceFinalizationService,
    SerialNumberService,
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {}
