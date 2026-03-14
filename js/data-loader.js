// ============================================================
// data-loader.js — Fetches station and trail event JSON data
// ============================================================

const STATIONS = [];
const TRAIL_EVENTS = [];
let WORD_BANK = { terms: [], phrases: [] };

const TOTAL_STATIONS = 10;

async function loadAllData() {
  const stationPromises = [];
  for (let i = 1; i <= TOTAL_STATIONS; i++) {
    const num = String(i).padStart(2, '0');
    stationPromises.push(
      fetch(`data/stations/station-${num}.json`)
        .then(r => {
          if (!r.ok) throw new Error(`Station ${num}: ${r.status}`);
          return r.json();
        })
    );
  }

  const eventsPromise = fetch('data/trail-events.json')
    .then(r => {
      if (!r.ok) throw new Error(`Trail events: ${r.status}`);
      return r.json();
    });

  const wordBankPromise = fetch('data/word-bank.json')
    .then(r => {
      if (!r.ok) throw new Error(`Word bank: ${r.status}`);
      return r.json();
    });

  try {
    const [stationData, eventData, wordBankData] = await Promise.all([
      Promise.all(stationPromises),
      eventsPromise,
      wordBankPromise
    ]);

    stationData.forEach(s => STATIONS.push(s));
    eventData.forEach(e => TRAIL_EVENTS.push(e));
    WORD_BANK.terms = wordBankData.terms || [];
    WORD_BANK.phrases = wordBankData.phrases || [];

    console.log(`Loaded ${STATIONS.length} stations, ${TRAIL_EVENTS.length} trail events, ${WORD_BANK.terms.length + WORD_BANK.phrases.length} word bank entries`);
    return true;
  } catch (err) {
    console.error('Failed to load game data:', err);
    // Show error on title screen (which is visible at load time)
    var titleContent = document.querySelector('.title-content');
    if (titleContent) {
      var errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding:1.5rem;text-align:center;color:#f4e8c1;max-width:500px;margin:1rem auto;';
      var errorP = document.createElement('p');
      errorP.style.cssText = 'color:#e07070;font-size:1.1rem;margin-bottom:0.5rem;';
      errorP.textContent = 'Error loading expedition data.';
      var helpP = document.createElement('p');
      helpP.style.cssText = 'font-size:0.9rem;opacity:0.8;';
      helpP.textContent = 'This site must be served from a web server (not opened as a local file). Try using GitHub Pages, or run a local server with: python3 -m http.server';
      errorDiv.appendChild(errorP);
      errorDiv.appendChild(helpP);
      titleContent.insertBefore(errorDiv, titleContent.firstChild);
    }
    return false;
  }
}
