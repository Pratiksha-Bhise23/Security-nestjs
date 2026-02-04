import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
   * Verify OTP and set cookie-based authentication
   * Public endpoint - no authentication required
   * Sets HTTP-only cookie with JWT token and CSRF token cookie
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyOtp(dto.email, dto.otp);
    
    console.log('[Auth] Setting cookies for:', dto.email);
    
    // Determine cookie settings based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set JWT token as HTTP-only cookie (secure, cannot be accessed by JS)
    res.cookie('authToken', result.token, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'lax', // Works with HTTP on localhost, 'strict' for production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Set CSRF token as a regular cookie (frontend can read it)
    res.cookie('csrfToken', result.csrfToken, {
      httpOnly: false, // Accessible to JavaScript
      secure: isProduction,
      sameSite: 'lax', // Works with both localhost and cross-origin with credentials
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    });

    console.log('[Auth] Cookies set. Auth Token length:', result.token.length, 'CSRF Token:', result.csrfToken.substring(0, 10) + '...');

    return {
      success: result.success,
      message: result.message,
      user: result.user,
      role: result.role,
      csrfToken: result.csrfToken,
    };
  }

  /**
   * Logout endpoint to clear authentication cookies
   * Clears both authToken and csrfToken cookies
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear authentication cookies
    res.clearCookie('authToken', { path: '/' });
    res.clearCookie('csrfToken', { path: '/' });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  // @Get('profile')
  // async getProfile(@Req() req) {
  //   // AuthGuard already verified token and attached payload
  //   const email = req.user?.email;

  //   return await this.authService.getProfile(email);
  // }
}
