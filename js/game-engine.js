// ============================================================
// game-engine.js — Core game logic, navigation, initialization
// ============================================================

// === SCREEN MANAGEMENT ===
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function goHome() {
  saveGame();
  showScreen('title-screen');
  updateTitleContinueButton();
}

// === LEVEL MANAGEMENT ===
function setLevel(level) {
  state.level = level;
  document.querySelectorAll('.level-btn, .level-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === level);
  });
  if (document.getElementById('game-screen').classList.contains('active')) {
    renderStation(state.currentStation);
  }
  saveGame();
}

// === VIEW SWITCHING ===
function showView(view) {
  state.currentView = view;
  document.querySelectorAll('.game-body').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-tab'));
  document.getElementById('btn-view-' + view).classList.add('active-tab');

  if (view === 'map') renderMap();
  if (view === 'journal') renderJournalTracker();
  saveGame();
}

// === START GAME ===
function startGame() {
  state.currentStation = 0;
  state.visitedStations = new Set();
  state.journalEntries = {};
  state.score = 0;
  state.challengesCompleted = new Set();
  state.seenEvents = [];
  showSplashScreen();
}

function showSplashScreen() {
  var level = state.level || 'standard';
  var body = document.getElementById('splash-body');
  if (!body) { launchExpedition(); return; }

  var h = '';

  // Section 1: Louisiana Purchase
  h += '<div class="splash-section">';
  h += '<img class="splash-img" src="data/images/splash/louisiana-purchase.jpg" alt="Map of the Louisiana Purchase, 1803">';
  if (level === 'beginner') {
    h += '<p>In 1803, President Thomas Jefferson made the biggest land deal in history. The United States bought a <strong>huge piece of land</strong> from France called the <strong>Louisiana Purchase</strong>. It doubled the size of the country overnight &mdash; but nobody knew what was out there.</p>';
  } else if (level === 'advanced') {
    h += '<p>In 1803, the United States purchased 828,000 square miles of territory from Napoleonic France for $15 million &mdash; roughly 4 cents per acre. The <strong>Louisiana Purchase</strong> doubled the nation&rsquo;s size, but it also deepened a geopolitical crisis: Britain, Spain, and dozens of sovereign Native nations all had claims on the land west of the Mississippi. Jefferson needed intelligence &mdash; maps, resources, diplomacy &mdash; and he needed it fast.</p>';
  } else {
    h += '<p>In 1803, President Thomas Jefferson purchased a vast territory from France called the <strong>Louisiana Purchase</strong>. For $15 million, the United States doubled in size &mdash; but almost nothing was known about this enormous new land. What rivers flowed through it? What peoples lived there? Was there a water route to the Pacific Ocean?</p>';
  }
  h += '</div>';

  // Section 2: The Mission
  h += '<div class="splash-section">';
  h += '<img class="splash-img splash-img-letter" src="data/images/splash/jefferson-letter.jpg" alt="Jefferson\'s letter to Captain Meriwether Lewis, 1803">';
  if (level === 'beginner') {
    h += '<p>Jefferson chose <strong>Captain Meriwether Lewis</strong> and <strong>William Clark</strong> to lead a team of explorers called the <strong>Corps of Discovery</strong>. Their job: travel up the Missouri River, cross the mountains, and find a way to the Pacific Ocean. Along the way, they were to draw maps, write about the animals and plants they found, and meet the Native peoples who lived on the land.</p>';
  } else if (level === 'advanced') {
    h += '<p>Jefferson personally trained <strong>Captain Meriwether Lewis</strong> in botany, medicine, celestial navigation, and ethnography, then sent him to recruit <strong>William Clark</strong> as co-commander. Their orders were precise: map the Missouri River to its source, find the most direct water route to the Pacific, document every species and mineral, record the languages and customs of Native nations, and establish trade relationships. The letter above is Jefferson&rsquo;s personal letter of credit &mdash; a guarantee that the United States government would repay anyone who helped them.</p>';
  } else {
    h += '<p>Jefferson chose <strong>Captain Meriwether Lewis</strong> and <strong>William Clark</strong> to lead a group of about 45 soldiers, boatmen, and explorers called the <strong>Corps of Discovery</strong>. Their mission: follow the Missouri River west, cross the Rocky Mountains, and reach the Pacific Ocean. Jefferson wanted them to make maps, record new plants and animals, and build peaceful relationships with Native American nations along the route.</p>';
  }
  h += '</div>';

  // Section 3: The Journey Ahead
  h += '<div class="splash-section">';
  h += '<img class="splash-img" src="data/images/splash/departure.jpg" alt="The Departure from Wood River, May 14, 1804 &mdash; painting by Gary Lucy">';
  if (level === 'beginner') {
    h += '<p>On <strong>May 14, 1804</strong>, the Corps of Discovery set off from Camp Wood River near St. Louis. They had a big boat called a <strong>keelboat</strong> and two smaller boats called pirogues. The journey ahead would take over two years and cover 8,000 miles of rivers, prairies, mountains, and coastline that no American had ever mapped.</p>';
  } else if (level === 'advanced') {
    h += '<p>On <strong>May 14, 1804</strong>, the expedition launched from Camp Dubois on the Wood River &mdash; a 55-foot keelboat and two pirogues carrying 8 tons of supplies into territory where the best existing maps were blank. Over the next 28 months, they would travel roughly 8,000 miles, cross the Continental Divide, nearly starve in the Bitterroot Mountains, and reach the Pacific &mdash; guided at critical moments by <strong>Sacagawea</strong>, a Lemhi Shoshone woman, and the knowledge of Native peoples whose homelands they crossed.</p>';
  } else {
    h += '<p>On <strong>May 14, 1804</strong>, the expedition launched from Camp Wood River near St. Louis. They loaded a 55-foot keelboat and two smaller boats with supplies and pushed off into the unknown. The journey would take over <strong>two years</strong> and cover <strong>8,000 miles</strong>. They would face grizzly bears, blizzards, starvation, and mountains no American had ever crossed &mdash; but also encounter extraordinary people, places, and wildlife along the way.</p>';
  }
  h += '</div>';

  // Your role
  h += '<div class="splash-role">';
  h += '<p><strong>200 years later, a lost expedition journal has been found in fragments along the trail.</strong></p>';
  h += '<p>Your mission: retrace the route of the Corps of Discovery, recover every lost journal page, and piece together the full story of America&rsquo;s greatest exploration.</p>';
  h += '</div>';

  body.innerHTML = h;
  showScreen('splash-screen');
}

function launchExpedition() {
  showScreen('game-screen');
  showView('station');
  renderStation(0);
  updateStationIndicator();
  updateScoreDisplay();
  saveGame();
}

// === CONTINUE GAME (from save) ===
function continueGame() {
  const saved = loadSave();
  if (!saved) {
    startGame();
    return;
  }

  state.level = saved.level;
  state.currentStation = saved.currentStation;
  state.visitedStations = saved.visitedStations;
  state.journalEntries = saved.journalEntries;
  state.currentView = saved.currentView || 'station';
  state.score = saved.score || 0;
  state.challengesCompleted = saved.challengesCompleted || new Set();
  state.seenEvents = saved.seenEvents || [];
  state.discoveries = saved.discoveries || [];

  // Update level buttons to reflect saved level
  document.querySelectorAll('.level-btn, .level-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === state.level);
  });

  showScreen('game-screen');
  showView(state.currentView);
  renderStation(state.currentStation);
  updateStationIndicator();
  updateScoreDisplay();
}

// === STATION NAVIGATION (gated — only visited stations) ===
function goToStation(index) {
  if (index >= 0 && index < STATIONS.length && state.visitedStations.has(index)) {
    renderStation(index);
  }
}

function travelToStation(index) {
  // Require challenge completion at current station before traveling
  const challengeId = `challenge_${state.currentStation}`;
  if (!state.challengesCompleted.has(challengeId)) return;

  if (TRAIL_EVENTS.length > 0) {
    renderTravelTransition(state.currentStation, index, () => renderStation(index));
  } else {
    renderStation(index);
  }
}

function updateStationIndicator() {
  document.getElementById('station-indicator').textContent =
    `Station ${state.currentStation + 1}`;
}

// === COMPLETION ===
function completeExpedition() {
  const completionText = document.getElementById('completion-text');
  const discCount = state.discoveries.length;

  // Build the "Recovered Journal" timeline
  let timelineHtml = '<div class="recovered-journal">';
  timelineHtml += '<h2 class="recovered-journal-title">The Recovered Journal</h2>';
  timelineHtml += '<p class="recovered-journal-intro">You\u2019ve recovered all 10 pages of the lost journal. Here is the story they tell:</p>';
  timelineHtml += '<div class="recovered-timeline">';
  for (let i = 0; i < STATIONS.length; i++) {
    const s = STATIONS[i];
    const d = s[state.level] || s.standard;
    const disc = state.discoveries.includes(i) && DISCOVERIES[i] ? DISCOVERIES[i] : null;
    const summary = state.journalEntries[`summary_${i}`] || '';
    timelineHtml += '<div class="timeline-entry">';
    timelineHtml += `<div class="timeline-marker">${disc ? disc.icon : '<span class="timeline-number">' + (i + 1) + '</span>'}</div>`;
    timelineHtml += '<div class="timeline-content">';
    timelineHtml += `<div class="timeline-station">${d.title}</div>`;
    timelineHtml += `<div class="timeline-date">${d.dates}</div>`;
    if (disc) {
      timelineHtml += `<div class="timeline-clue"><span class="evidence-pin">&#x1F4CC;</span> ${disc.clue}</div>`;
    }
    if (summary) {
      timelineHtml += `<div class="timeline-summary">&ldquo;${summary.substring(0, 150)}${summary.length > 150 ? '&hellip;' : ''}&rdquo;</div>`;
    }
    timelineHtml += '</div></div>';
  }
  timelineHtml += '</div>';

  // Master Explorer synthesis
  if (discCount >= 10 && typeof MILESTONE_SYNTHESIS !== 'undefined') {
    timelineHtml += '<div class="completion-synthesis"><span class="completion-synthesis-icon">\u{1F3C6}</span> <strong>Master Explorer</strong><br>' + MILESTONE_SYNTHESIS[10] + '</div>';
  } else if (discCount >= 5 && typeof MILESTONE_SYNTHESIS !== 'undefined') {
    timelineHtml += '<div class="completion-synthesis junior"><span class="completion-synthesis-icon">\u{1F3C5}</span> <strong>Junior Naturalist</strong><br>' + MILESTONE_SYNTHESIS[5] + '</div>';
  }
  timelineHtml += '</div>';

  completionText.innerHTML = timelineHtml;
  showScreen('completion-screen');
  // Show final knowledge test (framed as Jefferson report)
  _ftScore = 0;
  _ftAnswered = 0;
  showFinalTest();
  // Show Jefferson's Cipher crossword puzzle
  if (typeof renderFinalCipher === 'function') renderFinalCipher();

  // Level encouragement
  var encourageEl = document.getElementById('level-encouragement');
  if (encourageEl) {
    if (state.level === 'beginner') {
      encourageEl.innerHTML = '<div class="level-encourage">' +
        '<strong>Ready for a bigger challenge?</strong><br>' +
        'You completed the expedition on the Explorer level. ' +
        'Try the <em>Trailblazer</em> level next for deeper questions, tougher word puzzles, and richer journal entries!' +
        '<br><button class="btn-restart" style="margin-top:0.75rem;" onclick="restartAtLevel(\'standard\')">Try Trailblazer Level</button>' +
        '</div>';
    } else if (state.level === 'standard') {
      encourageEl.innerHTML = '<div class="level-encourage">' +
        '<strong>Think you can handle more?</strong><br>' +
        'You conquered the Trailblazer level! ' +
        'The <em>Cartographer</em> level has the hardest challenges, advanced vocabulary, and expects detailed journal writing.' +
        '<br><button class="btn-restart" style="margin-top:0.75rem;" onclick="restartAtLevel(\'advanced\')">Try Cartographer Level</button>' +
        '</div>';
    } else {
      encourageEl.innerHTML = '<div class="level-encourage">' +
        '<strong>You\u2019ve mastered the trail!</strong><br>' +
        'You completed the expedition at the highest level. You\u2019re a true Cartographer of discovery!' +
        '</div>';
    }
  }

  unlockGame();
  clearSave();
}

function restartGame() {
  resetState();
  updateTitleContinueButton();
  showScreen('title-screen');
}

function restartAtLevel(level) {
  resetState();
  state.level = level;
  updateTitleContinueButton();
  startGame();
}

// === SAVE CODE SYSTEM ===
function showSaveCodeUI() {
  const code = generateSaveCode();
  const el = document.getElementById('save-code-area');
  if (!el) return;
  if (!code) {
    el.innerHTML = '<p style="color:#c44;">No save data found. Start playing first!</p>';
    return;
  }
  el.innerHTML = `
    <p style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--ink-light);">Copy this code to save your progress. Paste it on any device to continue.</p>
    <textarea class="save-code-text" id="save-code-output" readonly onclick="this.select()">${code}</textarea>
    <button class="btn-save-code" onclick="copySaveCode()">Copy Code</button>`;
}

function copySaveCode() {
  const ta = document.getElementById('save-code-output');
  if (!ta) return;
  ta.select();
  try {
    navigator.clipboard.writeText(ta.value).then(() => {
      const btn = ta.nextElementSibling;
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy Code'; }, 2000); }
    });
  } catch (e) {
    document.execCommand('copy');
  }
}

function showLoadCodeUI() {
  const el = document.getElementById('save-code-area');
  if (!el) return;
  el.innerHTML = `
    <p style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--ink-light);">Paste a save code to restore your progress.</p>
    <textarea class="save-code-text" id="save-code-input" placeholder="Paste your save code here..."></textarea>
    <button class="btn-save-code" onclick="applySaveCode()">Load Save</button>
    <div id="save-code-error" style="color:#c44;font-size:0.85rem;margin-top:0.4rem;"></div>`;
}

function applySaveCode() {
  const ta = document.getElementById('save-code-input');
  const errEl = document.getElementById('save-code-error');
  if (!ta || !ta.value.trim()) {
    if (errEl) errEl.textContent = 'Please paste a save code first.';
    return;
  }
  const saved = loadSaveCode(ta.value);
  if (!saved) {
    if (errEl) errEl.textContent = 'Invalid save code. Please check and try again.';
    return;
  }
  // Restore state from code
  state.level = saved.level;
  state.currentStation = saved.currentStation;
  state.visitedStations = saved.visitedStations;
  state.journalEntries = saved.journalEntries;
  state.currentView = saved.currentView || 'station';
  state.score = saved.score || 0;
  state.challengesCompleted = saved.challengesCompleted || new Set();
  state.seenEvents = saved.seenEvents || [];
  state.discoveries = saved.discoveries || [];
  saveGame(); // persist to localStorage
  // If all 10 stations visited, unlock the game
  if (state.visitedStations.size >= 10) unlockGame();

  document.querySelectorAll('.level-btn, .level-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === state.level);
  });
  showScreen('game-screen');
  showView(state.currentView);
  renderStation(state.currentStation);
  updateStationIndicator();
  updateScoreDisplay();
}

// === TITLE CONTINUE BUTTON ===
function updateTitleContinueButton() {
  const container = document.getElementById('title-continue');
  if (!container) return;

  let html = '';
  if (hasSave()) {
    const saved = loadSave();
    const stationNum = saved ? saved.currentStation + 1 : 1;
    html += `<button class="btn-continue" onclick="continueGame()">Continue Expedition (Station ${stationNum})</button>`;
    html += `<a class="start-over-link" href="#" onclick="confirmStartOver(); return false;">Start over from the beginning</a>`;
  }
  if (isGameUnlocked()) {
    html += `<button class="btn-continue btn-game-unlocked" onclick="TrailGame.launch()">Play the Corps of Discovery Game</button>`;
  }
  container.innerHTML = html;
  container.style.display = html ? 'block' : 'none';
}

function confirmStartOver() {
  var el = document.querySelector('.start-over-link');
  if (!el) return;
  if (el.dataset.confirming) {
    resetState();
    updateTitleContinueButton();
    startGame();
    return;
  }
  el.dataset.confirming = 'true';
  el.textContent = 'Are you sure? All progress will be lost.';
  el.classList.add('confirming');
  setTimeout(function() {
    if (el.dataset.confirming) {
      delete el.dataset.confirming;
      el.textContent = 'Start over from the beginning';
      el.classList.remove('confirming');
    }
  }, 5000);
}

// === JOURNAL PDF EXPORT ===
function exportJournalPDF() {
  const stationNames = [];
  for (let i = 0; i < STATIONS.length; i++) {
    const s = STATIONS[i];
    const d = s[state.level] || s.standard;
    stationNames.push(d.title);
  }

  let entries = '';
  for (let i = 0; i < STATIONS.length; i++) {
    const date = state.journalEntries[`date_${i}`] || '';
    const author = state.journalEntries[`author_${i}`] || '';
    const summary = state.journalEntries[`summary_${i}`] || '';
    const reflection = state.journalEntries[`reflection_${i}`] || '';
    const visited = state.visitedStations.has(i);

    if (!visited) continue;

    entries += `
      <div class="entry ${i > 0 ? 'page-break' : ''}">
        <div class="entry-header">
          <div class="entry-station">Station ${i + 1}</div>
          <h2 class="entry-title">${stationNames[i]}</h2>
          ${date ? `<div class="entry-date">${date}</div>` : ''}
        </div>
        ${author ? `<div class="entry-field"><span class="field-label">Journal Author(s):</span> ${author}</div>` : ''}
        ${(state.discoveries || []).includes(i) && typeof DISCOVERIES !== 'undefined' && DISCOVERIES[i] ? `<div class="entry-field" style="color:#8b4513;"><span class="field-label">Discovery:</span> ${DISCOVERIES[i].name} &mdash; ${DISCOVERIES[i].desc}</div>` : ''}
        ${summary ? `
          <div class="entry-section">
            <div class="section-label">Summary of Events</div>
            <p>${summary}</p>
          </div>
        ` : '<div class="entry-section"><div class="section-label">Summary of Events</div><p class="empty-field">[No entry recorded]</p></div>'}
        ${reflection ? `
          <div class="entry-section">
            <div class="section-label">Historian&rsquo;s Analysis</div>
            <p>${reflection}</p>
          </div>
        ` : ''}
        <div class="entry-ornament">&mdash; &#x2736; &mdash;</div>
      </div>
    `;
  }

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Expedition Journal - The Lost Expedition</title>
<style>
  @page { size: letter; margin: 0.75in 1in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #2c1810;
    background: #f4e8c1;
    line-height: 1.7;
    font-size: 12pt;
  }
  .cover {
    text-align: center;
    padding: 2.5in 0.5in 1in;
    page-break-after: always;
  }
  .cover-border {
    border: 3px double #8b4513;
    padding: 2rem;
  }
  .cover-year { font-size: 14pt; color: #8b4513; letter-spacing: 0.3em; margin-bottom: 0.5rem; }
  .cover h1 { font-size: 28pt; color: #2c1810; margin-bottom: 0.3rem; }
  .cover-sub { font-size: 14pt; font-style: italic; color: #5c4033; margin-bottom: 1.5rem; }
  .cover-divider { width: 120px; height: 2px; background: #8b4513; margin: 1rem auto; }
  .cover-by { font-size: 11pt; color: #5c4033; margin-top: 1rem; }
  .cover-name { font-size: 16pt; font-weight: bold; color: #2c1810; margin-top: 0.25rem; border-bottom: 1px solid #8b4513; display: inline-block; min-width: 250px; padding-bottom: 2px; }
  .cover-stats { font-size: 10pt; color: #8b4513; margin-top: 2rem; }
  .page-break { page-break-before: always; }
  .entry { margin-bottom: 2rem; }
  .entry-header {
    border-bottom: 2px solid #8b4513;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  .entry-station {
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #8b4513;
  }
  .entry-title { font-size: 18pt; color: #2c1810; margin: 0.2rem 0; }
  .entry-date { font-style: italic; color: #5c4033; font-size: 11pt; }
  .entry-field { font-size: 11pt; color: #5c4033; margin-bottom: 0.75rem; }
  .field-label { font-weight: bold; color: #2c1810; }
  .entry-section { margin-bottom: 1rem; }
  .section-label {
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #8b4513;
    font-weight: bold;
    margin-bottom: 0.3rem;
  }
  .entry-section p {
    text-indent: 1.5em;
    text-align: justify;
  }
  .empty-field { color: #999; font-style: italic; }
  .entry-ornament {
    text-align: center;
    color: #8b4513;
    font-size: 14pt;
    margin-top: 1rem;
    letter-spacing: 0.5em;
  }
  @media print {
    body { background: white; }
  }
</style></head><body>
  <div class="cover">
    <div class="cover-border">
      <div class="cover-year">1804 &ndash; 1806</div>
      <h1>Expedition Journal</h1>
      <div class="cover-sub">Retracing the Journey of Lewis &amp; Clark</div>
      <div class="cover-divider"></div>
      <div class="cover-by">Recorded by</div>
      <div class="cover-name">&nbsp;</div>
      <div class="cover-stats">${state.visitedStations.size} stations visited &bull; ${state.challengesCompleted.size} knowledge checks completed &bull; ${(state.discoveries || []).length} discoveries &bull; ${state.score} points earned</div>
    </div>
  </div>
  ${entries}
</body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
  const loaded = await loadAllData();
  if (loaded) {
    updateTitleContinueButton();
    console.log('The Lost Expedition v0.9.0: Ready');
  }
});
