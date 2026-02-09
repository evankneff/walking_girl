## Time Entry Privacy & UX — Roadmap (2026-02-09)

**Note:** Avoid over-engineering, cruft, and legacy-compatibility features or comments. This is a clean-code project.

**Related plan:** See `[2026-02-09-time-entry-privacy-ux-plan.md](./2026-02-09-time-entry-privacy-ux-plan.md)`.

### Phase 1 — Name Display & Basic UX

- **Milestone 1.1: Name obfuscation**
  - Implement a client-side helper to show participant names as `FirstName LastInitial.` in the time-entry dropdown while keeping full names in data.
  - Apply this formatting in the `EntryForm` select options only (admin views keep full names).

- **Milestone 1.2: Mobile-friendly name search**
  - Add a search input above the name dropdown.
  - Filter the available names in real time based on the search text.
  - Ensure the input and dropdown layout work cleanly on mobile (full-width, single-column).

### Phase 2 — Post-Submission Flow Improvements

- **Milestone 2.1: Explicit navigation back to dashboard**
  - Remove the auto-redirect after time entry submission.
  - Add a prominent “Bring me back to the dashboard” button on the success/confirmation panel.
  - Keep the personal stats visible until the user chooses to leave.

- **Milestone 2.2: Immediate correction option (lightweight)**
  - Allow users to quickly re-open the form with their last submitted values via an “I entered it wrong” button on the success view.
  - Clarify in copy that leaders can finalize corrections in totals if necessary.

### Phase 3 — Future Enhancements (Optional)

- **Milestone 3.1: Backend support for edits/undo**
  - Extend `/api/entries` to return an `entryId`.
  - Provide admin endpoints to edit or delete entries.
  - Optionally support a short-lived “undo last entry” for the current session.

- **Milestone 3.2: Consistent privacy across views**
  - Audit other participant-facing views where names appear (e.g., history lists).
  - Apply the same obfuscated display where appropriate, while preserving full detail for admins.

