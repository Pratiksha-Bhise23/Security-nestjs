import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Attach user payload to request object for access in route handlers
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // First try to get token from Authorization header (for backward compatibility)
    const authHeader = request.headers.authorization?.split(' ') ?? [];
    if (authHeader[0] === 'Bearer' && authHeader[1]) {
      console.log('[AuthGuard] Token found in Authorization header');
      return authHeader[1];
    }

    // Then try to get token from cookies (cookie-based auth)
    const token = request.cookies?.authToken;
    if (token) {
      console.log('[AuthGuard] Token found in cookies');
      return token;
    }

    console.log('[AuthGuard] No token found. Cookies:', request.cookies);
    console.log('[AuthGuard] Authorization header:', request.headers.authorization);
    return undefined;
  }
}
