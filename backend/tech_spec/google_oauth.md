# Google OAuth - Backend Technical Specification

## Overview

This document describes the backend implementation of Google OAuth 2.0 for the StartupsForYou job platform. The implementation follows the OAuth 2.0 Authorization Code flow, providing secure authentication via Google accounts.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  routers/oauth.py                                                        │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │  GET /api/auth/google                                               │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ Build Google OAuth URL with:                                 │   │ │
│  │  │ - client_id                                                  │   │ │
│  │  │ - redirect_uri                                               │   │ │
│  │  │ - scope (openid, email, profile)                             │   │ │
│  │  │ Return: RedirectResponse to Google                           │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                     │ │
│  │  GET /api/auth/google/callback                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ 1. Receive authorization code from Google                   │   │ │
│  │  │ 2. Exchange code for access token                           │   │ │
│  │  │ 3. Fetch user profile from Google                           │   │ │
│  │  │ 4. Find or create user in MongoDB                           │   │ │
│  │  │ 5. Create session & JWT                                     │   │ │
│  │  │ 6. Redirect to frontend with token                          │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        MongoDB                                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │ │
│  │  │   users     │  │  profiles   │  │     user_sessions           │ │ │
│  │  │             │  │             │  │                             │ │ │
│  │  │ user_id     │  │ user_id     │  │ user_id                     │ │ │
│  │  │ email       │  │ email       │  │ session_token               │ │ │
│  │  │ name        │  │ name        │  │ expires_at                  │ │ │
│  │  │ picture     │  │ skills[]    │  │ created_at                  │ │ │
│  │  │ auth_provider│ │ ...         │  │                             │ │ │
│  │  │ provider_id │  │             │  │                             │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## OAuth 2.0 Authorization Code Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Frontend │     │ Backend  │     │  Google  │
│ Browser  │     │ (React)  │     │ (FastAPI)│     │  OAuth   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Click       │                │                │
     │ "Google"       │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │ 2. Redirect    │                │                │
     │<───────────────│                │                │
     │                │                │                │
     │ 3. GET /api/auth/google         │                │
     │────────────────────────────────>│                │
     │                │                │                │
     │ 4. 302 Redirect to Google OAuth URL              │
     │<────────────────────────────────│                │
     │                │                │                │
     │ 5. User authenticates with Google                │
     │─────────────────────────────────────────────────>│
     │                │                │                │
     │ 6. Google redirects with code                    │
     │<─────────────────────────────────────────────────│
     │                │                │                │
     │ 7. GET /api/auth/google/callback?code=xxx        │
     │────────────────────────────────>│                │
     │                │                │                │
     │                │                │ 8. Exchange    │
     │                │                │    code for    │
     │                │                │    token       │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │ 9. Return      │
     │                │                │    access_token│
     │                │                │<───────────────│
     │                │                │                │
     │                │                │ 10. GET        │
     │                │                │     userinfo   │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │ 11. Return     │
     │                │                │     user data  │
     │                │                │<───────────────│
     │                │                │                │
     │                │                │ 12. Create/Find│
     │                │                │     user in DB │
     │                │                │                │
     │ 13. 302 Redirect to frontend/oauth/callback?token=jwt
     │<────────────────────────────────│                │
     │                │                │                │
     │ 14. User authenticated!         │                │
     │───────────────>│                │                │
```

---

## API Endpoints

### 1. Initiate Google OAuth

**Endpoint**: `GET /api/auth/google`

**Purpose**: Redirect user to Google's OAuth consent screen.

**Request**: None (direct browser navigation)

**Response**: `302 Redirect` to Google OAuth URL

**Implementation**:

```python
@router.get("/google")
async def google_login():
    """
    Redirect user to Google OAuth consent screen
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    
    return RedirectResponse(url=google_auth_url)
```

**Google OAuth URL Parameters**:

| Parameter | Value | Description |
|-----------|-------|-------------|
| `client_id` | From env | Your Google OAuth Client ID |
| `redirect_uri` | `/api/auth/google/callback` | Where Google sends the user back |
| `response_type` | `code` | We want an authorization code |
| `scope` | `openid email profile` | What data we need access to |
| `access_type` | `offline` | Get refresh token (optional) |
| `prompt` | `consent` | Always show consent screen |

---

### 2. Handle Google Callback

**Endpoint**: `GET /api/auth/google/callback`

**Purpose**: Exchange authorization code for tokens, fetch user info, create/login user.

**Query Parameters**:
- `code`: Authorization code from Google
- `error`: Error message if authentication failed

**Response**: `302 Redirect` to frontend with JWT token

**Implementation**:

```python
@router.get("/google/callback")
async def google_callback(code: str = None, error: str = None, db=Depends(get_db)):
    """
    Handle Google OAuth callback
    """
    # Handle errors
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=google_auth_failed")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=no_code")
    
    # Step 1: Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": GOOGLE_REDIRECT_URI
            }
        )
    
    tokens = token_response.json()
    access_token = tokens.get("access_token")
    
    # Step 2: Fetch user info from Google
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    google_user = user_response.json()
    # google_user = {
    #     "id": "116392812416646477294",
    #     "email": "user@gmail.com",
    #     "name": "John Doe",
    #     "picture": "https://lh3.googleusercontent.com/..."
    # }
    
    # Step 3: Find or create user
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update with Google info if needed
    else:
        # Create new user
        user_id = generate_user_id()
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "password_hash": None,
            "auth_provider": "google",
            "provider_id": google_id,
            "created_at": now.isoformat(),
            "onboarding_completed": False
        })
        
        # Also create profile
        await db.profiles.insert_one({...})
    
    # Step 4: Create session
    session_token = create_session_token()
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (now + timedelta(days=7)).isoformat(),
        "created_at": now.isoformat()
    })
    
    # Step 5: Create JWT
    jwt_token = create_jwt_token(user_id, email)
    
    # Step 6: Redirect to frontend
    response = RedirectResponse(
        url=f"{FRONTEND_URL}/oauth/callback?token={jwt_token}"
    )
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7  # 7 days
    )
    
    return response
```

---

## Database Schema

### Users Collection

```javascript
{
  "_id": ObjectId("..."),
  "user_id": "user_65c1777f4c55",
  "email": "chalikantiteja@gmail.com",
  "name": "teja ch",
  "picture": "https://lh3.googleusercontent.com/a/...",
  "password_hash": null,                    // null for OAuth users
  "auth_provider": "google",                // "local", "google", "linkedin"
  "provider_id": "116392812416646477294",   // Google's unique user ID
  "created_at": "2025-12-24T07:45:35.788086+00:00",
  "onboarding_completed": false
}
```

**Schema Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | Internal unique ID (e.g., `user_abc123`) |
| `email` | string | User's email from Google |
| `name` | string | User's display name from Google |
| `picture` | string | Profile picture URL from Google |
| `password_hash` | string/null | null for OAuth users |
| `auth_provider` | string | Authentication method used |
| `provider_id` | string | Google's unique user identifier |
| `created_at` | string | ISO timestamp |
| `onboarding_completed` | boolean | Has user completed onboarding |

### User Sessions Collection

```javascript
{
  "_id": ObjectId("..."),
  "user_id": "user_65c1777f4c55",
  "session_token": "abc123xyz...",
  "expires_at": "2025-12-31T07:45:35.788086+00:00",
  "created_at": "2025-12-24T07:45:35.788086+00:00"
}
```

---

## Environment Variables

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="787194353710-xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
GOOGLE_REDIRECT_URI="http://localhost:8000/api/auth/google/callback"
FRONTEND_URL="http://localhost:3000"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
```

**Production Notes**:
- Use HTTPS for all URLs
- Set `secure=True` on cookies
- Use strong, unique `JWT_SECRET`
- Store secrets in environment, never in code

---

## Security Considerations

### 1. CSRF Protection
- OAuth state parameter recommended for production
- Currently relies on SameSite cookie attribute

### 2. Token Security
- JWT tokens expire after 7 days
- Session tokens stored in httponly cookies
- Client secret never exposed to frontend

### 3. User Linking
- If user with same email exists, links accounts
- Updates auth_provider to "google" on first OAuth login

### 4. Error Handling
- All errors redirect to frontend with error parameter
- No sensitive info leaked in error messages
- Logging for debugging without exposing secrets

---

## Google API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `accounts.google.com/o/oauth2/v2/auth` | GET | OAuth consent screen |
| `oauth2.googleapis.com/token` | POST | Exchange code for token |
| `www.googleapis.com/oauth2/v2/userinfo` | GET | Fetch user profile |

---

## File Structure

```
backend/
├── routers/
│   ├── __init__.py      # Exports oauth_router
│   ├── auth.py          # Email/password auth
│   └── oauth.py         # Google OAuth endpoints
├── server.py            # Includes oauth_router
├── .env                 # Google credentials
└── tech_spec/
    └── google_oauth.md  # This document
```

---

## Router Registration

**`routers/__init__.py`**:
```python
from .auth import router as auth_router, get_current_user, get_db
from .oauth import router as oauth_router
```

**`server.py`**:
```python
from routers import auth_router, oauth_router

app.include_router(auth_router, prefix="/api")
app.include_router(oauth_router, prefix="/api")
```

---

## Testing

### Manual Testing

1. Start the application:
   ```bash
   docker-compose up
   ```

2. Navigate to `http://localhost:3000/login`

3. Click "Continue with Google"

4. Complete Google sign-in

5. Verify redirect to `/coming-soon`

6. Check database:
   ```bash
   docker exec rolesforu-mongodb mongosh --quiet --eval "
     db = db.getSiblingDB('rolesforu');
     db.users.find({auth_provider: 'google'}).forEach(u => printjson(u));
   "
   ```

### Expected Database Entry

```javascript
{
  user_id: 'user_65c1777f4c55',
  email: 'user@gmail.com',
  name: 'User Name',
  picture: 'https://lh3.googleusercontent.com/...',
  password_hash: null,
  auth_provider: 'google',
  provider_id: '116392812416646477294',
  created_at: '2025-12-24T07:45:35.788086+00:00',
  onboarding_completed: false
}
```

---

## Future Enhancements

1. **LinkedIn OAuth** - Add `/auth/linkedin` and `/auth/linkedin/callback`
2. **GitHub OAuth** - Add for developer-focused roles
3. **Account Linking** - Allow users to link multiple OAuth providers
4. **State Parameter** - Add CSRF protection with state token
5. **Refresh Tokens** - Store Google refresh token for extended access
6. **Scope Expansion** - Request additional scopes for profile enrichment

---

## Troubleshooting

### Error: "OAuth client was not found"
- Check `GOOGLE_CLIENT_ID` is correct in `.env`
- Ensure credentials are for correct project

### Error: "redirect_uri_mismatch"
- Ensure `GOOGLE_REDIRECT_URI` matches exactly what's configured in Google Console
- Check for trailing slashes

### Error: "Access blocked: App not verified"
- Add your email to test users in Google Console
- Or publish the app for production

### User not created in database
- Check MongoDB connection
- Check backend logs: `docker logs rolesforu-backend`
