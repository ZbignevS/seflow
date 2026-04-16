import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import type { AuthenticatedRequest } from '../../auth/request.types';
import type { ExpenseDto, ExpenseListItemDto } from '@seflow/contracts';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
@UseGuards(FirebaseAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /** GET /expenses — list expenses for the authenticated user */
  @Get()
  list(@Req() req: AuthenticatedRequest): Promise<ExpenseListItemDto[]> {
    return this.expensesService.list(req.user.uid);
  }

  /** GET /expenses/:id — fetch a single expense */
  @Get(':id')
  getById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ExpenseDto> {
    return this.expensesService.getById(req.user.uid, id);
  }

  /** POST /expenses — create a new expense */
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseDto> {
    return this.expensesService.create(req.user.uid, dto);
  }

  /** PUT /expenses/:id — full update of an expense */
  @Put(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseDto> {
    return this.expensesService.update(req.user.uid, id, dto);
  }

  /** PATCH /expenses/:id — partial update of an expense */
  @Patch(':id')
  patch(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseDto> {
    return this.expensesService.update(req.user.uid, id, dto);
  }

  /** DELETE /expenses/:id — delete an expense */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    return this.expensesService.delete(req.user.uid, id);
  }

  /** POST /expenses/:id/toggle-paid — toggle paid status */
  @Post(':id/toggle-paid')
  togglePaid(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ExpenseDto> {
    return this.expensesService.togglePaid(req.user.uid, id);
  }
}
