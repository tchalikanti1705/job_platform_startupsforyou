<p align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-0.110.1-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS"/>
</p>

<h1 align="center">StartupsForYou</h1>

<p align="center">
  <strong>AI-Powered Job Platform Connecting Ambitious Talent with Exceptional Startups</strong>
</p>

<p align="center">
  <a href="#the-problem">Problem</a> •
  <a href="#our-solution">Solution</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## The Problem

### The Startup Hiring Gap

The traditional job market fails both **startups** and **job seekers** in critical ways:

| Pain Point | For Job Seekers | For Startups |
|------------|-----------------|--------------|
| **Discovery** | Hard to find quality startup opportunities buried under corporate listings | Struggle to reach candidates interested in startup culture |
| **Matching** | Generic job boards don't understand startup-specific skills (equity, fast-paced, wear-many-hats) | Waste time filtering candidates who don't fit startup mindset |
| **Access** | No direct connection to founders; blocked by recruiters | Miss great candidates who don't fit traditional resume patterns |
| **Tracking** | Managing applications across 20+ platforms is chaotic | No insight into candidate pipeline quality |
| **Context** | Lack of startup metrics (funding stage, team size, growth) to make informed decisions | Can't showcase what makes their startup unique |

**The Result:** Talented professionals miss life-changing opportunities at promising startups, while startups struggle to build their founding teams.

---

## Our Solution

**StartupsForYou** is a specialized job platform designed exclusively for the startup ecosystem. We leverage **AI-powered matching** to connect the right talent with the right startups based on skills, culture fit, and career aspirations.

### What Makes Us Different

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│    Traditional Job Boards          vs          StartupsForYou               │
│    ─────────────────────                      ──────────────────            │
│                                                                              │
│    ❌ Generic listings                        ✅ Startup-curated only        │
│    ❌ Keyword matching                        ✅ AI semantic matching         │
│    ❌ No company context                      ✅ Funding, stage, metrics      │
│    ❌ Recruiter gatekeeping                   ✅ Direct founder access        │
│    ❌ Fragmented tracking                     ✅ Unified application tracker  │
│    ❌ One-size-fits-all                       ✅ Personalized recommendations │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Authentication & Onboarding
- **Secure JWT Authentication** with email/password
- **Google OAuth Integration** (Phase 2)
- **Smart Onboarding Flow** with resume parsing and profile building
- **Skip Option** for users who want to explore first

### Intelligent Resume Parsing
- Upload PDF/DOCX resumes
- **Rule-based extraction** of skills, experience, education
- **AI-ready architecture** for GPT/Gemini integration
- User can edit and enhance extracted profile

### Personalized Job Matching
- **Best Match Algorithm** weighing skills, experience, and preferences
- **Newest First** sorting for time-sensitive opportunities
- Filter by: Skills, Experience Level, Location, Remote, Startup Stage

### Startup Discovery
- Browse curated startup listings with:
  - Funding stage (Seed → Series A → Unicorn)
  - Team size and growth metrics
  - Open positions count
  - Company culture highlights
- **Map View** with Mapbox integration (optional)

### Application Tracker
- **Kanban Board** with drag-and-drop (Phase 2)
- Status tracking: Applied → Interview → Offer/Rejected
- Deadline reminders and notifications

### Career Insights Dashboard
- Application activity trends
- Conversion funnel analytics
- KPI summary (applications, interviews, offers)
- Exportable application history

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
| **React Hook Form + Zod** | Form validation |
| **Recharts** | Analytics visualization |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

### Backend

| Technology | Purpose |
|------------|---------|
| **Python 3.11+** | Runtime environment |
| **FastAPI** | High-performance async API framework |
| **Motor** | Async MongoDB driver |
| **Pydantic v2** | Data validation & serialization |
| **PyJWT** | JSON Web Token authentication |
| **bcrypt** | Secure password hashing |
| **pdfplumber** | PDF resume parsing |
| **python-docx** | DOCX resume parsing |

### Database & Infrastructure

| Technology | Purpose |
|------------|---------|
| **MongoDB 7.0** | Document database for flexible schemas |
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                         (Web Browser / Mobile)                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER HOST                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │   ┌─────────────────┐          ┌─────────────────────────────────┐  │    │
│  │   │                 │   REST   │                                 │  │    │
│  │   │    FRONTEND     │   API    │           BACKEND               │  │    │
│  │   │    ─────────    │ ◄──────► │           ───────               │  │    │
│  │   │                 │          │                                 │  │    │
│  │   │  React 19       │          │  FastAPI                        │  │    │
│  │   │  TailwindCSS    │          │  ├── /api/auth     (JWT Auth)   │  │    │
│  │   │  Zustand        │          │  ├── /api/profile  (User Data)  │  │    │
│  │   │  shadcn/ui      │          │  ├── /api/jobs     (Listings)   │  │    │
│  │   │                 │          │  ├── /api/applications          │  │    │
│  │   │  Port: 3000     │          │  └── /api/insights (Analytics)  │  │    │
│  │   │                 │          │                                 │  │    │
│  │   └─────────────────┘          │  Port: 8000                     │  │    │
│  │                                └────────────────┬────────────────┘  │    │
│  │                                                 │                    │    │
│  │                                                 │ Motor (Async)      │    │
│  │                                                 ▼                    │    │
│  │                                ┌─────────────────────────────────┐  │    │
│  │                                │           MONGODB               │  │    │
│  │                                │           ───────               │  │    │
│  │                                │                                 │  │    │
│  │                                │  Collections:                   │  │    │
│  │                                │  ├── users                      │  │    │
│  │                                │  ├── profiles                   │  │    │
│  │                                │  ├── jobs                       │  │    │
│  │                                │  ├── applications               │  │    │
│  │                                │  └── user_sessions              │  │    │
│  │                                │                                 │  │    │
│  │                                │  Port: 27017                    │  │    │
│  │                                └─────────────────────────────────┘  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────►│ React    │────►│ FastAPI  │────►│ MongoDB  │
│  Action  │     │ Frontend │     │ Backend  │     │ Database │
└──────────┘     └────┬─────┘     └────┬─────┘     └──────────┘
                      │                │
                 Zustand           Pydantic
                 Store             Validation
                      │                │
                      ▼                ▼
                 Local State      Type Safety
                 Persistence      & Serialization
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
export DB_NAME=startupsforyu
export JWT_SECRET=your-secret-key

uvicorn server:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install  # or yarn install

# Set environment variables
export REACT_APP_BACKEND_URL=http://localhost:8000

npm start  # or yarn start
```

### Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `MONGO_URL` | Backend | MongoDB connection string |
| `DB_NAME` | Backend | Database name |
| `JWT_SECRET` | Backend | Secret for JWT signing |
| `CORS_ORIGINS` | Backend | Allowed CORS origins |
| `REACT_APP_BACKEND_URL` | Frontend | Backend API URL |

---

## Roadmap

### Phase 1: MVP ✅ (Current)
- [x] User authentication (JWT)
- [x] Landing page & marketing
- [x] User registration flow
- [x] Basic resume upload
- [x] Docker containerization

### Phase 2: Core Features (In Progress)
- [ ] **AI Resume Parsing** - GPT/Gemini integration for intelligent extraction
- [ ] **Job Search & Filters** - Full-text search with Elasticsearch
- [ ] **Personalized Matching** - ML-based job recommendations
- [ ] **Application Tracker** - Kanban board with drag-and-drop
- [ ] **Startup Profiles** - Detailed company pages with metrics

### Phase 3: AI & Intelligence
- [ ] **Semantic Skill Matching** - Embeddings-based similarity
- [ ] **AI Cover Letter Generator** - Personalized for each application
- [ ] **Interview Prep Assistant** - Company-specific insights
- [ ] **Salary Insights** - Market data and negotiation tips

### Phase 4: Network & Engagement
- [ ] **LinkedIn Integration** - Employee discovery & connections
- [ ] **Direct Messaging** - Chat with founders
- [ ] **Referral System** - Get introduced by network
- [ ] **Email Notifications** - Deadline reminders & updates

### Phase 5: Scale & Enterprise
- [ ] **Redis Caching** - Performance optimization
- [ ] **Elasticsearch** - Advanced search capabilities
- [ ] **Analytics Dashboard** - For startups to track applicants
- [ ] **Startup Subscription** - Premium listing features

---

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
  <sub>If you found this project helpful, please consider giving it a ⭐</sub>
</p>
