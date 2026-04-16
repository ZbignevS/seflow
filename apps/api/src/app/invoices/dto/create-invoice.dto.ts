import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateInvoiceRequest, Currency, InvoiceType, VatMode } from '@seflow/contracts';
import { InvoiceItemInputDto } from './invoice-item-input.dto';
import { InvoiceReceiverDto } from './invoice-receiver.dto';

export class CreateInvoiceDto implements CreateInvoiceRequest {
  @IsOptional()
  @IsIn(['standard', 'advance', 'credit'])
  readonly type?: InvoiceType;

  @IsOptional()
  @IsIn(['EUR', 'USD', 'GBP'])
  readonly currency?: Currency;

  @IsOptional()
  @IsIn(['article_10', 'article_11', 'not_registered'])
  readonly vatMode?: VatMode;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceReceiverDto)
  readonly receiver?: InvoiceReceiverDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemInputDto)
  readonly items?: InvoiceItemInputDto[];

  @IsOptional()
  @IsString()
  readonly notes?: string;

  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;

  @IsOptional()
  @IsBoolean()
  readonly isAccounting?: boolean;

  @IsOptional()
  @IsDateString()
  readonly issueDate?: string;
}
