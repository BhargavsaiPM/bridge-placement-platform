# 🌉 Bridge Placement System — Complete Website Guide

## 🚀 Running the Application

### Prerequisites
- Java 21+
- Maven 3.8+
- Node.js 18+
- MySQL running on port 3306 with user `root` / password `root`

### Step 1 — Start the Backend (Spring Boot)

Open a terminal and run:

```powershell
cd C:\Projects\Bridge_Project\backend
mvn spring-boot:run
```

- Starts on **http://localhost:9092**
- API base path: **http://localhost:9092/api**
- On first run, a **Super Admin** account is auto-seeded into the database

### Step 2 — Start the Frontend (React + Vite)

Open a **second** terminal and run:

```powershell
cd C:\Projects\Bridge_Project\frontend
npm run dev
```

- Starts on **http://localhost:5173**
- Open this URL in your browser

---

## 🔑 Login Credentials

### 👑 Admin (Super Admin)
| Field | Value |
|-------|-------|
| Email | `admin@bridge.com` |
| Password | `admin123` |

> This account is **auto-created** when the backend starts for the first time.

### 🏢 Company Account
1. Go to **http://localhost:5173/register-company**
2. Register a new company (fill in company name, email, password, domain)
3. After registration, the Admin must **approve** the company first before they can log in
4. Once approved, log in at **http://localhost:5173/login** with the company's credentials

### 👮 Placement Officer Account
- Officers are created **by a Company** (not by self-registration)
- An approved company logs in → goes to **Create Officer** page → enters officer's email & password
- The officer then logs in with those credentials

### 👤 Student / User Account
1. Go to **http://localhost:5173/register**
2. Fill in your name, email, password, phone, graduation year
3. Log in immediately after registration — no approval needed

---

## 🗺️ Pages & Features by Role

### 👑 Admin Role — `/admin/*`

After logging in as admin, you are redirected to **`/admin/dashboard`**.

#### Admin Dashboard (`/admin/dashboard`)
- Overview of system statistics (total companies, pending approvals, etc.)
- Quick links to management sections

#### Company Approval Page (`/admin/companies`)
- Lists all companies that have registered on the platform
- Shows each company's status: **PENDING**, **APPROVED**, or **REJECTED**
- Admin can click **Approve** or **Reject** next to any company
- Once approved, the company can log in and use the system

---

### 🏢 Company Role — `/company/*`

After logging in as a company, you are redirected to **`/company/dashboard`**.

> ⚠️ **Company must be APPROVED by Admin before they can log in.**

#### Company Dashboard (`/company/dashboard`)
- Overview of company stats: number of officers, active jobs, total applications
- Quick access to key actions

#### Create Officer (`/company/create-officer`)
- Form to create a **Placement Officer** account under your company
- Fields: Officer name, email, password
- The officer will have the `OFFICER` role and belong to your company

#### Company Profile (`/company/profile`)
- View and edit company details: name, website, industry, description
- See company domain and approval status

---

### 👮 Placement Officer Role — `/officer/*`

After logging in as an officer, you are redirected to **`/officer/dashboard`**.

#### Officer Dashboard (`/officer/dashboard`)
- Key metrics: total jobs, active jobs, total applications, reviewed applications
- Recent activity feed

#### Job Management (`/officer/jobs`)
- List of all jobs posted under the company
- View job title, type, location, applicant count, status
- Actions: Edit job, View applications for a job

#### Create / Edit Job (`/officer/jobs/create` or `/officer/jobs/:id/edit`)
- Form to post a new job listing
- Fields include:
  - Job Title, Job Type (Full-time / Internship / Part-time)
  - Location, Work Mode (Remote / On-site / Hybrid)
  - Salary Min / Max, Currency
  - Description, Requirements, Responsibilities
  - Skills required, Application deadline
  - Maximum number of applicants

#### Applications Review (`/officer/applications/:jobId`)
- View all student applications for a specific job
- See applicant name, email, resume, cover letter
- Actions: **Shortlist**, **Reject**, or change status of each applicant
- Filter applications by status

#### Reports (`/officer/reports`)
- Analytics and summaries for the company's recruitment activity
- Charts for applications over time, status breakdown, etc.

---

### 👤 Student / User Role — `/user/*`

After logging in as a user/student, you are redirected to **`/user/dashboard`**.

#### User Dashboard (`/user/dashboard`)
- Personal stats: applications submitted, interviews scheduled, profile completeness
- Recommended jobs based on skills
- Recent notifications summary

#### Job Search (`/user/jobs`)
- Browse all available job listings across companies
- Filter by: job type, location, work mode, salary range, skills
- Search bar for keyword search
- Each card shows job title, company, location, salary, deadline

#### Job Detail (`/user/jobs/:id`)
- Full job description, requirements, responsibilities
- Company info
- Button to **Apply** for the job

#### Apply for a Job (`/user/jobs/:id/apply`)
- Submit application form with:
  - Resume upload (PDF, max 5MB)
  - Cover letter (text)
  - Any other required fields
- Once submitted, shows in **My Applications**

#### My Applications (`/user/applications`)
- List of all jobs the user has applied to
- Shows application status: **PENDING**, **SHORTLISTED**, **REJECTED**
- View submission date and details of each application

#### Notifications (`/user/notifications`)
- System notifications about application status changes
- Updates from companies (e.g., "Your application was shortlisted")

---

## 🔄 End-to-End Workflow

```
1. Admin logs in → approves companies
        ↓
2. Company logs in → creates placement officer
        ↓
3. Officer logs in → posts job listings
        ↓
4. Students register → search & apply for jobs
        ↓
5. Officer reviews applications → shortlists or rejects
        ↓
6. Students see status updates in notifications
```

---

## 🌐 URL Reference

| URL | Who | Purpose |
|-----|-----|---------|
| `http://localhost:5173/login` | All | Login page |
| `http://localhost:5173/register` | Students | Student self-registration |
| `http://localhost:5173/register-company` | Companies | Company registration |
| `http://localhost:5173/forgot-password` | All | Password reset request |
| `http://localhost:5173/admin/dashboard` | Admin | Admin overview |
| `http://localhost:5173/admin/companies` | Admin | Approve/reject companies |
| `http://localhost:5173/company/dashboard` | Company | Company overview |
| `http://localhost:5173/company/create-officer` | Company | Create officer accounts |
| `http://localhost:5173/company/profile` | Company | Edit company profile |
| `http://localhost:5173/officer/dashboard` | Officer | Officer overview |
| `http://localhost:5173/officer/jobs` | Officer | Manage job listings |
| `http://localhost:5173/officer/jobs/create` | Officer | Post a new job |
| `http://localhost:5173/officer/reports` | Officer | View reports |
| `http://localhost:5173/user/dashboard` | Student | Student overview |
| `http://localhost:5173/user/jobs` | Student | Browse jobs |
| `http://localhost:5173/user/applications` | Student | Track applications |
| `http://localhost:5173/user/notifications` | Student | View notifications |

---

## ⚙️ Backend API

| Setting | Value |
|---------|-------|
| Base URL | `http://localhost:9092/api` |
| Auth | JWT Bearer Token |
| DB | MySQL `bridge_database` on `localhost:3306` |
| JWT Expiry | 24 hours (86400000 ms) |
| File Upload Max | 5 MB |

For full API documentation, see [`API_REFERENCE.md`](./API_REFERENCE.md) in the project root.

---

## 🛠️ Common Issues

| Problem | Fix |
|---------|-----|
| Backend won't start | Ensure MySQL is running on port 3306 with user `root` / password `root` |
| Port 9092 already in use | Stop the existing process or change `server.port` in `application.properties` |
| Company can't log in | Admin must approve the company first at `/admin/companies` |
| Frontend shows blank page | Ensure backend is running. Check browser console for errors |
| File upload fails | Ensure file is PDF and under 5 MB |
