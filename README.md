# 🚀 LeadDesk Mini

A production-ready **Full Stack Lead Capture & Admin Dashboard** application built for the **Digital Heroes Internship Qualification Task**.

> Built with React 19, FastAPI, MongoDB Atlas, JWT Authentication, and modern UI design.

---

## 📋 Project Overview

LeadDesk Mini is a complete lead management platform with two major modules:

| Module | Description |
|---|---|
| **Task A — Lead Capture** | Public landing page with a lead capture form. Leads are stored in MongoDB with validation and duplicate handling. |
| **Task B — Authentication & Admin** | Secure admin dashboard with JWT auth, bcrypt password hashing, lead management table, search, filters, and statistics. |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, Axios, React Hook Form, React Hot Toast |
| **Backend** | FastAPI, Pydantic v2, PyMongo, python-jose (JWT), bcrypt, python-dotenv |
| **Database** | MongoDB Atlas |
| **Deployment** | Frontend → Vercel, Backend → Render |

---

## 📁 Folder Structure

```
digitalheroesfinal/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── jwt_handler.py         # JWT token create/verify
│   │   │   └── password.py            # bcrypt hash/verify
│   │   ├── database/
│   │   │   └── connection.py          # MongoDB Atlas connection
│   │   ├── middleware/
│   │   │   └── auth_middleware.py     # JWT auth dependency
│   │   ├── models/
│   │   │   ├── lead.py                # Lead CRUD operations
│   │   │   └── user.py                # User lookup/creation
│   │   ├── routes/
│   │   │   ├── auth.py                # POST /api/auth/login
│   │   │   ├── leads.py               # Lead CRUD + search
│   │   │   └── dashboard.py           # GET /api/dashboard/stats
│   │   ├── schemas/
│   │   │   ├── lead.py                # Pydantic lead models
│   │   │   └── user.py                # Pydantic auth models
│   │   ├── utils/
│   │   │   └── seed_admin.py          # Admin seeder script
│   │   └── main.py                    # FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedCounter.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LeadForm.jsx
│   │   │   ├── LeadTable.jsx
│   │   │   ├── LeadViewModal.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useLeads.js
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vercel.json
│   ├── .env.example
│   └── package.json
├── README.md
└── LOOM_SCRIPT.md
```

---

## ⚡ Installation & Setup

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **MongoDB Atlas** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/leaddesk-mini.git
cd leaddesk-mini
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed admin user
python -m app.utils.seed_admin

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `JWT_EXPIRY_MINUTES` | Token expiry duration | `60` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## 🗄️ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with read/write access
4. Whitelist your IP (or use `0.0.0.0/0` for development)
5. Get your connection string and add it to `backend/.env`
6. The database name `LeadDesk` and collections `leads`, `users` will be created automatically

---

## 🧪 Test Credentials

| Field | Value |
|---|---|
| **Email** | `admin@leaddesk.com` |
| **Password** | `Admin@123` |

> Run `python -m app.utils.seed_admin` from the `backend/` directory to create this admin user.

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Login with email/password, returns JWT |

**Request:**
```json
{
  "email": "admin@leaddesk.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 3600,
  "email": "admin@leaddesk.com"
}
```

### Leads

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/leads` | ❌ | Submit a new lead (public) |
| `GET` | `/api/leads?page=1&limit=10` | ✅ | List leads (paginated) |
| `GET` | `/api/leads/search?q=name&status=New&budget=₹25k - ₹50k` | ✅ | Search leads |
| `PATCH` | `/api/leads/{id}/status` | ✅ | Update lead status |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | ✅ | Get lead statistics |

**Response:**
```json
{
  "total": 25,
  "new": 10,
  "contacted": 8,
  "closed": 7
}
```

---

## 🔒 Authentication Flow

```
┌─────────┐     POST /api/auth/login     ┌──────────┐
│  Admin   │ ──────────────────────────→  │  FastAPI  │
│  Login   │  { email, password }         │  Backend  │
│  Page    │ ←────────────────────────── │           │
│          │  { access_token, ...}        │  Verify   │
└─────────┘                               │  bcrypt   │
     │                                    └──────────┘
     │  Store token in localStorage
     │
     ▼
┌─────────┐     GET /api/leads            ┌──────────┐
│  Admin   │ ──────────────────────────→  │  FastAPI  │
│  Dash    │  Authorization: Bearer JWT   │  Verify   │
│  board   │ ←────────────────────────── │  JWT      │
│          │  { leads: [...] }            └──────────┘
└─────────┘
     │
     │  On 401 → Auto logout → Redirect to /login
```

---

## 🚀 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Set root directory to `backend`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS`
7. Deploy

> Remember to update `CORS_ORIGINS` on Render to include your Vercel frontend URL.

---

## 📸 Screenshots

> _Screenshots can be added after deployment._

| Page | Description |
|---|---|
| Landing Page | Modern SaaS hero with animated counters |
| Lead Form | Form with validation and budget dropdown |
| Login Page | Admin authentication with test credentials |
| Admin Dashboard | Stats cards, search, filters, lead table |
| Lead View Modal | Full lead details in a modal |
| Dark Mode | Complete dark mode support |
| Mobile View | Fully responsive on all devices |

---

## ✨ Key Features

- ✅ Modern SaaS landing page with gradient hero
- ✅ Animated counters (social proof)
- ✅ Lead capture form with React Hook Form validation
- ✅ Budget range dropdown
- ✅ Duplicate email detection
- ✅ JWT authentication with bcrypt
- ✅ Auto-logout on token expiry (401)
- ✅ Protected admin routes
- ✅ Dashboard with real-time statistics
- ✅ Lead table with status dropdown
- ✅ Search by name/email
- ✅ Filter by status and budget
- ✅ Pagination (10 per page)
- ✅ View lead modal with full message
- ✅ Skeleton loading states
- ✅ Empty state & no results UI
- ✅ Toast notifications
- ✅ Dark mode toggle
- ✅ Responsive (Mobile/Tablet/Desktop)
- ✅ Custom 404 page
- ✅ Error boundary
- ✅ SEO meta tags

---

## 🚀 Features & Improvements Completed

- [x] Lead export to CSV/Excel
- [x] Email notifications on new lead (SMTP)
- [x] Multi-admin support with role-based access (Super Admin, Admin, Viewer)
- [x] Lead notes and activity timeline
- [x] Charts and graphs for analytics (Chart.js status, budget, timeline)
- [x] Webhook integrations (Slack, Discord)
- [x] Rate limiting on public endpoints (SlowAPI)
- [x] File upload in lead contact form (GridFS storage, PDF/images/docs)
- [x] Unit and integration tests (Pytest + TestClient)
- [x] CI/CD pipeline with GitHub Actions

---

## 🏢 Organization

**GALLANTT ISPAT LIMITED**

Developed by **Sandeep Kumar**

---

## 📄 License

This project is built for assessment and production lead management.

