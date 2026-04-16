import { IsIn, IsOptional, IsString } from 'class-validator';
import type { ClientType, TaxResidency, UpdateClientRequest } from '@seflow/contracts';

export class UpdateClientDto implements UpdateClientRequest {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsString()
  readonly companyCode?: string;

  @IsOptional()
  @IsString()
  readonly vatCode?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsIn(['company', 'individual'])
  readonly clientType?: ClientType;

  @IsOptional()
  @IsIn(['domestic', 'foreign'])
  readonly taxResidency?: TaxResidency;
}
