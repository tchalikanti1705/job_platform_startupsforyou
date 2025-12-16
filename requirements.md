# Job Search & Tracking Platform - Requirements Document

## Original Problem Statement
Build a Job Search & Tracking Platform for students/job seekers with the following flow:
1. Signup/Login (email + social login)
2. Upload resume during onboarding → parse resume → user edits extracted profile
3. Navigate to Home → see personalized recommended jobs with Date Posted, Application Deadline, sorting: Newest vs Best Match
4. Search & Filters: skills, experience, location, startup focus
5. Startup Map View: click startup pin → see jobs for that startup
6. User marks job as Applied → status updates: Interview → Offer/Rejected
7. Insights: productivity charts + tracker table

## User Choices
- **Authentication**: JWT email/password + Emergent-managed Google OAuth
- **Resume Parsing**: Rule-based only (no AI) - extensible for future AI integration
- **Map View**: Fallback list view (Mapbox behind env flag MAPBOX_TOKEN)
- **Design Theme**: Clean light theme with white background, blue primary (#3B82F6), subtle gray borders, rounded cards
- **AI Integrations**: None for MVP-1 - AI modules as interfaces/stubs for Phase 2

## Architecture Completed (MVP-1)

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` - Main FastAPI app
- `/app/backend/routers/` - API routes (auth, profile, jobs, applications, insights)
- `/app/backend/models/` - Pydantic models
- `/app/backend/services/` - Business logic (resume_parser, matching)
- `/app/backend/data/seed_jobs.json` - 15 seed jobs

### Frontend (React + Tailwind + Shadcn)
- `/app/frontend/src/App.js` - Router and routes
- `/app/frontend/src/store/` - Zustand stores (auth, jobs, applications, profile, insights)
- `/app/frontend/src/pages/` - All pages (Landing, Login, Signup, Onboarding, Home, Jobs, JobDetail, Tracker, Startups, Insights)
- `/app/frontend/src/components/` - Reusable components (Layout, JobCard, ProtectedRoute)

### Features Implemented
1. ✅ **Authentication** - Email/password JWT + Google OAuth ready
2. ✅ **Onboarding** - Resume upload, parsing, profile editing, skip option
3. ✅ **Jobs Home** - Personalized recommendations, Best Match/Newest sorting
4. ✅ **Job Search** - Filters (skills, experience, location, startup, remote)
5. ✅ **Job Detail** - Full job info with Apply button
6. ✅ **Startups** - List view with job counts (Map placeholder)
7. ✅ **Application Tracker** - Kanban board (Applied/Interview/Offer/Rejected)
8. ✅ **Insights** - KPIs, charts, application table

## Next Tasks (Phase 2)

### Priority 1: Enhanced Features
- [ ] Add Mapbox integration when token is provided
- [ ] Implement drag-and-drop in Kanban tracker
- [ ] Add email notifications for deadline reminders
- [ ] Implement saved/bookmarked jobs feature

### Priority 2: AI Integration
- [ ] Integrate AI for resume parsing (GPT/Gemini via Emergent LLM Key)
- [ ] Add semantic skill matching using embeddings
- [ ] Implement AI-powered job recommendations

### Priority 3: LinkedIn & Email (As specified in spec)
- [ ] Phase 2A: LinkedIn employee discovery (generate search links)
- [ ] Phase 2B: Send email from platform (SendGrid integration)

### Priority 4: Performance & Scale
- [ ] Add Elasticsearch for faster job search
- [ ] Implement Redis caching
- [ ] Add pagination for large datasets
- [ ] Background jobs with Celery

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/session` - Exchange OAuth session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Profile
- `POST /api/profile/resume/upload` - Upload resume
- `GET /api/profile/resume/{id}/status` - Check parsing status
- `GET /api/profile/me` - Get profile
- `PUT /api/profile/me` - Update profile
- `POST /api/profile/me/complete-onboarding` - Mark onboarding done

### Jobs
- `GET /api/jobs/search` - Search with filters
- `GET /api/jobs/recommended` - Personalized recommendations
- `GET /api/jobs/{id}` - Single job details
- `GET /api/jobs/startups/list` - List startups with job counts
- `GET /api/jobs/startups/{company}/jobs` - Jobs for a startup

### Applications
- `POST /api/applications` - Create application
- `GET /api/applications` - List user's applications
- `GET /api/applications/{id}` - Get single application
- `PATCH /api/applications/{id}/status` - Update status
- `DELETE /api/applications/{id}` - Delete application

### Insights
- `GET /api/insights/summary` - KPI summary
- `GET /api/insights/timeseries` - Activity over time
- `GET /api/insights/funnel` - Conversion funnel
- `GET /api/insights/table` - Applications table data
