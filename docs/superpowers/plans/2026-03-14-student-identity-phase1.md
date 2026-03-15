# Student Identity (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add student name/period identity to the app — stored locally, shown in-game, auto-filled on journal PDF — so every student's work is identifiable before the Monday launch.

**Architecture:** Add `studentName` and `period` to the existing state object. Show a modal prompt before the game starts. Display name in the top bar. Auto-fill the PDF cover page and entry headers. No external dependencies.

**Tech Stack:** Vanilla JS, CSS3, localStorage (existing stack)

**Spec:** `docs/superpowers/specs/2026-03-14-student-identity-cloud-saves-design.md` (Phase 1 section)

---

## Chunk 1: State + Prompt + PDF (Tasks 1-4)

### Task 1: Add studentName and period to game state

**Files:**
- Modify: `js/game-state.js`

- [ ] **Step 1: Add fields to state object**

Find the `let state = {` block (line 7). Add after `wordChallengesWon: 0`:

```js
  studentName: '',
  period: ''
```

- [ ] **Step 2: Add fields to resetState, preserving identity**

Replace `resetState()` (lines 22-38):

```js
function resetState() {
  var savedName = state.studentName;
  var savedPeriod = state.period;
  state = {
    level: state.level,
    currentStation: 0,
    visitedStations: new Set(),
    journalEntries: {},
    currentView: 'station',
    score: 0,
    challengesCompleted: new Set(),
    scenariosCompleted: new Set(),
    seenEvents: [],
    discoveries: [],
    glossary: [],
    wordChallengesWon: 0,
    studentName: savedName,
    period: savedPeriod
  };
  clearSave();
}
```

- [ ] **Step 3: Add fields to _buildSaveData**

In `_buildSaveData()` (line ~55), add after the `wordChallengesWon` line:

```js
    studentName: state.studentName || '',
    period: state.period || '',
```

- [ ] **Step 4: Add fields to _parseSaveData**

In `_parseSaveData()` (line ~73), add after the `wordChallengesWon` line:

```js
    studentName: data.studentName || '',
    period: data.period || '',
```

- [ ] **Step 5: Commit**

```bash
git add js/game-state.js
git commit -m "feat: add studentName and period to game state with identity preservation on reset"
```

### Task 2: Name prompt modal (HTML + CSS)

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`

- [ ] **Step 1: Add modal markup to index.html**

Add this BEFORE the `<!-- JAVASCRIPT -->` comment at the bottom of `index.html` (before the script tags):

```html
<!-- ============================================================
     STUDENT NAME PROMPT
     ============================================================ -->
<div class="name-prompt-overlay" id="name-prompt-overlay">
  <div class="name-prompt-box">
    <h2 class="name-prompt-title">Identify Yourself, Explorer</h2>
    <p class="name-prompt-subtitle">Your name will appear on your expedition journal.</p>
    <div class="name-prompt-field">
      <label for="student-name-input">Your name (first name, last initial)</label>
      <input type="text" id="student-name-input" class="name-prompt-input" placeholder="e.g. Sarah T." autocomplete="off" maxlength="40">
    </div>
    <div class="name-prompt-field">
      <label for="student-period-input">Period</label>
      <input type="text" id="student-period-input" class="name-prompt-input" placeholder="e.g. 3" autocomplete="off" maxlength="10">
    </div>
    <div class="name-prompt-error" id="name-prompt-error"></div>
    <button class="btn-start name-prompt-btn" id="name-prompt-submit">Begin</button>
  </div>
</div>
```

- [ ] **Step 2: Add modal CSS to styles.css**

Add near the other overlay/modal styles:

```css
/* --- Student name prompt modal --- */
.name-prompt-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}
.name-prompt-overlay.active {
  display: flex;
}
.name-prompt-box {
  background: linear-gradient(160deg, var(--parchment) 0%, var(--parchment-dark) 100%);
  border: 2px solid var(--leather);
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: fadeIn 0.4s ease;
}
.name-prompt-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  color: var(--ink);
  margin-bottom: 0.3rem;
}
.name-prompt-subtitle {
  font-size: 0.85rem;
  color: var(--ink-light);
  margin-bottom: 1.25rem;
  font-style: italic;
}
.name-prompt-field {
  text-align: left;
  margin-bottom: 0.75rem;
}
.name-prompt-field label {
  display: block;
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-light);
  margin-bottom: 0.25rem;
}
.name-prompt-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  font-family: var(--font-body);
  font-size: 1rem;
  border: 1px solid var(--parchment-dark);
  border-radius: 6px;
  background: rgba(255,255,255,0.6);
  color: var(--ink);
}
.name-prompt-input:focus-visible {
  outline: 3px solid var(--leather);
  outline-offset: 0;
  border-color: var(--leather);
}
.name-prompt-error {
  font-size: 0.8rem;
  color: var(--danger);
  min-height: 1.2em;
  margin-bottom: 0.5rem;
}
.name-prompt-btn {
  width: 100%;
  margin-top: 0.5rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: student name prompt modal markup and styles"
```

### Task 3: Name prompt logic in game-engine.js

**Files:**
- Modify: `js/game-engine.js`

- [ ] **Step 1: Add showNamePrompt function**

Add before the `startGame()` function (before line 43):

```js
// === STUDENT NAME PROMPT ===
function showNamePrompt(callback) {
  var overlay = document.getElementById('name-prompt-overlay');
  var nameInput = document.getElementById('student-name-input');
  var periodInput = document.getElementById('student-period-input');
  var errorEl = document.getElementById('name-prompt-error');
  var submitBtn = document.getElementById('name-prompt-submit');

  // Pre-fill if state already has values
  if (state.studentName) nameInput.value = state.studentName;
  if (state.period) periodInput.value = state.period;

  overlay.classList.add('active');
  nameInput.focus();

  function submit() {
    var name = nameInput.value.trim();
    var period = periodInput.value.trim();
    if (!name) {
      errorEl.textContent = 'Please enter your name.';
      nameInput.focus();
      return;
    }
    if (!period) {
      errorEl.textContent = 'Please enter your period.';
      periodInput.focus();
      return;
    }
    errorEl.textContent = '';
    state.studentName = name;
    state.period = period;
    saveGame();
    overlay.classList.remove('active');
    submitBtn.removeEventListener('click', submit);
    nameInput.removeEventListener('keydown', keyHandler);
    periodInput.removeEventListener('keydown', keyHandler);
    callback();
  }

  function keyHandler(e) {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  }

  submitBtn.addEventListener('click', submit);
  nameInput.addEventListener('keydown', keyHandler);
  periodInput.addEventListener('keydown', keyHandler);
}
```

- [ ] **Step 2: Modify startGame to check for name**

Replace `startGame()` (lines 43-51):

```js
function startGame() {
  state.currentStation = 0;
  state.visitedStations = new Set();
  state.journalEntries = {};
  state.score = 0;
  state.challengesCompleted = new Set();
  state.seenEvents = [];
  if (!state.studentName) {
    showNamePrompt(function() { showSplashScreen(); });
  } else {
    showSplashScreen();
  }
}
```

- [ ] **Step 3: Modify continueGame to check for name**

In `continueGame()`, after all state restoration (after line 134, `state.wordChallengesWon = ...`), add the name fields:

```js
  state.studentName = saved.studentName || '';
  state.period = saved.period || '';
```

Then, replace the block starting at line 144 (`showScreen('game-screen');`) with:

```js
  // Prompt for name if this is a pre-Phase-1 save without identity
  if (!state.studentName) {
    showNamePrompt(function() {
      showScreen('game-screen');
      showView(state.currentView);
      renderStation(state.currentStation);
      updateStationIndicator();
      updateScoreDisplay();
    });
  } else {
    showScreen('game-screen');
    showView(state.currentView);
    renderStation(state.currentStation);
    updateStationIndicator();
    updateScoreDisplay();
  }
```

- [ ] **Step 4: Commit**

```bash
git add js/game-engine.js
git commit -m "feat: name prompt logic in startGame and continueGame"
```

### Task 4: PDF auto-fill with student name

**Files:**
- Modify: `js/game-engine.js`

- [ ] **Step 1: Auto-fill PDF cover name**

In `exportJournalPDF()`, find the line (line ~486):
```
      <div class="cover-name">&nbsp;</div>
```
Replace with:
```
      <div class="cover-name">${state.studentName || ''}${state.period ? ' &mdash; Period ' + state.period : ''}</div>
```

- [ ] **Step 2: Add student name to each journal entry header in PDF**

Find the `entries +=` template where each entry is built. After the line with `<div class="entry-station">Station ${i + 1}</div>` (line ~373), add:

```
          <div style="font-size:9pt;color:#8b4513;text-align:right;float:right;">${state.studentName || ''}${state.period ? ' — Period ' + state.period : ''}</div>
```

- [ ] **Step 3: Commit**

```bash
git add js/game-engine.js
git commit -m "feat: auto-fill student name on journal PDF cover and entry headers"
```

---

## Chunk 2: In-Game Display + Edit (Tasks 5-7)

### Task 5: Show student name in top bar

**Files:**
- Modify: `index.html`
- Modify: `js/renderers.js`

- [ ] **Step 1: Add name display element to top bar**

In `index.html`, find the `.top-bar-left` div (line ~82). After the score-display span, add:

```html
      <span class="student-name-display" id="student-name-display"></span>
```

- [ ] **Step 2: Add CSS for name display**

Add to `css/styles.css`:

```css
.student-name-display {
  font-family: var(--font-ui);
  font-size: 0.75rem;
  color: var(--parchment-dark);
  opacity: 0.7;
  margin-left: 0.5rem;
}
@media (max-width: 500px) {
  .student-name-display { display: none; }
}
```

- [ ] **Step 3: Update student name display when score updates**

In `js/renderers.js`, find `updateScoreDisplay()`. Add after the score text update (before the animation code):

```js
    var nameEl = document.getElementById('student-name-display');
    if (nameEl && state.studentName) {
      nameEl.textContent = state.studentName;
    }
```

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css js/renderers.js
git commit -m "feat: show student name in top bar"
```

### Task 6: Edit name link in Save & Load panel

**Files:**
- Modify: `index.html`
- Modify: `js/game-engine.js`

- [ ] **Step 1: Add identity display to Save & Load panel**

In `index.html`, find the `<div class="save-code-controls">` inside the save-code-panel details (line ~40). Replace the opening `<p>` description with:

```html
        <div id="student-identity-display" style="margin-bottom:0.75rem;font-size:0.85rem;color:var(--parchment-dark);"></div>
        <p style="margin:0 0 0.75rem;font-size:0.85rem;color:var(--parchment-dark);">Use save codes to transfer your progress between devices, or bookmark your place.</p>
```

- [ ] **Step 2: Add function to update identity display**

In `js/game-engine.js`, add after the `showNamePrompt` function:

```js
function updateIdentityDisplay() {
  var el = document.getElementById('student-identity-display');
  if (!el) return;
  if (state.studentName) {
    el.textContent = 'Signed in as: ' + state.studentName + (state.period ? ' — Period ' + state.period : '') + ' ';
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = '(change)';
    link.style.color = 'var(--river-light)';
    link.onclick = function(e) {
      e.preventDefault();
      showNamePrompt(function() {
        updateIdentityDisplay();
        updateScoreDisplay();
      });
    };
    el.appendChild(link);
  } else {
    el.textContent = '';
  }
}
```

- [ ] **Step 3: Call updateIdentityDisplay on page load**

In the `DOMContentLoaded` handler (line ~502), after `updateTitleContinueButton()`, add:

```js
    updateIdentityDisplay();
```

- [ ] **Step 4: Also call it after name prompt completes**

In the `submit()` function inside `showNamePrompt`, add after `saveGame()`:

```js
    updateIdentityDisplay();
```

- [ ] **Step 5: Commit**

```bash
git add index.html js/game-engine.js
git commit -m "feat: show student identity in save panel with edit link"
```

### Task 7: Version bump + push

**Files:**
- Modify: `index.html`, `js/game-engine.js`, `README.md`

- [ ] **Step 1: Update version to v0.23.0**

In `index.html`: change `v0.22.0` to `v0.23.0`.
In `js/game-engine.js`: change console log to `v0.23.0`.

- [ ] **Step 2: Add README changelog entry**

Update version line to `v0.23.0` and add changelog entry:

```markdown
### v0.23.0 — Student Identity
- **Student name prompt** — on first launch, students enter their name (first name, last initial) and period. Stored in localStorage and save codes. Identity preserved across game restarts.
- **PDF auto-fill** — journal export cover page now shows "Recorded by: Sarah T. — Period 3" instead of a blank line. Student name also appears in the header of each entry page.
- **In-game display** — student name shown in the top bar alongside the score
- **Edit link** — students can change their name in the Save & Load panel on the title screen
- **Pre-Phase-1 save migration** — students with existing saves from v0.22.0 or earlier are prompted for their name once on next continue
```

- [ ] **Step 3: Commit and push**

```bash
git add index.html js/game-engine.js README.md
git commit -m "v0.23.0: student identity — name prompt, PDF auto-fill, in-game display"
git push origin main
```
