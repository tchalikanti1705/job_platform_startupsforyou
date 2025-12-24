# Backend Overview

> StartupsForYou - Backend Tech Stack & Structure

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.110.1 | Web framework |
| Motor | 3.3.1 | Async MongoDB driver |
| Pydantic | 2.x | Data validation |
| bcrypt | 4.1.3 | Password hashing |
| PyJWT | 2.x | JWT tokens |
| python-dotenv | - | Environment config |
| Uvicorn | - | ASGI server |

---

## 📁 Project Structure

```
backend/
├── server.py               # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── Dockerfile              # Container config
├── .env                    # Environment variables
│
├── models/                 # Pydantic schemas
│   ├── __init__.py
│   └── user.py             # User models
│
├── routers/                # API route handlers
│   ├── __init__.py
│   └── auth.py             # Auth endpoints
│
├── services/               # Business logic
│   └── __init__.py
│
├── storage/                # File storage
│   └── resumes/
│
└── tech_spec/              # Documentation
    ├── README.md
    ├── overview.md
    └── auth-api.md
```

---

## 🏗 Layer Architecture

```
┌─────────────────────────────────────────┐
│              ROUTERS                     │
│     (API endpoints, request handling)    │
├─────────────────────────────────────────┤
│              SERVICES                    │
│        (Business logic, validation)      │
├─────────────────────────────────────────┤
│               MODELS                     │
│         (Pydantic schemas)               │
├─────────────────────────────────────────┤
│              DATABASE                    │
│           (MongoDB via Motor)            │
└─────────────────────────────────────────┘
```

---

## 🗄 Database (MongoDB)

### Collections

| Collection | Purpose |
|------------|---------|
| `users` | User accounts & credentials |
| `profiles` | User profile data |
| `user_sessions` | Active sessions |

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ | MongoDB connection string |
| `DB_NAME` | ✅ | Database name |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `CORS_ORIGINS` | ❌ | Allowed origins |

---

## 🚀 Running Locally

```bash
# Install
pip install -r requirements.txt

# Configure
cp .env.example .env

# Run
uvicorn server:app --reload --port 8000
```

---

## 🐳 Docker

```bash
# Build
docker build -t backend .

# Run
docker run -p 8000:8000 --env-file .env backend
```

---

*Last Updated: December 2024*
