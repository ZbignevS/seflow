import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import type { InvoiceItemInput } from '@seflow/contracts';

export class InvoiceItemInputDto implements InvoiceItemInput {
  @IsOptional()
  @IsString()
  readonly id?: string;

  @IsString()
  readonly title!: string;

  @IsString()
  readonly unit!: string;

  @IsNumber()
  @Min(0)
  readonly quantity!: number;

  @IsNumber()
  @Min(0)
  readonly price!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  readonly discount!: number;
}
