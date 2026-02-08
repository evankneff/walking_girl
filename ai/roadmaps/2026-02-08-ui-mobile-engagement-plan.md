# Plan: UI Overhaul, Mobile Optimization & Engagement Features

> **Note:** Avoid over-engineering, cruft, and legacy-compatibility features or comments. This is a clean-code project.

**Related Roadmap:** [2026-02-08-ui-mobile-engagement-roadmap.md](./2026-02-08-ui-mobile-engagement-roadmap.md)

## 1. Frontend Architecture & Refactoring

### A. Component Extraction
- **Savior Icon**: Extract the SVG code from `MapVisualization.jsx` into a reusable `SaviorIcon.jsx` component.
  - Props: `className`, `onClick`.
  - Usage: Navbar (Home link) and Map (Destination marker).

### B. Navigation & Layout
- **Mobile Navbar**:
  - Left: Savior Icon (Home).
  - Right: Hamburger Menu Icon (opens Side Drawer).
  - State: `isMenuOpen` in `App.jsx` or a layout context.
- **Side Drawer (`SideMenu.jsx`)**:
  - Links: Dashboard, Enter Time, Previous Weeks.
  - Behavior: Slides in from right, closes on click outside or link selection.
- **Floating Action Button (`Fab.jsx`)**:
  - Fixed position bottom-right.
  - Pink/Theme color.
  - Navigates to `/entry`.
  - Visible primarily on mobile/dashboard view.

## 2. Feature Implementation

### A. Entry Flow Enhancements
- **Auto-Redirect**:
  - In `EntryForm.jsx`, upon success, display success message for ~2 seconds.
  - Automatically `navigate('/')` to Dashboard.
- **Relative Stats (Motivation)**:
  - **Backend**: Update `POST /entries` to calculate user's percentile or rank relative to total group minutes.
  - **Frontend**: Display "You are in the top X% of walkers!" or "You've contributed X% to the goal!" in the success banner.

### B. Dashboard & Visualization
- **Group Streak**:
  - **Backend**: Update `GET /progress` to calculate consecutive weeks with >0 minutes.
  - **Frontend**: Display "🔥 X Week Streak" on Dashboard.
- **Previous Weeks (History)**:
  - **Backend**: Create `GET /api/progress/history`.
    - Returns array of `{ weekStartDate, totalMinutes }` sorted by date.
  - **Frontend**: Create `HistoryPage.jsx`.
    - Use `recharts` or `chart.js` to visualize progress over time.
    - Show trend line of group activity.

### C. Admin Leaderboard
- **Privacy First**: Leaderboard is **not** public.
- **Implementation**:
  - In `AdminPanel.jsx`, add a "Leaderboard" tab.
  - Aggregate existing entry data by `user_name`.
  - Sort by `totalMinutes` descending.
  - Display table: Rank, Name, Total Minutes, Entry Count.

## 3. Technical Stack Additions
- **Charting Library**: `recharts` (lightweight, React-native feel) or `chart.js`.
- **Icons**: `lucide-react` or `react-icons` for Hamburger/Close menus if not using custom SVGs.

## 4. API Changes Summary

| Method | Endpoint | Change |
|--------|----------|--------|
| `POST` | `/entries` | Return `relativeStats` object in response. |
| `GET` | `/progress` | Add `streakWeeks` to response. |
| `GET` | `/progress/history` | **New Endpoint**. Returns weekly aggregates. |
