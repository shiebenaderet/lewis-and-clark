# Stage 5: Narrative Immersion Overhaul — Implementation Plan

## Goal
Transform the experience from "digital worksheet" to "mystery investigation." Deliver on the title screen's promise: recover lost journals, piece together the story, feel like a detective.

---

## A. Journal Recovery Mechanic — "Recover, Don't Read"

**Current:** Journal entries are fully visible from the start (or hidden only until scenario is answered).
**New:** Journal entries are ALWAYS hidden behind a "locked journal" visual until the challenge is completed. Completing the challenge "recovers" the lost page.

### Changes:
1. **`renderStation()` in renderers.js** — Wrap journal entries in a locked container:
   - Before challenge is completed: show a "torn page" placeholder with a teaser line (first ~15 words of the first journal paragraph, followed by "…the rest is illegible")
   - After challenge is completed: fade in full journals with a "Journal Page Recovered!" banner animation
   - Scenarios (where they exist) remain before journals — answering the scenario shows the "What actually happened" reveal, but the FULL journal text still requires the challenge

2. **`completeChallengeResult()` in renderers.js** — After unlocking discovery, also trigger journal reveal:
   - Smooth fade-in of full journal entries
   - "Journal Page Recovered!" banner (similar styling to discovery banner)
   - Plays into the "you just found something" feeling

3. **CSS** — New `.journal-locked` and `.journal-recovered` styles:
   - Locked: torn paper edge effect, blurred/faded text, padlock icon
   - Recovered: fade-in animation, subtle golden glow border

4. **State** — No new state needed; we reuse `challengesCompleted` to know if journals are unlocked.

### Key detail:
- The scenario still hides journals until answered (existing Stage 2 behavior)
- But even after scenario reveal, journals show the "locked/teaser" state until challenge is done
- This means the flow becomes: context → scenario → challenge → FULL journal unlock
- For stations WITHOUT scenarios: context → challenge → journal unlock

---

## B. Discovery Clue Fragments — "The Evidence Board"

**Current:** Discoveries are generic collectibles ("The Keelboat — a 55-foot vessel...").
**New:** Each discovery includes a "clue fragment" — a short piece of evidence that connects to a bigger picture. At 5 and 10 discoveries, students see how the fragments fit together.

### Changes:
1. **`DISCOVERIES` array in renderers.js** — Add a `clue` field to each discovery:
   ```
   Station 1: "Jefferson's orders mention a water route to the Pacific — the Northwest Passage. Does it exist?"
   Station 2: "Lewis collected a live prairie dog to ship back to Jefferson. Why was cataloging species so important?"
   Station 3: "Jefferson designed specific peace medal ceremonies. What was the political purpose?"
   Station 4: "The Mandan already traded with Europeans. The 'unknown' West wasn't unknown to everyone."
   Station 5: "Sacagawea's baby was born on the expedition. Why would they bring an infant into the wilderness?"
   Station 6: "Lewis compared their boats to Columbus's ships. He saw this as a voyage of world-historical importance."
   Station 7: "The Great Falls forced an 18-mile portage. The 'easy water route' Jefferson hoped for doesn't exist."
   Station 8: "Without Sacagawea recognizing her brother, the expedition would have had no horses — and likely failed."
   Station 9: "The Nez Perce saved the starving expedition. Every major survival moment depended on Native peoples."
   Station 10: "York and Sacagawea voted equally. On the frontier, the rules of 'civilization' didn't always apply."
   ```

2. **Discovery banner** — After "Discovery Unlocked: [Name]", also show the clue fragment in a distinct "evidence" style (e.g., handwritten-style italic, pinned-note look).

3. **Milestone synthesis popups** — At 5/10 discoveries, show a synthesis message:
   - **5 discoveries (Junior Naturalist):** "Pattern emerging: The expedition depended on Native American knowledge, trade, and diplomacy at every turn. Jefferson imagined a scientific mission — but survival required human connections."
   - **10 discoveries (Master Explorer):** "The full picture: Jefferson sent Lewis and Clark to find a water route to the Pacific and claim the land for America. But the 'unknown' West was home to millions. The expedition succeeded not through American superiority, but through the generosity of the Mandan, Shoshone, and Nez Perce peoples. The 'lost journal' you've recovered tells a more complicated story than the one Jefferson expected."

4. **Discovery tracker** — On hover/click of an unlocked discovery icon in the tracker, show its clue fragment in a tooltip.

---

## C. Narrative Variation — Key Stations Feel Different

**Current:** Every station has identical structure.
**New:** 3 key emotional moments get special presentation.

### Changes:
1. **Station 5 (Sacagawea's baby) — "Witness" framing:**
   - Add a special narrative wrapper: "You're about to witness one of the most human moments of the expedition..."
   - After challenge completion, show a brief "character moment" — a callout box about Jean Baptiste's future (he became a world traveler, lived until 1866)

2. **Station 8 (Shoshone reunion) — "Turning Point" framing:**
   - Add a "Turning Point" banner (similar to season banners but with a distinct style)
   - After challenge, show a callout: "Without this moment, the expedition almost certainly fails. No horses means no mountain crossing."

3. **Station 10 (Pacific / The Vote) — "Climax" framing:**
   - Different heading treatment: larger, more dramatic title with "Ocean in View!" styling
   - After challenge, before journal prompts, show a reflective coda: Clark's famous misspelled quote in large, handwritten-style text
   - Frame the final journal prompt differently: "You've recovered the last page. Now write YOUR final report."

4. **CSS** — New `.station-witness`, `.station-turning-point`, `.station-climax` classes with distinct visual treatments (subtle, not overwhelming).

---

## D. Completion Screen — "Report to President Jefferson"

**Current:** Stats dump + quiz + bonus game.
**New:** A narrative resolution that synthesizes the journey.

### Changes:
1. **Reframe completion** — Replace "Journey Complete!" with a two-part ending:

   **Part 1: "The Recovered Journal"**
   - Show a visual summary: 10 stations as a vertical timeline, each with:
     - Station name + date
     - Discovery icon (if unlocked) + clue fragment
     - First line of student's summary (if written)
   - This IS the "pieced together" story the title screen promised
   - Header: "You've recovered all 10 pages of the lost journal. Here's the story they tell:"

   **Part 2: "Your Report to President Jefferson"**
   - Reframe the final test as a narrative: "President Jefferson wants to know what you've learned. Answer his questions:"
   - Same 5 questions, but with a framing wrapper
   - After completing the test, show a "Jefferson's Response" message based on score:
     - 5/5: "Excellent work. You have the makings of a true explorer-scholar."
     - 3-4/5: "A solid report. You've grasped the essential story."
     - 0-2/5: "Jefferson would like you to review the journals more carefully..."

2. **Discovery synthesis** (if 10/10): Show the full "Master Explorer" synthesis from section B above.

3. **Keep existing elements:** Bonus game button, journal export, restart — but move them below the narrative resolution.

---

## E. Light Journal Gating — "Your Turn to Write"

**Current:** Journal entry form is always accessible, completely optional.
**New:** "Continue West" requires at least a brief summary entry.

### Changes:
1. **`renderStation()` navigation section** — When challenge is completed but summary field is empty:
   - Show "Continue West" as a softer locked state: "Write a brief summary before moving on →"
   - NOT fully locked (they can still navigate via map) — just a nudge
   - Once they type anything in the summary field (minimum ~20 characters), the button activates

2. **`saveJournalField()` in game-state.js** — Add a check: if summary field for current station has content, enable the continue button dynamically.

3. **The "nudge" is dismissable** — After 10 seconds, show a small "skip" link below the button. This prevents frustration while encouraging engagement.

---

## File Changes Summary

| File | Changes |
|------|---------|
| `js/renderers.js` | Journal lock/unlock mechanic, discovery clue fragments, milestone synthesis, narrative variation for stations 5/8/10, rebuilt completion screen, journal gating nudge |
| `js/game-engine.js` | Updated `completeExpedition()` with two-part narrative resolution |
| `js/game-state.js` | Minor: helper to check if summary is written |
| `css/styles.css` | Journal locked/recovered styles, evidence clue styling, station-witness/turning-point/climax classes, recovered journal timeline on completion, Jefferson framing |
| `index.html` | Updated completion screen HTML structure, version bump |
| `README.md` | Version bump + changelog |

---

## Implementation Order

1. Journal recovery mechanic (A) — biggest impact, core of the narrative
2. Discovery clue fragments (B) — adds depth to collectibles
3. Narrative variation (C) — makes key moments feel special
4. Completion screen rebuild (D) — delivers the payoff
5. Journal gating nudge (E) — gentle engagement push
6. Validate + version bump + commit + push
