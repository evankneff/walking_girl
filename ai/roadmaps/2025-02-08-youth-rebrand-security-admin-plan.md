# Plan: Youth Rebrand, Security Hardening & Admin Safeguards

> **Note:** Avoid over-engineering, cruft, and legacy-compatibility features or comments. This is a clean-code project.

**See also:** [Roadmap](./2025-02-08-youth-rebrand-security-admin-roadmap.md)

---

## Summary of Discussion

The app is evolving from "Young Women" to **all youth** (young men and young women). Requirements include: representation in the map icon (girl + boy), hiding the admin entry point, a more professional and fun mobile-first UI, and hardening for 40–50 youth users. Additional focus: preventing unrealistic or abusive data in the entry form, and giving admins a full activity log, per-kid entry view, and safe delete flows (single entry and entire kid with confirmation).

---

## 1. Representation & Navbar

### 1.1 Map icon: girl + boy

- **Where:** `client/src/components/MapVisualization.jsx` (single “girl” figure in SVG, lines ~83–107).
- **Approach:** Add a second figure (boy) next to the girl; both use the same `getPointOnPath(position)`.
- **Implementation:** Two `<g>` elements with a small horizontal offset (e.g. girl at `charPosition.x - 25`, boy at `charPosition.x + 25`). Boy: simple SVG (e.g. different hair, shirt instead of dress), same scale. Keep pair compact so labels and path remain clear on mobile (existing `viewBox="0 0 1000 600"`).

### 1.2 Hide Admin from navbar

- **Where:** `client/src/App.jsx` — remove the `<Link to="/admin">Admin</Link>` (line 18).
- **Keep:** `<Route path="/admin" element={<AdminPanel />} />` so `/admin` remains reachable by URL. Security remains password + JWT; hiding the link is obscurity only.

---

## 2. UI Polish (professional, fun, mobile-first)

- **Current:** Mobile breakpoints (768px, 480px), 44px touch targets, 16px inputs. Gradient background, card layout.
- **Add:** Consistent typography and spacing; optional small “fun” touch (e.g. subtle pattern or friendly microcopy). Ensure nav doesn’t wrap awkwardly on small screens; keep girl+boy pair from overlapping path labels.
- **Scope:** Light polish only; no full redesign.

---

## 3. Security Hardening

### 3.1 JWT secret

- **Where:** `server/src/middleware/auth.js` — remove fallback default in production.
- **Action:** Require `JWT_SECRET` when `NODE_ENV === 'production'` (fail startup or refuse to issue tokens without it).

### 3.2 Rate limiting

- **Admin login:** `POST /api/admin/login` — limit by IP (e.g. 5–10 attempts per 15 min) via `express-rate-limit`.
- **Entries:** `POST /api/entries` — limit by IP (and optionally by name) to prevent spam (e.g. per hour/day caps).

### 3.3 Entry submission: name whitelist only

- **Where:** `server/src/routes/entries.js` — currently auto-creates user if name not found.
- **Change:** Only accept names that already exist in `users`. Return 400 with a clear message if name not in list. Admin pre-populates users; no auto-create.

### 3.4 Input limits

- **Name:** Max length (e.g. 100 chars) on server and, if free text elsewhere, client.
- **Minutes:** Server- and client-side cap per entry (e.g. 300 or 1440). Reject above cap with clear error.

### 3.5 CORS & headers

- **CORS:** In production, restrict `cors()` to the app’s origin(s).
- **Security headers:** Add Helmet (or equivalent) for XSS, X-Frame-Options, etc.

### 3.6 Data at rest

- Ensure SQLite `data/` directory and DB file have restrictive permissions; app runs as non-privileged user. Use HTTPS in production.

---

## 4. Entry Form: Protecting Against Unrealistic Data

- **Name:** Replace free-text input with a **dropdown** of names from `GET /api/users` (or a dedicated public endpoint that returns only names for the form). No free-text submission.
- **Minutes:** Enforce `min` and `max` (e.g. 1–1440); show short hint (“Max 5 hours per entry” or similar). Server enforces same cap.
- **Optional:** Server-side per-user caps (e.g. max entries per day or max total minutes per week) to limit abuse without blocking normal use.

---

## 5. Admin: Activity Log & Per-Kid View

### 5.1 Full activity log

- **Current:** “Recent Entries” shows last 20 only (`entries.slice(0, 20)`).
- **Change:** Show all entries (or paginate, e.g. 50 per page). Add sort: by date (newest/oldest), by name, by minutes. Clear columns: **Name | Minutes | Week start | Submitted at** (exact timestamp). Label as “Activity log” or “All entries.”

### 5.2 Per-kid view

- **Current:** Single flat entries list; no per-user view.
- **Add:** In Users section, make each user clickable (or add “View entries”). When selected, show only that user’s entries with date, minutes, week, and delete-per-entry. Optionally show that kid’s totals (e.g. total minutes, or per week).
- **Backend:** Add `GET /api/admin/entries?user_name=...` or `GET /api/admin/users/:id/entries` returning entries for that user (filter by `user_name` or join on user id). Reuse existing DB schema (`user_name` on `walking_entries`).

---

## 6. Admin: Delete Safeguards

### 6.1 Delete single entry

- Already implemented. Expose in full log and per-kid view with clear “Delete entry” label.

### 6.2 Delete entire kid (user)

- **Current:** `DELETE /api/admin/users/:id`; one generic confirm. DB has `FOREIGN KEY (user_name)` on `walking_entries`; delete user may fail if entries exist.
- **Change:**
  - **Backend:** On delete user, delete all entries for that user first (by `user_name`), then delete the user, in a single transaction. Alternatively add `ON DELETE CASCADE` if schema migration is acceptable.
  - **UI:** Stronger confirmation: e.g. “Permanently remove [Name]? This will delete all X entries for this person. Type ‘[Name]’ to confirm.” Require typing the name (or a confirmation phrase) before enabling Delete.

---

## 7. Implementation Order (Suggested)

1. **Quick wins:** Remove Admin nav link; require `JWT_SECRET` in production; add rate limiting (admin login + entries); name whitelist + entry form dropdown; minutes cap (client + server); name length limit.
2. **Representation & UI:** Girl + boy on map; light UI polish; verify mobile.
3. **Admin experience:** Full activity log (all entries, sort); per-kid view + backend endpoint; delete-user cascade + stronger confirmation; CORS + Helmet; DB/file permissions and HTTPS reminder.

---

## 8. Out of Scope (MVP)

- Multiple goals/campaigns, participant auth, mobile native apps, external integrations. Keep scope to the above.
