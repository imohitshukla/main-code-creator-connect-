````markdown name=documentation/ARCHITECTURE.md
# Architecture Documentation

## Overview
**creator-connect-main-app** is designed as a full-stack web application with a modular structure. The architecture separates frontend and backend logic to improve maintainability and scalability.

## Folder Structure
```
src/
  components/        # Reusable UI components for frontend
  pages/             # Page-level React components (Next.js or similar)
  api/               # Backend API route handlers
  controllers/       # Business logic for API endpoints
  models/            # Database schemas and models
  middlewares/       # Express/Next.js middlewares (auth, error, logging)
  types/             # TypeScript type definitions
  utils/             # Utility/helper functions
  config/            # Configuration files (DB, env)
  public/            # Static assets (images, icons)
  styles/            # CSS/SCSS/Styled-components
  index.ts           # Main entry point for backend/server
```

## Main Data Flows

### 1. User Interaction Flow
- User interacts with the UI (in `components/` and `pages/`)
- Frontend sends requests to backend API endpoints via `src/api/`
- Backend controllers (`src/controllers/`) process the request
- Data models (`src/models/`) handle database CRUD operations
- Response is sent back to frontend and rendered

### 2. Authentication Flow
- Registration/Login API endpoints handle credentials
- Middleware (`src/middlewares/auth.ts`) verifies JWT tokens on protected routes
- On success, user receives access token for future requests

### 3. Community/Post Flow
- User creates or joins communities through UI
- API endpoints (`/api/communities`, `/api/posts`) handle community and post logic
- Controllers validate and process requests, interact with models for DB operations

## Technologies Used
- **Frontend:** React/Next.js, TypeScript, CSS/SCSS
- **Backend:** Node.js/Bun, Express.js/Next.js API routes
- **Database:** MongoDB/PostgreSQL (specify actual usage)
- **Authentication:** JWT-based, middleware protection

## Integration Points
- Third-party APIs (if any) are connected via utility functions or direct API calls.
- Static assets are served from `public/`.

## Notes
- The project is modular; new features can be added in separate folders.
- All types and interfaces are in `src/types/`.
- Update this document as architectural changes occur.

_Last updated: 2025-09-09_
````
