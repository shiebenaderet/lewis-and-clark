// ============================================================
// game-state.js — Game state management with localStorage persistence
// ============================================================

const SAVE_KEY = 'lost-expedition-save';

let state = {
  level: 'standard',
  currentStation: 0,
  visitedStations: new Set(),
  journalEntries: {},
  currentView: 'station',
  score: 0,
  challengesCompleted: new Set(),
  scenariosCompleted: new Set(),
  seenEvents: [],
  discoveries: []
};

function resetState() {
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
    discoveries: []
  };
  clearSave();
}

function saveReflection(stationIndex, value) {
  state.journalEntries[`reflection_${stationIndex}`] = value;
  saveGame();
}

function saveJournalField(stationIndex, field, value) {
  state.journalEntries[`${field}_${stationIndex}`] = value;
  saveGame();
}

// === LOCALSTORAGE PERSISTENCE ===
function _buildSaveData() {
  return {
    level: state.level,
    currentStation: state.currentStation,
    visitedStations: Array.from(state.visitedStations),
    journalEntries: state.journalEntries,
    currentView: state.currentView,
    score: state.score,
    challengesCompleted: Array.from(state.challengesCompleted),
    scenariosCompleted: Array.from(state.scenariosCompleted),
    seenEvents: state.seenEvents || [],
    discoveries: state.discoveries || [],
    savedAt: new Date().toISOString()
  };
}

function _parseSaveData(data) {
  return {
    level: data.level || 'standard',
    currentStation: data.currentStation || 0,
    visitedStations: new Set(data.visitedStations || []),
    journalEntries: data.journalEntries || {},
    currentView: data.currentView || 'station',
    score: data.score || 0,
    challengesCompleted: new Set(data.challengesCompleted || []),
    scenariosCompleted: new Set(data.scenariosCompleted || []),
    seenEvents: data.seenEvents || [],
    discoveries: data.discoveries || [],
    savedAt: data.savedAt
  };
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(_buildSaveData()));
  } catch (e) {
    // localStorage may be unavailable (private browsing, etc.)
  }
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return _parseSaveData(JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

// === PORTABLE SAVE CODES ===
function generateSaveCode() {
  try {
    const json = JSON.stringify(_buildSaveData());
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    return null;
  }
}

function loadSaveCode(code) {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = JSON.parse(json);
    // Basic validation — must have visitedStations array
    if (!data || !Array.isArray(data.visitedStations)) return null;
    return _parseSaveData(data);
  } catch (e) {
    return null;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
}

function hasSave() {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch (e) {
    return false;
  }
}

// === GAME UNLOCK TRACKING ===
const GAME_UNLOCK_KEY = 'lost-expedition-game-unlocked';

function unlockGame() {
  try { localStorage.setItem(GAME_UNLOCK_KEY, '1'); } catch (e) {}
}

function isGameUnlocked() {
  try { return localStorage.getItem(GAME_UNLOCK_KEY) === '1'; } catch (e) { return false; }
}
