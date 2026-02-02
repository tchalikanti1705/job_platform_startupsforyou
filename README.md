<p align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS"/>
  <img src="https://img.shields.io/badge/OpenAI-LLM-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI"/>
</p>

<h1 align="center">🚀 StartupsForYou</h1>

<p align="center">
  <strong>AI-Powered Two-Sided Talent Marketplace Connecting Founders with Engineers</strong>
</p>

<p align="center">
  <em>The bridge between ambitious engineers and visionary founders</em>
</p>

<p align="center">
  <a href="#the-problem">Problem</a> •
  <a href="#the-solution">Solution</a> •
  <a href="#for-engineers">For Engineers</a> •
  <a href="#for-founders">For Founders</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a>
</p>

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│       ENGINEERS                      AI                      FOUNDERS        │
│    ┌───────────┐              ┌─────────────┐             ┌───────────┐      │
│    │           │              │             │             │           │      │
│    │  Profile  │─────────────►│   MATCHING  │◄────────────│   Roles   │      │
│    │  Skills   │              │   ENGINE    │             │   Needs   │      │
│    │  Goals    │              │             │             │  Culture  │      │
│    │           │              └──────┬──────┘             │           │      │
│    └───────────┘                     │                    └───────────┘      │
│                                      │                                       │
│                             DIRECT CONNECTION                                │
│                                      │                                       │
│                               ┌──────▼──────┐                                │
│                               │   Messages  │                                │
│                               │ Interviews  │                                │
│                               │   Offers    │                                │
│                               └─────────────┘                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## For Engineers

### 🎯 Find Your Perfect Startup

| Feature | Description |
|---------|-------------|
| **AI-Powered Matching** | Get role recommendations based on skills, experience, and preferences |
| **Direct Founder Access** | Skip recruiters - connect directly with startup founders |
| **Application Tracker** | Track all your applications in one unified dashboard |
| **Resume Parsing** | AI extracts skills and experience from your resume |
| **Transparent Info** | See funding stage, team size, equity ranges upfront |

### How It Works (Engineers)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Create  │────►│  Build   │────►│  Get AI  │────►│  Apply & │
│ Account  │     │ Profile  │     │  Matches │     │ Connect  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## For Founders

### 🏢 Build Your Dream Team

| Feature | Description |
|---------|-------------|
| **Startup Profile** | Showcase your vision, culture, tech stack, and funding stage |
| **Role Management** | Post unlimited roles with detailed requirements |
| **AI Candidate Matching** | Get ranked candidates scored against your requirements |
| **Direct Outreach** | Message top candidates before they apply |
| **Pipeline Management** | Track candidates through your hiring funnel |

### How It Works (Founders)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Create  │────►│  Setup   │────►│  Post    │────►│ Review & │
│ Startup  │     │ Profile  │     │  Roles   │     │  Hire    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## Key Features

### 🔐 Authentication & Roles
- **JWT Authentication** with 7-day token expiration
- **Role-Based Access**: Founder vs Engineer experiences
- **Smart Onboarding**: Role-specific profile building

### 🤖 AI-Powered Matching
- **Skill Matching**: 40% weight on technical skill overlap
- **Experience Matching**: 30% weight on level alignment
- **Location/Remote**: 15% weight on work preferences
- **Culture Fit**: 15% weight on startup stage and values
- **LLM Integration**: OpenAI & Anthropic for advanced matching

### 💬 Direct Communication
- **Connection Requests**: Founders can reach out to candidates
- **Real-time Messaging**: Built-in chat between matched pairs
- **Application Pipeline**: Status tracking for both sides

### 📊 Transparent Startup Data
- Funding Stage (Pre-seed → Unicorn)
- Team Size & Growth Rate
- Tech Stack & Culture
- Equity & Salary Ranges

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI with concurrent features |
| **React Router 7** | Client-side routing & navigation |
| **Zustand** | Lightweight state management |
| **TailwindCSS 3.4** | Utility-first styling |
| **shadcn/ui + Radix** | Accessible component library |
| **Axios** | HTTP client with interceptors |

### Backend

| Technology | Purpose |
|------------|---------|
| **Python 3.11+** | Runtime environment |
| **FastAPI** | High-performance async API framework |
| **Motor** | Async MongoDB driver |
| **Pydantic v2** | Data validation & serialization |
| **PyJWT** | JSON Web Token authentication |
| **OpenAI / Anthropic** | LLM integrations for AI matching |

### Database & Infrastructure

| Technology | Purpose |
|------------|---------|
| **MongoDB 7.0** | Document database for flexible schemas |
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |

---

## Architecture

### Project Structure

```
startupsfor.you/
├── frontend/
│   └── src/
│       ├── api/              # API layer (client, endpoints)
│       ├── models/           # Constants, enums, types
│       ├── controllers/      # Business logic hooks
│       ├── pages/            # View components
│       ├── components/ui/    # shadcn/ui components
│       └── store/            # Zustand state
│
├── backend/
│   ├── schemas/              # Pydantic models
│   ├── controllers/          # Business logic
│   ├── services/             # Matching, Resume, Notifications
│   ├── llm/                  # OpenAI, Anthropic providers
│   └── routers/              # API routes
│
├── docker-compose.yml
└── TECH_SPEC.md
```

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER HOST                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │   ┌─────────────────┐          ┌─────────────────────────────────┐  │    │
│  │   │    FRONTEND     │   REST   │           BACKEND               │  │    │
│  │   │    (React 19)   │ ◄──────► │          (FastAPI)              │  │    │
│  │   │    Port: 3000   │   API    │          Port: 8000             │  │    │
│  │   │                 │          │                                 │  │    │
│  │   │  ┌───────────┐  │          │  ┌─────────────────────────┐   │  │    │
│  │   │  │   API     │  │          │  │ Controllers + Services  │   │  │    │
│  │   │  │ Controllers│  │          │  │ LLM Integration        │   │  │    │
│  │   │  │  Models   │  │          │  │ Matching Engine        │   │  │    │
│  │   │  └───────────┘  │          │  └─────────────────────────┘   │  │    │
│  │   └─────────────────┘          └────────────────┬────────────────┘  │    │
│  │                                                 │                    │    │
│  │                                                 ▼                    │    │
│  │                         ┌─────────────┐   ┌─────────────┐           │    │
│  │                         │   MongoDB   │   │ OpenAI/LLM  │           │    │
│  │                         │  Port:27017 │   │  Providers  │           │    │
│  │                         └─────────────┘   └─────────────┘           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Docker** & **Docker Compose** (recommended)
- **Node.js 18+** (for local frontend development)
- **Python 3.11+** (for local backend development)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/tchalikanti1705/job_platform_rolesforu.git
cd job_platform_rolesforu

# Start all services
docker-compose up --build

# Access the application
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export MONGO_URL=mongodb://localhost:27017
export DB_NAME=startupsforyou
export JWT_SECRET=your-secret-key
export OPENAI_API_KEY=your-openai-key  # Optional

uvicorn server:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install

# Set environment variables
export REACT_APP_BACKEND_URL=http://localhost:8000

npm start
```

### Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `MONGO_URL` | Backend | MongoDB connection string |
| `DB_NAME` | Backend | Database name |
| `JWT_SECRET` | Backend | Secret for JWT signing |
| `OPENAI_API_KEY` | Backend | OpenAI API key (optional) |
| `ANTHROPIC_API_KEY` | Backend | Anthropic API key (optional) |
| `REACT_APP_BACKEND_URL` | Frontend | Backend API URL |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register (Engineer or Founder) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Startups (Founders Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/startups` | Create startup |
| GET | `/api/startups/me` | Get my startup |
| GET | `/api/startups` | List startups |

### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roles` | Create role (Founders) |
| GET | `/api/roles` | List roles |
| GET | `/api/roles/recommended` | AI recommendations (Engineers) |

### Engineers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/engineers/me` | Get my profile |
| PATCH | `/api/engineers/me` | Update profile |
| GET | `/api/engineers` | Search engineers (Founders) |

### Applications & Connections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply to role |
| POST | `/api/connections` | Connect with engineer |
| POST | `/api/connections/:id/messages` | Send message |

---

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Author

**Teja Chalikanti**
- GitHub: [@tchalikanti1705](https://github.com/tchalikanti1705)
- LinkedIn: [Teja Chalikanti](https://linkedin.com/in/Teja-Chalikanti)
- Email: tchalikanti@gmail.com

---

<p align="center">
  <strong>Built with ❤️ for the startup ecosystem</strong>
</p>

<p align="center">
  <sub>Connecting founders with the talent they need to build the future ⭐</sub>
</p>
