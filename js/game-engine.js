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
  unlockGame();
  clearSave();
}

function restartGame() {
  resetState();
  updateTitleContinueButton();
  showScreen('title-screen');
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
  }
  if (isGameUnlocked()) {
    html += `<button class="btn-continue btn-game-unlocked" onclick="TrailGame.launch()">Play the Corps of Discovery Game</button>`;
  }
  container.innerHTML = html;
  container.style.display = html ? 'block' : 'none';
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
