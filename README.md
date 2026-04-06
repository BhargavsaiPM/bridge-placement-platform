# Bridge Placement Platform

Bridge is a role-based placement platform for students, working professionals, companies, placement officers, and super admins.

## Stack

- Frontend: React 19, Vite, Tailwind CSS, Framer Motion
- Backend: Spring Boot 3.2, Spring Security, Spring Data JPA
- Database: PostgreSQL
- Auth: JWT
- File uploads: Cloudinary

## Current Product Scope

- Public job browsing and landing-page stats
- User and company registration
- OTP-based password reset
- Company job management
- Officer applicant review, AILS score review, and interview scheduling
- User application tracking with interview visibility
- In-app notifications for users, companies, and officers
- Admin approval and management flows

## Important Runtime Notes

- New uploads go through Cloudinary. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` before testing file uploads.
- JWT startup now requires `JWT_SECRET` to be set and to be at least 32 characters long.
- Demo seed data is disabled by default. Enable it with `APP_DEMO_SEED_ENABLED=true`.
- Generated artifacts such as `backend/target`, `frontend/dist`, and `backend/uploads` are intentionally ignored at the repo root.

## Project Structure

- `backend/`: Spring Boot API, security, services, repositories, entities
- `frontend/`: React app, shared API client, layouts, role-specific pages
- `PROJECT_AUDIT.md`: audit notes and action plan used for this cleanup pass
- `DEPLOYMENT_GUIDE.md`: deployment guidance and environment checklist

## Local Setup

### Backend

1. Copy `backend/.env.example` into your preferred local environment source.
2. Provide at least:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET`
   - Cloudinary credentials if you want uploads to work
3. Run:

```powershell
cd backend
mvn spring-boot:run
```

Backend default URL: `http://localhost:9092/api`

### Frontend

1. Copy `frontend/.env.example` and set `VITE_API_URL` if needed.
2. Run:

```powershell
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Verification

The latest cleanup pass was verified with:

- `mvn.cmd -q -DskipTests compile` in `backend`
- `npm.cmd run build` in `frontend`

## Notes

- Admin and company export endpoints are still not implemented on the backend. The frontend now shows safe placeholder states instead of broken download actions.
- The project still does not have a formal automated test suite yet.
