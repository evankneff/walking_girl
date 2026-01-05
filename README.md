# Walking Girl

A web application for tracking Young Women's walking time with a visual map showing progress toward a goal.

## Features

- **Entry Form**: Simple interface for girls to submit their walking time
- **Admin Panel**: Manage users, settings, and view all entries
- **Dashboard**: Beautiful map visualization showing progress from start to destination
- **Weekly Tracking**: Automatically groups entries by week

## Tech Stack

- **Backend**: Node.js, Express, SQLite
- **Frontend**: React, React Router
- **Containerization**: Docker, Docker Compose

## Quick Start with Docker

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Open your browser to `http://localhost:3001`
   - Default admin password: `admin` (change this in the admin panel!)

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### Installation

1. **Install server dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install client dependencies**:
   ```bash
   cd ../client
   npm install
   ```

3. **Create data directory**:
   ```bash
   mkdir -p ../server/data
   ```

### Running in Development

1. **Start the server** (in one terminal):
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:3001`

2. **Start the client** (in another terminal):
   ```bash
   cd client
   npm start
   ```
   Client runs on `http://localhost:3000` and proxies API requests to the server

## Project Structure

```
walking_girl/
├── server/              # Express backend
│   ├── src/
│   │   ├── server.js    # Main server file
│   │   ├── routes/      # API routes
│   │   ├── db/          # Database setup
│   │   └── middleware/  # Authentication
│   └── data/            # SQLite database (created automatically)
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   └── styles/      # CSS styles
│   └── public/          # Static files
└── docker-compose.yml   # Docker configuration
```

## API Endpoints

### Public Endpoints

- `GET /api/progress` - Get current progress data
- `POST /api/entries` - Submit walking time entry

### Admin Endpoints (require authentication)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/settings` - Get settings
- `POST /api/admin/settings` - Update settings
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Add user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/entries` - Get all entries

## Default Settings

- **Admin Password**: `admin` (CHANGE THIS!)
- **Goal Minutes**: 600 (10 hours)
- **Start Location**: "Start"
- **End Location**: "Destination"

## Database

The application uses SQLite for data persistence. The database file is stored in `server/data/walking_girl.db` and is automatically created on first run.

**Important**: When using Docker, the data directory is mounted as a volume, so your data persists across container restarts.

## Usage

1. **First Time Setup**:
   - Access the admin panel at `/admin`
   - Login with default password: `admin`
   - Change the admin password immediately
   - Set your goal time and location names
   - Add users (girls) to the system

2. **Girls Enter Time**:
   - Navigate to `/entry`
   - Enter their name and minutes walked
   - Submit the entry

3. **View Progress**:
   - Go to the dashboard at `/`
   - See the walking girl character move along the path
   - View progress statistics

## License

ISC

