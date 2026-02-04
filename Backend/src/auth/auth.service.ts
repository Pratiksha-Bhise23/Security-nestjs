import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { pool } from '../config/database.config';
import { generateOtp } from '../utils/otp-generator';
import { sendEmail } from '../utils/send-email';
import { Role } from './enums/role.enum';
import { CsrfService } from '../csrf/csrf.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private csrfService: CsrfService,
  ) {}

  async sendOtp(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email format');
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      console.log(`[OTP] Generating OTP for ${email}`);
      
      await pool.query(
        `INSERT INTO users (email, otp, otp_expiry, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (email)
         DO UPDATE SET otp = $2, otp_expiry = $3, updated_at = NOW()`,
        [email, otp, expiry]
      );

      console.log(`[OTP] OTP generated for ${email}: ${otp}`);
      
      try {
        await sendEmail(email, otp);
        console.log(`[EMAIL] Email sent successfully to ${email}`);
      } catch (emailError) {
        console.warn(`[EMAIL] Email sending failed for ${email}:`, emailError.message);
        // Continue even if email fails - OTP is still valid in DB
        // In development/test, log the OTP to console
        console.log(`[DEV] Use this OTP for testing: ${otp}`);
      }

      return {
        success: true,
        message: 'OTP sent successfully to your email',
        email,
      };
    } catch (error) {
      console.error('[ERROR] Error in sendOtp:', error);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new BadRequestException('Email and OTP are required');
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!result.rows.length) {
      throw new UnauthorizedException('User not found');
    }

    const user = result.rows[0];

    if (user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (new Date() > new Date(user.otp_expiry)) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Clear OTP after successful verification
    await pool.query(
      'UPDATE users SET otp = NULL, otp_expiry = NULL, is_verified = true, updated_at = NOW() WHERE email = $1',
      [email]
    );

    // Generate JWT token with role
    const userRole = user.role || Role.User;
    const token = this.jwtService.sign(
      { email, id: user.id, role: userRole },
      { expiresIn: '7d' }
    );

    // Generate CSRF token for authenticated user
    const csrfToken = this.csrfService.generateToken();
    this.csrfService.storeToken(user.id, csrfToken);

    return {
      success: true,
      message: 'OTP verified successfully',
      token,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
      },
      role: userRole,
    };
  }

  //     email,
  //     role: userRole,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //       role: userRole,
  //     },
  //   };
  // }

  async getProfile(email: string) {
    if (!email) {
      throw new UnauthorizedException('Email not provided');
    }

    const result = await pool.query('SELECT id, email, role, is_verified, created_at FROM users WHERE email = $1', [email]);

    if (!result.rows.length) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      user: result.rows[0],
    };
  }}

