# API Documentation - Role-Based Authorization

## Base URL
```
http://localhost:3000
```

---

## Authentication Endpoints

### 1. Send OTP
Sends a one-time password to the user's email.

**Endpoint**: `POST /auth/send-otp`  
**Authentication**: ❌ Not required  
**Rate Limit**: Recommended: 3 requests per minute per email  

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "user@example.com"
}
```

**Error Responses**:
- **400 Bad Request**: Invalid email format
- **500 Internal Server Error**: Email service failure (OTP still valid in DB)

**Notes**:
- OTP is valid for 10 minutes
- If user already exists, OTP is updated
- Both new and existing users can request OTP

---

### 2. Verify OTP
Verifies the OTP and returns JWT token with user role.

**Endpoint**: `POST /auth/verify-otp`  
**Authentication**: ❌ Not required  

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE2MDI0OTI0NjksImV4cCI6MTYwMzA5NzI2OX0.signature",
  "email": "user@example.com",
  "role": "user",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Error Responses**:
- **400 Bad Request**: Missing email or OTP
- **401 Unauthorized**: Invalid OTP, expired OTP, or user not found

**JWT Token Payload**:
```json
{
  "email": "user@example.com",
  "id": 1,
  "role": "user",
  "iat": 1602492469,
  "exp": 1603097269
}
```

**Notes**:
- Token expires in 7 days
- Default role for new users: "user"
- OTP is cleared from database after successful verification
- User is marked as verified (is_verified = true)

---

## User API Endpoints

### 1. Get User Profile
Retrieves the authenticated user's profile information.

**Endpoint**: `GET /user/profile`  
**Authentication**: ✅ Required (Bearer token)  
**Authorization**: Any authenticated user  
**Role Required**: user, admin  

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200):
```json
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

**Error Responses**:
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: User not found

---

### 2. Update User Profile
Updates the authenticated user's profile information.

**Endpoint**: `PUT /user/profile`  
**Authentication**: ✅ Required (Bearer token)  
**Authorization**: Any authenticated user  
**Role Required**: user, admin  

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "is_verified": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T14:20:00Z"
  }
}
```

**Error Responses**:
- **400 Bad Request**: Invalid data format
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: User not found

**Notes**:
- Only specified fields are updated
- timestamp fields are automatically managed
- No sensitive fields can be updated (e.g., role, email)

---

## Admin API Endpoints

### 1. Get Dashboard Statistics
Retrieves dashboard statistics for admin users.

**Endpoint**: `GET /admin/dashboard`  
**Authentication**: ✅ Required (Bearer token)  
**Authorization**: Admin only  
**Role Required**: admin  

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200):
```json
{
  "success": true,
  "stats": {
    "totalUsers": 50,
    "verifiedUsers": 45,
    "adminUsers": 2,
    "recentUsers": [
      {
        "id": 50,
        "email": "newuser@example.com",
        "role": "user",
        "is_verified": false,
        "created_at": "2024-01-16T15:00:00Z"
      }
    ]
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User is not admin

---

### 2. Get All Users
Retrieves paginated list of all users in the system.

**Endpoint**: `GET /admin/users?page=1&limit=10`  
**Authentication**: ✅ Required (Bearer token)  
**Authorization**: Admin only  
**Role Required**: admin  
**HTTP Method**: GET  

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "is_verified": true,
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**Error Responses**:
- **400 Bad Request**: Invalid page or limit values
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User is not admin

---

### 3. Update User Role
Changes a user's role between 'user' and 'admin'.

**Endpoint**: `PUT /admin/users/:id/role`  
**Authentication**: ✅ Required (Bearer token)  
**Authorization**: Admin only  
**Role Required**: admin  

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters**:
- `id` (required): User ID

**Request Body**:
```json
{
  "role": "admin"
}
```

**Valid Roles**: `"user"`, `"admin"`

**Success Response** (200):
```json
{
  "success": true,
  "message": "User role updated to admin",
  "user": {
    "id": 5,
    "email": "newadmin@example.com",
    "role": "admin",
    "is_verified": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- **400 Bad Request**: Invalid role value
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User is not admin
- **404 Not Found**: User not found

**Notes**:
- User must get new JWT token after role change
- Old token remains valid until expiration
- Only admins can change roles

---

### 4. Delete User
Permanently deletes a user from the system.

**Endpoint**: `DELETE /admin/users/:id`  
**Authentication**: ✅ Required (Bearer token)  
**Authorization**: Admin only  
**Role Required**: admin  

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters**:
- `id` (required): User ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "User deleted successfully",
  "user": {
    "id": 5,
    "email": "deleted@example.com"
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User is not admin
- **404 Not Found**: User not found

**Notes**:
- Deletion is permanent and cannot be undone
- Deleted user's JWT becomes invalid
- All user data is removed from database

---

## Error Response Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error type"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input, missing fields |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions/role |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## Authentication

### Bearer Token

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Token Format

JWT tokens are in the format: `header.payload.signature`

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE2MDI0OTI0NjksImV4cCI6MTYwMzA5NzI2OX0.DPMbq1kjl9sKlQ5s0e_uQ5K8vJ4K9L5M2N3O4P5Q6R
```

### Token Expiration

- Tokens expire after **7 days**
- After expiration, user must re-authenticate
- Frontend should handle token refresh or re-login flow

---

## Rate Limiting (Recommended)

Implement rate limiting on these endpoints:

| Endpoint | Limit | Window |
|----------|-------|--------|
| /auth/send-otp | 3 requests | Per 5 minutes |
| /auth/verify-otp | 5 attempts | Per 10 minutes |
| /admin/users/* | 100 requests | Per 1 minute |

---

## Request/Response Examples

### Example: Complete User Login Flow

**Step 1: Send OTP**
```bash
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Step 2: Verify OTP**
```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

**Step 3: Use Token to Get Profile**
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:3000/user/profile
```

### Example: Admin Dashboard Access

**Get Admin Stats**
```bash
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  http://localhost:3000/admin/dashboard
```

**Get Users List**
```bash
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  'http://localhost:3000/admin/users?page=1&limit=10'
```

**Promote User to Admin**
```bash
curl -X PUT http://localhost:3000/admin/users/5/role \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

---

## Webhook Support (Future Enhancement)

- Consider adding webhooks for user creation/deletion events
- Useful for external system synchronization
- Would require additional configuration

---

## GraphQL Support (Future Enhancement)

- Consider GraphQL API alongside REST API
- Would provide more flexible querying
- Query example:
  ```graphql
  query {
    dashboard {
      totalUsers
      recentUsers { id email role }
    }
  }
  ```
