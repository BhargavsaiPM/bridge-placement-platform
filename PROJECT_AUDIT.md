# Bridge Project Audit

Reviewed on: 2026-03-31
Scope: full repository audit without changing application code

## 1. Executive Summary

This project is a multi-role placement platform:

- Frontend: React 19 + Vite + Tailwind + Framer Motion
- Backend: Spring Boot 3.2 + Spring Security + JPA + PostgreSQL
- Auth style today: JWT login with role-based route protection
- Core user roles: `SUPER_ADMIN`, `COMPANY`, `PLACEMENT_OFFICER`, `USER`
- Current strong areas: role separation, decent page coverage, PostgreSQL-ready backend, basic OTP reset flow, job/application workflow
- Current weak areas: deployment hygiene, leftover generated files, outdated docs, incomplete AILS wiring, missing registration OTP verification, missing Google login, missing bot protection

Practical file picture:

- Visible project files excluding `node_modules`, `dist`, `target`, `.git`: about 185
- Backend Java source files: 88
- Frontend source files under `frontend/src`: 66
- Backend local uploads currently present: 15
- Frontend built output files currently present: 5
- Automated tests: not found

## 2. What This Project Does

At a business level this app lets:

- public users browse jobs
- students or working professionals register and apply
- companies register, create officers, post jobs, and review applicants
- placement officers review applicants and move them through stages
- admin approve or reject users, companies, and officers

At a technical level the flow is:

1. React frontend calls REST APIs using Axios.
2. Spring Boot backend handles auth, business rules, and database access.
3. PostgreSQL stores users, companies, jobs, applications, OTP tokens, notifications, and login logs.
4. JWT is stored in `localStorage` and reused in API requests.
5. File uploads currently go to local disk under `backend/uploads`, even though a Cloudinary service also exists in code.

## 3. Architecture Notes

### Backend architecture

- `controller/`: exposes REST endpoints
- `service/`: business rules and orchestration
- `repository/`: database access
- `entity/`: persistent models
- `security/`: JWT and request authorization
- `dto/`: request and response payloads
- `config/`: boot-time setup and web helpers

### Frontend architecture

- `api/`: thin wrappers around backend endpoints
- `layout/`: per-role wrappers and navigation shells
- `pages/`: public, auth, admin, company, officer, and user pages
- `components/`: reusable forms, modals, and job/applicant UI blocks

## 4. Detailed File Inventory

This section focuses on human-maintained files first, then generated or temporary files.

### 4.1 Root files

- `README.md`: project overview, but partly outdated because it still describes seeded demo data and older setup assumptions.
- `API_REFERENCE.md`: API documentation, but significantly outdated versus actual code.

### 4.2 Editor and local config

- `.vscode/settings.json`: local VS Code workspace preferences for Java and CMake; safe but machine-specific.
- `.idea/Bridge_Project.iml`: IntelliJ module file; editor-specific.
- `.idea/compiler.xml`: IntelliJ compiler settings; editor-specific.
- `.idea/encodings.xml`: IntelliJ encoding settings; editor-specific.
- `.idea/jarRepositories.xml`: IntelliJ repository settings; editor-specific.
- `.idea/misc.xml`: IntelliJ project metadata; editor-specific.
- `.idea/modules.xml`: IntelliJ module registration; editor-specific.
- `.idea/vcs.xml`: IntelliJ VCS mapping; editor-specific.

### 4.3 Backend root

- `backend/pom.xml`: Maven build file; defines Spring Boot, JPA, Security, Mail, PostgreSQL, JWT, Cloudinary, Lombok, MapStruct.
- `backend/Dockerfile`: container build recipe for backend deployment.

### 4.4 Backend resources

- `backend/src/main/resources/application.properties`: runtime configuration for server port, datasource, JPA, JWT, mail, Cloudinary, and frontend CORS origin.

### 4.5 Backend entrypoint

- `backend/src/main/java/com/bridge/placement/PlacementSystemApplication.java`: Spring Boot entrypoint; enables JPA auditing and scheduled jobs.

### 4.6 Backend config files

- `backend/src/main/java/com/bridge/placement/config/WebConfig.java`: serves `/uploads/**` from local disk.
- `backend/src/main/java/com/bridge/placement/config/DataInitializer.java`: fully commented-out demo seeding code; currently dead code.
- `backend/src/main/java/com/bridge/placement/config/ApplicationStatusConstraintUpdater.java`: refreshes PostgreSQL check constraint for `applications.application_status` at startup.

### 4.7 Backend controllers

- `backend/src/main/java/com/bridge/placement/controller/AuthController.java`: login, user registration, company registration, forgot password, reset password.
- `backend/src/main/java/com/bridge/placement/controller/ApplicationController.java`: apply to jobs, officer application lists, officer remarks, status updates, score lookup.
- `backend/src/main/java/com/bridge/placement/controller/AdminController.java`: admin dashboard stats, approvals, blocks, deletes, activity, analytics, profile, kanban data.
- `backend/src/main/java/com/bridge/placement/controller/CompanyController.java`: company profile, officer creation, officer state changes, company dashboard, application status updates.
- `backend/src/main/java/com/bridge/placement/controller/FileController.java`: file upload endpoint.
- `backend/src/main/java/com/bridge/placement/controller/InterviewController.java`: interview scheduling and interview retrieval endpoints.
- `backend/src/main/java/com/bridge/placement/controller/JobController.java`: company job CRUD, officer job listing, public job search, public job detail.
- `backend/src/main/java/com/bridge/placement/controller/NotificationController.java`: notification list, unread count, mark-as-read.
- `backend/src/main/java/com/bridge/placement/controller/OfficerController.java`: officer profile and first-login password change.
- `backend/src/main/java/com/bridge/placement/controller/PublicController.java`: public landing-page stats.
- `backend/src/main/java/com/bridge/placement/controller/ReportsController.java`: officer placement reports.
- `backend/src/main/java/com/bridge/placement/controller/UserController.java`: user profile and user applications.

### 4.8 Backend services

- `backend/src/main/java/com/bridge/placement/service/AuthService.java`: login, registration, password reset OTP generation and validation, login attempt throttling, login log creation.
- `backend/src/main/java/com/bridge/placement/service/ApplicationService.java`: job application rules, company/officer application retrieval, status updates, selected-student listing, score response shaping.
- `backend/src/main/java/com/bridge/placement/service/AilsService.java`: candidate-job scoring engine; currently not fully wired into apply flow.
- `backend/src/main/java/com/bridge/placement/service/CompanyService.java`: company profile updates, officer creation, officer activation/deactivation.
- `backend/src/main/java/com/bridge/placement/service/CloudinaryService.java`: cloud file upload service, but not currently used by the active upload endpoint.
- `backend/src/main/java/com/bridge/placement/service/FileStorageService.java`: active local-disk upload implementation.
- `backend/src/main/java/com/bridge/placement/service/InterviewSlotService.java`: schedule and fetch interview slots.
- `backend/src/main/java/com/bridge/placement/service/JobService.java`: job creation, update, closure, deletion, officer visibility, job search.
- `backend/src/main/java/com/bridge/placement/service/NotificationService.java`: create notifications, read tracking, cleanup old notifications.
- `backend/src/main/java/com/bridge/placement/service/OfficerService.java`: officer profile edits and password lifecycle.
- `backend/src/main/java/com/bridge/placement/service/PublicService.java`: landing-page stats.
- `backend/src/main/java/com/bridge/placement/service/ReportService.java`: placement report aggregation; partly placeholder/mock values.
- `backend/src/main/java/com/bridge/placement/service/UserService.java`: user profile retrieval and update.

### 4.9 Backend AILS helper classes

- `backend/src/main/java/com/bridge/placement/service/ails/AilsResult.java`: structured result object returned by the scoring engine.
- `backend/src/main/java/com/bridge/placement/service/ails/JobVectorizer.java`: extracts job-side text/skills keywords for scoring.
- `backend/src/main/java/com/bridge/placement/service/ails/ResumeParserService.java`: extracts user-side text/skills/education/certification signals.
- `backend/src/main/java/com/bridge/placement/service/ails/SimilarityCalculator.java`: calculates text similarity between applicant and job corpus.

### 4.10 Backend security files

- `backend/src/main/java/com/bridge/placement/security/SecurityConfig.java`: core Spring Security config, CORS, JWT filter chain, role authorization.
- `backend/src/main/java/com/bridge/placement/security/LastSeenFilter.java`: updates `lastSeen` fields after authenticated requests.
- `backend/src/main/java/com/bridge/placement/security/jwt/AuthEntryPointJwt.java`: unauthorized request handler.
- `backend/src/main/java/com/bridge/placement/security/jwt/JwtAuthenticationFilter.java`: reads `Authorization: Bearer ...` token and populates security context.
- `backend/src/main/java/com/bridge/placement/security/jwt/JwtUtils.java`: creates and validates JWT tokens.
- `backend/src/main/java/com/bridge/placement/security/services/BridgeUserDetails.java`: unified Spring Security principal for all role types.
- `backend/src/main/java/com/bridge/placement/security/services/CustomUserDetailsService.java`: loads admin, user, company, or officer by email.

### 4.11 Backend repositories

- `backend/src/main/java/com/bridge/placement/repository/AdminRepository.java`: DB access for admin records.
- `backend/src/main/java/com/bridge/placement/repository/ApplicationRepository.java`: DB access for job applications and reporting queries.
- `backend/src/main/java/com/bridge/placement/repository/CompanyRepository.java`: DB access for companies.
- `backend/src/main/java/com/bridge/placement/repository/InterviewSlotRepository.java`: DB access for scheduled interviews.
- `backend/src/main/java/com/bridge/placement/repository/JobRepository.java`: DB access for job postings and job visibility queries.
- `backend/src/main/java/com/bridge/placement/repository/LoginLogRepository.java`: DB access for login audits.
- `backend/src/main/java/com/bridge/placement/repository/NotificationRepository.java`: DB access for notifications.
- `backend/src/main/java/com/bridge/placement/repository/OtpTokenRepository.java`: DB access for OTP tokens.
- `backend/src/main/java/com/bridge/placement/repository/PlacementOfficerRepository.java`: DB access for officers.
- `backend/src/main/java/com/bridge/placement/repository/UserRepository.java`: DB access for end users.

### 4.12 Backend entities

- `backend/src/main/java/com/bridge/placement/entity/BaseEntity.java`: shared `id`, `createdAt`, `updatedAt`.
- `backend/src/main/java/com/bridge/placement/entity/Admin.java`: admin credentials/profile record.
- `backend/src/main/java/com/bridge/placement/entity/Application.java`: relation between user and job plus status, remarks, and stored score fields.
- `backend/src/main/java/com/bridge/placement/entity/Company.java`: company account, approval state, description, proof doc, assigned officers.
- `backend/src/main/java/com/bridge/placement/entity/InterviewSlot.java`: interview scheduling record.
- `backend/src/main/java/com/bridge/placement/entity/Job.java`: job posting core data.
- `backend/src/main/java/com/bridge/placement/entity/JobRound.java`: ordered hiring-round definitions attached to a job.
- `backend/src/main/java/com/bridge/placement/entity/LoginLog.java`: login audit trail.
- `backend/src/main/java/com/bridge/placement/entity/Notification.java`: user/company/officer notifications.
- `backend/src/main/java/com/bridge/placement/entity/OtpToken.java`: OTP storage for password reset.
- `backend/src/main/java/com/bridge/placement/entity/PlacementOfficer.java`: officer account attached to a company.
- `backend/src/main/java/com/bridge/placement/entity/User.java`: student/working-professional profile and account.

### 4.13 Backend DTO request files

- `backend/src/main/java/com/bridge/placement/dto/request/ForgotPasswordRequest.java`: forgot-password email request.
- `backend/src/main/java/com/bridge/placement/dto/request/JobRequest.java`: job create/update payload.
- `backend/src/main/java/com/bridge/placement/dto/request/LoginRequest.java`: login payload.
- `backend/src/main/java/com/bridge/placement/dto/request/PlacementOfficerRequest.java`: company-created officer payload.
- `backend/src/main/java/com/bridge/placement/dto/request/RegisterCompanyRequest.java`: company registration payload.
- `backend/src/main/java/com/bridge/placement/dto/request/RegisterUserRequest.java`: end-user registration payload.
- `backend/src/main/java/com/bridge/placement/dto/request/ResetPasswordRequest.java`: OTP + new password reset payload.
- `backend/src/main/java/com/bridge/placement/dto/request/UpdateCompanyProfileRequest.java`: company profile edit payload.
- `backend/src/main/java/com/bridge/placement/dto/request/UpdateOfficerProfileRequest.java`: officer profile edit payload.
- `backend/src/main/java/com/bridge/placement/dto/request/UpdateUserProfileRequest.java`: user profile edit payload.

### 4.14 Backend DTO response files

- `backend/src/main/java/com/bridge/placement/dto/response/AilsScoreResponse.java`: AILS score response sent to clients.
- `backend/src/main/java/com/bridge/placement/dto/response/AuthResponse.java`: login response with token and user details.
- `backend/src/main/java/com/bridge/placement/dto/response/MessageResponse.java`: generic message wrapper.
- `backend/src/main/java/com/bridge/placement/dto/response/PublicStatsResponse.java`: landing-page counters.

### 4.15 Backend enums

- `backend/src/main/java/com/bridge/placement/enums/ApplicationStatus.java`: workflow states for applications.
- `backend/src/main/java/com/bridge/placement/enums/CompanyType.java`: company classification.
- `backend/src/main/java/com/bridge/placement/enums/IndustrySector.java`: industry classification.
- `backend/src/main/java/com/bridge/placement/enums/InterviewMode.java`: interview type.
- `backend/src/main/java/com/bridge/placement/enums/JobStatus.java`: job open/closed state.
- `backend/src/main/java/com/bridge/placement/enums/JobType.java`: internship/full-time/etc.
- `backend/src/main/java/com/bridge/placement/enums/NotificationType.java`: semantic type of notification.
- `backend/src/main/java/com/bridge/placement/enums/Role.java`: platform roles.
- `backend/src/main/java/com/bridge/placement/enums/RoundName.java`: named hiring rounds.
- `backend/src/main/java/com/bridge/placement/enums/UserType.java`: `STUDENT` or `WORKING`.
- `backend/src/main/java/com/bridge/placement/enums/WorkMode.java`: onsite, hybrid, etc.

### 4.16 Backend exception handling

- `backend/src/main/java/com/bridge/placement/exception/GlobalExceptionHandler.java`: global error translation for runtime, validation, and auth-related exceptions.

### 4.17 Frontend root files

- `frontend/package.json`: frontend dependencies and scripts.
- `frontend/package-lock.json`: pinned npm dependency tree.
- `frontend/.gitignore`: frontend-only ignore rules.
- `frontend/README.md`: default Vite template README; low-value leftover.
- `frontend/index.html`: SPA entry HTML; still uses Vite default favicon.
- `frontend/vite.config.js`: Vite config.
- `frontend/vercel.json`: SPA rewrite config for Vercel.
- `frontend/tailwind.config.js`: project design tokens, colors, shadows, and animations.
- `frontend/postcss.config.js`: Tailwind/PostCSS setup.
- `frontend/eslint.config.js`: frontend lint rules.
- `frontend/build-log.txt`: build output log; temporary file, not long-term source.

### 4.18 Frontend entry and global styles

- `frontend/src/main.jsx`: React root renderer.
- `frontend/src/App.jsx`: route map for public, user, officer, admin, and company portals.
- `frontend/src/index.css`: global Tailwind layers, scrollbars, glassmorphism styles.
- `frontend/src/App.css`: unused default Vite CSS leftover.

### 4.19 Frontend assets

- `frontend/src/assets/Bridge-logo.png`: main brand image used on auth/public pages.
- `frontend/src/assets/react.svg`: unused Vite template asset.
- `frontend/public/vite.svg`: current favicon; still Vite default branding.

### 4.20 Frontend API layer

- `frontend/src/api/axios.js`: centralized Axios instance, token injection, 401 redirect behavior.
- `frontend/src/api/authApi.js`: auth and file-upload calls.
- `frontend/src/api/adminApi.js`: admin calls; includes some endpoints that do not exist on backend.
- `frontend/src/api/companyApi.js`: company calls; includes several endpoints that do not exist on backend.
- `frontend/src/api/officerApi.js`: officer profile, applicants, scores.
- `frontend/src/api/publicApi.js`: public job search and job detail.
- `frontend/src/api/userApi.js`: user profile and applications.

### 4.21 Frontend layout files

- `frontend/src/layout/AdminLayout.jsx`: admin route guard and shell.
- `frontend/src/layout/CompanyLayout.jsx`: company route guard and shell.
- `frontend/src/layout/OfficerLayout.jsx`: officer route guard and shell.
- `frontend/src/layout/UserLayout.jsx`: user route guard and shell.
- `frontend/src/layout/Sidebar.jsx`: admin sidebar.
- `frontend/src/layout/TopNav.jsx`: admin top nav.
- `frontend/src/layout/CompanySidebar.jsx`: company sidebar.
- `frontend/src/layout/CompanyTopNav.jsx`: company top nav.
- `frontend/src/layout/OfficerSidebar.jsx`: officer sidebar.
- `frontend/src/layout/OfficerTopNav.jsx`: officer top nav.
- `frontend/src/layout/UserSidebar.jsx`: user sidebar.
- `frontend/src/layout/UserTopNav.jsx`: user top nav.

### 4.22 Frontend shared components

- `frontend/src/components/shared/AddressFields.jsx`: reusable address form block.
- `frontend/src/components/shared/SearchableDropdown.jsx`: searchable select component.
- `frontend/src/components/shared/SkillSelect.jsx`: user skill picker for registration/profile.

### 4.23 Frontend modal component

- `frontend/src/components/modals/PasswordModal.jsx`: admin confirmation modal used before sensitive actions.

### 4.24 Frontend company components

- `frontend/src/components/company/ActivityTimeline.jsx`: likely timeline widget for company-facing activity display.
- `frontend/src/components/company/ApplicantKanban.jsx`: board-style applicant status visualization.
- `frontend/src/components/company/JobDetailsPanel.jsx`: detailed job display panel.
- `frontend/src/components/company/JobModal.jsx`: create/edit job form modal.
- `frontend/src/components/company/JobTable.jsx`: company job list table.
- `frontend/src/components/company/ManageJobDetail.jsx`: detailed company/officer job page.
- `frontend/src/components/company/OfficerTable.jsx`: company officer list table.

### 4.25 Frontend public pages

- `frontend/src/pages/public/Home.jsx`: landing page, public stats, hero UI.
- `frontend/src/pages/public/JobSearch.jsx`: public and user job browsing page with filters.
- `frontend/src/pages/public/JobDetail.jsx`: public and user job detail page, apply flow.

### 4.26 Frontend auth pages

- `frontend/src/pages/auth/Login.jsx`: JWT login UI and role-based redirect.
- `frontend/src/pages/auth/Register.jsx`: multi-step registration for users and companies.
- `frontend/src/pages/auth/ForgotPassword.jsx`: two-step OTP-based password reset UI.

### 4.27 Frontend user pages

- `frontend/src/pages/user/Dashboard.jsx`: user dashboard summary.
- `frontend/src/pages/user/Applications.jsx`: application history and progress.
- `frontend/src/pages/user/Profile.jsx`: profile management for student/working user.

### 4.28 Frontend officer pages

- `frontend/src/pages/officer/Dashboard.jsx`: officer dashboard summary.
- `frontend/src/pages/officer/Jobs.jsx`: jobs assigned to officer.
- `frontend/src/pages/officer/Applicants.jsx`: officer applicant review list.
- `frontend/src/pages/officer/ApplicantDetail.jsx`: detailed applicant review page with stage changes.
- `frontend/src/pages/officer/applicantHelpers.js`: formatting, score fallback, and status metadata for officer applicant pages.
- `frontend/src/pages/officer/Profile.jsx`: officer profile page.
- `frontend/src/pages/officer/Students.jsx`: officer student-related view.

### 4.29 Frontend admin pages

- `frontend/src/pages/admin/Dashboard.jsx`: admin overview dashboard.
- `frontend/src/pages/admin/Approvals.jsx`: approval workflows.
- `frontend/src/pages/admin/Analytics.jsx`: analytics page.
- `frontend/src/pages/admin/Activity.jsx`: platform activity page with password-confirmed admin actions.
- `frontend/src/pages/admin/Kanban.jsx`: student progress kanban board.
- `frontend/src/pages/admin/Profile.jsx`: admin profile page.
- `frontend/src/pages/admin/Reports.jsx`: export page, but backend export endpoints do not exist.

### 4.30 Frontend company pages

- `frontend/src/pages/company/Dashboard.jsx`: company overview dashboard.
- `frontend/src/pages/company/Profile.jsx`: company profile management.
- `frontend/src/pages/company/Officers.jsx`: officer list and management.
- `frontend/src/pages/company/Jobs.jsx`: company job management.
- `frontend/src/pages/company/Applicants.jsx`: company applicant review.
- `frontend/src/pages/company/SelectedStudents.jsx`: selected-student list; export buttons call missing backend endpoints.
- `frontend/src/pages/company/Analytics.jsx`: company charts; currently depends on missing backend endpoints.

## 5. Generated, Temporary, or Low-Value Files

These are the main files or folders I would treat as temporary, generated, or not suitable for long-term source control.

### Definitely generated

- `backend/target/`: Maven build output, compiled classes, jar files, maven status.
- `frontend/dist/`: Vite production build output.
- `target/`: top-level generated build directories; appears accidental and low-value.

### Local runtime data

- `backend/uploads/`: locally uploaded images and PDFs. These are runtime artifacts, not durable app source.

### Editor-specific

- `.idea/`
- `.vscode/settings.json`

### Template leftovers

- `frontend/README.md`
- `frontend/src/App.css`
- `frontend/src/assets/react.svg`
- `frontend/public/vite.svg` is still used, but it is template branding and should be replaced by your own favicon.

### Temporary or log-type files already showing repo hygiene issues

Git status indicates historical tracking of temporary files such as:

- `backend/build_log.txt`
- `backend/build_log_2.txt`
- `backend/build_log_3.txt`
- `backend/compile.log`
- `backend/compile.txt`
- `backend/compile_errors.txt`
- `backend/compile_out.txt`
- `backend/err.log`
- `backend/out.log`
- `backend/out.txt`
- `backend/startup-9093.err`
- `backend/startup-9093.log`
- `backend/startup.err`
- `backend/startup.log`
- `backend/startup_log.txt`
- `frontend/out.txt`

These are not long-term project assets and should be removed from version control and ignored.

## 6. Important Findings and Risks

### High-value findings

1. Upload architecture mismatch

- `FileController` says uploads are Cloudinary-based, but the active implementation is `FileStorageService`, which writes to local disk.
- `CloudinaryService` exists but is not used by the upload endpoint.
- Long-term impact: deployed environments will lose local files on restart/redeploy, or store them on ephemeral disk.

2. AILS scoring is built but not actually connected to the apply flow

- `AilsService` is implemented.
- `Application` has `ailsScore`, `explanation`, `improvementSuggestions`, `exceptionFlag`.
- `ApplicationService.applyForJob()` does not calculate or persist those values.
- Long-term impact: officer UI shows “fit” data, but much of it is fallback logic, not real stored scoring.

3. Frontend contains working pages for missing backend endpoints

Missing backend endpoints still referenced by frontend:

- `/admin/export/pdf`
- `/admin/export/excel`
- `/company/officer/logs`
- `/company/job/{id}/stats`
- `/company/export/pdf`
- `/company/export/excel`
- `/company/analytics/hires-monthly`
- `/company/analytics/success-rate`
- `/company/analytics/apps-per-job`
- `/company/analytics/package-role`

Long-term impact:

- some buttons/pages are placeholders
- users will hit runtime errors or empty fallback states

4. API docs are stale

- `API_REFERENCE.md` says OTP endpoints are stubs, but password-reset OTP actually exists now
- it describes officer job posting, while current code posts jobs through company endpoints
- some enum descriptions and response examples no longer match code

5. No migration framework

- database structure currently depends on `spring.jpa.hibernate.ddl-auto=update`
- long-term impact: risky production schema evolution, weak rollback story, inconsistent environments

6. No test suite

- no backend unit/integration tests found
- no frontend component/e2e tests found

### Additional code quality findings

7. Hardcoded-sensitive defaults in `application.properties`

- local Postgres username/password default is committed
- JWT secret fallback is committed
- mail username default is committed

This is common in student projects, but not safe for production.

8. `Home.jsx` bypasses the shared API layer

- it uses raw Axios and hardcoded `http://localhost:9092/api/public/stats`
- long-term impact: production API switching becomes inconsistent

9. `LastSeenFilter` has an admin bug

- it checks `ROLE_ADMIN`, but the project uses `SUPER_ADMIN`
- it also attempts to save admins through `userRepository`
- long-term impact: admin activity tracking is incorrect

10. `ApplicationController.getAilsScore()` allows `ADMIN`, not `SUPER_ADMIN`

- current expression uses `hasAnyRole('USER', 'PLACEMENT_OFFICER', 'ADMIN')`
- actual admin role is `SUPER_ADMIN`

11. `JobService.deleteJobByCompany()` can mis-handle applications when a job has no rounds

- it counts applications only when rounds are not empty
- long-term impact: deletion rule is inconsistent and risky

12. Notifications backend exists, but no real frontend notification center was found

- backend notification system is functional
- frontend does not appear to consume it

13. Interview scheduling backend exists, but frontend officer workflow does not expose full scheduling UI

- backend supports scheduling and retrieval
- frontend mostly changes statuses, but no complete interview scheduling experience is visible

14. Client-side route checks are brittle

- route guards decode JWT directly in the browser
- some checks use substring matching rather than a strict role parser
- long-term impact: hard to maintain, easy to break when token format changes

15. OTP is used only for password reset

- there is no registration-time OTP verification
- there is no email verification flag on user/company registration flow

## 7. What Is Good for Long-Term Usage

These parts are worth keeping and extending:

- Spring Boot + PostgreSQL stack
- clear role separation in backend controllers
- company and officer workflow separation
- reasonably complete registration form data model
- JWT-based auth foundation
- existing OTP table and mail setup
- existing Cloudinary integration scaffold
- existing Dockerfile for backend deployment
- existing `vercel.json` for frontend SPA deployment

## 8. Suggestions to Develop the Project More Effectively

### 8.1 Add “I am not a robot” protection

Best fit for this project:

- use Cloudflare Turnstile on:
  - user registration
  - company registration
  - login
  - forgot-password OTP request

Why this fits:

- free tier is enough for student and production-small usage
- friendlier than old-style CAPTCHA
- easy to add to React forms
- backend already has clear auth endpoints where token validation can be inserted

Implementation idea:

1. add Turnstile widget to `Login.jsx`, `Register.jsx`, and `ForgotPassword.jsx`
2. send Turnstile token along with form payload
3. validate on backend before continuing auth logic
4. reject requests without valid server-side verification

### 8.2 Add OTP verification after registration

Recommended future flow:

1. user fills registration form
2. backend stores account as `approved=false`, `emailVerified=false`, `enabled=false`
3. backend creates OTP token or email verification token
4. user enters OTP on a new verification screen
5. backend marks `emailVerified=true`
6. admin approval remains a separate step if your process still needs manual review

### 8.3 Add Google login

Recommended approach:

- keep your existing JWT system
- add Google Identity Services on frontend
- send Google ID token to backend
- backend verifies token with Google
- create or link local user record
- backend issues your own JWT after successful verification

Important design rule:

- do not treat Google login as “skip profile forever”
- instead use Google only for identity bootstrap
- still collect your domain-specific profile after first login

## 9. Recommended Action Plan

### Phase 1: Cleanup and repo hygiene

1. add proper ignore rules at repo root for:
   - `backend/target/`
   - `target/`
   - `backend/uploads/`
   - `*.log`
   - `*.txt` build logs
   - `.idea/`
2. remove tracked generated/log files from git
3. delete or replace template leftovers:
   - `frontend/README.md`
   - `frontend/src/App.css`
   - `frontend/src/assets/react.svg`
   - `frontend/public/vite.svg`
4. either delete `DataInitializer.java` or restore it properly

### Phase 2: Production readiness

1. move all secrets to environment variables only
2. add Flyway or Liquibase migrations
3. switch upload flow fully to Cloudinary
4. update `Home.jsx` to use env-based API URL through shared Axios
5. fix stale API documentation

### Phase 3: Feature completion

1. wire AILS scoring into `applyForJob()`
2. implement missing company analytics/export endpoints or remove placeholder UI
3. build notification center UI
4. expose interview scheduling UI to officers and interview view to users

### Phase 4: Auth hardening

1. add Turnstile
2. add registration OTP/email verification
3. add Google login
4. consider refresh-token strategy later if sessions need better UX

### Phase 5: Testing

1. backend unit tests for auth and application rules
2. backend integration tests for role-protected endpoints
3. frontend smoke tests for login, registration, job search, apply flow

## 10. Bottom-Line Assessment

This is a strong student project foundation with real product structure, not just demo pages. The backend and frontend are already organized in a way that can grow into a serious production portfolio app.

The main work now is not “rewrite everything.” It is:

- clean the repo
- complete unfinished connections
- harden auth
- replace local-file assumptions
- make deployment-friendly configuration

If you do those things in order, this project can become a much stronger final-year or resume-level project.
