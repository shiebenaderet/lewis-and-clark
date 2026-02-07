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
  challengesCompleted: new Set()
};

function resetState() {
  state = {
    level: state.level,
    currentStation: 0,
    visitedStations: new Set(),
    journalEntries: {},
    currentView: 'station',
    score: 0,
    challengesCompleted: new Set()
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
function saveGame() {
  try {
    const data = {
      level: state.level,
      currentStation: state.currentStation,
      visitedStations: Array.from(state.visitedStations),
      journalEntries: state.journalEntries,
      currentView: state.currentView,
      score: state.score,
      challengesCompleted: Array.from(state.challengesCompleted),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage may be unavailable (private browsing, etc.)
  }
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      level: data.level || 'standard',
      currentStation: data.currentStation || 0,
      visitedStations: new Set(data.visitedStations || []),
      journalEntries: data.journalEntries || {},
      currentView: data.currentView || 'station',
      score: data.score || 0,
      challengesCompleted: new Set(data.challengesCompleted || []),
      savedAt: data.savedAt
    };
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
