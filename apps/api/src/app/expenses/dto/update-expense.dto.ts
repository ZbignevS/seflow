import type { UpdateExpenseRequest } from '@seflow/contracts';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends CreateExpenseDto implements UpdateExpenseRequest {}
