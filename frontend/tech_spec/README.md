# Frontend Technical Specification

> **StartupsForYou** - Job Platform Frontend Documentation

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   └── index.html          # Entry HTML file
├── src/
│   ├── components/ui/      # Reusable UI components (shadcn/ui)
│   ├── pages/              # Page components (routes)
│   ├── store/              # State management (Zustand)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── App.js              # Main app with routing
│   ├── App.css             # Global styles
│   └── index.js            # React entry point
├── plugins/                # Custom webpack plugins
├── package.json            # Dependencies & scripts
├── tailwind.config.js      # Tailwind CSS config
└── Dockerfile              # Container config
```

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI Framework |
| React Router | 7.5.1 | Client-side routing |
| Zustand | 5.0.9 | State management |
| Tailwind CSS | 3.x | Utility-first styling |
| Radix UI | Latest | Accessible UI primitives |
| Axios | 1.8.4 | HTTP client |
| React Hook Form | 7.56.2 | Form handling |
| Zod | 3.24.4 | Schema validation |
| Lucide React | 0.507.0 | Icons |

---

## 🔀 Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Landing` | Homepage/Landing page |
| `/login` | `Login` | User login page |
| `/signup` | `Signup` | User registration |
| `/coming-soon` | `ComingSoon` | Placeholder for upcoming features |
| `*` | Redirect | All unknown routes → `/coming-soon` |

### Router Setup
```javascript
// App.js
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/coming-soon" element={<ComingSoon />} />
    <Route path="*" element={<Navigate to="/coming-soon" />} />
  </Routes>
</BrowserRouter>
```

---

## 🗃 State Management (Zustand)

### Auth Store (`store/authStore.js`)

**State:**
```javascript
{
  user: null,           // Current user object
  token: null,          // JWT access token
  isAuthenticated: false,
  isLoading: false,
  error: null
}
```

**Actions:**

| Action | Parameters | Description |
|--------|------------|-------------|
| `login` | `email, password` | Login with credentials |
| `signup` | `name, email, password` | Register new user |
| `logout` | - | Clear auth state |
| `checkAuth` | - | Verify current session |
| `setUser` | `user` | Set user directly (OAuth) |
| `setToken` | `token` | Set JWT token |
| `clearError` | - | Clear error state |

**Persistence:** Auth state persists via `zustand/middleware/persist`

---

## 🧩 UI Components (shadcn/ui)

All components are in `src/components/ui/` and built on **Radix UI** primitives.

### Available Components

| Component | File | Description |
|-----------|------|-------------|
| Button | `button.jsx` | Primary action buttons |
| Input | `input.jsx` | Text input fields |
| Card | `card.jsx` | Content containers |
| Dialog | `dialog.jsx` | Modal dialogs |
| Form | `form.jsx` | Form wrapper with validation |
| Toast | `toast.jsx` | Notification toasts |
| Select | `select.jsx` | Dropdown select |
| Checkbox | `checkbox.jsx` | Checkbox input |
| Tabs | `tabs.jsx` | Tab navigation |
| Avatar | `avatar.jsx` | User avatars |
| Badge | `badge.jsx` | Status badges |
| Skeleton | `skeleton.jsx` | Loading placeholders |

### Usage Example
```javascript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>Login</CardHeader>
  <CardContent>
    <Input placeholder="Email" />
    <Button>Submit</Button>
  </CardContent>
</Card>
```

---

## 🔌 API Integration

### Base Configuration
```javascript
const API_URL = process.env.REACT_APP_BACKEND_URL;
```

### Auth API Calls

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/signup` | POST | User registration |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Logout user |

### Request Pattern
```javascript
const response = await axios.post(`${API_URL}/api/auth/login`, {
  email,
  password
}, {
  headers: { 'Content-Type': 'application/json' }
});
```

---

## 🎨 Styling

### Tailwind CSS Configuration
- **Config:** `tailwind.config.js`
- **Animations:** `tailwindcss-animate` plugin
- **Utilities:** `clsx` + `tailwind-merge` via `lib/utils.js`

### Utility Function
```javascript
// lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

---

## 📜 Scripts

```bash
npm start         # Start development server
npm run build     # Production build
npm test          # Run tests
npm run eject     # Eject from CRA
```

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_BACKEND_URL` | Backend API base URL |

---

## 📦 Key Dependencies

### UI & Styling
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Utility CSS framework
- `lucide-react` - Icon library
- `class-variance-authority` - Component variants

### Forms & Validation
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolvers
- `zod` - Schema validation

### State & Routing
- `zustand` - Lightweight state management
- `react-router-dom` - Client routing

### Utilities
- `axios` - HTTP client
- `date-fns` - Date utilities
- `sonner` - Toast notifications

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set environment
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env

# Start development
npm start
```

---

## 📐 Design System

- **Colors:** Defined in `tailwind.config.js`
- **Typography:** System fonts with fallbacks
- **Spacing:** Tailwind default scale (4px base)
- **Border Radius:** Consistent rounded corners
- **Shadows:** Layered shadow system

---

*Last Updated: December 2024*
