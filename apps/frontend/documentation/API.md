# API Documentation

## Overview
This API serves as the backend for the **creator-connect-main-app** project. It handles user management, campaign creation, creator features, and additional endpoints specific to the platform's brand-creator connection interactions.

## Folder Structure
```
src/
  api/              # API route handlers
  controllers/      # Business logic for endpoints
  models/           # Database models (e.g., User, Post)
  middlewares/      # Authentication, error handling
  utils/            # Utility functions
  types/            # TypeScript type definitions
  config/           # Configuration files
  index.ts          # Entry point for backend/server
```

## Main Endpoints

### User Management
- `POST /api/auth/register`  
  Register a new user.
- `POST /api/auth/login`  
  Authenticate and login a user.
- `GET /api/user/:id`  
  Retrieve user profile by ID.

### Post/Content
- `GET /api/posts`  
  Get all posts.
- `POST /api/posts`  
  Create a new post.
- `GET /api/posts/:id`  
  Get a specific post by ID.
- `DELETE /api/posts/:id`  
  Delete a post.

### Community/Groups
- `GET /api/communities`  
  List all communities.
- `POST /api/communities`  
  Create a new community.
- `GET /api/communities/:id`  
  Get community details.

### Additional Endpoints
- `GET /api/search?q=...`  
  Search posts, users, or communities.
- `POST /api/upload`  
  Upload images or media.

## Authentication
- Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.
- Use middleware in `middlewares/auth.ts` to protect routes.

## Error Handling
- Standardized error responses:
  ```json
  {
    "error": "Error message",
    "code": 400
  }
  ```
- Error handling middleware in `middlewares/error.ts`.

## Example Requests

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "example",
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Get Posts
```http
GET /api/posts
Authorization: Bearer <token>
```

## Technologies Used
- Node.js/Bun
- TypeScript
- Express.js or similar framework
- MongoDB/PostgreSQL (specify your DB in `models/`)
- JWT for authentication

## Notes
- For more details, see controller files under `src/controllers/`.
- Types and interfaces are in `src/types/`.
- Update endpoints as your app grows!

_Last updated: 2025-09-09_
