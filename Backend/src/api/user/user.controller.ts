import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CsrfGuard } from '../../csrf/csrf.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.User)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get user profile
   * Protected endpoint - requires valid JWT token with 'user' role
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any) {
    return await this.userService.getProfile(req.user.email);
  }

  /**
   * Update user profile
   * Protected endpoint - requires valid JWT token with 'user' role and CSRF token
   */
  @Put('profile')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    const response = await this.userService.updateProfile(req.user.email, updateData);
    
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
   * Update user email
   * POST endpoint for profile email update
   * Protected endpoint - requires valid JWT token with 'user' role and CSRF token
   */
  @Post('update-profile')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  async updateEmailProfile(@Request() req: any, @Body() updateData: any) {
    const response = await this.userService.updateEmailProfile(
      req.user.email,
      updateData.email,
    );

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
