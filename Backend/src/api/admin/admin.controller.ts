import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../auth/enums/role.enum';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get dashboard statistics
   * Admin only
   */
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(@Request() req: any) {
    return await this.adminService.getDashboardStats();
  }

  /**
   * Get all users with pagination
   * Admin only
   */
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.adminService.getAllUsers(
      parseInt(page),
      parseInt(limit),
    );
  }

  /**
   * Update user role
   * Admin only
   */
  @Put('users/:id/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('id') userId: string,
    @Body() body: { role: 'user' | 'admin' },
  ) {
    return await this.adminService.updateUserRole(parseInt(userId), body.role);
  }

  /**
   * Delete user
   * Admin only
   */
  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') userId: string) {
    return await this.adminService.deleteUser(parseInt(userId));
  }
}
