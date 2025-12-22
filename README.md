# first commit
# RolesForU - Job Search & Tracking Platform

A full-stack job search and tracking platform for students and job seekers.

## 🚀 Quick Start with Docker

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Run the Application

```bash
# Clone the repository
git clone https://github.com/tchalikanti1705/job_platform_rolesforu.git
cd job_platform_rolesforu

# Start all services (MongoDB, Backend, Frontend)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

### Stop the Application
```bash
docker-compose down

# To also remove volumes (database data)
docker-compose down -v
```

## 🛠️ Development Setup (Without Docker)

### Backend
```bash
cd backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run the server
uvicorn server:app --reload --port 8000
```

### Frontend
```bash
cd frontend
yarn install

# Create .env file
cp .env.example .env

# Run the development server
yarn start
```

## 📁 Project Structure

```
├── backend/                 # FastAPI backend
│   ├── routers/            # API routes
│   ├── models/             # Pydantic models
│   ├── services/           # Business logic
│   ├── data/               # Seed data
│   └── storage/            # Resume uploads
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   └── store/          # Zustand state management
└── docker-compose.yml      # Docker orchestration
```

## ✨ Features
- 🔐 Email/Password + Google OAuth authentication
- 📄 Resume upload and parsing
- 🎯 Personalized job recommendations
- 🔍 Advanced job search with filters
- 📊 Application tracking (Kanban board)
- 📈 Insights and analytics dashboard
