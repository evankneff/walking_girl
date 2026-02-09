# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Walking Girl is a full-stack web app for tracking collective walking time toward a shared group goal. Participants log minutes walked, and a dashboard shows progress via a map visualization from start to destination. Designed for groups like Young Women organizations.

**Before making changes:** Review `/aiDocs/MVP.md` to ensure alignment with product goals.

## Development Commands

### Server (Express backend)
```bash
cd server
npm install          # Install dependencies
npm run dev          # Development with nodemon (port 3001)
npm start            # Production start
```

### Client (React frontend)
```bash
cd client
npm install          # Install dependencies
npm start            # Dev server (port 3000, proxies to 3001)
npm run build        # Production build
npm test             # Run tests
```

### Docker
```bash
docker-compose up --build    # Build and run entire app (port 3001)
```

In development, run server and client in separate terminals. The React dev server proxies `/api/*` to the backend.

## Architecture

**Monorepo structure:**
- `server/` - Express REST API with Firestore database
- `client/` - React SPA (Create React App)

**Production deployment:** Single Express process serves both the built React app and API on port 3001.

**Key architectural files:**
- `server/src/server.js` - Express setup, middleware, routing
- `server/src/db/database.js` - Firestore integration and query abstraction
- `server/src/routes/` - API route handlers (dashboard, entries, admin)
- `server/src/middleware/auth.js` - JWT authentication
- `client/src/App.jsx` - Main router and layout
- `client/src/components/Dashboard.jsx` - Progress display with auto-refresh
- `client/src/components/EntryForm.jsx` - Time entry submission
- `client/src/components/AdminPanel.jsx` - Admin CRUD interface

**Database:** Google Firestore (collections: `users`, `entries`, `settings`). The `queries` object in `database.js` abstracts all database operations.

**Authentication:** JWT tokens (24h expiry) for admin endpoints. Passwords hashed with bcrypt.

**Security:** Rate limiting on login (10/15min) and entries (60/hr). Helmet security headers. CORS configured by environment.

## API Endpoints

Public:
- `GET /api/progress` - Current progress and stats
- `POST /api/entries` - Submit walking time
- `GET /api/users/names` - Get user list for entry form

Admin (require JWT):
- `POST /api/admin/login` - Authenticate
- `GET/POST /api/admin/settings` - Goal and location config
- `GET/POST/DELETE /api/admin/users` - User management
- `GET /api/admin/entries` - View all entries

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 3001) |
| `JWT_SECRET` | Secret for JWT signing |
| `ADMIN_PASSWORD` | Admin login password |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP credentials JSON |
