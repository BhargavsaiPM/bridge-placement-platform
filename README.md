# Bridge Placement Platform

A comprehensive platform for managing college placements, connecting students, companies, and placement officers. Built with Spring Boot backend and React frontend.

## Project Structure

### Backend
- **Framework**: Spring Boot
- **Location**: `/backend`
- **Build**: Maven (`pom.xml`)
- **Java Package**: `com.bridge.placement`
  - `config/` - Configuration classes
  - `controller/` - REST API controllers
  - `dto/` - Data Transfer Objects
  - `entity/` - JPA entities
  - `enums/` - Enumeration classes
  - `exception/` - Custom exceptions
  - `service/` - Business logic services
  - `repository/` - Data access layer

### Frontend
- **Framework**: React + Vite
- **Location**: `/frontend`
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Package Manager**: npm

#### Frontend Structure
- `src/`
  - `api/` - API integration modules (authApi, companyApi, userApi, etc.)
  - `components/` - Reusable React components
  - `layout/` - Layout components (AdminLayout, CompanyLayout, etc.)
  - `pages/` - Page components organized by user role
    - `admin/` - Admin dashboard pages
    - `auth/` - Authentication pages
    - `company/` - Company-specific pages
    - `officer/` - Placement officer pages
    - `public/` - Public-facing pages
    - `user/` - Student/user pages
  - `assets/` - Static assets
  - `App.jsx` - Main application component
  - `main.jsx` - Application entry point

## User Roles

The platform supports multiple user roles:
- **Admin** - Platform administrators
- **Company** - Recruiting companies
- **Officer** - Placement officers
- **User** - Students/applicants
- **Public** - Unauthenticated users

## Key Features

- **Job Management** - Post and manage job openings
- **Applications** - Student job applications
- **Analytics** - Recruitment analytics and reporting
- **Approvals** - Application approval workflows
- **User Profiles** - Profile management for all users
- **Activity Tracking** - Platform activity logs and timeline

## Getting Started

### Prerequisites
- Java 11+ (for backend)
- Node.js 16+ and npm (for frontend)
- Maven (for backend build)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on the configured port (check `src/main/resources/application.properties`).

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

The frontend will be available at the configured Vite server URL (typically `http://localhost:5173`).

## Configuration

### Backend Configuration
- Application settings: `backend/src/main/resources/application.properties`
- Database configuration
- Server port configuration

### Frontend Configuration
- Vite config: `frontend/vite.config.js`
- Tailwind CSS config: `frontend/tailwind.config.js`
- ESLint config: `frontend/eslint.config.js`
- PostCSS config: `frontend/postcss.config.js`
- API endpoints: `frontend/src/api/` modules

## API Reference

See [API_REFERENCE.md](API_REFERENCE.md) for detailed API documentation.

## Documentation

- [API Reference](API_REFERENCE.md)
- [Website Guide](WEBSITE_GUIDE.md)
- [Frontend README](frontend/README.md)

## Build Output

Build logs are available in:
- `build_log.txt` - Root build log
- `backend/build_log.txt` - Backend build logs
- `frontend/build-log.txt` - Frontend build logs

## Project Status

Check build logs for any compilation or runtime issues during setup.

## Contributing

Please follow the project structure and coding conventions established in both backend and frontend modules.

## Contact & Support

For issues or questions, please refer to the project documentation and logs.

---

**Last Updated**: February 2026
