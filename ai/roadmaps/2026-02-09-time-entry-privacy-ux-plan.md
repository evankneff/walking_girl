## Time Entry Privacy & UX — Plan (2026-02-09)

**Note:** Avoid over-engineering, cruft, and legacy-compatibility features or comments. This is a clean-code project.

**Related roadmap:** See `[2026-02-09-time-entry-privacy-ux-roadmap.md](./2026-02-09-time-entry-privacy-ux-roadmap.md)`.

### 1. Context and Goals

- **Context**:
  - Walking Girl lets participants select their name, enter minutes walked, and see confirmation plus their contribution stats.
  - Current UX shows full names in the time-entry dropdown and auto-redirects back to the dashboard shortly after submission.
- **Goals**:
  - **Privacy**: Reduce exposure of full last names in participant-facing UI (especially when projected or screenshotted).
  - **Findability**: Make it easier to find one’s name in long lists, particularly on mobile.
  - **Feedback UX**: Let users stay on the confirmation view long enough to read their stats and navigate when ready.
  - **Error Recovery**: Provide a gentle way for users to correct an entry they realize is wrong immediately after submitting.

### 2. Scope

- **In scope**:
  - Client-side formatting of displayed participant names (first name + last initial).
  - Client-side search/filter for the name dropdown in the entry form.
  - Adjustments to the post-submission experience:
    - Replace auto-redirect with an explicit “back to dashboard” button.
    - Optional “I entered it wrong” flow that helps users correct mistakes.
- **Out of scope (for this iteration)**:
  - New backend endpoints for arbitrary user-side editing/deletion of past entries.
  - Authentication for participants or per-user accounts.
  - Full redesign of admin interfaces.

### 3. Name Obfuscation Design

#### 3.1 Data vs. Presentation

- **Data**:
  - Keep storing **full names** in the database and returning them from `/api/users/names`.
  - Do not truncate or mutate persisted data for display concerns.
- **Presentation**:
  - Introduce a small client-side helper that converts a full name string to a safer label:
    - `"Sam Smith"` → `"Sam S."`
    - `"Sam Tyler Smith"` → `"Sam S."` (use the last token as last name)
    - `"Madonna"` → `"Madonna"` (no artificial suffix)

#### 3.2 Formatting Rules

- **Input**: A single string `fullName`.
- **Algorithm**:
  - Trim whitespace.
  - Split on whitespace into tokens.
  - If only one token, return that token.
  - Otherwise:
    - `first = tokens[0]`
    - `last = tokens[tokens.length - 1]`
    - `lastInitial = uppercased first character of last`
    - Return `\`${first} ${lastInitial}.\``.
- **Edge cases**:
  - Extra internal spaces: `split(/\s+/)` to coalesce them.
  - Lower/mixed case last names: `.toUpperCase()` for the initial.
  - Non-letter characters: leave as-is for now; if future constraints appear, validate at admin user creation.

#### 3.3 Where to Apply

- `EntryForm` (time-entry screen):
  - Use the formatting helper in the dropdown options so each option shows the obfuscated label while the `value` remains the full name for submission.
- Future considerations:
  - If participant names appear in other public-facing locations (e.g., history views), consider reusing the same helper for consistency.
  - Admin views should continue to show full names, not obfuscated labels.

### 4. Searchable Name Dropdown (Mobile-Friendly)

#### 4.1 UX Goals

- Support groups with many participants where scanning a long dropdown is tedious, especially on a phone.
- Let a user quickly filter by typing a few characters (first name, last name, or both).
- Maintain compatibility with the existing `<select>` control so the server continues receiving the full name.

#### 4.2 UI Structure

- In the `EntryForm` name `form-group`:
  - Add an **input field** above the `<select>`:
    - Placeholder: “Start typing your name”.
    - Bound to state, e.g., `nameFilter`.
    - Disabled when the form is in `loading` state.
  - Continue to use a `<select>` for the actual choice of name:
    - The options are derived from a filtered list `filteredNames`.
    - Each option:
      - `value` = full name.
      - Text = obfuscated label from the name-formatting helper.

#### 4.3 Filtering Logic

- Add state in `EntryForm`:
  - `nameFilter` (`string`).
- Derive `filteredNames` from `names`:
  - Convert both `name` and `nameFilter` to lowercase.
  - Match if the full name string includes the search substring:
    - This allows matching on first name, last name, or both.
  - If `nameFilter` is empty, return all names.
- Performance:
  - Lists are expected to be small (tens, maybe low hundreds). Simple linear filtering on every keystroke is fine.

#### 4.4 Mobile Considerations

- Layout:
  - Make the search input full-width with generous padding and clear font size.
  - Ensure the search input and select are stacked vertically in a single column.
- Interaction:
  - Avoid complex custom dropdown widgets to keep things accessible and robust.
  - Use the standard HTML `<select>` to benefit from built-in mobile behaviors (native pickers).

### 5. Post-Submission UX Changes

#### 5.1 Current Behavior

- After a successful `POST /api/entries`, the client:
  - Shows a success message and relative stats (`userTotalMinutes`, `contributionPercent`).
  - **Auto-redirects** to the dashboard after a short delay.

#### 5.2 Desired Behavior

- Keep the confirmation view and stats visible until the user chooses to leave.
- Provide an explicit, visually prominent **“Bring me back to the dashboard”** button.
- Ensure this works well on mobile:
  - Large tap target.
  - Full-width, clearly styled, and easy to find at the bottom of the success area.

#### 5.3 Implementation Plan

- Remove the `setTimeout`-based auto-redirect.
- Reuse `useNavigate` for a manually triggered navigation:
  - Add a button (type `button` so it doesn’t submit the form again) that calls `navigate('/')`.
  - Place the button within the success `message` block or immediately below it, so it is visually tied to the confirmation.
- Keep the submit button behavior unchanged:
  - On submit: show “Submitting…” state.
  - On success: show message, stats, and the new dashboard button.

### 6. Immediate Error-Correction UX

#### 6.1 Design Principle

- Participants have **no authentication**; backend should be cautious about exposing edit/delete features.
- For the initial iteration, prioritize:
  - **Low complexity & safety** on the backend.
  - A **gentle UX** on the frontend that helps users fix mistakes with minimal friction.

#### 6.2 Short-Term Strategy (Client-Side Help)

- Instead of implementing a full edit/delete workflow:
  - Allow users to quickly re-open the form with their last submitted values.
  - Encourage them to submit corrected data while leaving the mistaken entry to be handled by an admin if needed.

- Implementation ideas:
  - Store the most recent submitted `name` and `minutes` in component state (e.g., `lastEntry`).
  - On success:
    - Show an extra button: **“I entered it wrong”**.
    - Clicking it:
      - Repopulates the name and minutes fields with the last submitted values.
      - Clear the success/error messages so they are back in “edit mode”.
      - Keeps them on the same view.
  - Add a small note explaining that leaders can fix mistakes if needed.

#### 6.3 Future Strategy (Real Edits/Undo)

- When ready to expand backend capabilities:
  - Have `/api/entries` return an `entryId` for the created entry.
  - Create a secure endpoint (likely admin-only) to:
    - Edit an entry’s minutes.
    - Or delete an entry.
  - Optionally allow a short-lived “undo last entry” endpoint keyed by:
    - Entry ID.
    - A temporary token or session identifier.
  - Reflect these actions in admin views and, optionally, in participant-facing history views.

### 7. Implementation Steps

1. **Name formatting helper**
   - Add a pure function in `EntryForm` (or a small shared utility) that maps a full name to the obfuscated label.
   - Replace dropdown option text with the helper output while keeping the `value` as the full name.
   - Manually test with:
     - Single-name entries.
     - Multi-part names.
     - Mixed case.

2. **Name search/filter**
   - Add `nameFilter` state and bind it to a new input above the select.
   - Implement simple `Array.filter` logic to derive `filteredNames` from `names`.
   - Update the map over `names` to use `filteredNames`.
   - Verify behavior on desktop and mobile:
     - Typing filters correctly.
     - Clearing the input shows the full list.

3. **Post-submission navigation button**
   - Remove the existing auto-redirect timeout.
   - Add a “Bring me back to the dashboard” button tied to `navigate('/')`.
   - Ensure the button:
     - Only appears on success (when `message` is set).
     - Is visually distinct but secondary to the success message itself.

4. **Immediate correction flow (lightweight)**
   - Track last submitted values in state.
   - Add an “I entered it wrong” button under the success content.
   - On click:
     - Repopulate fields with the last submitted values.
     - Clear success messages so the user is back in “edit mode”.
   - Add helper text clarifying that leaders can adjust totals if something still seems off.

5. **QA and UX Validation**
   - Test full flow on:
     - Desktop browsers.
     - iOS Safari and Android Chrome (if available).
   - Scenarios:
     - New user entering correct minutes.
     - User entering the wrong number and using the correction flow.
     - User getting distracted and coming back to the confirmation, then tapping “Bring me back to the dashboard”.
   - Confirm that:
     - No backend contracts changed for existing APIs.
     - Admin experiences are unaffected.

### 8. Risks and Mitigations

- **Risk**: Two users share similar names, and obfuscation leads to confusion.
  - **Mitigation**: In admin setup, prefer distinguishing first names or adding middle initials. Consider future enhancement to show more letters when ambiguous.
- **Risk**: Users misinterpret the correction flow as a true “undo”.
  - **Mitigation**: Wording: use phrases like “Fix my entry” and mention that leaders can finalize corrections in totals if needed.
- **Risk**: Extra UI elements crowd small screens.
  - **Mitigation**: Keep the layout single-column, with generous spacing; prioritize touch targets and readability over dense information.

