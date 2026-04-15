import { IsIn, IsString, MinLength } from 'class-validator';
import type { AuthProvider, SyncUserRequestDto } from '@seflow/contracts';

export class SyncUserDto implements SyncUserRequestDto {
  @IsString()
  @MinLength(0)
  readonly name!: string;

  @IsIn(['password', 'google'])
  readonly provider!: AuthProvider;
}
