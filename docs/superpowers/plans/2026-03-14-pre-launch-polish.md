# Pre-Launch Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 12 accessibility, mobile, and UX polish improvements before Monday classroom launch.

**Architecture:** Pure CSS/JS changes to an existing static vanilla JS web app. No build step, no framework, no tests. Changes touch `css/styles.css`, `js/renderers.js`, `js/trail-game.js`, and `index.html`. Each task produces a working commit.

**Tech Stack:** Vanilla JS, CSS3 (animations, media queries), localStorage

**Spec:** `docs/superpowers/specs/2026-03-14-pre-launch-polish-design.md`

**Security note:** This project uses innerHTML throughout for rendering station content from trusted local JSON files. All user input is escaped via the existing `escapeHtml()` function. No untrusted external data is rendered.

---

## Chunk 1: CSS-Only Changes (Tasks 1-4)

These tasks modify only `css/styles.css` and require no JS changes.

### Task 1: Focus Indicators

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Add global focus-visible rule**

Add after the Reset and Base section (after `body` rule, around line 50):

```css
:focus-visible {
  outline: 3px solid var(--campfire-glow);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Update form input focus styles**

Replace the existing `.journal-field-input:focus, .journal-field-textarea:focus` block (around line 847) with:

```css
.journal-field-input:focus-visible,
.journal-field-textarea:focus-visible {
  outline: 3px solid var(--leather);
  outline-offset: 0;
  border-color: var(--leather);
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.12);
}
```

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "a11y: add focus-visible indicators for keyboard navigation"
```

### Task 2: Touch Targets + Mobile Top Bar

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Add mobile touch target overrides**

Add a new responsive section before the word game responsive block (before line ~3958):

```css
@media (max-width: 600px) {
  .nav-btn { padding: 0.5rem 0.75rem; font-size: 0.8rem; }
  .level-toggle button { padding: 0.4rem 0.7rem; font-size: 0.7rem; }
  .gallery-dot {
    width: 10px; height: 10px;
    padding: 17px; margin: -17px 0;
    background-clip: content-box;
    border: none; box-sizing: content-box;
  }
  .gallery-dot.active { border: none; }
  .ordering-arrow { padding: 0.4rem 0.6rem; font-size: 1rem; }
}
```

- [ ] **Step 2: Add top bar mobile layout**

```css
@media (max-width: 500px) {
  #level-toggle { display: none; }
  .home-link { font-size: 0.8rem; }
  .station-indicator { font-size: 0.7rem; }
}
```

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "a11y: mobile touch targets 44px min, hide level toggle on small screens"
```

### Task 3: Completion Celebration (Campfire Glow)

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Update completion screen styles**

Find the `#completion-screen` rule (around line 1107). Update/add:

```css
#completion-screen {
  background: radial-gradient(ellipse at center bottom, #3a1a08 0%, #1a0f08 70%);
}

#completion-screen::before {
  content: '';
  position: fixed;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 400px; height: 150px;
  background: radial-gradient(ellipse at center, rgba(212,118,10,0.25) 0%, transparent 70%);
  animation: campfireGlow 3s ease-in-out infinite;
  pointer-events: none; z-index: 0;
}

@keyframes campfireGlow {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.08); }
}

#completion-screen::after {
  content: '';
  position: fixed;
  bottom: 40px; left: 50%;
  width: 4px; height: 4px;
  background: var(--campfire-glow);
  border-radius: 50%;
  animation: ember 3s ease-out infinite;
  pointer-events: none; z-index: 0;
  box-shadow:
    -30px 10px 0 0 var(--campfire),
    40px -5px 0 0 var(--campfire-glow),
    -60px 15px 0 -1px var(--campfire);
}

@keyframes ember {
  0% { transform: translateY(0) translateX(0); opacity: 1; }
  100% { transform: translateY(-140px) translateX(15px); opacity: 0; }
}
```

Merge with existing `#completion-screen` rule — don't duplicate `display`, `align-items`, etc.

- [ ] **Step 2: Commit**

```bash
git add css/styles.css
git commit -m "polish: campfire glow celebration on completion screen"
```

### Task 4: Score Animation CSS + Image Skeleton CSS

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Add score glow keyframes and class**

```css
@keyframes scoreGlow {
  0% { transform: scale(1); text-shadow: none; }
  30% { transform: scale(1.15); text-shadow: 0 0 12px rgba(245,166,35,0.8), 0 0 24px rgba(245,166,35,0.4); }
  100% { transform: scale(1); text-shadow: none; }
}
.score-display.score-updated {
  animation: scoreGlow 1.2s ease;
}
```

- [ ] **Step 2: Add image skeleton shimmer**

```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.gallery-img-wrap {
  position: relative;
  background: linear-gradient(90deg, #2c1810 25%, #3d2518 50%, #2c1810 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}
.gallery-img-wrap.img-loaded {
  background: none;
  animation: none;
}
```

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "polish: score glow animation CSS, image loading skeleton shimmer"
```

---

## Chunk 2: JS Changes to renderers.js (Tasks 5-9)

### Task 5: Scenario Keyboard Handlers + Color-Blind Feedback Icons

**Files:**
- Modify: `js/renderers.js`

- [ ] **Step 1: Add keyboard handler to scenario choices**

Find line ~590. Change the scenario choice div from:
```js
html += `<div class="scenario-choice" onclick="answerScenario(${stationIndex}, ${i})" tabindex="0" role="button">`;
```
To:
```js
html += `<div class="scenario-choice" onclick="answerScenario(${stationIndex}, ${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();answerScenario(${stationIndex}, ${i})}" tabindex="0" role="button">`;
```

- [ ] **Step 2: Add icons to completeChallengeResult feedback**

In `completeChallengeResult()` (~line 1155), change:
- `feedback.textContent = challenge.feedback_correct;` → `feedback.textContent = '\u2705 ' + challenge.feedback_correct;`
- `feedback.textContent = challenge.feedback_incorrect;` → `feedback.textContent = '\u274C ' + challenge.feedback_incorrect;`

- [ ] **Step 3: Add icons to scenario feedback**

In `answerScenario()` (~line 634), change:
- `'That matches history!'` → `'\u2705 That matches history!'`
- `'Interesting choice!'` → `'\u274C Interesting choice!'`

- [ ] **Step 4: Add icons to final test feedback**

In `answerFinalTest()` (~line 242), change:
- `'Correct!'` → `'\u2705 Correct!'`
- `'Not quite \u2014 the correct answer is highlighted above.'` → `'\u274C Not quite \u2014 the correct answer is highlighted above.'`

- [ ] **Step 5: Add icons to travel event choice results**

In `handleTravelChoice()` (~line 2154), change the result div to include icons:
- `${choice.good ? '+5' : '+1'}` → `${choice.good ? '\u2705 +5' : '\u274C +1'}`

- [ ] **Step 6: Commit**

```bash
git add js/renderers.js
git commit -m "a11y: scenario keyboard handlers, color-blind feedback icons"
```

### Task 6: Score Animation JS + Image Loading JS

**Files:**
- Modify: `js/renderers.js`

- [ ] **Step 1: Update updateScoreDisplay to trigger animation**

Replace the `updateScoreDisplay()` function (~line 1367):

```js
function updateScoreDisplay() {
  const el = document.getElementById('score-display');
  if (el) {
    el.textContent = `${state.score} pts`;
    el.classList.remove('score-updated');
    void el.offsetWidth;
    el.classList.add('score-updated');
    el.addEventListener('animationend', function() {
      el.classList.remove('score-updated');
    }, { once: true });
  }
}
```

- [ ] **Step 2: Add onload to gallery images**

Find gallery image rendering (~line 306). Add `onload="this.closest('.gallery-img-wrap').classList.add('img-loaded')"` to the `<img>` tag, alongside the existing `onerror`.

- [ ] **Step 3: Commit**

```bash
git add js/renderers.js
git commit -m "polish: score glow animation trigger, image skeleton onload"
```

### Task 7: Mobile Journal Tracker (Stacked Cards)

**Files:**
- Modify: `js/renderers.js`, `css/styles.css`

- [ ] **Step 1: Rewrite renderJournalTracker for mobile card support**

Replace the `renderJournalTracker()` function (~line 1952) with a version that checks `window.innerWidth <= 600`. Below 600px, render `.tracker-card` divs with labeled fields. Above 600px, render the existing `<tr>` table rows. On mobile, hide the `<table>` and insert cards into a `#tracker-cards` container created dynamically. Keep the discoveries panel and field guide rendering at the bottom unchanged.

Key details:
- Card markup: `.tracker-card` > `.tracker-card-header` (station N: title) + labeled inputs/textareas
- Same `onchange` handlers as existing table cells
- Same `escapeHtml()` calls on values

- [ ] **Step 2: Add tracker card CSS to styles.css**

```css
.tracker-card {
  background: linear-gradient(160deg, var(--parchment) 0%, var(--parchment-dark) 100%);
  border: 1px solid var(--leather);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}
.tracker-card-header {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--leather-dark);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(139,69,19,0.2);
}
.tracker-card-label {
  display: block;
  font-family: var(--font-ui);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ink-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0.5rem 0 0.2rem;
}
.tracker-card input,
.tracker-card textarea {
  width: 100%;
  padding: 0.5rem 0.6rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  border: 1px solid var(--parchment-dark);
  border-radius: 4px;
  background: rgba(255,255,255,0.5);
  color: var(--ink);
}
.tracker-card textarea {
  min-height: 60px;
  resize: vertical;
}
```

- [ ] **Step 3: Commit**

```bash
git add js/renderers.js css/styles.css
git commit -m "mobile: stacked card layout for journal tracker below 600px"
```

### Task 8: Vocab Tooltip Tap-to-Toggle

**Files:**
- Modify: `js/renderers.js`, `css/styles.css`

- [ ] **Step 1: Add delegated click handler at end of renderers.js**

Vocab-word spans are in JSON data files as raw HTML, so we use event delegation rather than inline onclick:

```js
// === VOCAB TOOLTIP TAP-TO-TOGGLE ===
document.addEventListener('click', function(e) {
  var vocabWord = e.target.closest('.vocab-word');
  if (vocabWord) {
    var wasActive = vocabWord.classList.contains('active');
    document.querySelectorAll('.vocab-word.active').forEach(function(w) {
      w.classList.remove('active');
    });
    if (!wasActive) {
      vocabWord.classList.add('active');
    }
    e.stopPropagation();
  } else {
    document.querySelectorAll('.vocab-word.active').forEach(function(w) {
      w.classList.remove('active');
    });
  }
});
```

- [ ] **Step 2: Add CSS for active state**

After the existing `.vocab-word:hover .vocab-tooltip` rule (~line 672), add:

```css
.vocab-word.active .vocab-tooltip {
  display: block;
}
```

- [ ] **Step 3: Commit**

```bash
git add js/renderers.js css/styles.css
git commit -m "a11y: vocab tooltip tap-to-toggle for mobile"
```

### Task 9: Map Scroll Hint

**Files:**
- Modify: `index.html`, `css/styles.css`

- [ ] **Step 1: Add hint text to map view in index.html**

Inside `.map-container`, just before `<div class="map-svg-wrap"`, add:

```html
<p class="map-scroll-hint">Scroll left and right to explore the full trail</p>
```

- [ ] **Step 2: Add CSS**

```css
.map-scroll-hint {
  display: none;
  text-align: center;
  font-family: var(--font-ui);
  font-size: 0.75rem;
  color: var(--ink-light);
  font-style: italic;
  margin: 0.5rem 0;
  opacity: 0.7;
}
@media (max-width: 700px) {
  .map-scroll-hint { display: block; }
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html css/styles.css
git commit -m "mobile: map horizontal scroll hint for small screens"
```

---

## Chunk 3: Trail Game Save Persistence (Task 10)

### Task 10: Trail Game Save Persistence

**Files:**
- Modify: `js/trail-game.js`

- [ ] **Step 1: Add save/load/clear functions inside the TrailGame IIFE**

Before the `// --- Public API ---` comment (~line 1561), add:

```js
const TG_SAVE_KEY = 'lost-expedition-trail-game';

function saveTrailGame() {
  if (!gs) return;
  try {
    localStorage.setItem(TG_SAVE_KEY, JSON.stringify({
      difficulty: gs.difficulty, currentLeg: gs.currentLeg,
      food: gs.food, health: gs.health, supplies: gs.supplies, morale: gs.morale,
      party: gs.party, journal: gs.journal, totalDays: gs.totalDays,
      phase: gs.phase, eventIndex: gs.eventIndex
    }));
  } catch (e) {}
}

function loadTrailGame() {
  try {
    var raw = localStorage.getItem(TG_SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearTrailGameSave() {
  try { localStorage.removeItem(TG_SAVE_KEY); } catch (e) {}
}
```

- [ ] **Step 2: Add saveTrailGame() calls**

Add `saveTrailGame();` at the end of: `travel()`, `doAction()`, `handleEvent()`, `advanceWinter()`.

- [ ] **Step 3: Clear save on game end**

Add `clearTrailGameSave();` at the start of `renderVictory()` and `renderGameOver()`.

- [ ] **Step 4: Modify launch() to check for saved game**

Replace `launch()` in the public API to check `loadTrailGame()`. If a save exists with a non-start phase, show a resume prompt card with "Resume Expedition" and "Start Fresh" buttons.

- [ ] **Step 5: Add resumeGame() and startFresh() to public API**

`resumeGame()`: load saved data into `gs` via `newGameState()` then override fields, render `renderStop()`.
`startFresh()`: call `clearTrailGameSave()` then `this.init()`.

- [ ] **Step 6: Commit**

```bash
git add js/trail-game.js
git commit -m "feat: trail game save/load persistence with resume prompt"
```

---

## Chunk 4: Version Bump (Task 11)

### Task 11: Version Bump + Push

**Files:**
- Modify: `index.html`, `js/game-engine.js`, `README.md`

- [ ] **Step 1: Update version strings to v0.22.0**

In `index.html`: change `v0.21.0` to `v0.22.0`.
In `js/game-engine.js`: change console log version to `v0.22.0`.

- [ ] **Step 2: Add README changelog entry**

Update version line and add `### v0.22.0` entry summarizing all 12 improvements.

- [ ] **Step 3: Commit and push**

```bash
git add index.html js/game-engine.js README.md
git commit -m "v0.22.0: pre-launch polish — accessibility, mobile, UX improvements"
git push origin main
```
