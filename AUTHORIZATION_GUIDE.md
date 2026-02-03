# Authorization Implementation - Quick Start Guide

## How It Works

### 1. Role Assignment
- Users are assigned roles ('user' or 'admin') in the database
- New users default to 'user' role
- Admin role must be manually set via `PUT /admin/users/:id/role`

### 2. JWT & Authentication
- After OTP verification, user receives JWT containing their role
- JWT is signed with secret key and includes: `{email, id, role}`
- JWT is valid for 7 days

### 3. Authorization Checks
- Every API request (except public endpoints) requires valid JWT
- Admin endpoints additionally check if user role is 'admin'
- Unauthorized requests return 403 Forbidden

---

## API Usage Examples

### Testing with cURL

#### 1. Send OTP
```bash
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

#### 2. Verify OTP (returns JWT and role)
```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'

# Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "role": "user",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### 3. Get User Profile
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/user/profile

# Response:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "is_verified": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### 4. Get Admin Dashboard (Admin Only)
```bash
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  http://localhost:3000/admin/dashboard

# Response:
{
  "success": true,
  "stats": {
    "totalUsers": 5,
    "verifiedUsers": 4,
    "adminUsers": 1,
    "recentUsers": [
      {
        "id": 1,
        "email": "admin@example.com",
        "role": "admin",
        "is_verified": true,
        "created_at": "2024-01-10T08:00:00Z"
      }
    ]
  }
}
```

#### 5. Update User Role (Admin Only)
```bash
curl -X PUT http://localhost:3000/admin/users/2/role \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'

# Response:
{
  "success": true,
  "message": "User role updated to admin",
  "user": {
    "id": 2,
    "email": "newadmin@example.com",
    "role": "admin"
  }
}
```

#### 6. Get All Users with Pagination (Admin Only)
```bash
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  'http://localhost:3000/admin/users?page=1&limit=10'

# Response:
{
  "success": true,
  "data": [...users],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### 7. Delete User (Admin Only)
```bash
curl -X DELETE http://localhost:3000/admin/users/2 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Response:
{
  "success": true,
  "message": "User deleted successfully",
  "user": {
    "id": 2,
    "email": "deleted@example.com"
  }
}
```

---

## Frontend Routes

### User Routes
- **`/`** - Login page (public)
- **`/otp`** - OTP verification (public)
- **`/profile`** - User profile (protected, user role)
  - Redirects to login if not authenticated
  - Redirects to dashboard if user is admin

### Admin Routes
- **`/dashboard`** - Admin dashboard (protected, admin role only)
  - Redirects to login if not authenticated
  - Shows statistics and recent users
  - Cannot be accessed by regular users

---

## Key Decorators & Guards

### @Public()
Marks a route as public (no authentication required)
```typescript
@Public()
@Post('send-otp')
async sendOtp(@Body() dto: SendOtpDto) { }
```

### @Roles()
Specifies required roles for a route
```typescript
@Roles(Role.Admin)
@Get('dashboard')
async getDashboard() { }
```

### @UseGuards()
Applies guards to routes or controllers
```typescript
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin')
export class AdminController { }
```

### @Request()
Injects the request object (contains authenticated user data)
```typescript
async getProfile(@Request() req: any) {
  const user = req.user; // { email, id, role, iat, exp }
}
```

---

## Local Storage Management

The frontend stores the following in localStorage:

```javascript
// After successful OTP verification:
localStorage.setItem('authToken', 'JWT_TOKEN_HERE');
localStorage.setItem('userRole', 'user'); // or 'admin'
localStorage.setItem('user', JSON.stringify({
  id: 1,
  email: 'user@example.com',
  role: 'user'
}));
```

To test as a different user, clear localStorage:
```javascript
localStorage.clear();
```

---

## Database Setup

To create the role column if not exists, run migrations:

```bash
# In Backend directory
npm run migrations

# Or manually:
psql -U postgres -d otp_login_db -f src/config/migrations.sql
```

To manually set a user as admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

To view all users and their roles:
```sql
SELECT id, email, role, is_verified, created_at FROM users;
```

---

## Troubleshooting

### "Forbidden resource" error
- Check JWT is valid (hasn't expired)
- Check user has required role for the endpoint
- Admin endpoints require `role: 'admin'`

### "User not found in request" error
- JWT might not contain user data
- Request doesn't have Authorization header
- AuthGuard might not be applied

### Role not being returned after login
- Check auth service is including role in JWT
- Verify database role column exists and has values
- Check JWT_SECRET environment variable matches

### Frontend not redirecting to dashboard
- Check userRole is stored in localStorage
- Verify admin user has `role: 'admin'` in database
- Check browser console for errors

---

## Environment Variables

Backend `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Admin
DB_NAME=otp_login_db
JWT_SECRET=your-secret-key-change-in-production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Frontend: Update API URL in `src/api/auth.ts` if backend is on different port.

---

## Security Checklist

✅ JWT includes role information
✅ Routes are protected with AuthGuard
✅ Admin routes use RolesGuard
✅ Database has role constraints
✅ Frontend validates roles before showing pages
✅ Public routes explicitly marked with @Public()
✅ Unauthorized requests return proper HTTP status codes
✅ Passwords not stored (using OTP instead)
✅ JWT has expiration (7 days)

---

## Next Steps

1. Test the implementation with curl commands above
2. Create admin accounts in database
3. Test admin dashboard with admin account
4. Test user profile with regular user account
5. Verify cross-role access is blocked properly
