# CSRF Protection Implementation Guide

## Overview
This document outlines the CSRF (Cross-Site Request Forgery) protection implementation for the Security-nestJS application.

## What is CSRF?
CSRF is a security vulnerability where an attacker tricks a user into performing unwanted actions on a website they're logged into. CSRF protection uses tokens to verify that requests are legitimate.

## Implementation Summary

### Backend (NestJS)

#### 1. CSRF Service (`src/csrf/csrf.service.ts`)
- **Generates** random CSRF tokens (32-byte hex strings)
- **Stores** tokens in memory with timestamps (10-minute expiry)
- **Validates** tokens against stored values
- **Clears** tokens after successful validation (single-use tokens)
- Provides token management methods

#### 2. CSRF Guard (`src/csrf/csrf.guard.ts`)
- **Protects** state-changing routes (POST, PUT, DELETE, PATCH)
- **Skips** safe methods (GET, OPTIONS, HEAD)
- **Extracts** tokens from:
  - `X-CSRF-Token` header (primary)
  - `_csrf` body field (form submissions)
  - `_csrf` query parameter
- **Validates** tokens and generates new ones for next request
- Returns 403 Forbidden for invalid/expired tokens

#### 3. CSRF Module (`src/csrf/csrf.module.ts`)
- Provides `CsrfService` and `CsrfGuard` for dependency injection

### Frontend (React)

#### 1. CSRF Utility (`src/utils/csrf.ts`)
- `getCsrfToken()` - Retrieves token from localStorage
- `setCsrfToken()` - Stores token in localStorage
- `clearCsrfToken()` - Removes token on logout
- `hasCsrfToken()` - Checks if token exists

#### 2. API Integration (`src/api/auth.ts`)
- **verifyOtp()** - Receives and stores initial CSRF token after authentication
- **updateProfile()** - Includes CSRF token in PUT request header
- **updateUserRole()** - Includes CSRF token in PUT request header
- **deleteUser()** - Includes CSRF token in DELETE request header
- All state-changing requests include `X-CSRF-Token` header

## Implementation Details

### Token Flow

```
1. User logs in
   ↓
2. Backend generates CSRF token and returns it with JWT
   ↓
3. Frontend stores CSRF token in localStorage
   ↓
4. For state-changing requests, frontend includes token in X-CSRF-Token header
   ↓
5. Backend validates token
   ↓
6. Backend generates new token and returns it in response
   ↓
7. Frontend updates stored token with new one
   ↓
8. On logout, frontend clears both JWT and CSRF token
```

### Protected Routes

**GET (Safe - No CSRF token required):**
- `GET /api/user/profile`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`

**POST (Safe in this app - Public endpoints):**
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`

**PUT (Protected - CSRF token required):**
- `PUT /api/user/profile`
- `PUT /api/admin/users/:id/role`

**DELETE (Protected - CSRF token required):**
- `DELETE /api/admin/users/:id`

## Preventing Attacks

### 1. Origin Verification
CORS is configured to only allow requests from `http://localhost:5173` (frontend)

### 2. Token Validation
- Every state-changing request must include a valid CSRF token
- Tokens expire after 10 minutes
- Tokens are single-use (new token generated after each use)
- Invalid tokens result in 403 Forbidden response

### 3. Same-Site Cookies (Future Enhancement)
Consider adding SameSite cookie attribute for additional protection:
```typescript
app.use(session({
  cookie: { sameSite: 'strict' }
}))
```

### 4. No Token Exposure
- Tokens are stored in localStorage (not accessible to scripts in this case)
- Tokens are sent in headers, not in URLs (prevents logging)
- Tokens are never logged or exposed in responses for failed requests

## Installation & Setup

### Backend
1. CSRF module is already imported in `AppModule`
2. `CsrfGuard` is applied to protected routes in controllers
3. `CsrfService` is injected into `AuthService`

### Frontend
1. CSRF token is automatically handled by auth API functions
2. Token is stored after successful login
3. Token is automatically included in state-changing requests

## Testing CSRF Protection

### Valid Request (Should succeed)
```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Invalid Token (Should fail with 403)
```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-CSRF-Token: INVALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Missing Token (Should fail with 403)
```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

## Configuration for Production

### Important: In-Memory Storage Limitation
The current implementation uses in-memory storage for tokens. For production with multiple server instances, use Redis:

```typescript
// Replace csrfTokenStore with Redis
import { Redis } from 'ioredis';

const redis = new Redis();

storeToken(userId: string, token: string): void {
  redis.setex(`csrf:${userId}`, 600, token); // 10 minute expiry
}
```

### Other Recommendations
1. **Increase token expiry** if needed (currently 10 minutes)
2. **Use HTTPS only** in production
3. **Enable helmet.js** for additional security headers
4. **Implement rate limiting** to prevent token guessing
5. **Add monitoring** to detect CSRF attacks

## Environment Variables
Update CORS origins in `main.ts` based on your environment:

```typescript
// Development
app.enableCors({
  origin: ['http://localhost:5173'],
  // ...
});

// Production
app.enableCors({
  origin: [process.env.FRONTEND_URL],
  // ...
});
```

## Existing Functionality Preserved

✅ OTP-based authentication still works
✅ JWT token validation still works
✅ Role-based access control still works
✅ All GET requests work without CSRF tokens
✅ All existing endpoints remain functional

## Additional Security Features

1. **Token Expiry**: Tokens expire after 10 minutes
2. **Single-Use Tokens**: New token generated after each request
3. **Secure Storage**: Tokens in memory, cleared on server restart
4. **Header-Based**: Token in header prevents accidental logging
5. **Request Method Filtering**: Only state-changing methods validated

## Files Modified/Created

**Created:**
- `src/csrf/csrf.service.ts`
- `src/csrf/csrf.guard.ts`
- `src/csrf/csrf.module.ts`
- `Frontend/src/utils/csrf.ts`

**Modified:**
- `src/app.module.ts` - Added CsrfModule
- `src/auth/auth.module.ts` - Added CsrfModule import
- `src/auth/auth.service.ts` - Added CSRF token generation
- `src/main.ts` - Added X-CSRF-Token to CORS headers
- `src/api/user/user.controller.ts` - Added CsrfGuard to PUT route
- `src/api/admin/admin.controller.ts` - Added CsrfGuard to PUT and DELETE routes
- `Frontend/src/api/auth.ts` - Added CSRF token handling
- `Frontend/src/pages/Otp.tsx` - Added CSRF token storage
- `Frontend/src/pages/Profile.tsx` - Added CSRF token cleanup on logout
- `Frontend/src/pages/Dashboard.tsx` - Added CSRF token cleanup on logout

## Troubleshooting

**Error: "CSRF token is missing"**
- Ensure token is stored after login
- Check X-CSRF-Token header is being sent
- Verify localStorage has csrfToken key

**Error: "Invalid or expired CSRF token"**
- Token may have expired (10 minute limit)
- Token was already used (single-use)
- Wrong token value being sent
- Try logging in again to get new token

**401 Unauthorized instead of 403**
- JWT token is invalid or expired
- Authorization header is missing
- Fix: Log in again to get new JWT and CSRF token

## Next Steps

1. Consider migrating to Redis for token storage in production
2. Implement rate limiting for failed CSRF validation
3. Add monitoring and alerting for CSRF attacks
4. Document API endpoints with CSRF requirements
5. Add CSRF token refresh endpoint if needed
