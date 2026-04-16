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
import type { ClientDto } from '@seflow/contracts';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
@UseGuards(FirebaseAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /** GET /clients — all clients for the authenticated user */
  @Get()
  getClients(@Req() req: AuthenticatedRequest): Promise<ClientDto[]> {
    return this.clientsService.getClients(req.user.uid);
  }

  /** GET /clients/:id — single client with invoice summary */
  @Get(':id')
  getClient(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ClientDto> {
    return this.clientsService.getClientById(req.user.uid, id);
  }

  /** POST /clients — create new client */
  @Post()
  createClient(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateClientDto,
  ): Promise<ClientDto> {
    return this.clientsService.createClient(req.user.uid, dto);
  }

  /** PATCH /clients/:id — update existing client */
  @Patch(':id')
  updateClient(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<ClientDto> {
    return this.clientsService.updateClient(req.user.uid, id, dto);
  }

  /** DELETE /clients/:id — delete client */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteClient(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    return this.clientsService.deleteClient(req.user.uid, id);
  }
}
