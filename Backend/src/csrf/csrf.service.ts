import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

/**
 * CSRF Token Storage
 * In production, consider using Redis for distributed systems
 */
const csrfTokenStore = new Map<string, { token: string; timestamp: number }>();

@Injectable()
export class CsrfService {
  /**
   * Generate a unique CSRF token
   * Token format: random 32 bytes hex string
   */
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Store CSRF token with timestamp (10 minute expiry)
   */
  storeToken(userId: string, token: string): void {
    csrfTokenStore.set(userId, {
      token,
      timestamp: Date.now(),
    });
  }

  /**
   * Validate CSRF token
   * Checks if token exists, matches, and hasn't expired (10 minutes)
   */
  validateToken(userId: string, token: string): boolean {
    const stored = csrfTokenStore.get(userId);

    if (!stored) {
      return false;
    }

    // Check token match
    if (stored.token !== token) {
      return false;
    }

    // Check expiry (10 minutes = 600000 ms)
    const tokenAge = Date.now() - stored.timestamp;
    if (tokenAge > 10 * 60 * 1000) {
      csrfTokenStore.delete(userId);
      return false;
    }

    return true;
  }

  /**
   * Get stored token for a user
   */
  getToken(userId: string): string | null {
    return csrfTokenStore.get(userId)?.token || null;
  }

  /**
   * Clear CSRF token after successful verification
   */
  clearToken(userId: string): void {
    csrfTokenStore.delete(userId);
  }

  /**
   * Clean up expired tokens (optional maintenance task)
   */
  cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [userId, data] of csrfTokenStore.entries()) {
      if (now - data.timestamp > 10 * 60 * 1000) {
        csrfTokenStore.delete(userId);
      }
    }
  }
}
