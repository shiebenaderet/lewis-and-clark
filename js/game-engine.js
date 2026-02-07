// ============================================================
// game-engine.js — Core game logic, navigation, initialization
// ============================================================

// === SCREEN MANAGEMENT ===
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
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
}

// === START GAME ===
function startGame() {
  state.currentStation = 0;
  state.visitedStations = new Set();
  state.journalEntries = {};
  showScreen('game-screen');
  renderStation(0);
  updateStationIndicator();
}

// === STATION NAVIGATION ===
function goToStation(index) {
  if (index >= 0 && index < STATIONS.length) {
    renderStation(index);
  }
}

function travelToStation(index) {
  if (TRAIL_EVENTS.length > 0 && Math.random() < 0.45) {
    const evt = TRAIL_EVENTS[Math.floor(Math.random() * TRAIL_EVENTS.length)];
    showTrailEvent(evt, () => renderStation(index));
  } else {
    renderStation(index);
  }
}

function updateStationIndicator() {
  document.getElementById('station-indicator').textContent =
    `Station ${state.currentStation + 1} of ${STATIONS.length}`;
}

// === COMPLETION ===
function completeExpedition() {
  const completionText = document.getElementById('completion-text');
  const visited = state.visitedStations.size;
  completionText.innerHTML = `
    You've retraced the entire journey of the Corps of Discovery, from Camp Dubois to the Pacific Ocean and back through history!
    <br><br>
    You visited <strong>${visited} of ${STATIONS.length}</strong> stations and recovered the lost journal entries of Lewis &amp; Clark.
    <br><br>
    The expedition covered over 8,000 miles in 2 years, 4 months, and 10 days. They documented 178 plants and 122 animals previously unknown to science, established relations with dozens of Native American nations, and proved that an overland route to the Pacific was possible.
    <br><br>
    <em>"We were now about to penetrate a country at least 2,000 miles in width, on which the foot of civilized man had never trod."</em> &mdash; Captain Meriwether Lewis
  `;
  showScreen('completion-screen');
}

function restartGame() {
  resetState();
  showScreen('title-screen');
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
  const loaded = await loadAllData();
  if (loaded) {
    console.log('The Lost Expedition: Ready');
  }
});
