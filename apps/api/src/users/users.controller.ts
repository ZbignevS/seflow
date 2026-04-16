import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { AuthenticatedRequest } from '../auth/request.types';
import { SyncUserDto } from './dto/sync-user.request.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';
import type { UserDto } from '@seflow/contracts';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Called by the Angular frontend immediately after a successful Firebase
   * login. Creates the Firestore user document on first login; subsequent
   * calls are idempotent and return the existing document.
   *
   * POST /api/users/sync
   */
  @Post('sync')
  sync(@Req() req: AuthenticatedRequest, @Body() body: SyncUserDto): Promise<UserDto> {
    return this.usersService.createUserIfNotExists(
      req.user.uid,
      req.user.email ?? '',
      body.name,
      body.provider,
    );
  }

  /**
   * Returns the Firestore profile of the currently authenticated user.
   *
   * GET /api/users/me
   */
  @Get('me')
  async me(@Req() req: AuthenticatedRequest): Promise<UserDto> {
    const user = await this.usersService.getUserById(req.user.uid);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  /**
   * Updates the authenticated user's full name and/or phone number.
   *
   * PATCH /api/users/me
   */
  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() body: UpdateUserDto): Promise<UserDto> {
    return this.usersService.updateUser(req.user.uid, body);
  }

  /**
   * Changes the authenticated user's password via Firebase Auth.
   *
   * PATCH /api/users/change-password
   */
  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: ChangePasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(req.user.uid, body.newPassword);
  }

  /**
   * Permanently deletes the authenticated user's account from Firebase Auth
   * and Firestore.
   *
   * DELETE /api/users/me
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@Req() req: AuthenticatedRequest): Promise<void> {
    await this.usersService.deleteUser(req.user.uid);
  }
}
