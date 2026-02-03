# Project Structure - Updated with Authorization

```
Security-nestjs/
├── README.md
├── IMPLEMENTATION_SUMMARY.md     [NEW] - Complete changes overview
├── AUTHORIZATION_GUIDE.md        [NEW] - Quick reference guide
│
├── Backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── lambda.ts
│   │   ├── app.module.ts                    [UPDATED] - Added User & Admin modules
│   │   │
│   │   ├── auth/                            [CORE AUTHENTICATION]
│   │   │   ├── auth.module.ts               [UPDATED] - Export RolesGuard
│   │   │   ├── auth.controller.ts           [UPDATED] - Removed profile endpoint
│   │   │   ├── auth.service.ts              [UPDATED] - Add role to JWT
│   │   │   ├── auth.guard.ts                [EXISTING] - JWT verification
│   │   │   │
│   │   │   ├── enums/
│   │   │   │   └── role.enum.ts             [NEW] - User, Admin roles
│   │   │   │
│   │   │   ├── decorators/
│   │   │   │   ├── public.decorator.ts      [EXISTING] - Mark public routes
│   │   │   │   └── roles.decorator.ts       [NEW] - Specify required roles
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   └── roles.guard.ts           [NEW] - Check user roles
│   │   │   │
│   │   │   └── dto/
│   │   │       ├── send-otp.dto.ts
│   │   │       └── verify-otp.dto.ts
│   │   │
│   │   ├── api/                             [NEW STRUCTURE]
│   │   │   ├── user/                        [NEW] User API
│   │   │   │   ├── user.module.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   └── user.service.ts
│   │   │   │
│   │   │   └── admin/                       [NEW] Admin API
│   │   │       ├── admin.module.ts
│   │   │       ├── admin.controller.ts
│   │   │       └── admin.service.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── mock-database.ts
│   │   │   └── migrations.sql               [UPDATED] - Added role column
│   │   │
│   │   └── utils/
│   │       ├── otp-generator.ts
│   │       └── send-email.ts
│   │
│   └── test/
│       ├── app.e2e-spec.ts
│       └── jest-e2e.json
│
└── Frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx                          [UPDATED] - Added /dashboard route
    │   ├── App.css
    │   ├── index.css
    │   │
    │   ├── api/
    │   │   └── auth.ts
    │   │
    │   ├── pages/
    │   │   ├── Login.tsx                    [EXISTING]
    │   │   ├── Otp.tsx                      [UPDATED] - Role-based redirect
    │   │   ├── Profile.tsx                  [UPDATED] - Role validation
    │   │   └── Dashboard.tsx                [NEW] - Admin dashboard
    │   │
    │   └── assets/
    │
    └── public/
```

## Module Dependencies

```
AuthModule
├── JwtModule (global)
├── AuthGuard (global)
├── RolesGuard
├── Public decorator
├── Roles decorator
└── Role enum

UserModule
├── UserController
├── UserService
└── AuthGuard (used)

AdminModule
├── AdminController
├── AdminService
├── AuthGuard (used)
└── RolesGuard (used)
```

## Route Structure

```
Authentication Routes (Public)
├── POST /auth/send-otp
└── POST /auth/verify-otp

User Routes (Protected - Any authenticated user)
├── GET /user/profile
└── PUT /user/profile

Admin Routes (Protected - Admin only)
├── GET /admin/dashboard
├── GET /admin/users?page=1&limit=10
├── PUT /admin/users/:id/role
└── DELETE /admin/users/:id
```

## Data Model

```
User Entity
├── id: number (primary key)
├── email: string (unique)
├── role: 'user' | 'admin' (default: 'user')
├── otp: string (temporary, cleared after verification)
├── otp_expiry: timestamp (temporary)
├── is_verified: boolean (default: false)
├── created_at: timestamp
└── updated_at: timestamp
```

## JWT Payload

```json
{
  "email": "user@example.com",
  "id": 1,
  "role": "user",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Frontend State Management

```
localStorage
├── authToken: "JWT_TOKEN"
├── userRole: "user" | "admin"
└── user: JSON string
    ├── id
    ├── email
    └── role
```

## Flow Diagrams

### User Registration & Login Flow
```
Login Page
    ↓
[Enter Email]
    ↓
POST /auth/send-otp
    ↓
OTP Page
    ↓
[Enter OTP]
    ↓
POST /auth/verify-otp
    ↓ (Get JWT + Role)
[Store in localStorage]
    ↓
Check Role
├─→ role='user' → Profile Page
└─→ role='admin' → Dashboard Page
```

### Authorization Check Flow
```
Request to API
    ↓
Has Authorization Header?
├─ No → 401 Unauthorized
└─ Yes → Verify JWT with AuthGuard
    ↓
    JWT Valid?
    ├─ No → 401 Unauthorized
    └─ Yes → Check @Roles decorator
        ├─ No roles required → Allow
        └─ Roles required → Check user.role in RolesGuard
            ├─ Role matches → Allow
            └─ No match → 403 Forbidden
```

## Changes Summary by File Type

### New Files Created (9)
- `src/auth/enums/role.enum.ts`
- `src/auth/decorators/roles.decorator.ts`
- `src/auth/guards/roles.guard.ts`
- `src/api/user/user.module.ts`
- `src/api/user/user.service.ts`
- `src/api/user/user.controller.ts`
- `src/api/admin/admin.module.ts`
- `src/api/admin/admin.service.ts`
- `src/api/admin/admin.controller.ts`

### Files Modified (8)
- Backend: `auth.service.ts`, `auth.controller.ts`, `auth.module.ts`, `app.module.ts`, `migrations.sql`
- Frontend: `App.tsx`, `Otp.tsx`, `Profile.tsx`

### Documentation Files Created (2)
- `IMPLEMENTATION_SUMMARY.md`
- `AUTHORIZATION_GUIDE.md`

**Total New/Modified Files: 19**

## Key Features

✅ Role-based access control (RBAC)
✅ JWT includes user role
✅ Admin-only dashboard with statistics
✅ User profile management
✅ Admin user management (view, update roles, delete)
✅ Public & protected routes
✅ Role-based frontend routing
✅ Database constraints for role validation
✅ Comprehensive error handling
✅ Professional UI with Tailwind CSS
