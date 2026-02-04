# CSRF Protection - Usage Examples

## Frontend Examples

### Example 1: Login and Get CSRF Token

```typescript
import { sendOtp, verifyOtp } from '../api/auth';
import { getCsrfToken, setCsrfToken } from '../utils/csrf';

// Step 1: User enters email
const handleLogin = async (email: string) => {
  try {
    const result = await sendOtp(email);
    console.log('OTP sent successfully');
  } catch (error) {
    console.error('Failed to send OTP:', error);
  }
};

// Step 2: User enters OTP
const handleVerifyOtp = async (email: string, otp: string) => {
  try {
    const result = await verifyOtp(email, otp);
    
    // Backend automatically sends CSRF token, verifyOtp stores it
    console.log('JWT Token:', result.token);
    console.log('CSRF Token stored:', getCsrfToken() !== null);
    
    // Navigate based on role
    if (result.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/profile');
    }
  } catch (error) {
    console.error('OTP verification failed:', error);
  }
};
```

### Example 2: Update User Profile (with CSRF protection)

```typescript
import { updateProfile } from '../api/auth';
import { getCsrfToken } from '../utils/csrf';

const handleUpdateProfile = async () => {
  const token = localStorage.getItem('authToken');
  const csrfToken = getCsrfToken();
  
  try {
    // CSRF token is automatically included by updateProfile function
    const result = await updateProfile(token, {
      name: 'John Doe',
      bio: 'Updated bio'
    });
    
    console.log('Profile updated:', result);
    // CSRF token is automatically refreshed
  } catch (error) {
    if (error.message.includes('403')) {
      console.error('CSRF token invalid or expired. Please login again.');
      localStorage.clear();
    } else {
      console.error('Profile update failed:', error);
    }
  }
};
```

### Example 3: Admin Actions (with CSRF protection)

```typescript
import { updateUserRole, deleteUser } from '../api/auth';

// Update user role
const handleChangeUserRole = async (userId: number, role: 'user' | 'admin') => {
  const token = localStorage.getItem('authToken');
  
  try {
    const result = await updateUserRole(token, userId, role);
    console.log('User role updated:', result);
    // CSRF token automatically refreshed
  } catch (error) {
    console.error('Failed to update role:', error);
  }
};

// Delete user
const handleDeleteUser = async (userId: number) => {
  const token = localStorage.getItem('authToken');
  const confirmed = window.confirm('Are you sure you want to delete this user?');
  
  if (!confirmed) return;
  
  try {
    const result = await deleteUser(token, userId);
    console.log('User deleted:', result);
    // CSRF token automatically refreshed
  } catch (error) {
    console.error('Failed to delete user:', error);
  }
};
```

### Example 4: Manual CSRF Token Management

```typescript
import { 
  getCsrfToken, 
  setCsrfToken, 
  clearCsrfToken, 
  hasCsrfToken 
} from '../utils/csrf';

// Check if user has CSRF token
if (hasCsrfToken()) {
  console.log('User is authenticated with CSRF protection');
}

// Get current token
const token = getCsrfToken();
console.log('Current CSRF Token:', token);

// Manually set token (not recommended - API does this automatically)
setCsrfToken('new-token-value');

// Clear on logout
const handleLogout = () => {
  clearCsrfToken();
  localStorage.clear();
};
```

### Example 5: Error Handling with CSRF

```typescript
const makeSecureRequest = async (apiCall, token) => {
  try {
    const result = await apiCall(token);
    return { success: true, data: result };
  } catch (error) {
    // Handle different CSRF-related errors
    if (error.message.includes('CSRF token is missing')) {
      console.error('CSRF token missing - user may need to re-authenticate');
      localStorage.clear();
      clearCsrfToken();
      window.location.href = '/';
    } else if (error.message.includes('Invalid or expired CSRF token')) {
      console.error('CSRF token expired - requesting new one');
      // Try to get new token by re-authenticating
      window.location.href = '/';
    } else {
      console.error('Request failed:', error);
    }
    return { success: false, error: error.message };
  }
};
```

## Backend Examples

### Example 1: Using CSRF Service in Custom Guard

```typescript
import { Injectable } from '@nestjs/common';
import { CsrfService } from './csrf/csrf.service';

@Injectable()
export class CustomCsrfGuard {
  constructor(private csrfService: CsrfService) {}

  validateCsrfToken(userId: string, token: string): boolean {
    return this.csrfService.validateToken(userId, token);
  }

  generateNewToken(userId: string): string {
    const token = this.csrfService.generateToken();
    this.csrfService.storeToken(userId, token);
    return token;
  }
}
```

### Example 2: Manually Using CSRF in Custom Endpoint

```typescript
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CsrfGuard } from './csrf/csrf.guard';
import { CsrfService } from './csrf/csrf.service';

@Controller('custom')
export class CustomController {
  constructor(private csrfService: CsrfService) {}

  @Post('sensitive-operation')
  @UseGuards(AuthGuard, CsrfGuard)
  async sensitiveLongOperation(@Request() req) {
    // CSRF already validated by guard
    const userId = req.user.id;
    
    // Do sensitive operation
    const result = await this.performOperation();
    
    // Generate new CSRF token for next request
    const newCsrfToken = this.csrfService.generateToken();
    this.csrfService.storeToken(userId, newCsrfToken);
    
    return {
      success: true,
      data: result,
      csrfToken: newCsrfToken // Send to frontend
    };
  }

  private async performOperation() {
    // Your business logic here
    return { message: 'Operation completed' };
  }
}
```

### Example 3: Monitoring CSRF Attacks

```typescript
import { Injectable } from '@nestjs/common';
import { CsrfService } from './csrf/csrf.service';

@Injectable()
export class SecurityLogger {
  private failedAttempts = new Map<string, number>();
  
  constructor(private csrfService: CsrfService) {}

  logCsrfFailure(userId: string, token: string, reason: string) {
    const attempts = this.failedAttempts.get(userId) || 0;
    this.failedAttempts.set(userId, attempts + 1);
    
    console.log(`[CSRF FAILURE] User: ${userId}, Reason: ${reason}, Attempts: ${attempts + 1}`);
    
    // Alert if too many failures
    if ((attempts + 1) > 5) {
      console.warn(`[SECURITY ALERT] Possible CSRF attack on user: ${userId}`);
      // Could trigger additional security measures
    }
  }

  logCsrfSuccess(userId: string) {
    // Reset counter on success
    this.failedAttempts.delete(userId);
  }
}
```

## Testing Examples

### Example 1: Test Valid CSRF Token

```bash
#!/bin/bash

# Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}')

JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
CSRF_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.csrfToken')

# Use CSRF token in request
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

### Example 2: Test Invalid CSRF Token

```bash
#!/bin/bash

JWT_TOKEN="valid_jwt_token_here"
INVALID_CSRF="invalid_csrf_token_xyz"

# This should fail with 403
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $INVALID_CSRF" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

### Example 3: Test Missing CSRF Token

```bash
#!/bin/bash

JWT_TOKEN="valid_jwt_token_here"

# This should fail with 403 (CSRF token missing)
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

### Example 4: Test Token Refresh

```bash
#!/bin/bash

JWT_TOKEN="valid_jwt_token_here"
CSRF_TOKEN="initial_csrf_token"

# First request
RESPONSE=$(curl -s -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}')

# Extract new token
NEW_CSRF=$(echo $RESPONSE | jq -r '.csrfToken')
echo "Old CSRF: $CSRF_TOKEN"
echo "New CSRF: $NEW_CSRF"

# Second request with new token
curl -s -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $NEW_CSRF" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Again"}' | jq '.'
```

## Integration with Existing Code

### In React Components

```typescript
import { useEffect, useState } from 'react';
import { updateProfile, getCsrfToken } from '../api/auth';

export function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const csrfToken = getCsrfToken();

      if (!csrfToken) {
        throw new Error('CSRF token not found. Please login again.');
      }

      const result = await updateProfile(token, formData);
      
      // Success - CSRF token already updated automatically
      console.log('Profile updated successfully');
      
    } catch (err) {
      setError(err.message);
      
      // If CSRF related error, force re-login
      if (err.message.includes('CSRF')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      {/* Your form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

## Common Issues and Solutions

### Issue: "CSRF token not found"

```typescript
// Check if token exists before making request
if (!hasCsrfToken()) {
  console.error('CSRF token missing - user should re-authenticate');
  window.location.href = '/login';
} else {
  // Proceed with request
  await updateProfile(token, data);
}
```

### Issue: "Token expired after 10 minutes"

```typescript
// Implement automatic re-authentication
const handleApiError = (error) => {
  if (error.message.includes('expired')) {
    console.log('CSRF token expired - please login again');
    localStorage.clear();
    clearCsrfToken();
    window.location.href = '/login';
  }
};
```

### Issue: Token not updating in frontend

```typescript
// Verify that API response includes csrfToken
const response = await updateProfile(token, data);
console.log('Response:', response);
console.log('New CSRF Token:', response.csrfToken);
// Verify it's being stored
console.log('Stored CSRF Token:', getCsrfToken());
```
