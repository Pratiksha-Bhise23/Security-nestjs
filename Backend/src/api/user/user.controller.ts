import {
  Controller,
  Get,
  Put,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
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
   * Protected endpoint - requires valid JWT token with 'user' role
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    return await this.userService.updateProfile(req.user.email, updateData);
  }
}


// import {
//   Controller,
//   Get,
//   Put,
//   Body,
//   Request,
//   HttpCode,
//   HttpStatus,
// } from '@nestjs/common';
// import { UserService } from './user.service';
// import { AuthGuard } from '../../auth/auth.guard';

// @Controller('user')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   /**
//    * Get user profile
//    * GET /api/user/profile
//    */
//   @Get('profile')
//   @HttpCode(HttpStatus.OK)
//   async getProfile(@Request() req: any) {
//     return await this.userService.getProfile(req.user.email);
//   }

//   /**
//    * Update user profile
//    * PUT /api/user/profile
//    */
//   @Put('profile')
//   @HttpCode(HttpStatus.OK)
//   async updateProfile(@Request() req: any, @Body() updateData: any) {
//     return await this.userService.updateProfile(req.user.email, updateData);
//   }
// }
