# StartupsForYou - Technical Specification

> Global Platform Architecture & Tech Stack

---

## 🎯 Platform Overview

**StartupsForYou** is a job platform connecting talent with startup opportunities.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
│                         (Web Browsers)                                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DOCKER HOST                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     docker-compose.yml                           │    │
│  │                                                                  │    │
│  │   ┌─────────────────┐          ┌─────────────────┐              │    │
│  │   │                 │          │                 │              │    │
│  │   │    FRONTEND     │   API    │     BACKEND     │              │    │
│  │   │    (React)      │ ◄──────► │    (FastAPI)    │              │    │
│  │   │                 │          │                 │              │    │
│  │   │    Port: 3000   │          │    Port: 8000   │              │    │
│  │   │                 │          │                 │              │    │
│  │   └─────────────────┘          └────────┬────────┘              │    │
│  │                                         │                        │    │
│  │                                         │                        │    │
│  │                                         ▼                        │    │
│  │                           ┌─────────────────────┐                │    │
│  │                           │                     │                │    │
│  │                           │      MONGODB        │                │    │
│  │                           │                     │                │    │
│  │                           │    Port: 27017      │                │    │
│  │                           │                     │                │    │
│  │                           └─────────────────────┘                │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI Framework |
| React Router | 7.5.1 | Routing |
| Zustand | 5.0.9 | State Management |
| Tailwind CSS | 3.x | Styling |
| Radix UI | Latest | UI Components |
| Axios | 1.8.4 | HTTP Client |
| React Hook Form | 7.56.2 | Forms |
| Zod | 3.24.4 | Validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.110.1 | Web Framework |
| Motor | 3.3.1 | MongoDB Driver |
| Pydantic | 2.x | Data Validation |
| bcrypt | 4.1.3 | Password Hashing |
| PyJWT | 2.x | JWT Tokens |

### Database

| Technology | Purpose |
|------------|---------|
| MongoDB | Primary Database |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |

---

## 🐳 Container Architecture

### Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `frontend` | Custom | 3000 | React SPA |
| `backend` | Custom | 8000 | FastAPI Server |
| `mongodb` | mongo:latest | 27017 | Database |

### Docker Compose Structure

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=startupsforyou
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 🔀 Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────>│ Frontend │────>│ Backend  │────>│ MongoDB  │
│  Action  │     │ (React)  │     │ (FastAPI)│     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                │
                      │   HTTP/JSON    │
                      │◄──────────────►│
                      │                │
                 Zustand          Pydantic
                 State            Models
```

---

## 🔐 Authentication Architecture

```
┌─────────────────────────────────────────────────────┐
│                  AUTH SYSTEM                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────────┐        ┌─────────────┐            │
│   │   Email/    │        │   OAuth     │            │
│   │  Password   │        │  (Future)   │            │
│   └──────┬──────┘        └──────┬──────┘            │
│          │                      │                    │
│          ▼                      ▼                    │
│   ┌─────────────────────────────────────┐           │
│   │           JWT TOKEN                  │           │
│   │    (7 days expiration)              │           │
│   └──────────────────┬──────────────────┘           │
│                      │                               │
│                      ▼                               │
│   ┌─────────────────────────────────────┐           │
│   │    Authorization: Bearer <token>     │           │
│   └─────────────────────────────────────┘           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
job_platform_rolesforu/
│
├── TECH_SPEC.md              # This file (Global docs)
├── docker-compose.yml        # Container orchestration
├── README.md                 # Project readme
│
├── frontend/
│   ├── tech_spec/
│   │   └── README.md         # Frontend documentation
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── tech_spec/
│   │   ├── README.md         # Backend doc index
│   │   ├── overview.md       # Tech stack & structure
│   │   └── auth-api.md       # Auth API documentation
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── server.py
│   ├── requirements.txt
│   └── Dockerfile
│
└── tests/                    # Test files
```

---

## 🌐 API Overview

| Service | Base URL | Purpose |
|---------|----------|---------|
| Frontend | `http://localhost:3000` | Web Application |
| Backend API | `http://localhost:8000/api` | REST API |
| API Docs | `http://localhost:8000/docs` | Swagger UI |

### Current Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api` | GET | API info |
| `/api/health` | GET | Health check |
| `/api/auth/signup` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | User logout |

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

## 📚 Documentation Links

| Area | Location |
|------|----------|
| Frontend | [frontend/tech_spec/README.md](frontend/tech_spec/README.md) |
| Backend | [backend/tech_spec/README.md](backend/tech_spec/README.md) |
| Auth API | [backend/tech_spec/auth-api.md](backend/tech_spec/auth-api.md) |

---


*Last Updated: December 2024*
