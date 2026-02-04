# Security-nestJS: CSRF Protected Authentication System

## Overview

A secure authentication system built with NestJS (backend) and React (frontend) featuring:

- **OTP-Based Authentication** - Email-based one-time passwords
- **JWT Token Management** - Secure token-based authorization
- **CSRF Protection** - Cross-Site Request Forgery defense
- **Role-Based Access Control** - Admin and User roles
- **Type-Safe Implementation** - TypeScript throughout

## ✨ Security Features

### CSRF Protection 🛡️
- **Random Token Generation** - Cryptographically secure 32-byte tokens
- **Token Validation** - All state-changing requests require valid CSRF tokens
- **Single-Use Tokens** - New token generated after each successful request
- **Token Expiry** - Tokens expire after 10 minutes
- **Header-Based** - Tokens sent in X-CSRF-Token header (not in URL)
- **Automatic Refresh** - Frontend automatically updates token from responses

### Authentication
- OTP sent via email
- Time-limited OTP verification (10 minutes)
- JWT token generation (7-day expiry)
- Secure token storage

### Authorization
- Admin role endpoints protected
- User role endpoints protected
- Public endpoints for authentication
- Role-based route access

## 📁 Project Structure

```
Security-nestjs/
├── Backend/
│   ├── src/
│   │   ├── csrf/              # CSRF Protection Module
│   │   │   ├── csrf.service.ts
│   │   │   ├── csrf.guard.ts
│   │   │   └── csrf.module.ts
│   │   ├── auth/              # Authentication
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   ├── api/
│   │   │   ├── user/          # User endpoints
│   │   │   ├── admin/         # Admin endpoints
│   │   │   └── security-test/ # Testing endpoints
│   │   └── main.ts
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── auth.ts        # API functions with CSRF support
│   │   ├── utils/
│   │   │   └── csrf.ts        # CSRF token utilities
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Otp.tsx        # Updated for CSRF token storage
│   │   │   ├── Profile.tsx    # Updated for token cleanup
│   │   │   └── Dashboard.tsx  # Updated for token cleanup
│   │   └── main.tsx
│   └── package.json
│
└── Documentation/
    ├── README.md
    ├── CSRF_PROTECTION.md              # Comprehensive guide
    ├── CSRF_IMPLEMENTATION_SUMMARY.md  # Quick summary
    ├── CSRF_USAGE_EXAMPLES.md          # Code examples
    └── IMPLEMENTATION_CHANGES.md       # What was changed
```

## 🚀 Getting Started

### Backend Setup

```bash
cd Backend
npm install
npm run start:dev
```

Server runs on `http://localhost:3000`

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Application runs on `http://localhost:5173`

## 🔐 Security Workflow

### Login Flow
```
1. User enters email
2. Backend sends OTP via email
3. User enters OTP
4. Backend validates OTP and returns:
   - JWT token (7 days)
   - CSRF token (10 minutes)
5. Frontend stores both tokens
```

### Protected Request Flow
```
1. User makes state-changing request (PUT/DELETE/POST)
2. Frontend includes:
   - JWT in Authorization header
   - CSRF token in X-CSRF-Token header
3. Backend validates both tokens
4. If valid:
   - Request processed
   - New CSRF token generated
   - Response includes new token
5. Frontend updates CSRF token for next request
```

### Logout Flow
```
1. User clicks logout
2. Frontend clears:
   - JWT token
   - CSRF token
   - User data
3. Redirect to login page
```

## 🛡️ Protected Endpoints

### State-Changing Routes (CSRF Required)
- `PUT /api/user/profile` - Update profile
- `PUT /api/admin/users/:id/role` - Change user role
- `DELETE /api/admin/users/:id` - Delete user

### Read-Only Routes (No CSRF Needed)
- `GET /api/user/profile` - Get profile
- `GET /api/admin/dashboard` - Get statistics
- `GET /api/admin/users` - Get users list

### Public Routes (No Auth Required)
- `POST /api/auth/send-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP and get tokens

## 📚 Documentation

### Quick Start
- **CSRF_IMPLEMENTATION_SUMMARY.md** - Overview of what was implemented

### Comprehensive Guides
- **CSRF_PROTECTION.md** - Detailed architecture and implementation
- **CSRF_USAGE_EXAMPLES.md** - Code examples for frontend and backend
- **IMPLEMENTATION_CHANGES.md** - List of all files modified/created

## 🧪 Testing

### Test CSRF Protection

```bash
# Login to get tokens
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}')

JWT=$(echo $RESPONSE | jq -r '.token')
CSRF=$(echo $RESPONSE | jq -r '.csrfToken')

# Test with valid CSRF token (should succeed)
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $JWT" \
  -H "X-CSRF-Token: $CSRF" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# Test without CSRF token (should fail with 403)
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

## 🔑 API Response Format

### OTP Verification Response
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGc...",
  "csrfToken": "a1b2c3d4e5f6...",
  "email": "user@example.com",
  "role": "user",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Protected Request Response
```json
{
  "success": true,
  "message": "Request successful",
  "csrfToken": "f6e5d4c3b2a1...",
  "data": { ... }
}
```

## ⚠️ Important Notes

### Token Management
- CSRF tokens stored in `localStorage` (frontend)
- JWT tokens stored in `localStorage` (frontend)
- Tokens cleared on logout
- Tokens cleared on session expiry

### CORS Configuration
- Only `http://localhost:5173` allowed in development
- Update origins in `main.ts` for production

### For Production
1. Use Redis instead of in-memory token storage
2. Enable HTTPS only
3. Add rate limiting
4. Enable security headers (helmet.js)
5. Update CORS origins to your domain
6. Configure proper environment variables

## 🐛 Troubleshooting

### "CSRF token is missing"
- User is not logged in
- CSRF token cleared or expired
- Solution: Log in again

### "Invalid or expired CSRF token"
- Token older than 10 minutes
- Wrong token being sent
- Solution: Refresh page or log in again

### "401 Unauthorized"
- JWT token invalid or expired
- Solution: Log in again

## 📦 Dependencies

### Backend
- @nestjs/common
- @nestjs/jwt
- @nestjs/config
- pg (PostgreSQL)
- jsonwebtoken
- nodemailer

### Frontend
- React 18
- React Router
- Vite
- TypeScript
- Tailwind CSS

## 🔄 Existing Functionality

✅ OTP authentication preserved
✅ JWT token validation preserved
✅ Role-based access control preserved
✅ All GET requests work as before
✅ All public endpoints unchanged
✅ Error handling improved

## 📝 Configuration

### Environment Variables

**Backend (.env)**
```
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/db
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000/api
```

## 🎯 Next Steps

1. Test the application thoroughly
2. Review CSRF protection documentation
3. Deploy to staging environment
4. Implement Redis for token storage (production)
5. Add monitoring and alerting
6. Configure HTTPS and security headers
7. Update API documentation

## 📞 Support

For issues or questions:
1. Check CSRF_PROTECTION.md for detailed information
2. Review CSRF_USAGE_EXAMPLES.md for code examples
3. Check IMPLEMENTATION_CHANGES.md for what was modified

## ✅ Status

- [x] CSRF Service Created
- [x] CSRF Guard Implemented
- [x] Auth Service Updated
- [x] Protected Routes Configured
- [x] Frontend Integration Complete
- [x] Token Management Implemented
- [x] Documentation Complete
- [x] No Existing Functionality Broken

**Status: Ready for Testing and Deployment** 🚀

---

Last Updated: February 4, 2026
CSRF Protection: Implemented ✨
