import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Send OTP to email
   * Public endpoint - no authentication required
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return await this.authService.sendOtp(dto.email);
  }

  /**
   * Verify OTP and return JWT token
   * Public endpoint - no authentication required
   * Returns token and user role for frontend routing
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.authService.verifyOtp(dto.email, dto.otp);
  }

  // @Get('profile')
  // async getProfile(@Req() req) {
  //   // AuthGuard already verified token and attached payload
  //   const email = req.user?.email;

  //   return await this.authService.getProfile(email);
  // }
}
