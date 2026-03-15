# Pre-Launch Polish: Accessibility, Mobile & UX Improvements

**Date:** 2026-03-14
**Status:** Approved
**Target:** v0.22.0 — ship before Monday classroom launch

## Summary

12 improvements to make the site fully accessible, mobile-friendly, and polished before student use. All changes are CSS/JS only — no data file changes, no new HTML screens.

## Design Decisions

- **Completion celebration:** Campfire glow (radial gradient + floating embers, CSS-only)
- **Score animation:** Campfire glow (scale + warm text-shadow, CSS-only)
- **Mobile journal tracker:** Stacked cards below 600px (not collapsible rows)

---

## 1. Focus Indicators

**Files:** `css/styles.css`

Add global `:focus-visible` with `--campfire-glow` (#f5a623) outline, 3px solid, 2px offset. Override for journal form inputs to use `--leather` with box-shadow. Ensures keyboard-navigating students see where they are.

## 2. Touch Targets (Mobile)

**Files:** `css/styles.css`

In `@media (max-width: 600px)`:
- `.nav-btn` — padding to `0.5rem 0.75rem` minimum
- `.level-toggle button` — padding to `0.4rem 0.7rem`
- `.gallery-dot` — keep 10px visual dot, add padding for 44px hit area
- `.ordering-arrow` — padding to `0.4rem 0.6rem`, font-size `1rem`

## 3. Scenario Keyboard Handlers

**Files:** `js/renderers.js`

Add `onkeydown` to scenario choice divs (line ~588) for Enter and Space keys, calling `answerScenario()`. Matches existing `onclick` pattern.

## 4. Image Loading Skeletons

**Files:** `css/styles.css`, `js/renderers.js`

CSS shimmer animation on `.gallery-img-wrap` using dark brown palette (`#2c1810` to `#3d2518`). Add `onload` to gallery `<img>` elements to add a class that hides the shimmer. Pure CSS animation with minimal JS.

## 5. Mobile Journal Tracker (Stacked Cards)

**Files:** `js/renderers.js`, `css/styles.css`

In `renderJournalTracker()`, below 600px viewport, render each visited station as a vertical `.tracker-card` instead of a table row. Fields: station header, date, author, summary, analysis. Desktop table unchanged. Same `onchange` handlers.

## 6. Score Animation (Campfire Glow)

**Files:** `js/renderers.js`, `css/styles.css`

In `updateScoreDisplay()`, add `score-updated` class that triggers `@keyframes scoreGlow` — scale to 1.15x with warm orange `text-shadow`, then return. Remove class on `animationend` so it re-triggers on next score change.

## 7. Completion Celebration (Campfire Glow)

**Files:** `css/styles.css`

On `#completion-screen`:
- `background: radial-gradient(ellipse at center bottom, #3a1a08 0%, #1a0f08 70%)`
- `::before` pseudo-element for pulsing glow at bottom
- 3-4 CSS-only floating ember particles using `@keyframes` (small dots rising and fading)
- Applied to existing markup, no HTML changes

## 8. Vocab Tooltip Tap-to-Toggle

**Files:** `js/renderers.js` (or new function in existing JS), `css/styles.css`

Add `toggleVocabTip(el)` function that toggles `.active` class on vocab-word spans. CSS: `.vocab-word.active .vocab-tooltip` shown. Document click listener closes open tooltips. Works on both mobile tap and desktop click alongside existing hover.

## 9. Trail Game Save Persistence

**Files:** `js/trail-game.js`

New localStorage key `lost-expedition-trail-game`. Save state after each action. On `TrailGame.launch()`, check for saved game and offer resume vs. "Start Fresh". Clear save on completion/game over.

## 10. Mobile Top Bar Layout

**Files:** `css/styles.css`

At `@media (max-width: 500px)`: hide `#level-toggle` (students set level on title screen, rarely change mid-game). Tighten nav button sizing. Prevents the 9-element bar from wrapping awkwardly on 375px screens.

## 11. Map Horizontal Scroll Hint

**Files:** `index.html` or `js/renderers.js`

Add a one-line helper text above or below the map SVG on mobile: "Scroll left and right to explore the full trail." Only visible below 700px viewport. CSS `display:none` on desktop.

## 12. Color-Blind Correctness Feedback

**Files:** `js/renderers.js`

Prefix feedback text with icons: checkmark for correct, X for incorrect. Applied to:
- Challenge feedback (multiple choice, fill-in-blank, map click, ordering, image match)
- Scenario feedback
- Final test feedback
- Trail event choice results

Ensures correctness is communicated by shape, not just color.

---

## Files Changed

| File | Changes |
|------|---------|
| `css/styles.css` | Focus indicators, touch targets, shimmer, score glow, completion celebration, tracker cards, top bar mobile, scroll hint |
| `js/renderers.js` | Scenario keyboard, image onload, mobile tracker, score animation, vocab toggle, feedback icons, scroll hint |
| `js/trail-game.js` | Save/load persistence |

## Out of Scope

- Font inconsistency in trail-game.css (already handled by OpenDyslexic override)
- Drag-and-drop touch support (arrow buttons provide mobile fallback)
- Trail event overlay focus trapping (Escape key handler already added in v0.21.0)
