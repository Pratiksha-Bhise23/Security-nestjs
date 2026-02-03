import { Controller, Post, Body, Get, Headers, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    try {
      return await this.authService.sendOtp(dto.email);
    } catch (error) {
      throw error;
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtp(dto.email, dto.otp);
    } catch (error) {
      throw error;
    }
  }

  @Get('profile')
  async getProfile(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new BadRequestException('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await this.authService.validateToken(token);

    return await this.authService.getProfile(payload.email);
  }
}
