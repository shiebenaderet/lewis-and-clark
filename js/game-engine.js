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

// === STUDENT NAME PROMPT ===
function showNamePrompt(callback) {
  var overlay = document.getElementById('name-prompt-overlay');
  var nameInput = document.getElementById('student-name-input');
  var periodInput = document.getElementById('student-period-input');
  var errorEl = document.getElementById('name-prompt-error');
  var submitBtn = document.getElementById('name-prompt-submit');

  var classCodeInput = document.getElementById('student-class-code-input');

  if (state.studentName) nameInput.value = state.studentName;
  if (state.period) periodInput.value = state.period;
  if (state.classCode && classCodeInput) classCodeInput.value = state.classCode;

  // Show backup button if student already has save data
  var backupDiv = document.getElementById('name-prompt-backup');
  if (backupDiv) {
    backupDiv.style.display = state.studentName ? '' : 'none';
  }

  overlay.classList.add('active');
  nameInput.focus();

  function submit() {
    var name = nameInput.value.trim();
    var period = periodInput.value.trim();
    var classCode = classCodeInput ? classCodeInput.value.trim().toUpperCase() : '';
    if (!name) {
      errorEl.textContent = 'Please enter your name.';
      nameInput.focus();
      return;
    }
    if (!period) {
      errorEl.textContent = 'Please enter your period.';
      periodInput.focus();
      return;
    }
    errorEl.textContent = '';
    state.studentName = name;
    state.period = period;
    state.classCode = classCode;

    if (classCode && typeof validateClassCode === 'function') {
      errorEl.textContent = 'Checking class code...';
      validateClassCode(classCode).then(function(valid) {
        if (!valid) {
          errorEl.textContent = 'Class code not found. Check with your teacher or leave blank to continue without cloud save.';
          state.classCode = '';
          return;
        }
        errorEl.textContent = '';
        // Check for existing cloud save
        if (typeof checkCloudSave === 'function') {
          checkCloudSave(classCode, name, period).then(function(exists) {
            if (exists) {
              errorEl.textContent = '';
              if (confirm('Welcome back! A saved expedition was found for ' + name + '. Load it?')) {
                loadFromCloud(classCode, name, period).then(function(cloudData) {
                  if (cloudData) {
                    var parsed = _parseSaveData(cloudData);
                    state.level = parsed.level;
                    state.currentStation = parsed.currentStation;
                    state.visitedStations = parsed.visitedStations;
                    state.journalEntries = parsed.journalEntries;
                    state.score = parsed.score;
                    state.challengesCompleted = parsed.challengesCompleted;
                    state.seenEvents = parsed.seenEvents;
                    state.discoveries = parsed.discoveries;
                    state.scenariosCompleted = parsed.scenariosCompleted;
                    state.glossary = parsed.glossary;
                    state.wordChallengesWon = parsed.wordChallengesWon;
                    state.completedRuns = parsed.completedRuns || 0;
                  }
                  finishSubmit();
                });
                return;
              }
            }
            finishSubmit();
          });
        } else {
          finishSubmit();
        }
      });
      return;
    }

    finishSubmit();
  }

  function finishSubmit() {
    saveGame();
    updateIdentityDisplay();
    overlay.classList.remove('active');
    submitBtn.removeEventListener('click', submit);
    nameInput.removeEventListener('keydown', keyHandler);
    periodInput.removeEventListener('keydown', keyHandler);
    callback();
  }

  function keyHandler(e) {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  }

  submitBtn.addEventListener('click', submit);
  nameInput.addEventListener('keydown', keyHandler);
  periodInput.addEventListener('keydown', keyHandler);
}

function downloadSaveBackup() {
  var saveData = _buildSaveData();
  var json = JSON.stringify(saveData, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  var name = (state.studentName || 'student').replace(/\s+/g, '-').toLowerCase();
  a.download = 'expedition-save-' + name + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function editStudentInfo() {
  showNamePrompt(function() {
    // Re-render current station to update display
    renderStation(state.currentStation);
    updateStationIndicator();
    updateScoreDisplay();
    // Trigger a cloud sync with new info
    if (state.classCode && typeof syncToCloud === 'function') {
      syncToCloud();
    }
  });
}

function updateIdentityDisplay() {
  var el = document.getElementById('student-identity-display');
  if (!el) return;
  if (state.studentName) {
    el.textContent = '';
    el.appendChild(document.createTextNode('Signed in as: ' + state.studentName + (state.period ? ' \u2014 Period ' + state.period + ' ' : ' ')));
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = '(change)';
    link.style.color = '#5a9bbc';
    link.onclick = function(e) {
      e.preventDefault();
      showNamePrompt(function() {
        updateIdentityDisplay();
        updateScoreDisplay();
      });
    };
    el.appendChild(link);
  } else {
    el.textContent = '';
  }
}

// === START GAME ===
function startGame() {
  state.currentStation = 0;
  state.visitedStations = new Set();
  state.journalEntries = {};
  state.score = 0;
  state.challengesCompleted = new Set();
  state.seenEvents = [];
  if (!state.studentName) {
    showNamePrompt(function() { showSplashScreen(); });
  } else {
    showSplashScreen();
  }
}

function showSplashScreen() {
  var level = state.level || 'standard';
  var body = document.getElementById('splash-body');
  if (!body) { launchExpedition(); return; }

  var h = '';

  // Section 1: Louisiana Purchase
  h += '<div class="splash-section">';
  h += '<img class="splash-img" src="data/images/splash/louisiana-purchase.jpg" alt="Map of the Louisiana Purchase, 1803" onerror="this.style.display=\'none\'">';
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
  h += '<img class="splash-img splash-img-letter" src="data/images/splash/jefferson-letter.jpg" alt="Jefferson\'s letter to Captain Meriwether Lewis, 1803" onerror="this.style.display=\'none\'">';
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
  h += '<img class="splash-img" src="data/images/splash/departure.jpg" alt="The Departure from Wood River, May 14, 1804 &mdash; painting by Gary Lucy" onerror="this.style.display=\'none\'">';
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
  state.scenariosCompleted = saved.scenariosCompleted || new Set();
  state.glossary = saved.glossary || [];
  state.wordChallengesWon = saved.wordChallengesWon || 0;
  state.studentName = saved.studentName || '';
  state.period = saved.period || '';
  state.classCode = saved.classCode || '';
  state.completedRuns = saved.completedRuns || 0;

  // Unlock bonus game if all stations have been visited
  if (state.visitedStations.size >= 10) unlockGame();

  if (!state.studentName) {
    showNamePrompt(function() {
      document.querySelectorAll('.level-btn, .level-toggle button').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.level === state.level);
      });
      showScreen('game-screen');
      showView(state.currentView);
      renderStation(state.currentStation);
      updateStationIndicator();
      updateScoreDisplay();
    });
  } else {
    document.querySelectorAll('.level-btn, .level-toggle button').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.level === state.level);
    });
    showScreen('game-screen');
    showView(state.currentView);
    renderStation(state.currentStation);
    updateStationIndicator();
    updateScoreDisplay();
  }
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

  // On repeat runs, let students skip trail activities
  if (state.completedRuns > 0 && TRAIL_EVENTS.length > 0) {
    showSkipTravelPrompt(state.currentStation, index, () => renderStation(index));
  } else if (TRAIL_EVENTS.length > 0) {
    renderTravelTransition(state.currentStation, index, () => renderStation(index));
  } else {
    renderStation(index);
  }
}

function showSkipTravelPrompt(fromIndex, toIndex, callback) {
  const overlay = document.getElementById('travel-overlay');
  const scene = document.getElementById('travel-scene');

  const stationNames = [
    "Camp Dubois", "Platte River", "Council Bluff", "Fort Mandan", "Fort Mandan",
    "Fort Mandan", "Great Falls", "Camp Fortunate", "Lolo Trail", "Fort Clatsop"
  ];

  const distances = [0, 600, 25, 400, 0, 0, 350, 200, 150, 300, 250];
  const miles = distances[toIndex] || 200;

  // All content is static/hardcoded — no user input in this HTML
  scene.textContent = '';
  var titleDiv = document.createElement('div');
  titleDiv.className = 'travel-title';
  titleDiv.textContent = 'Traveling to ' + stationNames[toIndex] + '...';
  scene.appendChild(titleDiv);

  var distDiv = document.createElement('div');
  distDiv.className = 'travel-distance';
  distDiv.textContent = miles + ' miles to the next station';
  scene.appendChild(distDiv);

  var promptDiv = document.createElement('div');
  promptDiv.className = 'skip-travel-prompt';

  var msgP = document.createElement('p');
  msgP.textContent = 'You\u2019ve traveled this trail before! Would you like to skip the trail activities?';
  promptDiv.appendChild(msgP);

  var buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'skip-travel-buttons';

  var skipBtn = document.createElement('button');
  skipBtn.className = 'btn-skip-travel';
  skipBtn.textContent = 'Skip to Station \u2192';
  skipBtn.onclick = function() {
    overlay.classList.remove('active');
    callback();
  };
  buttonsDiv.appendChild(skipBtn);

  var playBtn = document.createElement('button');
  playBtn.className = 'btn-play-travel';
  playBtn.textContent = 'Play Trail Activities';
  playBtn.onclick = function() {
    overlay.classList.remove('active');
    renderTravelTransition(fromIndex, toIndex, callback);
  };
  buttonsDiv.appendChild(playBtn);

  promptDiv.appendChild(buttonsDiv);
  scene.appendChild(promptDiv);
  overlay.classList.add('active');
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

  state.completedRuns = (state.completedRuns || 0) + 1;
  unlockGame();
  saveGame();
  window._journalExported = false;
  window.addEventListener('beforeunload', _warnUnsavedJournal);
}

function restartGame() {
  if (window._journalExported === false) {
    if (!confirm('You haven\'t saved your journal as a PDF yet!\n\nAre you sure you want to start over?\nA backup of your save data will download automatically.')) return;
    downloadSaveBackup();
  } else if (hasSave()) {
    if (!confirm('This will erase your current expedition!\n\nHave you exported your journal as a PDF?\nA backup of your save data will download automatically.')) return;
    downloadSaveBackup();
  }
  window.removeEventListener('beforeunload', _warnUnsavedJournal);
  clearSave();
  resetState();
  updateTitleContinueButton();
  showScreen('title-screen');
}

function restartAtLevel(level) {
  if (window._journalExported === false) {
    if (!confirm('You haven\'t saved your journal as a PDF yet!\n\nAre you sure you want to start a new expedition?\nA backup of your save data will download automatically.')) return;
    downloadSaveBackup();
  } else if (hasSave()) {
    if (!confirm('This will erase your current expedition and start a new one!\n\nA backup of your save data will download automatically.')) return;
    downloadSaveBackup();
  }
  window.removeEventListener('beforeunload', _warnUnsavedJournal);
  clearSave();
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
  const showCopied = () => {
    const btn = ta.nextElementSibling;
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy Code'; }, 2000); }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ta.value).then(showCopied).catch(() => {
      // Fallback: selection is already active from ta.select(), user can Ctrl+C
      showCopied();
    });
  } else {
    // Legacy fallback — text is already selected
    showCopied();
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
  state.scenariosCompleted = saved.scenariosCompleted || new Set();
  state.glossary = saved.glossary || [];
  state.wordChallengesWon = saved.wordChallengesWon || 0;
  state.completedRuns = saved.completedRuns || 0;
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

// === JOURNAL REVIEW (pre-export station check) ===
let _reviewStations = [];
let _reviewIndex = 0;

function startJournalReview() {
  _reviewStations = [];
  for (let i = 0; i < STATIONS.length; i++) {
    if (state.visitedStations.has(i)) _reviewStations.push(i);
  }
  _reviewIndex = 0;
  document.getElementById('journal-review-modal').style.display = 'flex';
  renderReviewStation();
}

function getStationCheckItems(stationIndex) {
  const items = [];
  if (typeof WORD_BANK !== 'undefined') {
    const stNum = stationIndex + 1;
    (WORD_BANK.terms || []).forEach(t => {
      if (t.station === stNum) {
        const lvl = t[state.level] || t.standard || {};
        items.push({ label: t.word, hint: t.definition || lvl.clue || '', key: t.key });
      }
    });
    (WORD_BANK.phrases || []).forEach(p => {
      if (p.station === stNum) {
        const lvl = p[state.level] || p.standard || {};
        items.push({ label: p.phrase, hint: lvl.clue || '', key: p.key || p.phrase.toLowerCase() });
      }
    });
  }
  return items;
}

function renderReviewStation() {
  const idx = _reviewStations[_reviewIndex];
  const s = STATIONS[idx];
  const d = s[state.level] || s.standard;
  const summary = state.journalEntries['summary_' + idx] || '';
  const reflection = state.journalEntries['reflection_' + idx] || '';
  const checkItems = getStationCheckItems(idx);

  // Progress bar
  const progressEl = document.getElementById('review-progress');
  const progText = document.createElement('span');
  progText.className = 'review-progress-text';
  progText.textContent = 'Station ' + (_reviewIndex + 1) + ' of ' + _reviewStations.length;
  const progBarOuter = document.createElement('div');
  progBarOuter.className = 'review-progress-bar';
  const progBarFill = document.createElement('div');
  progBarFill.className = 'review-progress-fill';
  progBarFill.style.width = ((_reviewIndex + 1) / _reviewStations.length * 100) + '%';
  progBarOuter.appendChild(progBarFill);
  progressEl.textContent = '';
  progressEl.appendChild(progText);
  progressEl.appendChild(progBarOuter);

  // Content
  const contentEl = document.getElementById('review-content');
  const frag = document.createDocumentFragment();

  const stLabel = document.createElement('div');
  stLabel.className = 'review-station-label';
  stLabel.textContent = 'Station ' + (idx + 1);
  frag.appendChild(stLabel);

  const stTitle = document.createElement('h3');
  stTitle.className = 'review-station-title';
  stTitle.textContent = d.title;
  frag.appendChild(stTitle);

  // Summary section — editable textarea
  const sumSec = document.createElement('div');
  sumSec.className = 'review-entry-section';
  const sumLabel = document.createElement('div');
  sumLabel.className = 'review-section-label';
  sumLabel.textContent = 'Your Summary';
  sumSec.appendChild(sumLabel);
  const sumArea = document.createElement('textarea');
  sumArea.className = 'review-textarea';
  sumArea.value = summary;
  sumArea.placeholder = 'Describe the key events at this station\u2026';
  sumArea.addEventListener('input', function() {
    state.journalEntries['summary_' + idx] = sumArea.value;
    saveGame();
    updateReviewChecklist(idx, checkItems);
  });
  sumSec.appendChild(sumArea);
  frag.appendChild(sumSec);

  // Reflection section — editable textarea (if station has a prompt)
  let refArea = null;
  if (d.reflection) {
    const refSec = document.createElement('div');
    refSec.className = 'review-entry-section';
    const refLabel = document.createElement('div');
    refLabel.className = 'review-section-label';
    refLabel.textContent = 'Historian\u2019s Analysis';
    refSec.appendChild(refLabel);
    const refPrompt = document.createElement('p');
    refPrompt.className = 'review-reflection-prompt';
    refPrompt.textContent = d.reflection;
    refSec.appendChild(refPrompt);
    refArea = document.createElement('textarea');
    refArea.className = 'review-textarea';
    refArea.value = reflection;
    refArea.placeholder = 'Think critically and write your analysis\u2026';
    refArea.addEventListener('input', function() {
      state.journalEntries['reflection_' + idx] = refArea.value;
      saveGame();
      updateReviewChecklist(idx, checkItems);
    });
    refSec.appendChild(refArea);
    frag.appendChild(refSec);
  }

  // Checklist
  if (checkItems.length > 0) {
    const checkDiv = document.createElement('div');
    checkDiv.className = 'review-checklist';
    checkDiv.id = 'review-checklist-container';
    const checkTitle = document.createElement('div');
    checkTitle.className = 'review-checklist-title';
    checkTitle.textContent = 'Did you mention\u2026?';
    checkDiv.appendChild(checkTitle);

    const combined = (summary + ' ' + reflection).toLowerCase();
    checkItems.forEach((item, ci) => {
      const termWords = item.key.replace(/_/g, ' ').toLowerCase();
      const found = combined.includes(termWords) || combined.includes(item.label.toLowerCase());
      const lbl = document.createElement('label');
      lbl.className = 'review-check-item' + (found ? ' auto-found' : '');
      lbl.dataset.key = item.key;
      lbl.dataset.label = item.label.toLowerCase();
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      if (found) cb.checked = true;
      cb.readOnly = true;
      lbl.appendChild(cb);
      const termSpan = document.createElement('span');
      termSpan.className = 'review-check-term';
      termSpan.textContent = item.label;
      lbl.appendChild(termSpan);
      const hintSpan = document.createElement('span');
      hintSpan.className = 'review-check-hint';
      hintSpan.textContent = ' \u2014 ' + item.hint;
      lbl.appendChild(hintSpan);
      checkDiv.appendChild(lbl);
    });
    frag.appendChild(checkDiv);
  }

  contentEl.textContent = '';
  contentEl.appendChild(frag);

  // Auto-size textareas to fit content
  [sumArea, refArea].forEach(ta => {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.max(ta.scrollHeight, 60) + 'px';
    ta.addEventListener('input', function() {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  });

  // Actions
  const actionsEl = document.getElementById('review-actions');
  actionsEl.textContent = '';

  if (_reviewIndex > 0) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-review btn-review-prev';
    prevBtn.textContent = '\u2190 Previous';
    prevBtn.addEventListener('click', prevReviewStation);
    actionsEl.appendChild(prevBtn);
  }

  if (_reviewIndex < _reviewStations.length - 1) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-review btn-review-next';
    nextBtn.textContent = 'Next Station \u2192';
    nextBtn.addEventListener('click', nextReviewStation);
    actionsEl.appendChild(nextBtn);
  } else {
    const doneBtn = document.createElement('button');
    doneBtn.className = 'btn-review btn-review-done';
    doneBtn.textContent = 'Looks Good \u2014 Ready to Export!';
    doneBtn.addEventListener('click', finishReview);
    actionsEl.appendChild(doneBtn);
  }

  // Scroll to top of panel
  document.querySelector('.journal-review-panel').scrollTop = 0;
}

function nextReviewStation() {
  if (_reviewIndex < _reviewStations.length - 1) {
    _reviewIndex++;
    renderReviewStation();
  }
}

function prevReviewStation() {
  if (_reviewIndex > 0) {
    _reviewIndex--;
    renderReviewStation();
  }
}

function updateReviewChecklist(stationIdx, checkItems) {
  const container = document.getElementById('review-checklist-container');
  if (!container) return;
  const summary = state.journalEntries['summary_' + stationIdx] || '';
  const reflection = state.journalEntries['reflection_' + stationIdx] || '';
  const combined = (summary + ' ' + reflection).toLowerCase();
  container.querySelectorAll('.review-check-item').forEach(lbl => {
    const termWords = (lbl.dataset.key || '').replace(/_/g, ' ').toLowerCase();
    const labelText = (lbl.dataset.label || '').toLowerCase();
    const found = combined.includes(termWords) || combined.includes(labelText);
    const cb = lbl.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = found;
    lbl.classList.toggle('auto-found', found);
  });
}

function finishReview() {
  document.getElementById('journal-review-modal').style.display = 'none';
  var exportBtn = document.getElementById('btn-export-pdf');
  if (exportBtn) exportBtn.style.display = '';
}

// === JOURNAL PDF EXPORT ===
function exportJournalPDF() {
  // Build discoveries list
  const discList = (state.discoveries || []).sort((a, b) => a - b);
  const discTotal = (typeof DISCOVERIES !== 'undefined') ? DISCOVERIES.length : 10;

  // Build milestone badges
  const milestones = [];
  if (discList.length >= 5) milestones.push('Junior Naturalist');
  if (discList.length >= 10) milestones.push('Master Explorer');

  // Build expedition summary table
  let discoveryNames = '';
  if (discList.length > 0 && typeof DISCOVERIES !== 'undefined') {
    discoveryNames = discList
      .filter(idx => DISCOVERIES[idx])
      .map(idx => DISCOVERIES[idx].icon + ' ' + DISCOVERIES[idx].name)
      .join(' &bull; ');
  }

  const summaryTable = `
    <table class="summary-table">
      <tr>
        <td class="summary-cell">
          <div class="summary-label">Stations</div>
          <div class="summary-value">${state.visitedStations.size} / ${STATIONS.length}</div>
        </td>
        <td class="summary-cell">
          <div class="summary-label">Knowledge Checks</div>
          <div class="summary-value">${state.challengesCompleted.size} / ${STATIONS.length}</div>
        </td>
        <td class="summary-cell">
          <div class="summary-label">Discoveries</div>
          <div class="summary-value">${discList.length} / ${discTotal}</div>
        </td>
        <td class="summary-cell">
          <div class="summary-label">Points</div>
          <div class="summary-value">${state.score}</div>
        </td>
      </tr>
      ${discoveryNames ? `<tr><td colspan="4" class="summary-discoveries">${discoveryNames}</td></tr>` : ''}
      ${milestones.length ? `<tr><td colspan="4" class="summary-milestones">${milestones.join(' &bull; ')}</td></tr>` : ''}
    </table>`;

  // Build journal entries
  let entryCount = 0;
  let entries = '';
  for (let i = 0; i < STATIONS.length; i++) {
    const visited = state.visitedStations.has(i);
    if (!visited) continue;

    const s = STATIONS[i];
    const d = s[state.level] || s.standard;
    const title = d.title;
    const reflectionPrompt = d.reflection || '';
    const date = state.journalEntries[`date_${i}`] || '';
    const author = state.journalEntries[`author_${i}`] || '';
    const summary = state.journalEntries[`summary_${i}`] || '';
    const reflection = state.journalEntries[`reflection_${i}`] || '';

    const separator = entryCount > 0
      ? '<div class="entry-separator">&mdash; &#x2736; &mdash;</div>'
      : '';

    entries += `
      ${separator}
      <div class="entry">
        <div class="entry-header">
          <span class="entry-station">Station ${i + 1}</span>
          <span class="entry-title">${title}</span>
          ${date ? `<span class="entry-date"> &mdash; ${date}</span>` : ''}
          ${author ? `<span class="entry-author"> &mdash; ${author}</span>` : ''}
        </div>
        <div class="entry-section">
          <div class="section-label">Summary of Events</div>
          ${summary
            ? `<p>${summary}</p>`
            : '<p class="empty-field">[No entry recorded]</p>'}
        </div>
        ${reflectionPrompt ? `
          <div class="entry-section">
            <div class="section-label">Historian&rsquo;s Analysis</div>
            <p class="reflection-prompt">${reflectionPrompt}</p>
            ${reflection
              ? `<p>${reflection}</p>`
              : '<p class="empty-field">[No entry recorded]</p>'}
          </div>
        ` : ''}
      </div>
    `;
    entryCount++;
  }

  const printHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Expedition Journal - The Lost Expedition</title>
<style>
  @page { size: letter; margin: 1in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #2c1810;
    background: #f4e8c1;
    line-height: 1.5;
    font-size: 11pt;
    padding: 0.5in;
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #8b4513;
    padding-bottom: 0.4rem;
    margin-bottom: 0.6rem;
  }
  .header-title {
    font-size: 18pt;
    color: #2c1810;
    margin-bottom: 0.1rem;
  }
  .header-sub {
    font-size: 9pt;
    font-style: italic;
    color: #5c4033;
    letter-spacing: 0.15em;
  }
  .header-info {
    font-size: 9pt;
    color: #8b4513;
    margin-top: 0.25rem;
  }
  .summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.8rem;
    border: 1px solid #c9a96e;
  }
  .summary-cell {
    width: 25%;
    text-align: center;
    padding: 0.3rem 0.2rem;
    border-right: 1px solid #c9a96e;
  }
  .summary-cell:last-child { border-right: none; }
  .summary-label {
    font-size: 7pt;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #8b4513;
    font-weight: bold;
  }
  .summary-value {
    font-size: 14pt;
    font-weight: bold;
    color: #2c1810;
  }
  .summary-discoveries {
    font-size: 8pt;
    color: #5c4033;
    text-align: center;
    padding: 0.25rem 0.3rem;
    border-top: 1px solid #c9a96e;
    line-height: 1.6;
  }
  .summary-milestones {
    font-size: 8pt;
    font-weight: bold;
    color: #8b4513;
    text-align: center;
    padding: 0.2rem;
    border-top: 1px solid #c9a96e;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .entry { margin-bottom: 0.8rem; }
  .entry-header {
    margin-bottom: 0.3rem;
  }
  .entry-station {
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #8b4513;
    font-weight: bold;
  }
  .entry-title { font-size: 13pt; color: #2c1810; font-weight: bold; }
  .entry-date { font-style: italic; color: #5c4033; font-size: 9pt; }
  .entry-author { color: #5c4033; font-size: 9pt; }
  .entry-section { margin-bottom: 0.5rem; }
  .section-label {
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #8b4513;
    font-weight: bold;
    margin-bottom: 0.15rem;
  }
  .entry-section p {
    text-align: justify;
  }
  .reflection-prompt {
    font-style: italic;
    color: #5c4033;
    font-size: 10pt;
    margin-bottom: 0.2rem;
  }
  .empty-field { color: #999; font-style: italic; }
  .entry-separator {
    text-align: center;
    color: #8b4513;
    font-size: 10pt;
    margin: 0.6rem 0;
    letter-spacing: 0.3em;
  }
  @media print {
    body { background: white; }
  }
</style></head><body>
  <div class="header">
    <div class="header-title">Expedition Journal</div>
    <div class="header-sub">Retracing the Journey of Lewis &amp; Clark, 1804&ndash;1806</div>
    <div class="header-info">${state.studentName || ''}${state.period ? ' &mdash; Period ' + state.period : ''}</div>
  </div>
  ${summaryTable}
  ${entries}
</body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(printHTML);
    win.document.close();
    setTimeout(() => win.print(), 500);
    window._journalExported = true;
    window.removeEventListener('beforeunload', _warnUnsavedJournal);
    clearSave();
  } else {
    alert('Your browser blocked the PDF window. Please allow pop-ups for this site and try again.');
  }
}

function _warnUnsavedJournal(e) {
  if (!window._journalExported) {
    e.preventDefault();
    e.returnValue = '';
  }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
  const loaded = await loadAllData();
  if (loaded) {
    updateTitleContinueButton();
    updateIdentityDisplay();
    console.log('The Lost Expedition v0.26.0: Ready');
  }
});
