# Google OAuth - Frontend Technical Specification

## Overview

This document describes the frontend implementation of Google OAuth for the StartupsForYou job platform. The implementation provides a seamless "Continue with Google" experience for both signup and login flows.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Login.js   │    │  Signup.js  │    │  OAuthCallback.js   │  │
│  │             │    │             │    │                     │  │
│  │ [Continue   │    │ [Continue   │    │ Handles redirect    │  │
│  │  with       │───▶│  with       │───▶│ from Google OAuth   │  │
│  │  Google]    │    │  Google]    │    │ callback            │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                 │                      │              │
│         └────────┬────────┘                      │              │
│                  │                               │              │
│                  ▼                               ▼              │
│         Redirect to Backend           Store token & user       │
│         /api/auth/google              in Zustand store         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Login Page (`src/pages/Login.js`)

**Purpose**: Provides Google sign-in button alongside traditional email/password login.

**Key Implementation**:

```javascript
const API_URL = process.env.REACT_APP_BACKEND_URL;

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    {/* Google's official colors: Blue, Green, Yellow, Red */}
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92..." />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77..." />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43..." />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15..." />
  </svg>
);

// Handle Google Login - Simply redirect to backend
const handleGoogleLogin = () => {
  window.location.href = `${API_URL}/api/auth/google`;
};
```

**UI Structure**:
```jsx
{/* Google Sign In Button */}
<Button
  type="button"
  variant="outline"
  className="w-full mb-4"
  onClick={handleGoogleLogin}
>
  <GoogleIcon />
  <span className="ml-2">Continue with Google</span>
</Button>

{/* Separator */}
<div className="relative mb-4">
  <Separator />
  <span>Or continue with email</span>
</div>

{/* Traditional Email/Password Form */}
<form onSubmit={handleSubmit}>
  {/* ... email/password fields ... */}
</form>
```

**Error Handling**:
- Checks URL for `?error=` parameter from failed OAuth
- Displays user-friendly error message
- Clears error on retry

---

### 2. Signup Page (`src/pages/Signup.js`)

**Purpose**: Same Google button as Login - handles both new and existing users.

**Key Point**: The Google OAuth flow automatically creates new users or logs in existing ones. The signup page uses the identical `handleGoogleSignup` function:

```javascript
const handleGoogleSignup = () => {
  window.location.href = `${API_URL}/api/auth/google`;
};
```

---

### 3. OAuth Callback Page (`src/pages/OAuthCallback.js`)

**Purpose**: Handles the redirect from backend after successful Google authentication.

**Route**: `/oauth/callback`

**Flow**:

```
Backend redirects to:
/oauth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
         │
         ▼
   OAuthCallback.js
         │
         ├── Extract token from URL
         │
         ├── Store token in Zustand
         │
         ├── Fetch user info from /api/auth/me
         │
         ├── Store user in Zustand
         │
         └── Navigate to /coming-soon (or dashboard)
```

**Implementation**:

```javascript
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      // Handle errors
      if (errorParam) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Store token
      setToken(token);

      // Fetch user info
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Store user and redirect
      setUser(response.data);
      navigate('/coming-soon');
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" />
      <p>Completing sign in...</p>
    </div>
  );
};
```

---

### 4. Auth Store (`src/store/authStore.js`)

**Purpose**: Zustand store for managing authentication state.

**Relevant Methods**:

```javascript
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Used by OAuthCallback to set user directly
      setUser: (user) => {
        set({ user, isAuthenticated: !!user, error: null });
      },

      // Used by OAuthCallback to store JWT
      setToken: (token) => {
        set({ token });
      },

      // ... other methods (login, signup, logout, etc.)
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```

**Persistence**: Uses Zustand's `persist` middleware to save auth state to localStorage.

---

## Routes Configuration (`src/App.js`)

```javascript
import OAuthCallback from './pages/OAuthCallback';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="*" element={<Navigate to="/coming-soon" replace />} />
    </Routes>
  );
}
```

---

## User Flow

### Happy Path (New User)

1. User visits `/signup`
2. Clicks "Continue with Google"
3. Browser redirects to `http://localhost:8000/api/auth/google`
4. Backend redirects to Google OAuth consent screen
5. User signs in with Google account
6. Google redirects back to backend callback
7. Backend creates new user in MongoDB
8. Backend redirects to `/oauth/callback?token=xxx`
9. OAuthCallback stores token, fetches user, redirects to app
10. User is authenticated ✅

### Happy Path (Existing User)

Same as above, except:
- Step 7: Backend finds existing user (no creation)
- User is logged into existing account ✅

### Error Path

1. User clicks "Continue with Google"
2. Something fails (user cancels, network error, etc.)
3. Backend redirects to `/login?error=oauth_failed`
4. Login page shows error message
5. User can retry

---

## Environment Variables

```env
# Frontend (.env or environment)
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## UI Components Used

| Component | Source | Purpose |
|-----------|--------|---------|
| `Button` | shadcn/ui | Google sign-in button |
| `Separator` | shadcn/ui | "Or continue with email" divider |
| `Alert` | shadcn/ui | Error message display |
| `Loader2` | lucide-react | Loading spinner |

---

## Future Enhancements

1. **LinkedIn OAuth** - Add LinkedIn sign-in button (same pattern)
2. **GitHub OAuth** - Add GitHub sign-in for developer roles
3. **Loading State** - Add loading indicator while redirecting to Google
4. **Remember Me** - Option to extend session duration

---

## Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `src/pages/Login.js` | Modified | Added Google button |
| `src/pages/Signup.js` | Modified | Added Google button |
| `src/pages/OAuthCallback.js` | Created | Handle OAuth redirect |
| `src/App.js` | Modified | Added OAuth callback route |
| `src/store/authStore.js` | Existing | Already had setUser/setToken |
