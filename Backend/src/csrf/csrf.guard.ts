import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CsrfService } from './csrf.service';

/**
 * CSRF Guard - Validates CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
 * 
 * Token should be provided in:
 * - Header: X-CSRF-Token
 * - Body: _csrf (for form submissions)
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Skip CSRF validation for GET and OPTIONS requests
    if (method === 'GET' || method === 'OPTIONS' || method === 'HEAD') {
      return true;
    }

    // Only validate for state-changing methods
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return true;
    }

    const user = request.user;
    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated for CSRF validation');
    }

    // Get CSRF token from request
    const token = this.extractToken(request);

    if (!token) {
      throw new ForbiddenException('CSRF token is missing');
    }

    // Validate token
    const isValid = this.csrfService.validateToken(user.id, token);

    if (!isValid) {
      throw new ForbiddenException('Invalid or expired CSRF token');
    }

    // Clear token after successful validation (single-use)
    this.csrfService.clearToken(user.id);

    // Generate new token for next request
    const newToken = this.csrfService.generateToken();
    this.csrfService.storeToken(user.id, newToken);

    // Attach new token to request for response
    request.csrfToken = newToken;

    return true;
  }

  /**
   * Extract CSRF token from request
   * Priority: Header > Body > Query
   */
  private extractToken(request: any): string | null {
    // Check header first
    const headerToken = request.headers['x-csrf-token'];
    if (headerToken) {
      return headerToken;
    }

    // Check body
    if (request.body && request.body._csrf) {
      return request.body._csrf;
    }

    // Check query params
    if (request.query && request.query._csrf) {
      return request.query._csrf;
    }

    return null;
  }
}
