# The Lost Expedition — Retracing Lewis & Clark

An interactive website that turns 10 classroom stations on the Lewis & Clark expedition into an immersive Oregon Trail-inspired experience for students.

## Live Demo

**[Play The Lost Expedition](https://shiebenaderet.github.io/lewis-and-clark/)**

## Version

**v0.10.1** — Map UX, game screen polish, historical accuracy

## What This Is

This project replaces a paper-based station activity (where students walk around the room reading printed primary sources) with a digital experience. Students play as a young historian retracing the Corps of Discovery's route, recovering "lost" journal entries at each stop along the trail.

**Target audience:** 8th grade social studies students

## Features

- **10 stations** with historical context and actual journal entries from Lewis & Clark
- **3 reading levels** togglable at any time:
  - *Easier Vocabulary* — 4th grade reading level, simplified text, vocabulary tooltips
  - *Standard* — 8th grade level (default)
  - *Advanced* — 10th grade level, deeper analysis, fewer scaffolds
- **Geographically accurate trail map** (SVG) with real lat/long projection, terrain features, rivers, mountains, coastline, and progress tracking
- **Journey segment details** — hover between stations to see distance, travel time, health toll, and supply status for each leg
- **Guided journal entry prompts** at each station (date, author, summary, analysis) that auto-populate the journal tracker
- **PDF journal export** — antique-styled journal with cover page, printable/saveable for Canvas submission
- **Image galleries** at each station with 2–3 images (scene paintings, portraits, artifacts) from Wikimedia Commons, with carousel navigation
- **Knowledge checks** — multiple-choice challenges at each station with feedback and scoring
- **Interactive travel events** — 29 diverse encounters between stations: choice-based decisions and tap/swat mini-games covering weather, wildlife, navigation, health, Native encounters, and camp life
- **Save/resume** — localStorage persistence so students can pick up where they left off; portable save codes for cross-device transfer
- **Discoveries** — 10 collectible items unlocked by answering Knowledge Checks correctly, logged in journal and PDF export
- **Random trail events** between stations (grizzly bears, storms, mosquitoes, etc.)
- **Reflection questions** at each station
- **Primary source links** at each station to real digitized journal entries (University of Nebraska) and the Corps of Discovery Online Atlas (Lewis & Clark College)
- **Teacher & Student Resources** panel on the title screen linking to external educational sites
- **No build step** — pure static files, no dependencies

## Project Structure

```
lewis-and-clark/
├── index.html                  # Main page (HTML structure only)
├── css/
│   └── styles.css              # All styles (theme, layout, responsive)
├── js/
│   ├── data-loader.js          # Fetches station & event JSON data
│   ├── game-state.js           # State management (level, progress, journal)
│   ├── renderers.js            # DOM rendering (stations, map, tracker)
│   ├── trail-events.js         # Trail event overlay logic
│   ├── trail-game.js           # Corps of Discovery bonus game
│   └── game-engine.js          # Core game logic, navigation, init
├── data/
│   ├── stations/
│   │   ├── station-01.json     # Station 1 content (all 3 levels)
│   │   ├── station-02.json     # Station 2 content
│   │   ├── ...                 # Stations 3–9
│   │   └── station-10.json     # Station 10 content
│   └── trail-events.json       # Random encounter events
├── .nojekyll                   # GitHub Pages config (skip Jekyll)
├── README.md
└── LICENSE
```

### Editing Content

**To update station text:** Edit the JSON files in `data/stations/`. Each file has three objects (`beginner`, `standard`, `advanced`) with `title`, `dates`, `context`, `journals`, `reflection`, `images` (array), and `challenge` fields.

**To add trail events:** Edit `data/trail-events.json`. Each event has `icon`, `title`, `text`, `action` (`quick_choice` or `tap_swat`), and type-specific fields (`choices` array or `swat_target`/`swat_count`/`swat_time`).

**To change styles:** Edit `css/styles.css`. Color variables are at the top in `:root`.

## How to Use

**GitHub Pages (recommended):** Enable Pages in repo settings, set source to the main branch root. The site will be live at `https://your-username.github.io/lewis-and-clark/`.

**Local testing:** Run a local web server (required for JSON fetching):
```
python3 -m http.server
```
Then open `http://localhost:8000` in your browser.

**Note:** Opening `index.html` directly as a file (`file://`) will not work because browsers block `fetch()` requests from local files. You need a web server.

## Changelog

### v0.10.1
- **Map clickability improvements:** Increased spacing between tightly-clustered stations (Fort Mandan group, Platte/Council Bluff). Added clickable midpoint scroll markers on every trail segment for easy access to journey details
- **Game accessible from title screen:** After completing the educational expedition, "Play the Corps of Discovery Game" button appears on the main menu. Game exit returns to title screen
- **Historical distance accuracy:** Corrected leg distances to total ~3,830 miles (matching Clark's journal estimates; was 2,758). Real expedition comparison uses Clark's 4,162-mile one-way calculation
- **Enhanced game-over screen:** Now includes route map showing how far you got, comparison table vs. the real expedition, and decision tracking summary
- **Route summary map on victory screen:** Full completed route shown on victory
- **Title screen alignment fixes:** Centered save code panel, continue/game buttons, and all collapsible sections. Proper flex column layout throughout

### v0.10.0
- **Portable save codes:** Students can generate a save code (base64-encoded game state) and paste it on any device to restore progress — works without authentication or accounts
  - "Get Save Code" and "Enter Save Code" buttons on the title screen
  - One-click copy to clipboard
- **Click-to-fill journal entries:** Clicking dates or authors at a station auto-fills the journal field (appends if already populated). Visual hints (dashed underline, "click to add" text) guide students
- **Discoveries system:** 10 collectible discoveries (one per station) unlocked by answering Knowledge Checks correctly
  - Animated unlock banner with icon and description
  - Discoveries logged in the Journal tracker with a dedicated grid panel
  - Included in PDF journal export (per-entry and cover page stats)
- **Clickable party member bios:** Click any party member in the Corps of Discovery game to see a biographical overlay with full name, birth, when they joined, historical bio, special ability, and fate
- **Harder difficulty tuning:**
  - Negative event effects now scale with difficulty (Trailblazer takes ~1.3x damage, Greenhorn ~0.7x)
  - Party member damage threshold lowered (health < -3 triggers individual injuries, was -5)
  - Travel attrition: party members randomly lose health each leg, scaling with difficulty and leg number (later legs are more dangerous)
  - Lewis and Clark protected from attrition death (but not from event damage)
- **Decision tracking & enhanced victory screen:**
  - Good and bad decisions tracked throughout the game
  - Victory screen shows decision summary with contextual feedback
  - Journey length comparison vs. the real expedition (your days vs. 554 actual days)

### v0.9.5
- **Knowledge bonus questions:** 10 trivia questions (one per stop) tied to the educational station content. Correct answers grant resource bonuses (food, supplies, health, morale), reinforcing what students learned
- **Party member abilities:** Living party members provide unique bonuses:
  - Drouillard (Scout): higher hunting success rate and food yield
  - Sacagawea (Guide): better foraging results and morale boost
  - Sgt. Gass (Carpenter): superior repair and scavenging output
  - Ability hints shown on stop screen so players understand the system
- **Enhanced victory screen:** Side-by-side comparison table with the real Lewis & Clark expedition (days to Pacific, distance, party survival, deaths). Historical context about the actual 554-day journey and Sgt. Floyd's death
- Knowledge bonus score tracked and displayed on victory screen

### v0.9.4
- **Map-based travel animation:** Replaces plain progress bar with SVG mini-map of the full expedition route
  - Animated party dot travels from start to destination along the trail
  - Completed legs shown as solid orange trail, future legs as faint dashes
  - Geographic features: Missouri River, Columbia River, Rocky Mountains, Pacific coastline, Great Plains
  - From/to station markers with labels
  - Reuses equirectangular projection from the educational map

### v0.9.3
- **Fort Mandan Winter Camp:** Special 3-round phase at leg 3 with unique actions — Forge Trade Goods, Learn from Mandan, Build Canoes, Hunt Buffalo, Trade, Rest
- Scripted Jean Baptiste birth in winter round 3 with morale boost
- Spring departure narrative sends keelboat back to Jefferson
- **Scripted historical events:** Sacagawea's reunion with brother Cameahwait at Camp Fortunate, "Ocian in view!" at Pacific arrival
- Nez Perce supply recovery at leg 8 (food, supplies, health boost)
- Variable trading by location: generous at Mandan, tense near Teton, disabled at remote portage legs
- Rebalanced resource consumption across all 10 legs

### v0.9.2
- Added `legs: [min, max]` ranges to all 22 game events for location filtering — no more Pacific events on the Great Plains
- Fixed event shuffle (Fisher-Yates) and added seen-event tracking to prevent repetition
- Party starts with 8 historically accurate core members (Lewis, Clark, York, Drouillard, Ordway, Gass, Floyd, Pryor)
- Sgt. Floyd dies at leg 1 (scripted event); Sacagawea & Charbonneau join at Fort Mandan (leg 3)
- Added "Repair & Scavenge" action at stops (+3-8 supplies, once per stop)
- Renamed "Oregon Trail" to "Corps of Discovery" in all game text and CSS

### v0.9.1
- Discovery intro/clue text now changes with selected reading level (beginner/standard/advanced)
- Mini-game target visibility increased from 1.5s to 2.5s; total game timers roughly doubled (10-12s)
- Fixed trail event repetition: Fisher-Yates shuffle with seen-event tracking (no more bears 6 times)

### v0.9.0
- **Progressive discovery narrative:** Students "search for the lost expedition" with level-aware intro text and clue reveals at each station
- **Station gating:** Must complete Knowledge Check to unlock "Continue West" button
- **Progressive map reveal:** Only visited stations and a dim "?" for the next unvisited stop
- Larger map elements (bigger markers, text, hit areas) for usability
- Persistent HTML info panel on map with "Add to journal" button (replaces SVG tooltip)
- Journal tracker only shows visited stations

### v0.8.0
- **Corps of Discovery bonus game** (unlocks after completing all 10 stations):
  - 10-leg journey from Camp Dubois to Fort Clatsop with resource management
  - 22 historical events with multiple-choice decisions affecting food, health, supplies, morale
  - 8 party members with individual health tracking
  - 3 difficulty levels (Greenhorn, Explorer, Trailblazer) and 3 pace settings
  - Hunt, Rest, Trade, Forage actions at each stop
  - Victory/game-over screens with expedition stats and ranking

### v0.7.1
- Replaced Wikimedia Commons image URLs with local curated images

### v0.7.0
- Replaced "Historian's Reflection" textarea with guided journal entry prompts:
  - Date, journal author, summary, and analysis fields at each station
  - Entries auto-populate the Journal tracker tab and PDF export
- Added antique-styled PDF journal export:
  - Parchment-themed cover page with student name line, score stats
  - Each station entry with date, author, summary, and analysis
  - Opens in new window for Print-to-PDF (Canvas submission ready)
  - Export button on both completion screen and journal tracker tab
- Expanded trail events from 10 to 29 diverse encounters:
  - Wildlife: grizzly bears, buffalo herds, rattlesnakes, eagles, prairie dogs, wolves
  - Weather: thunderstorms, hailstorms, bitter cold, scorching heat
  - Navigation: river forks, rapids, portage, getting lost
  - Health: sickness, mosquitoes, prickly pear, hunting accidents
  - Encounters: Shoshone, Nez Perce, Mandan forge
  - Camp life: stargazing for position, journal writing, equipment repair
- Cleaned up title screen: Teacher Resources now uses native `<details>`/`<summary>` (no JS needed), removed emojis from links, more compact layout
- Primary Sources section at stations now collapsible (less visual clutter)
- Recommended image size for gallery: **800 x 450px (16:9 landscape)**

### v0.6.1
- Fixed broken gallery images: recomputed MD5 hash paths for all Wikimedia Commons URLs
- Replaced unverified image filenames with confirmed ones (Library of Congress illustrations, Peale portraits, Russell/Paxson/Bierstadt paintings)
- Improved gallery error handling: failed images skip to next working slide; gallery hides entirely if all images fail
- Gallery navigation now skips failed slides when using arrows

### v0.6.0
- Integrated [Corps of Discovery Online Atlas](http://lcatlas.lclark.edu/) (Lewis & Clark College):
  - "Explore the Atlas" button on the map view linking to the interactive GIS trail map
  - Per-station link to explore locations in the atlas
- Integrated [Journals of Lewis & Clark](https://lewisandclarkjournals.unl.edu/) (University of Nebraska):
  - "Read the Real Journal" links at each station to the digitized primary source for that date
  - Deep links use the date-based URL pattern (e.g., `lc.jrn.1805-11-07` for "Ocean in view!")
- Added "Explore Primary Sources" section on every station page with journal, atlas, and NPS links
- Added collapsible "Teacher & Student Resources" panel on the title screen with links to:
  - UNL Journals, LC Atlas, NPS Trail Maps, Gilder Lehrman Interactive Map, Lewis & Clark Trail Alliance
- Added atlas link below the trail map with description

### v0.5.0
- Image galleries at each station: 2–3 curated images per station (paintings, portraits, NPS photos) with carousel navigation (arrows + dots)
- Interactive travel events between stations replacing auto-advancing transitions:
  - Choice-based encounters (3 options with good/bad outcomes, historical context in feedback)
  - Tap/swat mini-games (timed target-tapping challenges: mosquitoes, wolves, cactus)
  - Points awarded for each event (+5 good choices, +1 poor choices; +5 successful swats, +2 partial)
  - 2–3 random events per journey leg, with arrival summary and point tally
- Fixed map station hover "bounce" bug (SVG transform scaling from origin)
- Fixed map tooltip text too small and pulsing (separated glow animation layer, increased tooltip size and font sizes)
- All 10 station JSON files updated with `images` arrays (backward-compatible with single `image`)
- Trail events JSON rewritten with 10 interactive events (6 choice-based, 4 tap/swat)

### v0.4.0
- Replaced abstract map with geographically accurate SVG trail map using equirectangular projection
- Station markers placed at real lat/long coordinates (Camp Dubois to Fort Clatsop)
- Terrain features: Rocky Mountains, Great Plains, Pacific coastline, Missouri/Columbia/Mississippi rivers
- Journey segment tooltips: hover trail between stations to see miles, days, health, and supply data
- Fort Mandan cluster handling (stations 4-6 at same location with visual offsets)
- Compass rose, 200-mile scale bar, cumulative journey statistics
- Pulsing glow animation on current station marker
- "Hover for journey details" hint in map legend

### v0.3.0
- Fixed splash screen bug ("Begin the Expedition" button now works)
- Added historical images at each station (Wikimedia Commons, public domain)
- Added multiple-choice knowledge checks with correct/incorrect feedback and scoring
- Added animated travel transitions between stations with progress bar and random trail encounters
- Added localStorage save/resume — students can close and come back without losing progress
- Added "Continue Expedition" button on title screen when a save exists
- Added score tracking in top navigation bar and completion screen
- Added GitHub Pages deployment link to README

### v0.2.0
- Refactored from single HTML file into modular project structure
- CSS extracted to `css/styles.css`
- JavaScript split into 5 focused modules
- Station content moved to individual JSON files (easy to edit)
- Trail events moved to separate JSON file
- Added `.nojekyll` for GitHub Pages compatibility
- Added data-loader with error handling for missing files

### v0.1.0
- Initial build of all 10 stations with 3 reading levels each
- Interactive SVG trail map
- Digital journal/tracker
- Random trail events (10 event types)
- Title screen, completion screen
- Responsive design, print-friendly styles

## License

CC0 1.0 Universal — Public domain. Use freely for any purpose.
