import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { FixedAssetData } from '@seflow/contracts';

export class FixedAssetDataDto implements Partial<FixedAssetData> {
  @IsOptional()
  @IsString()
  readonly assetGroup?: string;

  @IsOptional()
  @IsString()
  readonly assetName?: string;

  @IsOptional()
  @IsDateString()
  readonly acquisitionDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly depreciationPeriod?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly usagePercent?: number;
}
