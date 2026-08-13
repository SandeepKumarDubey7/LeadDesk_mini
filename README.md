# 🚀 LeadDesk Mini

A production-ready, full-stack **Lead Capture & Sales Management Platform** built for **GALLANTT ISPAT LIMITED**.

> Built with **React 19**, **FastAPI**, **MongoDB Atlas (GridFS)**, **JWT Role-Based Auth**, **Chart.js Analytics**, **Slack/Discord Webhooks**, and **GitHub Actions CI/CD**.

---

## 📋 Project Overview

LeadDesk Mini is a comprehensive enterprise lead management application:

| Module | Description |
|---|---|
| **Public Lead Capture** | Responsive landing page with contact form, budget tier selection, and **file attachments** (PDF, PNG, JPG, DOC, DOCX up to 5MB stored in MongoDB GridFS). |
| **Admin Dashboard** | Protected management portal featuring **live analytics charts**, multi-filter search, status updates, **CSV/Excel export**, **lead notes**, and **activity audit timeline**. |
| **Role-Based Access Control (RBAC)** | Support for `super_admin`, `admin`, and `viewer` roles with team access management. |
| **Automated Notifications** | Real-time **SMTP HTML email** alerts and **Slack / Discord webhooks** on lead capture. |
| **Security & Reliability** | IP-based rate limiting with **SlowAPI**, bcrypt password hashing, JWT expiry, and **automated CI/CD test pipeline**. |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Chart.js, react-chartjs-2, React Router v7, Axios, React Hook Form, React Hot Toast |
| **Backend** | FastAPI 0.115, Pydantic v2, PyMongo, GridFS, openpyxl, SlowAPI, python-jose (JWT), passlib/bcrypt, httpx |
| **Database** | MongoDB Atlas (Documents + GridFS file storage) |
| **Testing** | Pytest 8.3, FastAPI TestClient, mongomock |
| **CI/CD & DevOps** | GitHub Actions (`.github/workflows/ci.yml`), Render (Backend), Vercel (Frontend) |

---

## 📁 Project Architecture

```
LeadDesk_mini/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI/CD pipeline
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── jwt_handler.py         # JWT token creation and verification
│   │   │   └── password.py            # bcrypt password hashing utilities
│   │   ├── database/
│   │   │   └── connection.py          # PyMongo client & GridFS instance
│   │   ├── middleware/
│   │   │   ├── auth_middleware.py     # JWT & role-based access dependency
│   │   │   └── rate_limiter.py        # SlowAPI rate limiter configuration
│   │   ├── models/
│   │   │   ├── analytics.py           # MongoDB aggregation pipelines for charts
│   │   │   ├── lead.py                # Lead CRUD, notes, timeline & exports
│   │   │   └── user.py                # Admin user & role management helpers
│   │   ├── routes/
│   │   │   ├── admin.py               # Super admin user management endpoints
│   │   │   ├── analytics.py           # Chart & analytics data endpoints
│   │   │   ├── auth.py                # POST /api/auth/login
│   │   │   ├── dashboard.py           # Aggregated pipeline stats
│   │   │   ├── export.py              # GET /api/leads/export (CSV & XLSX)
│   │   │   └── leads.py               # Lead submission, attachment, search, notes
│   │   ├── schemas/
│   │   │   ├── lead.py                # Pydantic schemas for leads, notes & timeline
│   │   │   └── user.py                # Pydantic schemas for auth & user roles
│   │   ├── utils/
│   │   │   ├── email_service.py       # SMTP HTML email notification service
│   │   │   ├── seed_admin.py          # Super admin user seeder
│   │   │   └── webhooks.py            # Slack & Discord notification dispatcher
│   │   └── main.py                    # FastAPI entrypoint, CORS & route registry
│   ├── tests/
│   │   ├── conftest.py                # Test fixtures & mongomock setup
│   │   ├── test_admin.py              # Super admin & RBAC tests
│   │   ├── test_auth.py               # Login & token validation tests
│   │   ├── test_dashboard.py          # Stats & analytics endpoint tests
│   │   ├── test_export.py             # CSV and Excel export tests
│   │   └── test_leads.py              # Lead CRUD, attachments, notes & timeline tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsCharts.jsx    # Chart.js status, budget & trend graphs
│   │   │   ├── AnimatedCounter.jsx    # Animated metrics counter
│   │   │   ├── EmptyState.jsx         # Empty state & no-results indicator
│   │   │   ├── ErrorBoundary.jsx      # React error boundary
│   │   │   ├── Footer.jsx             # Company branded footer
│   │   │   ├── LeadForm.jsx           # Form with drag-and-drop file upload
│   │   │   ├── LeadTable.jsx          # Lead management table with attachment clip
│   │   │   ├── LeadViewModal.jsx      # Tabbed modal: Details | Notes | Timeline
│   │   │   ├── LoadingSkeleton.jsx    # Shimmer loading skeleton
│   │   │   ├── Navbar.jsx             # Responsive navbar
│   │   │   ├── ProtectedRoute.jsx     # Auth route guard
│   │   │   ├── SearchBar.jsx          # Search bar component
│   │   │   ├── StatCard.jsx           # Metric stat cards
│   │   │   └── UserManagementModal.jsx# Super Admin team access manager
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Auth state & role context
│   │   ├── hooks/
│   │   │   └── useLeads.js            # Custom hook for lead pagination & filters
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx     # Full-featured admin dashboard
│   │   │   ├── LandingPage.jsx        # Marketing SaaS landing page
│   │   │   ├── LoginPage.jsx          # Admin authentication page
│   │   │   └── NotFoundPage.jsx       # 404 page
│   │   ├── services/
│   │   │   └── api.js                 # Axios client with JWT interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚡ Installation & Quick Start

### Prerequisites
- **Node.js** >= 18
- **Python** >= 3.10
- **MongoDB Atlas** connection string

### 1. Clone the Repository
```bash
git clone https://github.com/SandeepKumarDubey7/LeadDesk_mini.git
cd LeadDesk_mini
```

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux

# Seed default Super Admin user
python -m app.utils.seed_admin

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux

# Start Vite development server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_secret_key` |
| `JWT_EXPIRY_MINUTES` | Token expiry duration (minutes) | `60` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5173` |
| `SMTP_HOST` | *(Optional)* SMTP mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | *(Optional)* SMTP port | `587` |
| `SMTP_USER` | *(Optional)* SMTP sender email | `notifications@example.com` |
| `SMTP_PASSWORD` | *(Optional)* SMTP app password | `xxxx-xxxx-xxxx-xxxx` |
| `NOTIFY_EMAIL` | *(Optional)* Recipient email for lead alerts | `admin@example.com` |
| `SLACK_WEBHOOK_URL` | *(Optional)* Slack incoming webhook URL | `https://hooks.slack.com/...` |
| `DISCORD_WEBHOOK_URL` | *(Optional)* Discord incoming webhook URL | `https://discord.com/api/webhooks/...` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## 👥 Roles & Access Permissions

| Feature / Action | Super Admin | Admin | Viewer |
|---|:---:|:---:|:---:|
| View Leads & Search | ✅ | ✅ | ✅ |
| View Lead Details & Attachments | ✅ | ✅ | ✅ |
| View Activity Timeline & Notes | ✅ | ✅ | ✅ |
| Add Notes to Leads | ✅ | ✅ | ❌ |
| Update Lead Status (New/Contacted/Closed) | ✅ | ✅ | ❌ |
| Export to CSV / Excel | ✅ | ✅ | ✅ |
| View Analytics Charts | ✅ | ✅ | ✅ |
| Manage Team Users & Roles | ✅ | ❌ | ❌ |

### Default Credentials (Seeded)
- **Email**: `admin@leaddesk.com`
- **Password**: `Admin@123`
- **Role**: `super_admin`

---

## 📡 API Endpoint Reference

### 1. Authentication
- `POST /api/auth/login` — Authenticate and receive JWT access token.

### 2. Public Leads & File Upload
- `POST /api/leads` — Submit new lead with optional file attachment (`multipart/form-data`). *(Rate limit: 5/min)*
- `GET /api/leads/public/stats` — Public aggregate counts. *(Rate limit: 30/min)*

### 3. Lead Management (Protected)
- `GET /api/leads?page=1&limit=10` — Paginated list of all leads.
- `GET /api/leads/search?q=...&status=...&budget=...` — Multi-filter search.
- `PATCH /api/leads/{id}/status` — Update status (`New`, `Contacted`, `Closed`).
- `GET /api/leads/{id}/attachment` — Download lead attached file.

### 4. Notes & Activity Timeline (Protected)
- `POST /api/leads/{id}/notes` — Add follow-up note.
- `GET /api/leads/{id}/notes` — List notes for a lead.
- `GET /api/leads/{id}/timeline` — View chronological activity timeline.

### 5. Export (Protected)
- `GET /api/leads/export?format=csv` — Export filtered leads as CSV.
- `GET /api/leads/export?format=xlsx` — Export filtered leads as formatted Excel spreadsheet.

### 6. Analytics Charts (Protected)
- `GET /api/analytics/status-distribution` — Grouped lead counts by status.
- `GET /api/analytics/budget-distribution` — Grouped lead counts by budget range.
- `GET /api/analytics/leads-over-time?days=30` — Daily lead volume trend.

### 7. Team & Role Management (Super Admin)
- `POST /api/admin/users` — Create new admin user (`super_admin`, `admin`, `viewer`).
- `GET /api/admin/users` — List all registered admin accounts.
- `PATCH /api/admin/users/{id}/role` — Change user role.
- `DELETE /api/admin/users/{id}` — Delete user account.

---

## 🧪 Testing

The backend includes a comprehensive test suite using **Pytest** and in-memory **mongomock** (no live database required to run tests):

```bash
cd backend
python -m pytest tests/ -v
```

### Test Suite Summary
- `test_auth.py` — Login flows, invalid credentials, token verification.
- `test_leads.py` — Form submissions, file uploads, duplicate email conflict handling, pagination, search, status RBAC, notes, timeline.
- `test_dashboard.py` — Public metrics, protected dashboard stats, analytics chart aggregations.
- `test_export.py` — CSV and Excel export downloads.
- `test_admin.py` — Super Admin user management and role restriction enforcement.

---

## 🚀 CI/CD Pipeline

The project includes an automated GitHub Actions pipeline in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that executes on every push and pull request:
1. **Backend Tests**: Sets up Python 3.11, installs dependencies, and runs `pytest tests/ -v`.
2. **Frontend Build Check**: Sets up Node.js 20, installs packages, and validates production bundle compilation with `npm run build`.

---

## 🏢 Organization

**GALLANTT ISPAT LIMITED**

Developed by **Sandeep Kumar**

---

## 📄 License

This project is built for assessment and enterprise lead management.
