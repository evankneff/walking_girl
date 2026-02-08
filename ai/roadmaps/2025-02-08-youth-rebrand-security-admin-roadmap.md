# Roadmap: Youth Rebrand, Security & Admin Safeguards

> **Note:** Avoid over-engineering, cruft, and legacy-compatibility features or comments. This is a clean-code project.

**See also:** [Plan](./2025-02-08-youth-rebrand-security-admin-plan.md)

**Status:** All phases implemented.

---

## Phase 1 — Quick wins & security baseline  ✓

- [x] Remove Admin link from navbar; keep `/admin` route.
- [x] Require `JWT_SECRET` in production; add rate limiting for admin login and entry submission.
- [x] Entries: name whitelist only (no auto-create); entry form uses dropdown of approved names.
- [x] Cap minutes per entry (client + server, 300 max); enforce name max length (100 chars).

**Deliverable:** Safer, whitelist-based entries and basic hardening.

---

## Phase 2 — Representation & UI  ✓

- [x] Add boy figure next to girl on map (both move along path).
- [x] Light UI polish: typography, spacing, mobile check; nav and map labels clear on small screens.

**Deliverable:** All-youth representation and a more professional, mobile-first feel.

---

## Phase 3 — Admin log & per-kid view  ✓

- [x] Full activity log: all entries, sort by date/name/minutes, clear columns (Name | Minutes | Week | Submitted at).
- [x] Per-kid view: click user → see all their entries + totals; delete individual entries from log and per-kid view.
- [x] Backend: endpoint for entries by user (`GET /api/admin/entries?user_name=...`).

**Deliverable:** Auditable log and ability to check each kid's time entries.

---

## Phase 4 — Delete safeguards & hardening  ✓

- [x] Delete user: backend deletes that user's entries first (transaction), then user; UI confirmation with "type name to confirm."
- [x] CORS restricted in production; Helmet for security headers.
- [x] Name length limit enforced on admin add-user as well.

**Deliverable:** Safe "delete kid" flow and production hardening.
