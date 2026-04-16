import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { ClientType, CreateClientRequest, TaxResidency } from '@seflow/contracts';

export class CreateClientDto implements CreateClientRequest {
  @IsString()
  @MinLength(1)
  readonly name!: string;

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

  @IsIn(['company', 'individual'])
  readonly clientType!: ClientType;

  @IsIn(['domestic', 'foreign'])
  readonly taxResidency!: TaxResidency;
}
