# Student Identity & Cloud Saves

**Date:** 2026-03-14
**Status:** Approved

## Summary

Two-phase feature adding student identity to the app and optional Supabase cloud sync with a teacher dashboard.

- **Phase 1:** Student name/period prompt, stored locally, auto-fills journal PDF. No external dependencies. Ships immediately.
- **Phase 2:** Supabase cloud sync as a background save layer, teacher registration restricted to `@edmonds.wednet.edu`, class codes for student grouping, and a teacher dashboard with a live student map and journal viewer.

## Design Decisions

- localStorage remains the primary save mechanism. Supabase is a sync layer, not a dependency. The app works fully offline.
- Teacher auth uses a Supabase Edge Function to verify passwords and return a signed JWT. RLS policies check the JWT for teacher access.
- Student identity is first name + last initial + period. No passwords or accounts for students.
- Class codes (e.g. "CLARK3") group students under a teacher, similar to Kahoot/Gimkit.
- Dashboard is a screen within the existing app, not a separate page.
- Name collisions: the unique constraint on `(class_code, student_name, period)` means two "Sarah T." students in the same period will share a save. This is an accepted tradeoff — the teacher can resolve by having one student add a middle initial. The app warns when a cloud save already exists for that name+period combo.

---

## Phase 1: Student Identity (No Supabase)

### Student Name Prompt

**Trigger:** Modify `startGame()` in `game-engine.js`. Instead of immediately calling `showSplashScreen()`, first check if `state.studentName` is set. If not, show the name prompt modal. The modal's "Begin" button calls `showSplashScreen()`.

**Continuing students with pre-Phase-1 saves:** In `continueGame()`, after restoring state from `loadSave()`, check if `state.studentName` is falsy. If so, show the name prompt modal. On submit, update state and call `saveGame()`, then proceed to `showScreen('game-screen')` as normal. This ensures students who saved before Phase 1 are prompted once.

**Modal contents:**
- **"Your name"** — text input, placeholder "First name, last initial (e.g. Sarah T.)"
- **"Period"** — text input, placeholder "e.g. 3"
- **"Begin" button** — validates both fields are non-empty, then proceeds

Stored as `state.studentName` and `state.period`. Added to `_buildSaveData()` and `_parseSaveData()` in `game-state.js`.

**`resetState()` preservation:** Modify `resetState()` in `game-state.js` to preserve `studentName`, `period`, and `classCode` across resets. These identity fields survive "Start a New Expedition" — the student doesn't re-enter their name when replaying. The reset rebuilds game progress but keeps identity:
```js
function resetState() {
  const name = state.studentName;
  const period = state.period;
  const classCode = state.classCode;
  state = { /* ... existing reset fields ... */ };
  state.studentName = name;
  state.period = period;
  state.classCode = classCode;
  clearSave();
}
```

### PDF Auto-Fill

In `exportJournalPDF()` in `game-engine.js`, replace the blank cover name:
```
<div class="cover-name">&nbsp;</div>
```
with:
```
<div class="cover-name">${escapeHtml(state.studentName || '')}${state.period ? ' — Period ' + escapeHtml(state.period) : ''}</div>
```

Also add a header to each journal entry div in the PDF:
```
<div class="entry-student">${escapeHtml(state.studentName || '')} — Period ${escapeHtml(state.period || '')}</div>
```

### In-Game Display

Show the student name in the top bar next to the score. In `renderers.js`, modify `updateScoreDisplay()` (or add a new `updateStudentDisplay()` called alongside it) to set text in the `.score-display` element or a new sibling element: "Sarah T. | 25 pts".

### Editing Name

In the "Save & Load Progress" `<details>` panel on the title screen, add a line below the existing description: "Signed in as: **Sarah T. — Period 3** ([change](#))". Clicking "change" shows the name prompt modal again. On submit, updates `state.studentName` and `state.period`, calls `saveGame()`. This updates the localStorage save in place (same save, new name). In Phase 2, a name change will create a new cloud record — the old one remains orphaned, which is acceptable.

### Files Changed

| File | Changes |
|------|---------|
| `js/game-engine.js` | Name prompt modal logic in `startGame()` and `continueGame()`, PDF auto-fill in `exportJournalPDF()` |
| `js/game-state.js` | Add `studentName` and `period` to state object, `_buildSaveData()`, `_parseSaveData()` |
| `js/renderers.js` | Show name in top bar |
| `css/styles.css` | Name prompt modal styles |
| `index.html` | Name prompt modal markup, "change" link in save panel |

---

## Phase 2: Supabase Cloud Sync

### Architecture

```
Student browser                  Supabase
  ├─ localStorage (primary)       ├─ classes table
  ├─ js/supabase-sync.js ───────► ├─ saves table
  └─ game-state.js                ├─ Edge Function: teacher-auth
                                  └─ RLS policies (JWT-based)
                                    │
Teacher browser ────────────────────┘
  └─ Dashboard screen (reads saves, classes)
```

The Supabase JS client (`@supabase/supabase-js`) is loaded via CDN (`<script>` tag). A new file `js/supabase-sync.js` handles all Supabase communication. The rest of the app talks to `game-state.js` as before — sync is invisible.

### Supabase Configuration

A config object at the top of `js/supabase-sync.js`:
```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

These are safe to expose client-side — row-level security (RLS) protects the data.

### Database Schema

**`classes` table:**
- `id` — uuid, primary key, default `gen_random_uuid()`
- `class_code` — text, unique, not null
- `teacher_name` — text, not null
- `teacher_email` — text, not null, CHECK constraint: `teacher_email LIKE '%@edmonds.wednet.edu'`
- `teacher_password_hash` — text, not null
- `created_at` — timestamptz, default `now()`

**`saves` table:**
- `id` — uuid, primary key, default `gen_random_uuid()`
- `class_code` — text, not null, references `classes(class_code)`
- `student_name` — text, not null
- `period` — text, not null
- `save_data` — jsonb, not null
- `current_station` — integer, default 0
- `score` — integer, default 0
- `completed` — boolean, default false
- `created_at` — timestamptz, default `now()`
- `updated_at` — timestamptz, default `now()`
- Unique constraint on `(class_code, student_name, period)`

**Trigger for `updated_at`:**
```sql
CREATE EXTENSION IF NOT EXISTS moddatetime;
CREATE TRIGGER saves_updated_at
  BEFORE UPDATE ON saves
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### Class Code Generation

Class codes are generated **client-side** as 6 uppercase alphanumeric characters (excluding ambiguous chars I, O, 0, 1). On INSERT, if the `unique` constraint on `class_code` rejects the value, the client retries with a new code (up to 5 attempts). With 32^6 = ~1 billion possible codes and a handful of classes, collision probability is negligible.

### Auth Architecture

**Problem:** Supabase RLS cannot compare a submitted password against a stored hash column. RLS policies evaluate against JWT claims, not query parameters.

**Solution:** A Supabase Edge Function (`teacher-auth`) handles teacher login:

1. Teacher submits class code + password to the Edge Function
2. Edge Function looks up the class, verifies password with bcrypt
3. On success, returns a short-lived JWT (1 hour) with claims: `{ role: 'teacher', class_code: 'CLARK3' }`
4. Client creates a new Supabase client instance with the JWT in the `global.headers` option: `createClient(url, anonKey, { global: { headers: { Authorization: 'Bearer ' + token } } })`. This teacher-scoped client is stored in `supabase-sync.js` and used for all dashboard queries.
5. RLS policies check `auth.jwt() ->> 'class_code'` for teacher access

**Teacher registration** also goes through an Edge Function (`teacher-register`):
1. Validates email ends with `@edmonds.wednet.edu` (server-side, not just client)
2. Hashes password with bcrypt
3. Generates class code with collision retry
4. Inserts into `classes` table
5. Returns the class code

### Row-Level Security

**`saves` table:**
- **INSERT:** `true` (any anonymous client can create a save — the class_code FK constraint ensures the class exists)
- **UPDATE:** `true` (upsert is the primary write pattern — the unique constraint scopes it)
- **SELECT (student — own save):** `true` (students select by class_code + name + period in the WHERE clause; they can only retrieve what they know the key for)
- **SELECT (teacher — all saves for a class):** `auth.jwt() ->> 'role' = 'teacher' AND auth.jwt() ->> 'class_code' = class_code`

**`classes` table:**
- **INSERT:** handled by Edge Function only (disable direct inserts via RLS: `false`)
- **SELECT:** `true` (anyone can check if a class code exists — no sensitive data exposed)
- **UPDATE/DELETE:** `auth.jwt() ->> 'role' = 'teacher' AND auth.jwt() ->> 'class_code' = class_code`

**Accepted risk:** Student saves use open INSERT/UPDATE policies. A malicious user could overwrite a student's save if they know the class code, student name, and period. This is acceptable for a classroom tool — the same information is visible on a classroom roster. The class code provides sufficient obscurity.

### Student Flow

**First launch (no save):**
1. Name prompt appears with an additional optional field: **"Class code"** — text input, placeholder "e.g. CLARK3 (ask your teacher)"
2. If a class code is entered, validated against Supabase (does the class exist? — a simple SELECT on `classes`)
3. App also checks if a save already exists for this name+period+class_code combo:
   - If found: asks "Welcome back! Load your saved progress?" with Yes/No
   - If not found: proceeds to fresh start
4. Class code stored in `state.classCode`
5. Game proceeds normally

**During gameplay:**
- Every time `saveGame()` fires, if `state.classCode` is set, it also calls `syncToCloud()` asynchronously
- `syncToCloud()` upserts to the `saves` table, also passing denormalized fields (`current_station`, `score`, `completed`) and `updated_at: new Date().toISOString()`
- If sync fails (offline, Supabase error), it silently fails. Console warning only. localStorage is the source of truth.
- A small cloud icon in the top bar shows sync status: synced (checkmark), syncing (spinner), offline/error (gray cloud with X)

**Day 2, same Chromebook:**
- localStorage has their save. Normal continue. Background sync resumes.

**Day 2, different Chromebook:**
- No localStorage save. Name prompt appears.
- Student enters name + period + class code
- App checks Supabase for a matching save (5-second timeout)
- If found: loads save_data into localStorage and state, continues
- If not found: starts fresh (with a note: "No saved progress found for this name. Starting a new expedition.")
- If timeout/error: starts fresh with a warning: "Couldn't reach the cloud. Your previous progress may load when you're back online." The app retries the cloud check on next `saveGame()` call.

### Teacher Registration

**Create a Class flow:**
1. Click "Teacher Dashboard" on title screen
2. Choose "Create a New Class"
3. Enter: teacher name, email, password
4. Client-side validation: email must end with `@edmonds.wednet.edu` (server-side Edge Function also validates)
5. Call `teacher-register` Edge Function → returns class code
6. Teacher sees their class code and is told to share it with students
7. A teacher can create multiple classes (one per period, or one for all)

**Returning teacher:**
1. Click "Teacher Dashboard"
2. Enter class code + password
3. Call `teacher-auth` Edge Function → returns JWT
4. Dashboard loads with JWT-authenticated requests

### Teacher Dashboard

A new screen within the app (using the existing `showScreen()` pattern).

**Access:** "Teacher Dashboard" link on the title screen, below "Teacher & Student Resources." Prompts for class code + password, or "Create a New Class."

**Two views:**

**Map View (default):**
- The SVG trail map rendered at full width, using the same projection math from `renderers.js` `renderMap()` (not from `trail-game.js` — the main map projection in `renderers.js` is the one used for the educational map and has all 10 station coordinates)
- Student dots plotted at their `current_station` position
- Dots colored by period (predefined palette: Period 1=blue, 2=green, 3=orange, 4=purple, 5=red, 6=teal, 7=pink, 8=gold)
- When multiple students share a station, dots offset slightly in a cluster with a count badge (e.g. "×7")
- Hover a dot → tooltip: student name, station number, score
- Period filter dropdown (All / Period 1 / Period 2 / etc.)
- Legend showing period colors

**Table View:**
- Columns: Name, Period, Station, Score, Status (In Progress / Complete), Last Active
- Sortable by clicking column headers
- Click a row → expands inline to show that student's journal entries (extracted from `save_data.journalEntries`)
- "Export CSV" button for gradebook import (exports: name, period, station, score, completed, last_active)
- Period filter (same dropdown as map view)

**Data refresh:** Fetches from Supabase on load. "Refresh" button for manual re-fetch. No real-time subscriptions.

### Edge Functions

Two Supabase Edge Functions (deployed via Supabase CLI or dashboard):

**`teacher-register`:**
- Input: `{ teacher_name, teacher_email, password }`
- Validates email domain server-side
- Hashes password with bcrypt
- Generates class code (6 chars, retry on collision up to 5 times)
- Inserts into `classes`
- Returns: `{ class_code }` or error

**`teacher-auth`:**
- Input: `{ class_code, password }`
- Looks up class by code
- Verifies password with bcrypt
- On success: signs a JWT with `{ role: 'teacher', class_code }` using Supabase JWT secret, 1-hour expiry
- Returns: `{ token }` or error

### Files Changed

| File | Changes |
|------|---------|
| `js/supabase-sync.js` | New file — Supabase client init, syncToCloud(), loadFromCloud(), class code validation, teacher auth (Edge Function calls) |
| `js/teacher-dashboard.js` | New file — all dashboard logic: auth state (JWT storage), data fetching, map view rendering, table view rendering, CSV export, period filtering. Self-contained module that owns the teacher experience. |
| `js/game-state.js` | Add `classCode` to state, call sync on save |
| `js/game-engine.js` | Add class code field to name prompt, teacher dashboard access (delegates to `teacher-dashboard.js`) |
| `js/renderers.js` | Cloud sync status icon in top bar |
| `css/styles.css` | Dashboard styles (map dots, table, period colors, expandable rows), sync icon styles, teacher registration/login form |
| `index.html` | Supabase CDN script tag, script tags for new JS files, dashboard screen div, teacher dashboard link on title screen |

### New Files

| File | Purpose |
|------|---------|
| `js/supabase-sync.js` | Student-side Supabase communication (sync, load, class validation) |
| `js/teacher-dashboard.js` | Teacher-side logic: auth state (JWT), dashboard rendering, data fetching. Keeps all dashboard complexity out of renderers.js. |
| `js/teacher-dashboard.js` | Teacher dashboard: auth, rendering, data fetching |
| `supabase/functions/teacher-auth/index.ts` | Edge Function: teacher login → JWT |
| `supabase/functions/teacher-register/index.ts` | Edge Function: teacher registration → class code |
| `supabase/migrations/001_create_tables.sql` | Database migration: classes + saves tables, RLS, triggers |

---

## Out of Scope

- Email verification beyond domain check (sufficient for a district tool)
- Real-time live updates on dashboard (manual refresh is fine)
- Student passwords or accounts
- Multi-district support (email domain is hardcoded as a CHECK constraint, can be altered later)
- Grade assignment or LMS integration
- Chat or messaging between teacher and students
- Handling orphaned saves from name changes (acceptable for classroom use)
