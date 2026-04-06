# Bridge Deployment Guide

Reviewed on: 2026-03-31
Goal: free-first deployment plan for a student project

## 1. Recommended Free-First Architecture

Recommended stack for this project:

- Frontend: Vercel Hobby
- Backend: Koyeb free web service
- Database: Supabase Postgres Free
- File storage: Cloudinary
- Bot protection: Cloudflare Turnstile
- Email: Gmail SMTP with app password for development/student usage

Why this combination is practical:

- your frontend already has `frontend/vercel.json`
- your backend already has a `backend/Dockerfile`
- your backend already targets PostgreSQL
- your code already includes Cloudinary integration scaffolding
- Turnstile and Google login fit your auth roadmap well

## 2. How Deployment Works in This Project

Think of deployment as 3 separate parts:

### Frontend deployment

- React/Vite builds static files
- Vercel serves those files globally
- frontend talks to backend using `VITE_API_URL`

### Backend deployment

- Spring Boot is built into a jar
- Koyeb runs it using your Dockerfile
- Koyeb exposes a public HTTPS URL
- backend reads secrets and config from environment variables

### Database deployment

- PostgreSQL runs on a managed DB provider
- backend connects using JDBC URL, username, and password
- data remains safe even when backend container restarts or redeploys

Very important:

- backend local disk is not reliable for long-term files in cloud hosting
- that is why uploaded files should move to Cloudinary, not `backend/uploads`

## 3. Best Option vs Backup Option

### Best option for your current codebase

- Frontend on Vercel
- Backend on Koyeb
- Database on Supabase

### Backup option if you want fewer platforms

- Frontend on Vercel
- Backend on Koyeb
- Database on Koyeb Postgres

Backup-option warning:

- Koyeb’s free Postgres allowance is limited
- good for demos and testing, weaker for always-on student showcase usage

## 4. Official Provider Notes Checked Today

These matter because “free” plans change often.

- Vercel says the Hobby plan is free and includes personal Git integration, previews, HTTPS, and base resources.
- Koyeb says each organization gets one free web service and one free PostgreSQL database, but Koyeb also requires a credit card for fraud prevention.
- Supabase docs say the Free plan gives you two free projects and 500 MB database size per project.
- Cloudflare Turnstile has a Free plan and supports up to 20 widgets with unlimited challenges.

Because of those current rules, my recommendation is:

- if you want the easiest frontend hosting, use Vercel
- if you are okay adding a card for account verification, use Koyeb for backend
- if you want a cleaner free database story, use Supabase Postgres instead of Koyeb Postgres

## 5. Pre-Deployment Fixes You Should Do Before Going Live

These are the biggest blockers in this repository.

### Must-fix

1. Remove generated and temporary files from source control
2. Stop relying on local `backend/uploads`
3. Replace hardcoded defaults in `application.properties`
4. Add environment variables for all secrets
5. Update frontend to use only env-based API URLs
6. Add proper `.gitignore` rules at repo root

### Strongly recommended

7. Add database migrations using Flyway or Liquibase
8. Fix stale API documentation
9. Wire AILS scoring properly or hide score-based UI until it is real
10. Remove or finish pages that call missing backend endpoints

## 6. Step-by-Step Deployment Plan

## Step 1: Prepare the repository

Before deployment, clean these items:

- delete generated folders from git tracking:
  - `backend/target/`
  - `target/`
  - `frontend/dist/`
- stop tracking runtime file artifacts:
  - `backend/uploads/`
  - build logs
  - startup logs
- create a proper root `.gitignore`

Recommended ignore entries:

```gitignore
node_modules/
frontend/dist/
backend/target/
target/
backend/uploads/
*.log
*.txt
.idea/
.vscode/
```

## Step 2: Set up the database

### Recommended database: Supabase Postgres

Why:

- your backend already uses PostgreSQL
- no code rewrite is needed
- free plan is easier to understand for student use

What to do:

1. Create a Supabase project
2. Open project database settings
3. Copy connection info
4. Build your JDBC URL

Expected backend variables:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=<db_user>
SPRING_DATASOURCE_PASSWORD=<db_password>
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
```

Important note:

- your current code uses `spring.jpa.hibernate.ddl-auto=update`
- for first student deployment this can work
- for long-term stability, replace it with migrations later

### How database deployment works

Database deployment is different from app deployment:

- you create the database once
- backend redeploys many times
- data stays inside the managed database service
- app containers are replaceable, database is persistent

That means:

- redeploying backend should not delete your users, jobs, or applications
- but if you keep using local file uploads, uploaded files may disappear

## Step 3: Deploy backend to Koyeb

Why Koyeb fits this repo:

- supports Dockerfile deployment
- offers a free web service
- supports Java and Docker workflows directly

### Backend deployment steps

1. Push repo to GitHub
2. Create Koyeb account
3. Connect GitHub repository
4. Choose the `backend` directory as service root if needed
5. Deploy using the existing `backend/Dockerfile`
6. Set runtime environment variables

Required backend variables:

```env
PORT=8000
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
JWT_SECRET=<very long random secret>
FRONTEND_URL=https://your-frontend-domain.vercel.app
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=<gmail-app-password>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Optional future variables:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TURNSTILE_SECRET_KEY=...
```

### Backend deployment caveats

- Koyeb requires card verification today
- free service resources are limited
- cold starts and sleep behavior may affect demo responsiveness
- this is acceptable for a student showcase, but not ideal for high-traffic production

## Step 4: Deploy frontend to Vercel

Why Vercel fits:

- React/Vite deploys smoothly
- `frontend/vercel.json` already handles SPA rewrites
- free Hobby plan is enough for student usage

### Frontend deployment steps

1. Import the repository into Vercel
2. Set the project root to `frontend`
3. Framework preset should detect Vite
4. Set build command:

```bash
npm run build
```

5. Set output directory:

```bash
dist
```

6. Add environment variable:

```env
VITE_API_URL=https://your-backend-service.koyeb.app/api
```

Optional future frontend variables:

```env
VITE_TURNSTILE_SITE_KEY=...
VITE_GOOGLE_CLIENT_ID=...
```

## Step 5: Fix CORS after deployment

Your backend already uses:

- `bridge.app.frontendUrl`
- `FRONTEND_URL`

After frontend is live:

1. copy the Vercel frontend URL
2. set `FRONTEND_URL` in backend
3. redeploy backend

Without this, browser requests may fail due to CORS.

## Step 6: Smoke test production

After both deployments:

1. Open landing page
2. Confirm public stats load
3. Register a test user
4. Request password reset OTP
5. Login with test account
6. Browse jobs
7. Apply to a job
8. Login as admin/company/officer and verify protected routes

## 7. What You Need to Change for Database-Friendly Production

Your project currently relies on JPA auto-update. That works for now, but long-term use should move to migrations.

### Better long-term database process

1. Add Flyway
2. create migration scripts like:
   - `V1__init.sql`
   - `V2__add_otp_tokens.sql`
   - `V3__add_login_logs.sql`
3. switch away from `ddl-auto=update`

Why this matters:

- safe schema changes
- repeatable deployments
- easier debugging
- cleaner team collaboration

## 8. File Storage Deployment Rule

This is the most important deployment rule for your current app:

- do not depend on `backend/uploads` in production

Why:

- cloud containers are not reliable permanent storage
- restarts or redeploys can wipe files
- scaling to multiple instances breaks local file assumptions

Best solution for this repo:

- finish Cloudinary integration
- make `FileController` use `CloudinaryService`
- store only returned URLs in database

That way:

- frontend can open files from stable URLs
- backend can restart safely
- deployments become much simpler

## 9. Bot Protection Plan for Deployment

Recommended solution: Cloudflare Turnstile

Where to add it:

- login
- user registration
- company registration
- forgot password

How it works:

1. frontend renders Turnstile widget
2. widget returns token
3. frontend submits token with form
4. backend sends token to Cloudflare Siteverify
5. backend continues only if verification succeeds

Backend variable:

```env
TURNSTILE_SECRET_KEY=...
```

Frontend variable:

```env
VITE_TURNSTILE_SITE_KEY=...
```

## 10. OTP Verification After Registration Plan

Recommended flow for deployed app:

### User registration

1. user submits form
2. backend creates user with:
   - `approved=false`
   - `emailVerified=false`
3. backend sends OTP
4. frontend redirects to `/verify-registration`
5. user submits OTP
6. backend marks `emailVerified=true`
7. admin approval still happens after email verification

### Company registration

Same idea, but keep admin approval mandatory after email verification.

Why this helps:

- fake accounts go down
- admin panel quality improves
- password reset logic can share OTP infrastructure

## 11. Google Login Plan

Recommended production design:

### Frontend

- add “Continue with Google” button on login and registration pages
- use Google Identity Services

### Backend

- add endpoint like:

```text
POST /auth/google
```

- receive Google ID token from frontend
- verify token server-side
- create or link local account
- issue your own JWT

### First-login behavior

If user is new:

1. create local user record
2. mark `emailVerified=true` because Google already verified email ownership
3. still collect missing profile data after login
4. still allow admin approval if your business rule needs it

Suggested extra columns later:

- `authProvider` (`LOCAL`, `GOOGLE`)
- `providerUserId`
- `emailVerified`

## 12. Minimum Production Environment Variables

### Backend

```env
PORT=8000
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
JWT_SECRET=replace-with-long-random-secret
FRONTEND_URL=https://your-frontend.vercel.app
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
TURNSTILE_SECRET_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SHOW_SQL=false
```

### Frontend

```env
VITE_API_URL=https://your-backend.koyeb.app/api
VITE_TURNSTILE_SITE_KEY=...
VITE_GOOGLE_CLIENT_ID=...
```

## 13. Free Hosting Reality Check

For a student project, “free” usually means:

- limited RAM/CPU
- cold starts or sleep
- usage caps
- occasional pauses for inactivity
- weaker support

That is still okay for:

- portfolio links
- project demos
- resume showcases
- internal testing

It is not ideal for:

- high traffic
- strict uptime promises
- large file hosting

## 14. My Suggested Rollout Order

### Week 1

1. repo cleanup
2. `.gitignore`
3. env variable cleanup
4. frontend API URL cleanup

### Week 2

1. Supabase database
2. backend on Koyeb
3. frontend on Vercel
4. Cloudinary integration finish

### Week 3

1. Turnstile
2. registration OTP verification
3. Google login

### Week 4

1. Flyway migrations
2. tests
3. fix placeholder pages or backend gaps

## 15. Official Links Used

Deployment and platform:

- Vercel account plans: https://vercel.com/docs/plans
- Koyeb docs intro: https://www.koyeb.com/docs
- Koyeb pricing FAQ: https://www.koyeb.com/docs/faqs/pricing
- Supabase billing and free-plan notes: https://supabase.com/docs/guides/platform/billing-on-supabase

Security and auth:

- Cloudflare Turnstile overview: https://developers.cloudflare.com/turnstile/
- Cloudflare Turnstile plans: https://developers.cloudflare.com/turnstile/plans/
- Cloudflare Turnstile get started: https://developers.cloudflare.com/turnstile/get-started/
- Cloudflare Turnstile server-side validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Google Sign In overview: https://developers.google.com/identity/gsi/web/guides/overview
- Google Sign In button guide: https://developers.google.com/identity/gsi/web/guides/display-button
- Google ID token verification: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- Spring Security OAuth2 login with Google: https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html

## 16. Final Recommendation

If you want the most realistic student deployment without paying now:

- deploy frontend first on Vercel
- deploy database on Supabase
- deploy backend on Koyeb
- finish Cloudinary before treating file uploads as production-ready
- add Turnstile before opening public registration
- add registration OTP next
- add Google login after that

That order gives you the highest improvement per hour spent.
