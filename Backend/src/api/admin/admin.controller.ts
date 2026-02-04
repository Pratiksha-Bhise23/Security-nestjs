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
import { CsrfGuard } from '../../csrf/csrf.guard';
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
   * Admin only - requires CSRF token
   */
  @Put('users/:id/role')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('id') userId: string,
    @Body() body: { role: 'user' | 'admin' },
    @Request() req: any,
  ) {
    const response = await this.adminService.updateUserRole(parseInt(userId), body.role);
    
    // Include new CSRF token in response if available
    if (req.csrfToken) {
      return {
        ...response,
        csrfToken: req.csrfToken,
      };
    }
    
    return response;
  }

  /**
   * Delete user
   * Admin only - requires CSRF token
   */
  @Delete('users/:id')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id') userId: string,
    @Request() req: any,
  ) {
    const response = await this.adminService.deleteUser(parseInt(userId));
    
    // Include new CSRF token in response if available
    if (req.csrfToken) {
      return {
        ...response,
        csrfToken: req.csrfToken,
      };
    }
    
    return response;
  }
}
