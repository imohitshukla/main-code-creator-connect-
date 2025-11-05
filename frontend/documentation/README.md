````markdown name=README.md
# Creator Connect Main App

## Overview
**Creator Connect Main App** is a full-stack web application designed to connect brands and creators. It enables brands to discover creators, build partnerships, and manage campaigns effectively.

## Features
- User registration and authentication (JWT)
- Community creation and management
- Posting content within communities
- Search for users, posts, and communities
- Media uploads
- Responsive frontend UI

## Architecture

### Project Structure
```
src/
  components/        # Reusable frontend UI components
  pages/             # Page-level views (Next.js or React)
  api/               # Backend API route handlers
  controllers/       # Business logic for API endpoints
  models/            # Database models/schemas
  middlewares/       # Authentication/error handling logic
  types/             # TypeScript type definitions
  utils/             # Utility functions (shared logic)
  config/            # Configuration files
  styles/            # CSS/SCSS/Styled components
  public/            # Static assets
  index.ts           # Backend/server entry point
```

### Data Flow
- **Frontend**: Users interact through pages and components.
- **Backend**: Handles requests via API, processes logic in controllers, stores/retrieves data with models.
- **Authentication**: JWT-based, managed in middlewares.
- **Database**: MongoDB/PostgreSQL (update as per your stack).

## API Overview
See [`documentation/API.md`](documentation/API.md) for full details.

## Getting Started

### Prerequisites
- Node.js or Bun
- npm, pnpm, or bun
- Database (MongoDB/PostgreSQL)

### Installation
```sh
git clone https://github.com/imohitshukla/creator-connect-main-app.git
cd creator-connect-main-app
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and fill in your environment variables.

### Run Application
```sh
npm run dev
```
or
```sh
bun dev
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

## License
Specify your license here.

## Additional Documentation
- [Architecture](documentation/ARCHITECTURE.md)
- [API](documentation/API.md)
````
