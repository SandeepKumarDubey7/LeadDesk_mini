# 🎬 LeadDesk Mini — Loom Walkthrough Script

> **Duration:** 2–3 minutes
> **Tone:** Professional, confident, concise

---

## 🎥 Script

### [0:00 – 0:15] Introduction

> "Hi, I'm Sandeep. I built LeadDesk Mini — a full-stack lead capture and management platform for the Digital Heroes Internship Task. Let me walk you through it quickly."

---

### [0:15 – 0:40] Landing Page

> "This is the public landing page. It's built with React 19 and Tailwind CSS. You can see the gradient hero section, animated counters showing social proof like '500+ Businesses Helped', feature cards, and the tech stack showcase. The design is fully responsive — it works great on mobile, tablet, and desktop. There's also a dark mode toggle up here in the navbar."

**Action:** Scroll through the page slowly. Toggle dark mode. Show mobile responsiveness.

---

### [0:40 – 1:10] Lead Form & Validation

> "Here's the lead capture form. It has four fields — Name, Email, Budget Range dropdown, and Message. All fields have client-side validation using React Hook Form. Let me show you — if I submit empty, you see the error messages. And the email field validates the format too."

> "Now let me fill it out properly and submit. You can see the loading spinner, and then a success toast notification. This lead is now stored in MongoDB Atlas. If I try submitting the same email again, it shows a duplicate email error — that's backend validation."

**Action:** Show validation errors, then fill form and submit. Show success toast. Submit again with same email to show 409 error.

---

### [1:10 – 1:30] MongoDB Storage

> "On the backend, this is powered by FastAPI with a real MongoDB Atlas database. Every lead is stored with name, email, budget, message, status defaulting to 'New', and a timestamp. I'm using Pydantic for schema validation and PyMongo for the database connection."

**Action:** (Optional) Briefly show FastAPI docs at /docs or MongoDB Atlas collection.

---

### [1:30 – 1:50] Admin Login

> "Now let's access the admin dashboard. If I go to /admin without logging in, I'm redirected to the login page — that's the protected route in action. I'll log in with the admin credentials. The password is hashed with bcrypt, and on success, a JWT token is generated and stored securely."

**Action:** Navigate to /admin, show redirect. Login with admin@leaddesk.com / Admin@123.

---

### [1:50 – 2:15] Dashboard

> "Here's the admin dashboard. At the top, you see four stat cards — Total Leads, New, Contacted, and Closed — powered by a dedicated stats API with MongoDB aggregation. Below that, there's a search bar, status filter, and budget filter dropdown."

> "The lead table shows all leads with columns for Name, Email, Budget, Message (truncated), Status, Date, and an Action button. I can click 'View' to see the full message in a modal."

**Action:** Point to stat cards. Use the search bar. Toggle filters. Click View on a lead.

---

### [2:15 – 2:35] Status Update & Search

> "The status column has a dropdown — I can change a lead from 'New' to 'Contacted' or 'Closed'. It updates immediately in the database via a PATCH API call, and you see a confirmation toast."

> "The search works across name and email with backend pagination. And the status and budget filters narrow down results instantly."

**Action:** Change a status. Show toast. Search by name. Filter by status.

---

### [2:35 – 2:50] Deployment & Architecture

> "The app is deployment-ready. The frontend is configured for Vercel with SPA rewrites, and the backend has a Render configuration file. Environment variables are properly separated with .env.example files for both."

> "The architecture follows clean separation — routes, models, schemas, auth, and middleware on the backend. Components, pages, hooks, services, and context on the frontend."

---

### [2:50 – 3:00] One Improvement

> "If I had more time, I'd add email notifications — so when a new lead comes in, the admin gets an instant email with the lead details. I'd use a service like SendGrid or Resend for that."

> "Thanks for watching! I'm excited about the opportunity at Digital Heroes."

---

## ✅ Key Points to Hit

- [x] Modern, responsive UI (not just a basic form)
- [x] Form validation (client + server)
- [x] Real MongoDB storage (not mock)
- [x] JWT authentication with bcrypt
- [x] Protected routes with auto-redirect
- [x] Dashboard with real statistics
- [x] Search + filter + pagination
- [x] Status management with dropdown
- [x] Clean architecture and code quality
- [x] Deployment-ready configuration
