# Authentication API

> User registration, login, and session management

---

## 📍 Base Path

```
/api/auth
```

---

## 🔐 Authentication Methods

| Method | Description |
|--------|-------------|
| JWT Token | Bearer token in Authorization header |
| Session Cookie | `session_token` cookie (for OAuth) |

---

## 📡 Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/signup` | POST | ❌ | Register new user |
| `/login` | POST | ❌ | Login with credentials |
| `/me` | GET | ✅ | Get current user |
| `/logout` | POST | ✅ | Logout & clear session |

---

## 📋 API Reference

### POST `/api/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "user_id": "user_abc123def456",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": null,
    "created_at": "2024-12-24T10:30:00Z",
    "onboarding_completed": false
  }
}
```

**Errors:**
| Code | Detail |
|------|--------|
| 400 | Email already registered |

---

### POST `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "user_id": "user_abc123def456",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": null,
    "created_at": "2024-12-24T10:30:00Z",
    "onboarding_completed": false
  }
}
```

**Errors:**
| Code | Detail |
|------|--------|
| 401 | Invalid email or password |

---

### GET `/api/auth/me`

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "user_id": "user_abc123def456",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": null,
  "created_at": "2024-12-24T10:30:00Z",
  "onboarding_completed": false
}
```

**Errors:**
| Code | Detail |
|------|--------|
| 401 | Not authenticated |

---

### POST `/api/auth/logout`

Logout and clear session.

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 🔄 Authentication Flow

### JWT Flow
```
Client                     Server                    DB
  │                          │                        │
  │  POST /signup            │                        │
  │─────────────────────────>│                        │
  │                          │  Insert user           │
  │                          │───────────────────────>│
  │                          │                        │
  │  { access_token, user }  │                        │
  │<─────────────────────────│                        │
  │                          │                        │
  │  GET /me                 │                        │
  │  Authorization: Bearer   │                        │
  │─────────────────────────>│                        │
  │                          │  Decode JWT            │
  │                          │  Fetch user            │
  │                          │───────────────────────>│
  │  { user }                │                        │
  │<─────────────────────────│                        │
```

---

## 📦 Data Models

### UserCreate (Input)
```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
```

### UserLogin (Input)
```python
class UserLogin(BaseModel):
    email: EmailStr
    password: str
```

### UserResponse (Output)
```python
class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime
    onboarding_completed: bool = False
```

### TokenResponse (Output)
```python
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
```

---

## 🔒 Security

### Password Hashing
- **Algorithm:** bcrypt
- **Salt:** Auto-generated per password

### JWT Token
| Setting | Value |
|---------|-------|
| Algorithm | HS256 |
| Expiration | 7 days |
| Payload | `user_id`, `email`, `exp`, `iat` |

---

## 🗄 Database Schema

### `users` Collection
```json
{
  "user_id": "user_abc123def456",
  "email": "user@example.com",
  "name": "John Doe",
  "password_hash": "$2b$12$...",
  "picture": null,
  "created_at": "2024-12-24T10:30:00Z",
  "onboarding_completed": false
}
```

### `profiles` Collection
```json
{
  "user_id": "user_abc123def456",
  "email": "user@example.com",
  "name": "John Doe",
  "skills": [],
  "experience_level": null,
  "preferred_location": null,
  "preferred_roles": [],
  "resume_id": null,
  "onboarding_completed": false,
  "created_at": "2024-12-24T10:30:00Z",
  "updated_at": null
}
```

---

## 📝 Implementation Notes

- User ID format: `user_{12-char-hex}`
- Password min length: No server validation (add if needed)
- Profile is auto-created on signup
- Sessions stored in `user_sessions` collection

---

*Last Updated: December 2024*
