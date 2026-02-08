# Walking Girl — MVP Overview

## Product Summary

**Walking Girl** (“Walking with our Savior”) is a web application for tracking collective walking time toward a shared goal. It is designed for groups (e.g., Young Women) where participants log minutes walked and everyone sees progress on a single dashboard. A map visualization shows progress from a configurable start location to a destination, making the goal tangible and motivating.

## What the Product Does

1. **Participants submit walking time**  
   Users go to an entry form, choose their name (from a list managed by an admin), enter minutes walked, and submit. Entries are stored and attributed to the current week.

2. **Everyone sees progress on a dashboard**  
   The main view shows total minutes walked, the group goal (e.g., 10 hours), progress as a percentage, and current-week activity. A map illustrates progress along a path from “start” to “destination,” so the group can see how far they’ve come toward the goal.

3. **Admins configure and manage**  
   An admin can set the goal (total minutes), start and end location labels, the admin password, and the list of participant names. Admins can also view all entries for oversight and management.

## How the Applications Work Together

The system is a **single full-stack web application** with two logical parts that work together:

| Layer | Role |
|-------|------|
| **Client** (`client/`) | React SPA: Dashboard (map + stats), Entry form, Admin panel. Talks to the server over HTTP (`/api/*`). |
| **Server** (`server/`) | Express API + static host: REST endpoints for progress, entries, and admin; SQLite for persistence; in production also serves the built React app. |

**Data flow:**

- **Progress:** Dashboard calls `GET /api/progress`. Server reads settings and aggregates entries from SQLite, returns total minutes, goal, percentage, location labels, and current-week stats. Client renders the map and stats.
- **Entries:** Entry form sends `POST /api/entries` with name and minutes. Server validates (e.g., name in users list), associates the entry with the current week, and stores it. Dashboard progress updates on next load or refresh.
- **Admin:** Admin UI uses `/api/admin/*` (login, settings, users, entries). Auth is session/cookie-based. Changes to settings (goal, locations) or users immediately affect progress and entry validation.

**Deployment:** One process serves both API and frontend. In development, the React dev server proxies API requests to the Node server. In production, Express serves the built client and the same API; Docker runs this single app (e.g., on port 3001) with a persistent volume for the SQLite database.

## MVP Scope (Current)

- **In scope:** One shared goal per deployment; entries per participant per week; configurable goal minutes and location names; admin-managed user list; map visualization of progress; Docker-based deployment with persistent data.
- **Out of scope (MVP):** Multiple goals or campaigns, authentication for participants, mobile apps, or external integrations.

---

*This document describes the current MVP. For architecture details, see project README and `server/` / `client/` structure.*
