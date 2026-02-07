// ============================================================
// game-state.js — Game state management
// ============================================================

let state = {
  level: 'standard',
  currentStation: 0,
  visitedStations: new Set(),
  journalEntries: {},
  currentView: 'station'
};

function resetState() {
  state = {
    level: state.level,
    currentStation: 0,
    visitedStations: new Set(),
    journalEntries: {},
    currentView: 'station'
  };
}

function saveReflection(stationIndex, value) {
  state.journalEntries[`reflection_${stationIndex}`] = value;
}

function saveJournalField(stationIndex, field, value) {
  state.journalEntries[`${field}_${stationIndex}`] = value;
}
