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
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import type { AuthenticatedRequest } from '../../auth/request.types';
import type {
  InvoiceDto,
  InvoiceListItemDto,
  InvoicePreviewPayload,
} from '@seflow/contracts';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
@UseGuards(FirebaseAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /** GET /invoices — list invoices for the authenticated user */
  @Get()
  list(@Req() req: AuthenticatedRequest): Promise<InvoiceListItemDto[]> {
    return this.invoicesService.list(req.user.uid);
  }

  /** GET /invoices/:id — fetch a single invoice */
  @Get(':id')
  getById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<InvoiceDto> {
    return this.invoicesService.getById(req.user.uid, id);
  }

  /** POST /invoices — create a new draft invoice */
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceDto> {
    return this.invoicesService.create(req.user.uid, dto);
  }

  /** PATCH /invoices/:id — update a draft invoice and recalculate totals */
  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ): Promise<InvoiceDto> {
    return this.invoicesService.update(req.user.uid, id, dto);
  }

  /** DELETE /invoices/:id — delete a draft invoice */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    return this.invoicesService.delete(req.user.uid, id);
  }

  /** POST /invoices/:id/finalize — lock invoice as immutable */
  @Post(':id/finalize')
  finalize(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<InvoiceDto> {
    return this.invoicesService.finalize(req.user.uid, id);
  }

  /** POST /invoices/:id/preview — get preview-ready render payload */
  @Post(':id/preview')
  preview(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<InvoicePreviewPayload> {
    return this.invoicesService.preview(req.user.uid, id);
  }
}
