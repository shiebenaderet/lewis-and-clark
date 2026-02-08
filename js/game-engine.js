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

// === STATION NAVIGATION ===
function goToStation(index) {
  if (index >= 0 && index < STATIONS.length) {
    renderStation(index);
  }
}

function travelToStation(index) {
  if (TRAIL_EVENTS.length > 0) {
    renderTravelTransition(state.currentStation, index, () => renderStation(index));
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
  const challengesDone = state.challengesCompleted.size;
  completionText.innerHTML = `
    You've retraced the entire journey of the Corps of Discovery, from Camp Dubois to the Pacific Ocean and back through history!
    <br><br>
    You visited <strong>${visited} of ${STATIONS.length}</strong> stations and completed <strong>${challengesDone}</strong> knowledge checks.
    <br>Your score: <strong>${state.score} points</strong>
    <br><br>
    The expedition covered over 8,000 miles in 2 years, 4 months, and 10 days. They documented 178 plants and 122 animals previously unknown to science, established relations with dozens of Native American nations, and proved that an overland route to the Pacific was possible.
    <br><br>
    <em>"We were now about to penetrate a country at least 2,000 miles in width, on which the foot of civilized man had never trod."</em> &mdash; Captain Meriwether Lewis
  `;
  showScreen('completion-screen');
  clearSave();
}

function restartGame() {
  resetState();
  updateTitleContinueButton();
  showScreen('title-screen');
}

// === TITLE CONTINUE BUTTON ===
function updateTitleContinueButton() {
  const container = document.getElementById('title-continue');
  if (!container) return;

  if (hasSave()) {
    const saved = loadSave();
    const stationNum = saved ? saved.currentStation + 1 : 1;
    container.innerHTML = `<button class="btn-continue" onclick="continueGame()">Continue Expedition (Station ${stationNum})</button>`;
    container.style.display = 'block';
  } else {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
  const loaded = await loadAllData();
  if (loaded) {
    updateTitleContinueButton();
    console.log('The Lost Expedition v0.5.0: Ready');
  }
});
