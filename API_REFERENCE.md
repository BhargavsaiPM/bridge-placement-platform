# Bridge Placement System — API Reference

**Base URL:** `http://localhost:9092/api`
**Auth Header:** `Authorization: Bearer <token>`
**Content-Type:** `application/json`

---

## 🔐 AUTH ENDPOINTS (Public — No Token Required)

### 1. Register User (Student / Working)
```
POST /auth/register-user
```
**Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "Arjun Sharma",
  "mobile": "9876543210",
  "dob": "2001-06-15",
  "roleType": "STUDENT",
  "githubLink": "https://github.com/arjunsharma",
  "resumeUrl": "https://drive.google.com/file/resume.pdf",
  "achievements": "Won Hackathon 2024, Google DSC Lead"
}
```
**Response:**
```json
{ "message": "User registered successfully!" }
```

---

### 2. Register Company
```
POST /auth/register-company
```
**Body:**
```json
{
  "name": "TechCorp India",
  "domainEmail": "admin@techcorp.in",
  "password": "company@123",
  "branchAddress": "Hyderabad, Telangana",
  "companyType": "SOFTWARE"
}
```
> `companyType` options: `SOFTWARE` | `HARDWARE` | `ELECTRONICS` | `CORE` | `OTHER`

**Response:**
```json
{ "message": "Company registered successfully! Wait for Admin approval." }
```

---

### 3. Login (All Roles — Single Endpoint)
```
POST /auth/login
```
**Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdH...",
  "id": 1,
  "username": "student@example.com",
  "email": "student@example.com",
  "roles": ["ROLE_USER"],
  "type": "Bearer"
}
```

---

### 4. Forgot Password
```
POST /auth/forgot-password
```
*(Stub — OTP feature to be implemented)*

---

### 5. Reset Password
```
POST /auth/reset-password
```
*(Stub — OTP verification to be implemented)*

---

## 🏢 ADMIN ENDPOINTS (Role: SUPER_ADMIN)

### 6. Get All Companies
```
GET /admin/companies
Authorization: Bearer <admin_token>
```
**Response:** Array of all company objects.

---

### 7. Approve a Company
```
POST /admin/company/approve?companyId=1
Authorization: Bearer <admin_token>
```
**Response:**
```json
{ "message": "Company Approved Successfully" }
```

---

## 🏭 COMPANY ENDPOINTS (Role: COMPANY)

### 8. Create Placement Officer
```
POST /company/create-placement-officer
Authorization: Bearer <company_token>
```
**Body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@techcorp.in",
  "password": "officer@123",
  "age": 30,
  "jobRole": "Talent Acquisition Manager",
  "workingSince": "2020-01-15",
  "profilePhoto": "https://cdn.example.com/photo.jpg"
}
```
**Response:**
```json
{ "message": "Placement Officer Created Successfully" }
```

---

## 👔 PLACEMENT OFFICER ENDPOINTS (Role: PLACEMENT_OFFICER)

### 9. Post a Job
```
POST /officer/job
Authorization: Bearer <officer_token>
```
**Body:**
```json
{
  "title": "Java Backend Developer",
  "description": "We are looking for a talented Java developer...",
  "requiredSkills": "Java, Spring Boot, MySQL, REST API",
  "experienceRequired": 1,
  "salaryRange": "6-10 LPA",
  "location": "Hyderabad",
  "workMode": "HYBRID",
  "jobType": "FULLTIME",
  "applicationDeadline": "2026-03-31",
  "maxApplicants": 50,
  "rounds": ["APTITUDE", "TECHNICAL", "HR"]
}
```
> `workMode`: `REMOTE` | `ONSITE` | `HYBRID`
> `jobType`: `INTERNSHIP` | `FULLTIME`
> `rounds`: `APTITUDE` | `TECHNICAL` | `HR` | `OTHER`

**Response:** Full `Job` object with `id`.

---

### 10. Get Applications for a Job
```
GET /officer/applications/{jobId}
Authorization: Bearer <officer_token>
```
**Example:** `GET /officer/applications/1`

**Response:** Array of application objects with AILS scores.

---

### 11. Update Application Status
```
PUT /officer/application/status?applicationId=1&status=SHORTLISTED
Authorization: Bearer <officer_token>
```
> `status`: `APPLIED` | `SHORTLISTED` | `REJECTED` | `SELECTED`

**Response:**
```json
{ "message": "Status Updated to SHORTLISTED" }
```

---

### 12. Get Placement Reports
```
GET /officer/reports/placement
Authorization: Bearer <officer_token>
```
**Response:**
```json
{
  "studentsPlacedCurrentYear": 45,
  "departmentWisePlacementPercentage": {
    "CS": 85,
    "IT": 80,
    "ECE": 70
  },
  "offerPackageStatistics": {
    "Highest": "24 LPA",
    "Average": "8 LPA",
    "Lowest": "4 LPA"
  },
  "interviewRoundPerformance": {
    "Aptitude Pass Rate": "60%",
    "Technical Pass Rate": "40%"
  }
}
```

---

## 👤 USER ENDPOINTS (Role: USER — Student/Working)

### 13. Search Jobs (Public)
```
GET /jobs/search?location=Hyderabad&type=FULLTIME
```
**Response:** Array of open job objects.

---

### 14. Apply for a Job
```
POST /user/apply/{jobId}
Authorization: Bearer <user_token>
```
**Example:** `POST /user/apply/1`

**Response:**
```json
{
  "message": "Applied Successfully! AILS Score: 78.0"
}
```
> AILS Score (0–100) and `exceptionFlag` are auto-computed on apply.

---

### 15. Get Notifications
```
GET /user/notifications
Authorization: Bearer <user_token>
```
**Response:**
```json
[
  {
    "id": 1,
    "userEmail": "student@example.com",
    "title": "Application Submitted",
    "message": "You have applied for Java Backend Developer",
    "type": "STATUS_CHANGE",
    "readFlag": false,
    "createdAt": "2026-02-19T10:00:00"
  }
]
```

---

### 16. Mark Notification as Read
```
PUT /user/notifications/read?notificationId=1
Authorization: Bearer <user_token>
```
**Response:** `200 OK` (no body)

---

## 📋 ENUMS REFERENCE

| Enum | Values |
|------|--------|
| `roleType` (User) | `STUDENT`, `WORKING` |
| `companyType` | `SOFTWARE`, `HARDWARE`, `ELECTRONICS`, `CORE`, `OTHER` |
| `workMode` | `REMOTE`, `ONSITE`, `HYBRID` |
| `jobType` | `INTERNSHIP`, `FULLTIME` |
| `jobStatus` | `DRAFT`, `OPEN`, `CLOSED`, `ARCHIVED` |
| `applicationStatus` | `APPLIED`, `SHORTLISTED`, `REJECTED`, `SELECTED` |
| `roundName` | `APTITUDE`, `TECHNICAL`, `HR`, `OTHER` |
| `notificationType` | `JOB_POSTED`, `STATUS_CHANGE`, `SELECTION`, `REJECTION` |

---

## 🧪 RECOMMENDED TESTING ORDER

1. `POST /auth/register-user` → Register student
2. `POST /auth/register-company` → Register company
3. Create Admin manually in DB (insert into `admins` table)
4. `POST /auth/login` → Login as Admin, get token
5. `POST /admin/company/approve?companyId=1` → Approve company
6. `POST /auth/login` → Login as Company, get token
7. `POST /company/create-placement-officer` → Create officer
8. `POST /auth/login` → Login as Officer, get token
9. `POST /officer/job` → Post a job
10. `POST /auth/login` → Login as Student, get token
11. `GET /jobs/search` → Browse jobs
12. `POST /user/apply/1` → Apply & get AILS Score
13. `GET /officer/applications/1` → Officer reviews applicants
14. `PUT /officer/application/status?applicationId=1&status=SELECTED` → Finalize
15. `GET /officer/reports/placement` → View analytics

---

## 📝 NOTES

- **First Super Admin**: Manually insert into DB:
  ```sql
  INSERT INTO admins (email, password, name, role, created_at, updated_at)
  VALUES ('admin@bridge.com', '$2a$10$...bcrypt_hash...', 'Bridge Admin', 'SUPER_ADMIN', NOW(), NOW());
  ```
  Or use a bcrypt hash of your password from: https://bcrypt-generator.com/

- **Resume URL**: Should be a direct PDF link.
- **JWT Token** expires in `86400000 ms` (24 hours).
