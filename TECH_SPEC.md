# StartupsForYou - Technical Specification

> AI-Powered Two-Sided Talent Marketplace Architecture

---

## 🎯 Platform Overview

**StartupsForYou** is an AI-powered talent marketplace that bridges the gap between **startup founders** and **engineers**. The platform enables startups to post roles and directly connect with high-fit candidates through intelligent matching.

### Core Value Proposition

| For Founders | For Engineers |
|--------------|---------------|
| Discover top engineering talent | Find startup roles that match skills |
| AI-powered candidate matching | Get matched with relevant opportunities |
| Direct outreach to candidates | Connect directly with founders |
| Manage hiring pipeline | Track applications in one place |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                USERS                                         │
│                    (Founders & Engineers)                                    │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER HOST                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      docker-compose.yml                              │    │
│  │                                                                      │    │
│  │   ┌─────────────────┐          ┌─────────────────────────────┐      │    │
│  │   │                 │          │         BACKEND              │      │    │
│  │   │    FRONTEND     │   API    │        (FastAPI)             │      │    │
│  │   │    (React 19)   │ ◄──────► │                              │      │    │
│  │   │                 │          │  ┌─────────────────────────┐ │      │    │
│  │   │    Port: 3000   │          │  │     Controllers         │ │      │    │
│  │   │                 │          │  │     Services            │ │      │    │
│  │   │  ┌───────────┐  │          │  │     LLM Integration     │ │      │    │
│  │   │  │ API Layer │  │          │  └─────────────────────────┘ │      │    │
│  │   │  │Controllers│  │          │         Port: 8000           │      │    │
│  │   │  │  Models   │  │          └────────────┬────────────────┘      │    │
│  │   │  │  Views    │  │                       │                        │    │
│  │   │  └───────────┘  │                       ▼                        │    │
│  │   └─────────────────┘                       │                        │    │
│  │                                  ┌─────────────────────┐              │    │
│  │                                  │      MONGODB        │              │    │
│  │                                  │    Port: 27017      │              │    │
│  │                                  └─────────────────────┘              │    │
│  │                                             │                         │    │
│  │                                             ▼                         │    │
│  │                                  ┌─────────────────────┐              │    │
│  │                                  │   LLM PROVIDERS     │              │    │
│  │                                  │  (OpenAI/Anthropic) │              │    │
│  │                                  └─────────────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Backend Structure

```
backend/
├── server.py                 # FastAPI application entry point
├── requirements.txt          # Python dependencies
├── Dockerfile               # Container configuration
│
├── schemas/                  # Pydantic models (request/response)
│   ├── __init__.py
│   ├── user.py              # User, Auth schemas
│   ├── startup.py           # Startup schemas
│   ├── role.py              # Job role schemas
│   ├── engineer.py          # Engineer profile schemas
│   ├── application.py       # Application schemas
│   └── connection.py        # Connection/messaging schemas
│
├── controllers/              # Business logic handlers
│   ├── __init__.py
│   ├── auth_controller.py   # Authentication logic
│   ├── startup_controller.py
│   ├── role_controller.py
│   ├── engineer_controller.py
│   ├── application_controller.py
│   └── connection_controller.py
│
├── services/                 # Business services
│   ├── __init__.py
│   ├── matching_service.py  # AI candidate-role matching
│   ├── resume_service.py    # Resume upload & parsing
│   └── notification_service.py
│
├── llm/                      # AI/LLM integrations
│   ├── __init__.py
│   ├── llm_service.py       # Abstract LLM interface
│   ├── openai_provider.py   # OpenAI implementation
│   └── anthropic_provider.py # Claude implementation
│
├── routers/                  # API route definitions
│   ├── __init__.py
│   └── auth.py
│
└── storage/                  # File storage
    └── resumes/
```

### Frontend Structure

```
frontend/
├── src/
│   ├── index.js             # Application entry point
│   ├── App.js               # Root component with routing
│   │
│   ├── api/                  # API layer
│   │   ├── index.js         # API exports
│   │   ├── client.js        # Axios client with interceptors
│   │   ├── endpoints.js     # Centralized endpoint definitions
│   │   ├── auth.js          # Auth API calls
│   │   ├── startups.js      # Startup API calls
│   │   ├── roles.js         # Role API calls
│   │   ├── engineers.js     # Engineer API calls
│   │   ├── applications.js  # Application API calls
│   │   └── connections.js   # Connection API calls
│   │
│   ├── models/               # Data models & constants
│   │   ├── index.js
│   │   └── constants.js     # Enums, status codes, etc.
│   │
│   ├── controllers/          # Business logic hooks
│   │   ├── index.js
│   │   ├── useAuth.js       # Authentication controller
│   │   ├── useStartup.js    # Startup management
│   │   ├── useRoles.js      # Role management
│   │   ├── useEngineer.js   # Engineer profile
│   │   ├── useApplications.js
│   │   ├── useConnections.js
│   │   └── useNotifications.js
│   │
│   ├── pages/                # View components (pages)
│   │   ├── Landing.js       # Home page
│   │   ├── Login.js         # Login page
│   │   ├── Signup.js        # Signup page
│   │   └── ComingSoon.js
│   │
│   ├── components/           # Reusable UI components
│   │   └── ui/              # shadcn/ui components
│   │
│   ├── store/                # Global state (Zustand)
│   │   ├── index.js
│   │   └── authStore.js
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── use-toast.js
│   │
│   └── lib/                  # Utilities
│       └── utils.js
│
├── public/
│   └── index.html
│
├── package.json
├── tailwind.config.js
└── Dockerfile
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI Framework |
| React Router | 7.x | Client-side routing |
| Zustand | 5.x | Global state management |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | UI component library |
| Axios | 1.x | HTTP client |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.110+ | Web framework |
| Motor | 3.3+ | Async MongoDB driver |
| Pydantic | 2.x | Data validation |
| bcrypt | 4.x | Password hashing |
| PyJWT | 2.x | JWT tokens |
| OpenAI | 1.x | AI/LLM integration |
| Anthropic | 0.x | Claude integration |

### Database

| Technology | Purpose |
|------------|---------|
| MongoDB | Primary database |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |

---

## 🗄 Database Schema

### Collections

```javascript
// Users - Base authentication
{
  user_id: "user_abc123",
  email: "user@example.com",
  password_hash: "...",
  name: "John Doe",
  role: "founder" | "engineer",
  avatar_url: "https://...",
  onboarding_completed: false,
  created_at: ISODate(),
}

// Startups - Founder's company
{
  startup_id: "startup_xyz789",
  founder_id: "user_abc123",
  name: "TechStartup Inc",
  tagline: "Building the future",
  description: "...",
  website: "https://...",
  logo_url: "https://...",
  funding_stage: "seed",
  team_size: "2-10",
  tech_stack: ["React", "Python", "MongoDB"],
  industry: "SaaS",
  location: "San Francisco, CA",
  remote_friendly: true,
  created_at: ISODate(),
}

// Engineer Profiles
{
  profile_id: "eng_def456",
  user_id: "user_def456",
  headline: "Full Stack Developer",
  bio: "...",
  skills: ["React", "Node.js", "Python"],
  experience_years: 5,
  experience: [{company, title, dates, description}],
  education: [{institution, degree, field, year}],
  linkedin_url: "...",
  github_url: "...",
  portfolio_url: "...",
  availability: "actively_looking",
  work_preference: "remote",
  preferred_locations: ["San Francisco", "Remote"],
  open_to_equity: true,
  created_at: ISODate(),
}

// Roles - Job postings
{
  role_id: "role_ghi789",
  startup_id: "startup_xyz789",
  founder_id: "user_abc123",
  title: "Senior Frontend Engineer",
  description: "...",
  requirements: ["5+ years React", "TypeScript"],
  nice_to_have: ["GraphQL", "Testing"],
  skills_required: ["React", "TypeScript"],
  experience_level: "senior",
  employment_type: "full_time",
  salary_range: {min: 150000, max: 200000, currency: "USD", equity: 0.5},
  location: "San Francisco",
  remote_allowed: true,
  visa_sponsorship: false,
  status: "active",
  created_at: ISODate(),
}

// Applications
{
  application_id: "app_jkl012",
  role_id: "role_ghi789",
  engineer_id: "user_def456",
  startup_id: "startup_xyz789",
  cover_letter: "...",
  resume_url: "...",
  status: "pending",
  match_score: 0.85,
  feedback: "...",
  interview_date: ISODate(),
  applied_at: ISODate(),
}

// Connections - Direct messaging
{
  connection_id: "conn_mno345",
  founder_id: "user_abc123",
  engineer_id: "user_def456",
  startup_id: "startup_xyz789",
  role_id: "role_ghi789",
  status: "accepted",
  messages: [{
    message_id: "msg_...",
    sender_id: "user_abc123",
    sender_name: "John",
    content: "Hi, I'd love to chat...",
    sent_at: ISODate(),
    read: false,
  }],
  created_at: ISODate(),
}
```

---

## 🤖 AI/LLM Integration

### Features

| Feature | Description | Provider |
|---------|-------------|----------|
| Resume Parsing | Extract skills, experience from resumes | OpenAI/Anthropic |
| Candidate Matching | Score candidates against role requirements | OpenAI |
| Job Description Generation | Generate compelling role descriptions | OpenAI/Anthropic |
| Match Explanation | Explain why a candidate fits a role | OpenAI/Anthropic |

### Matching Algorithm

1. **Rule-Based Scoring** (Default)
   - Skills overlap: 40%
   - Experience level: 30%
   - Location match: 15%
   - Work preference: 15%

2. **AI-Enhanced Scoring** (When LLM available)
   - Semantic skill matching
   - Context-aware experience evaluation
   - Culture fit indicators

---

## 🔀 Data Flow

### Engineer Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Signup  │────>│  Create  │────>│  Browse  │────>│  Apply   │
│ Engineer │     │ Profile  │     │  Roles   │     │ to Roles │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                  │
                      │         ┌──────────┐             │
                      └────────>│    AI    │<────────────┘
                                │ Matching │
                                └──────────┘
```

### Founder Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Signup  │────>│  Create  │────>│   Post   │────>│  Review  │
│ Founder  │     │ Startup  │     │  Roles   │     │   Apps   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                       │                │
                                       │   ┌──────────┐ │
                                       └──>│  Search  │<┘
                                           │ Talent   │
                                           └──────────┘
```

---

## 🐳 Docker Deployment

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=startupsforyou
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 🔐 Security

- JWT-based authentication with 7-day expiration
- bcrypt password hashing (cost factor 12)
- CORS configuration for frontend origin
- HTTP-only cookies for session tokens
- Input validation with Pydantic/Zod
- Role-based access control (Founder vs Engineer)

---

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Startups (Founders)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/startups` | Create startup |
| GET | `/api/startups/me` | Get my startup |
| PATCH | `/api/startups/:id` | Update startup |
| GET | `/api/startups` | List startups |

### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roles` | Create role |
| GET | `/api/roles/:id` | Get role |
| PATCH | `/api/roles/:id` | Update role |
| DELETE | `/api/roles/:id` | Close role |
| GET | `/api/roles` | List roles |
| GET | `/api/roles/recommended` | AI recommendations |

### Engineers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/engineers/me` | Get my profile |
| PATCH | `/api/engineers/me` | Update profile |
| GET | `/api/engineers` | List engineers |
| GET | `/api/engineers/search` | Search by skills |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply to role |
| GET | `/api/applications/me` | My applications |
| GET | `/api/roles/:id/applications` | Role applications |
| PATCH | `/api/applications/:id` | Update status |

### Connections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/connections` | Create connection |
| GET | `/api/connections` | My connections |
| POST | `/api/connections/:id/respond` | Accept/decline |
| POST | `/api/connections/:id/messages` | Send message |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Run with Docker

```bash
# Start all services
docker-compose up --build

# Access
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Run Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

*Last Updated: January 2026*

