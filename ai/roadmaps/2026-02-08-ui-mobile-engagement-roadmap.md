# Roadmap: UI Overhaul, Mobile Optimization & Engagement Features

> **Note:** Avoid over-engineering, cruft, and legacy-compatibility features or comments. This is a clean-code project.

**Detailed Plan:** [2026-02-08-ui-mobile-engagement-plan.md](./2026-02-08-ui-mobile-engagement-plan.md)

## Phase 1: Mobile Foundation (UI/UX)
*Focus: Navigation and ease of access.*

- [ ] **Refactor**: Extract `SaviorIcon` for reuse.
- [ ] **Feature**: Implement `SideMenu` (Hamburger) navigation.
- [ ] **Feature**: Implement `Fab` (Floating Action Button) for "Enter Time".
- [ ] **Update**: Responsive Navbar layout (Savior Left, Menu Right).

## Phase 2: Engagement Loop
*Focus: Motivation and friction reduction.*

- [ ] **Backend**: Calculate "Relative Stats" on entry submission.
- [ ] **Frontend**: Show motivating stats on success banner.
- [ ] **UX**: Auto-redirect to Dashboard after successful entry.
- [ ] **Feature**: Calculate and display "Group Streak" on Dashboard.

## Phase 3: Insights & Administration
*Focus: Long-term data visualization and management.*

- [ ] **Backend**: Create endpoint for historical weekly progress.
- [ ] **Frontend**: Build `HistoryPage` with progress chart.
- [ ] **Admin**: Add private "Leaderboard" view to Admin Panel.
