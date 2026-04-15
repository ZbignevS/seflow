import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { AuthenticatedRequest } from '../auth/request.types';
import { SyncUserDto } from './dto/sync-user.request.dto';
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
}
