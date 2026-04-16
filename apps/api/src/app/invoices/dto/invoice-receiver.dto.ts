import { IsIn, IsOptional, IsString } from 'class-validator';
import type { InvoiceReceiver, ReceiverType } from '@seflow/contracts';

export class InvoiceReceiverDto implements Pick<InvoiceReceiver, 'type' | 'name'> {
  @IsIn(['local', 'eu_business', 'foreign_company', 'foreign_person'])
  readonly type!: ReceiverType;

  @IsString()
  readonly name!: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsString()
  readonly companyCode?: string;

  @IsOptional()
  @IsString()
  readonly vatNumber?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsString()
  readonly clientId?: string;
}
