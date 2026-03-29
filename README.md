# Bridge Placement Platform

A comprehensive platform for managing college placements, connecting students, companies, and placement officers. Built with a high-performance Spring Boot backend and a modern, glassy React frontend.

## Project Structure

### Backend
- **Framework**: Spring Boot 3.x
- **Location**: `/backend`
- **Build**: Maven (`pom.xml`)
- **Java Package**: `com.bridge.placement`
  - `config/` - Security, Data Initializer, and App configurations
  - `controller/` - REST API controllers (Admin, Job, Application, Interview, Notification, etc.)
  - `dto/` - Data Transfer Objects for API requests/responses
  - `entity/` - JPA entities (PostgreSQL/H2 mapping)
  - `enums/` - Enumerated types (Role, Status, Mode)
  - `exception/` - Global exception handling
  - `service/` - Core business logic implementation
  - `repository/` - Spring Data JPA repositories

### Frontend
- **Framework**: React + Vite (Fast HMR)
- **Location**: `/frontend`
- **Styling**: Vanilla CSS with modern Glassmorphism (Apple/Google inspired)
- **Navigation**: React Router with Role-based protected routes
- **Package Manager**: npm

#### Frontend Structure
- `src/`
  - `api/` - Modular API integration (Axios-based)
  - `components/` - Reusable UI elements (Buttons, Inputs, Modals)
  - `layout/` - Standardized Layouts (Sidebar on the left, Header on top)
  - `pages/` - Role-specific views (Admin, Company, Officer, User, Public)
  - `assets/` - Images, logos, and global styles
  - `App.jsx` - Main application with Routing infrastructure

## User Roles

- **Admin**: Full platform management, user/company approvals, and system activity monitoring.
- **Company**: Job posting, applicant screening, and recruitment cycle management.
- **Officer**: Student/Job matching, interview scheduling, and placement reporting.
- **User (Student)**: Profile management, job search, and application tracking.
- **Public**: Access to browse jobs and basic platform information.

## Key Features

- **Job Management**: End-to-end recruitment workflow from posting to selection.
- **Smart Applications**: Student tracking system with status updates and history.
- **Interview Scheduling**: Integrated scheduling system for online (Google Meet) or offline interviews.
- **Notification System**: Real-time alerts for interview invites, application status changes, and new job postings.
- **Placement Reports**: Visual analytics for placement officers to track recruitment success rates.
- **Advanced Admin Activity**: Detailed logs of every action taken on the platform for auditing.
- **Responsive UI/UX**: Premium "Glassy" design adapted for all screen sizes.

## Development Status

- **Branching**: The project has been consolidated into a single **`main`** branch for streamlined development.
- **Data**: Initialized with a high-quality dataset of 10+ records per entity (Students, Companies, Jobs) for immediate testing.
- **UI**: Standardized Sidebar positions across all dashboards for a consistent user experience.

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+ and npm
- Maven 3.8+

### Quick Start (Development)

1. **Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *Available at http://localhost:8080*

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Available at http://localhost:5173*

## API Reference

Comprehensive API documentation is available at [API_REFERENCE.md](API_REFERENCE.md).

---

**Last Updated**: March 2026
