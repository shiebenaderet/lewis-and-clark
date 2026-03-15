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
  discoveries: [],
  glossary: [],
  wordChallengesWon: 0,
  studentName: '',
  period: '',
  classCode: ''
};

function resetState() {
  var savedName = state.studentName;
  var savedPeriod = state.period;
  var savedClassCode = state.classCode;
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
    discoveries: [],
    glossary: [],
    wordChallengesWon: 0,
    studentName: savedName,
    period: savedPeriod,
    classCode: savedClassCode
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
  // Check journal gating when summary is updated
  if (field === 'summary' && typeof checkJournalGate === 'function') {
    checkJournalGate(stationIndex);
  }
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
    glossary: state.glossary || [],
    wordChallengesWon: state.wordChallengesWon || 0,
    studentName: state.studentName || '',
    period: state.period || '',
    classCode: state.classCode || '',
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
    glossary: data.glossary || [],
    wordChallengesWon: data.wordChallengesWon || 0,
    studentName: data.studentName || '',
    period: data.period || '',
    classCode: data.classCode || '',
    savedAt: data.savedAt
  };
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(_buildSaveData()));
  } catch (e) {
    console.warn('Could not save game:', e.name);
    if (e.name === 'QuotaExceededError') {
      var indicator = document.getElementById('score-display');
      if (indicator && !indicator.dataset.saveWarned) {
        indicator.dataset.saveWarned = '1';
        indicator.title = 'Warning: Storage full — use Save Codes to preserve progress';
        indicator.style.outline = '2px solid #c44';
      }
    }
  }
  // Cloud sync (async, non-blocking)
  if (state.classCode && typeof syncToCloud === 'function') {
    syncToCloud();
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
