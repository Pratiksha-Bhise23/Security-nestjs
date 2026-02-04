# CSRF Protection - Visual Architecture Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SECURITY-NESTJS                              │
│                    CSRF Protected Architecture                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐      ┌──────────────────────────────┐
│      FRONTEND (React)             │      │    BACKEND (NestJS)           │
│   http://localhost:5173          │      │  http://localhost:3000        │
│                                  │      │                               │
│  ┌────────────────────────────┐ │      │  ┌──────────────────────────┐ │
│  │ Login Page                 │ │      │  │ Auth Controller          │ │
│  │ - Enter Email              │ │──POST─→ │ - /auth/send-otp (Public)│ │
│  │ - Send OTP                 │ │      │  │ - /auth/verify-otp (Public)│
│  └────────────────────────────┘ │      │  └──────────────────────────┘ │
│                                  │      │           ↓                   │
│  ┌────────────────────────────┐ │      │  ┌──────────────────────────┐ │
│  │ OTP Page                   │ │      │  │ Auth Service             │ │
│  │ - Enter OTP Code           │ │      │  │ - Validate OTP           │ │
│  │ - Verify                   │ │      │  │ - Generate JWT           │ │
│  └────────────────────────────┘ │      │  │ - Generate CSRF Token    │ │
│           ↓                      │      │  │ (using CsrfService)      │ │
│  ┌────────────────────────────┐ │      │  └──────────────────────────┘ │
│  │ localStorage               │ │      │           ↓                   │
│  │ - authToken (JWT)          │←─────────Response with:              │
│  │ - csrfToken                │ │      │  - authToken (JWT)           │
│  │ - userRole                 │ │      │  - csrfToken                 │
│  │ - user                     │ │      │  - user data                 │
│  └────────────────────────────┘ │      │  - userRole                  │
│           ↓                      │      │                              │
│  ┌────────────────────────────┐ │      │  ┌──────────────────────────┐ │
│  │ Profile/Dashboard Page     │ │      │  │ CSRF Guard               │ │
│  │                            │ │      │  │ (Middleware)             │ │
│  │ API Calls with:            │ │      │  │ - Validates CSRF token   │ │
│  │ - JWT (Authorization)      │ │      │  │ - Allows GET requests    │ │
│  │ - CSRF Token (X-Header)    │ │      │  │ - Protects PUT/DELETE    │
│  │                            │ │      │  │ - Generates new token    │
│  │ On User Actions:           │ │      │  └──────────────────────────┘ │
│  │ - PUT /user/profile ──────────────→ │          ↓                   │
│  │ - PUT /admin/users/:id/role ───────→ │  ┌──────────────────────────┐ │
│  │ - DELETE /admin/users/:id ────────→ │  │ Controller Routes        │ │
│  │                            │ │      │  │ - All GET (safe)         │ │
│  │ Response received:         │ │      │  │ - PUT/DELETE (protected) │ │
│  │ - Check for csrfToken      │ │      │  │ - Returns new CSRF token │ │
│  │ - Update localStorage      │ │      │  └──────────────────────────┘ │
│  │                            │ │      │                              │
│  │ On Logout:                 │ │      │  ┌──────────────────────────┐ │
│  │ - Clear localStorage       │ │      │  │ Database                 │
│  │ - Clear CSRF Token         │ │      │  │ - User data              │
│  │ - Redirect to /            │ │      │  │ - Roles & Permissions    │
│  └────────────────────────────┘ │      │  └──────────────────────────┘ │
│                                  │      │                               │
│  ┌────────────────────────────┐ │      │  ┌──────────────────────────┐ │
│  │ CSRF Utility (csrf.ts)     │ │      │  │ CSRF Service             │ │
│  │ - getCsrfToken()           │ │      │  │ - generateToken()        │ │
│  │ - setCsrfToken()           │ │      │  │ - storeToken()           │ │
│  │ - clearCsrfToken()         │ │      │  │ - validateToken()        │ │
│  │ - hasCsrfToken()           │ │      │  │ - clearToken()           │ │
│  └────────────────────────────┘ │      │  └──────────────────────────┘ │
└──────────────────────────────────┘      │                               │
                                          └──────────────────────────────┘
                                                    CORS Config:
                                                    - Allow: localhost:5173
                                                    - Headers: X-CSRF-Token
```

## Request/Response Flow Diagram

### 1. Authentication Flow

```
User Input (Email)
    ↓
sendOtp() API Call (no auth needed)
    ↓
Backend: Email validated
    ↓
OTP generated & stored (10 min expiry)
    ↓
Email sent to user
    ↓
Frontend: Display OTP input field

User Input (6-digit OTP)
    ↓
verifyOtp() API Call (no auth needed)
    ↓
Backend:
├─ OTP validated
├─ Generate JWT token (7 days)
├─ Generate CSRF token (10 minutes)
└─ Return both tokens
    ↓
Frontend:
├─ Store JWT in localStorage
├─ Store CSRF token in localStorage
└─ Redirect to /profile or /dashboard
```

### 2. Protected Request Flow (State-Changing)

```
User Performs Action (PUT/DELETE)
    ↓
Frontend API Function:
├─ Read JWT from localStorage
├─ Read CSRF from localStorage
├─ Include JWT in Authorization header
├─ Include CSRF in X-CSRF-Token header
└─ Send request
    ↓
Backend Receives Request:
├─ CORS Check ✓
├─ AuthGuard validates JWT ✓
├─ RolesGuard validates role ✓
└─ CsrfGuard validates CSRF token
    ↓
    ├─ Token Missing? → 403 Forbidden
    ├─ Token Invalid? → 403 Forbidden
    ├─ Token Expired? → 403 Forbidden
    └─ Token Valid? ✓
    ↓
Backend Processes Request:
├─ Clear old CSRF token
├─ Generate new CSRF token
├─ Process the action
└─ Include new CSRF token in response
    ↓
Frontend Receives Response:
├─ Check for csrfToken field
├─ Update localStorage with new token
└─ Display success message
```

### 3. Safe Request Flow (GET)

```
User Reads Data (GET)
    ↓
Frontend API Function:
├─ Read JWT from localStorage
└─ Include JWT in Authorization header
    (NO CSRF token needed)
    ↓
Backend Receives Request:
├─ CORS Check ✓
├─ AuthGuard validates JWT ✓
├─ RolesGuard validates role ✓
└─ CsrfGuard skips (GET is safe)
    ↓
Backend:
├─ Fetch data from database
└─ Return response
    ↓
Frontend Receives Response:
└─ Display data to user
    (no CSRF token update needed)
```

### 4. Logout Flow

```
User Clicks Logout
    ↓
Frontend:
├─ clearCsrfToken() - Remove from localStorage
├─ localStorage.clear() - Remove JWT & user data
└─ Navigate to /login
    ↓
Backend (if authenticated request):
├─ Tokens become invalid automatically
├─ Next request fails 401/403
└─ User redirected to login
```

## Token Lifecycle

```
LOGIN                          REQUEST 1                      REQUEST 2
  │                                │                              │
  ├─ User verifies OTP            │                              │
  │                                │                              │
  ├─ JWT generated                │                              │
  │ (7 day expiry)                │                              │
  │                                │                              │
  ├─ CSRF Token #1                │                              │
  │ generated & stored             │                              │
  │ (10 min expiry)               │                              │
  │ ││                             │                              │
  │ └└─ Sent to frontend          │                              │
  │     └─ Stored in              │                              │
  │        localStorage            │                              │
  │                                │                              │
  │                    ┌──────────┴──────────┐                  │
  │                    │                     │                  │
  │         Frontend includes      Frontend includes            │
  │         in request:            in request:                 │
  │         - JWT ✓                - JWT ✓                     │
  │         - CSRF #1 ✓            - CSRF #2 ✓                 │
  │                    │                     │                  │
  │                    ↓                     ↓                  │
  │             Backend validates   Backend validates          │
  │             both tokens         both tokens                │
  │                    │                     │                  │
  │                    ├─ JWT valid?  ✓     ├─ JWT valid?  ✓  │
  │                    ├─ CSRF valid? ✓     ├─ CSRF valid? ✓  │
  │                    │                     │                  │
  │                    ├─ Process request    ├─ Process request │
  │                    │                     │                  │
  │                    ├─ Clear old token    ├─ Clear old token │
  │                    │                     │                  │
  │                    ├─ Generate           ├─ Generate        │
  │                    │  CSRF Token #2      │  CSRF Token #3   │
  │                    │  (fresh 10 min)     │  (fresh 10 min) │
  │                    │                     │                  │
  │                    └──→ Send in response └──→ Send in response
  │                        CSRF #2 stored       CSRF #3 stored │
  │                        in localStorage      in localStorage  │
  │                                                             │
  │                                                 Continue cycle...
  │                                                             │
  │                                                LOGOUT
  │                                                   │
  │                                      Clear localStorage
  │                                      - JWT cleared
  │                                      - CSRF cleared
  │                                      - User data cleared
  │                                                   │
  │                                         Redirect to /login
```

## Protected Routes Protection Chain

```
PUT /api/user/profile
    ↓
1. CORS Middleware
   ✓ Check if request from allowed origin (localhost:5173)
   ✓ Allow X-CSRF-Token header
    ↓
2. AuthGuard
   ✓ Extract JWT from Authorization header
   ✓ Verify JWT signature
   ✓ Verify JWT not expired
   ✓ Attach user payload to request
    ↓
3. RolesGuard
   ✓ Check user has required role (@Roles(Role.User))
    ↓
4. CsrfGuard
   ✓ Extract CSRF from X-CSRF-Token header
   ✓ Validate token exists in store
   ✓ Validate token matches stored value
   ✓ Validate token not expired (< 10 min)
   ✓ Clear old token
   ✓ Generate new token
   ✓ Attach new token to request
    ↓
5. Controller Handler
   ✓ Process the request
   ✓ Return response with new CSRF token
```

## Token Expiry Timeline

```
Day 1:
├─ 9:00 AM: User logs in
├─ JWT Token: Valid until 9:00 AM Day 8 (7 days) ────────→ Long-lived
├─ CSRF Token #1: Valid until 9:10 AM (10 minutes)
│  └─ 9:05 AM: User makes PUT request
│     ├─ CSRF Token #1 validated ✓
│     ├─ New CSRF Token #2 generated
│     └─ CSRF Token #2: Valid until 9:15 AM
│
│  └─ 9:15 AM: CSRF Token #2 expires
│     └─ Next PUT request fails 403 (CSRF token expired)
│     └─ User needs to re-login
│
├─ 9:07 AM: User makes another PUT request
│  ├─ CSRF Token #1 still valid ✓
│  ├─ New CSRF Token #2 generated (different token)
│  └─ CSRF Token #2: Valid until 9:17 AM
│
└─ Day 8 at 9:00 AM: JWT expires
   └─ User needs to log in again (get new JWT & CSRF)
```

## Security Benefits Visualization

```
WITHOUT CSRF PROTECTION:
┌────────────────────────────────────────┐
│ User logged into app                   │
│ (Bank transfer page)                   │
└────────────────────────────────────────┘
           ↓
   Opens new tab to
   attacker-site.com
           ↓
┌────────────────────────────────────────┐
│ Attacker website contains hidden form: │
│ <form action="bank.com/transfer">      │
│   <input name="amount" value="1000">   │
│   <input name="to" value="hacker">     │
│   <script>form.submit()</script>       │
│ </form>                                │
└────────────────────────────────────────┘
           ↓
   Browser automatically includes
   bank.com cookies with request
           ↓
   TRANSFER SUCCEEDS ❌
   Money sent to hacker

---

WITH CSRF PROTECTION:
┌────────────────────────────────────────┐
│ User logged into app                   │
│ (Bank transfer page)                   │
│ - Has CSRF token in localStorage       │
└────────────────────────────────────────┘
           ↓
   Opens new tab to
   attacker-site.com
           ↓
┌────────────────────────────────────────┐
│ Attacker website tries to submit form  │
│ (But localStorage only accessible to   │
│  same origin - can't read CSRF token)  │
└────────────────────────────────────────┘
           ↓
   Browser sends request but
   CSRF token is missing from header
           ↓
   Backend validates:
   ✓ JWT valid
   ✗ CSRF token missing
           ↓
   REQUEST REJECTED ✓
   Returns 403 Forbidden
   Transfer blocked!
```

## File Modification Summary

```
Backend Structure:
src/
├── csrf/                    ← NEW FOLDER
│   ├── csrf.service.ts     ← Token generation & validation
│   ├── csrf.guard.ts       ← Route protection
│   └── csrf.module.ts      ← DI module
│
├── auth/
│   ├── auth.service.ts     ← MODIFIED (generates CSRF token)
│   ├── auth.guard.ts       ← (unchanged)
│   ├── auth.controller.ts  ← (unchanged)
│   └── auth.module.ts      ← MODIFIED (imports CsrfModule)
│
├── api/
│   ├── user/
│   │   └── user.controller.ts ← MODIFIED (added CsrfGuard)
│   └── admin/
│       └── admin.controller.ts ← MODIFIED (added CsrfGuard)
│
├── app.module.ts           ← MODIFIED (imports CsrfModule)
└── main.ts                 ← MODIFIED (CORS headers)

Frontend Structure:
src/
├── api/
│   └── auth.ts             ← MODIFIED (CSRF in requests)
│
├── utils/
│   └── csrf.ts             ← NEW FILE (token utilities)
│
└── pages/
    ├── Otp.tsx             ← MODIFIED (store CSRF token)
    ├── Profile.tsx         ← MODIFIED (clear on logout)
    └── Dashboard.tsx       ← MODIFIED (clear on logout)
```

---

This visual guide shows how CSRF protection integrates with your existing authentication system while maintaining all current functionality.
