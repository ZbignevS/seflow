import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateExpenseRequest, ExpenseType } from '@seflow/contracts';
import { FixedAssetDataDto } from './fixed-asset-data.dto';

export class CreateExpenseDto implements CreateExpenseRequest {
  @IsOptional()
  @IsIn(['general', 'representation', 'supplies', 'fixed_asset'])
  readonly type?: ExpenseType;

  @IsOptional()
  @IsString()
  readonly supplierName?: string;

  @IsOptional()
  @IsString()
  readonly supplierCode?: string;

  @IsOptional()
  @IsString()
  readonly receiptNumber?: string;

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly vatRate?: number;

  @IsOptional()
  @IsDateString()
  readonly date?: string;

  @IsOptional()
  @IsBoolean()
  readonly isPaid?: boolean;

  @IsOptional()
  @IsString()
  readonly attachmentUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FixedAssetDataDto)
  readonly fixedAssetData?: FixedAssetDataDto;
}
