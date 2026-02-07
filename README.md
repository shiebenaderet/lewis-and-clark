# The Lost Expedition — Retracing Lewis & Clark

An interactive website that turns 10 classroom stations on the Lewis & Clark expedition into an immersive Oregon Trail-inspired experience for students.

## Version

**v0.2.0** — Modular file structure

## What This Is

This project replaces a paper-based station activity (where students walk around the room reading printed primary sources) with a digital experience. Students play as a young historian retracing the Corps of Discovery's route, recovering "lost" journal entries at each stop along the trail.

**Target audience:** 8th grade social studies students

## Features

- **10 stations** with historical context and actual journal entries from Lewis & Clark
- **3 reading levels** togglable at any time:
  - *Easier Vocabulary* — 4th grade reading level, simplified text, vocabulary tooltips
  - *Standard* — 8th grade level (default)
  - *Advanced* — 10th grade level, deeper analysis, fewer scaffolds
- **Interactive trail map** (SVG) with progress tracking
- **Digital journal tracker** — replaces the paper handout (date, author, summary fields)
- **Random trail events** between stations (grizzly bears, storms, mosquitoes, etc.)
- **Reflection questions** at each station
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

**To update station text:** Edit the JSON files in `data/stations/`. Each file has three objects (`beginner`, `standard`, `advanced`) with `title`, `dates`, `context`, `journals`, and `reflection` fields.

**To add trail events:** Edit `data/trail-events.json`. Each event has `icon`, `title`, and `text`.

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
