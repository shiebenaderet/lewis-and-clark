// ============================================================
// renderers.js — All DOM rendering functions
// ============================================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// === STATION RENDERING ===
function renderStation(index) {
  if (index < 0 || index >= STATIONS.length) return;
  state.currentStation = index;
  state.visitedStations.add(index);
  updateStationIndicator();
  updateScoreDisplay();
  saveGame();

  const station = STATIONS[index];
  const level = state.level;
  const data = station[level] || station.standard;

  let html = '<div class="station-card">';

  // Hero image
  if (data.image) {
    html += '<div class="station-hero">';
    html += `<img src="${data.image.url}" alt="${escapeHtml(data.image.alt)}" loading="lazy" onerror="this.parentElement.style.display='none'">`;
    if (data.image.caption) {
      html += `<div class="station-hero-caption">${escapeHtml(data.image.caption)}</div>`;
    }
    html += '</div>';
  }

  // Header
  html += '<div class="station-header">';
  html += `<div class="station-number">Station ${index + 1} of ${STATIONS.length}</div>`;
  html += `<h2 class="station-title">${data.title}</h2>`;
  html += `<div class="station-date">${data.dates}</div>`;
  html += '</div>';

  // Body
  html += '<div class="station-body">';

  // Context paragraphs
  html += '<div class="station-context">';
  data.context.forEach(p => {
    html += `<p>${p}</p>`;
  });
  html += '</div>';

  // Journal entries
  if (data.journals && data.journals.length > 0) {
    data.journals.forEach(j => {
      html += '<div class="journal-entry">';
      html += `<div class="journal-date">${j.date}</div>`;
      html += '<div class="journal-text">';
      j.text.forEach(p => {
        html += `<p>${p}</p>`;
      });
      html += '</div>';
      html += `<div class="journal-author">&mdash; ${j.author}</div>`;
      html += '</div>';
    });
  }

  // Interactive challenge
  if (data.challenge) {
    const challengeId = `challenge_${index}`;
    const completed = state.challengesCompleted.has(challengeId);
    html += renderChallenge(data.challenge, index, completed);
  }

  // Reflection question
  if (data.reflection) {
    const savedReflection = state.journalEntries[`reflection_${index}`] || '';
    html += '<div class="station-reflection">';
    html += '<div class="reflection-label">Historian\'s Reflection</div>';
    html += `<p class="reflection-question">${data.reflection}</p>`;
    html += `<textarea class="reflection-textarea" placeholder="Write your thoughts here..." onchange="saveReflection(${index}, this.value)">${savedReflection}</textarea>`;
    html += '</div>';
  }

  // Navigation
  html += '<div class="station-nav">';
  html += `<button class="btn-station-nav" onclick="goToStation(${index - 1})" ${index === 0 ? 'disabled' : ''}>&larr; Previous Station</button>`;
  if (index < STATIONS.length - 1) {
    html += `<button class="btn-station-nav primary" onclick="travelToStation(${index + 1})">Continue West &rarr;</button>`;
  } else {
    html += `<button class="btn-station-nav primary" onclick="completeExpedition()">Complete the Expedition &rarr;</button>`;
  }
  html += '</div>';

  html += '</div>'; // station-body
  html += '</div>'; // station-card

  document.getElementById('station-content').innerHTML = html;
  window.scrollTo(0, 0);
}

// === CHALLENGE RENDERING ===
function renderChallenge(challenge, stationIndex, alreadyCompleted) {
  const challengeId = `challenge_${stationIndex}`;
  let html = `<div class="challenge-box" id="${challengeId}">`;
  html += '<div class="challenge-header">';
  html += '<span class="challenge-icon">&#x1F9ED;</span>';
  html += '<span class="challenge-label">Knowledge Check</span>';
  html += '</div>';
  html += `<p class="challenge-question">${challenge.question}</p>`;

  if (alreadyCompleted) {
    // Already answered — show completed state
    html += '<div class="challenge-options">';
    challenge.options.forEach((opt, i) => {
      const isCorrect = i === challenge.correct;
      html += `<button class="challenge-option ${isCorrect ? 'correct' : ''}" disabled>${opt}</button>`;
    });
    html += '</div>';
    html += `<div class="challenge-feedback show correct">${challenge.feedback_correct}</div>`;
  } else {
    html += '<div class="challenge-options">';
    challenge.options.forEach((opt, i) => {
      html += `<button class="challenge-option" onclick="answerChallenge(${stationIndex}, ${i})">${opt}</button>`;
    });
    html += '</div>';
    html += `<div class="challenge-feedback" id="feedback_${stationIndex}"></div>`;
  }

  html += '</div>';
  return html;
}

function answerChallenge(stationIndex, choiceIndex) {
  const station = STATIONS[stationIndex];
  const data = station[state.level] || station.standard;
  const challenge = data.challenge;
  const challengeId = `challenge_${stationIndex}`;
  const isCorrect = choiceIndex === challenge.correct;

  // Disable all buttons
  const box = document.getElementById(challengeId);
  const buttons = box.querySelectorAll('.challenge-option');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    btn.onclick = null;
    if (i === challenge.correct) {
      btn.classList.add('correct');
    } else if (i === choiceIndex && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });

  // Show feedback
  const feedback = document.getElementById(`feedback_${stationIndex}`);
  if (isCorrect) {
    feedback.textContent = challenge.feedback_correct;
    feedback.className = 'challenge-feedback show correct';
    state.score += 10;
  } else {
    feedback.textContent = challenge.feedback_incorrect;
    feedback.className = 'challenge-feedback show incorrect';
    state.score += 3; // partial credit for trying
  }

  state.challengesCompleted.add(challengeId);
  updateScoreDisplay();
  saveGame();
}

function updateScoreDisplay() {
  const el = document.getElementById('score-display');
  if (el) {
    el.textContent = `${state.score} pts`;
  }
}

// === MAP RENDERING ===
function renderMap() {
  const wrap = document.getElementById('map-svg-wrap');

  const positions = [
    { x: 480, y: 280, label: "Camp Dubois,\nSt. Louis" },
    { x: 400, y: 250, label: "Platte River,\nGreat Plains" },
    { x: 380, y: 210, label: "Council Bluff,\nOmaha" },
    { x: 340, y: 170, label: "Fort Mandan,\nKnife River" },
    { x: 320, y: 160, label: "Fort Mandan\n(Winter)" },
    { x: 280, y: 150, label: "Depart\nFort Mandan" },
    { x: 210, y: 170, label: "Great Falls,\nMissouri" },
    { x: 160, y: 145, label: "Camp Fortunate,\nShoshone" },
    { x: 110, y: 160, label: "Rocky Mountains\nto Columbia R." },
    { x: 50,  y: 175, label: "Fort Clatsop,\nPacific Ocean" }
  ];

  let svg = `<svg viewBox="0 0 560 350" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="560" height="350" fill="#f4e8c1"/>`;
  svg += `<rect x="350" y="180" width="200" height="170" rx="20" fill="#d4c98a" opacity="0.4"/>`;
  svg += `<polygon points="100,140 130,80 160,130 190,70 220,140 250,90 280,145" fill="#b8a88a" opacity="0.35"/>`;
  svg += `<path d="M 490 290 Q 460 275 420 260 Q 380 240 350 210 Q 320 185 300 165 Q 260 150 220 165 Q 180 155 140 160 Q 100 170 60 180" fill="none" stroke="#5a9bbc" stroke-width="3" stroke-dasharray="6,3" opacity="0.6"/>`;

  svg += `<text x="490" y="310" font-size="9" fill="#8b7355" font-family="Georgia" text-anchor="middle">Missouri River</text>`;
  svg += `<text x="80" y="200" font-size="9" fill="#8b7355" font-family="Georgia" text-anchor="middle">Columbia River</text>`;
  svg += `<text x="200" y="95" font-size="9" fill="#8b7355" font-family="Georgia" text-anchor="middle">Rocky Mountains</text>`;
  svg += `<text x="420" y="310" font-size="9" fill="#8b7355" font-family="Georgia" text-anchor="middle">Great Plains</text>`;
  svg += `<text x="30" y="190" font-size="8" fill="#5a9bbc" font-family="Georgia">Pacific</text>`;

  let pathD = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    pathD += ` L ${positions[i].x} ${positions[i].y}`;
  }
  svg += `<path d="${pathD}" fill="none" stroke="#6b4423" stroke-width="2" stroke-dasharray="5,3" opacity="0.5"/>`;

  if (state.visitedStations.size > 1) {
    const visited = Array.from(state.visitedStations).sort((a,b) => a - b);
    let visitedPath = `M ${positions[visited[0]].x} ${positions[visited[0]].y}`;
    for (let i = 1; i < visited.length; i++) {
      if (visited[i] === visited[i-1] + 1) {
        visitedPath += ` L ${positions[visited[i]].x} ${positions[visited[i]].y}`;
      }
    }
    svg += `<path d="${visitedPath}" fill="none" stroke="#d4760a" stroke-width="2.5"/>`;
  }

  positions.forEach((pos, i) => {
    const visited = state.visitedStations.has(i);
    const current = state.currentStation === i;

    let fill = '#6b4423';
    let stroke = '#5c2e0a';
    let r = 7;
    if (visited) { fill = '#f5a623'; stroke = '#d4760a'; }
    if (current) { fill = '#8b1a1a'; stroke = '#ffffff'; r = 9; }

    svg += `<g class="map-station ${visited ? 'visited' : ''} ${current ? 'current' : ''}" onclick="goToStation(${i}); showView('station');" style="cursor:pointer;">`;
    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
    svg += `<text x="${pos.x}" y="${pos.y - r - 4}" font-size="8" fill="#2c1810" font-family="sans-serif" text-anchor="middle" font-weight="bold">${i + 1}</text>`;

    const lines = pos.label.split('\n');
    lines.forEach((line, li) => {
      svg += `<text x="${pos.x}" y="${pos.y + r + 10 + li * 10}" font-size="7" fill="#5c4033" font-family="Georgia" text-anchor="middle">${line}</text>`;
    });

    svg += '</g>';
  });

  svg += `<g transform="translate(520,40)">`;
  svg += `<circle cx="0" cy="0" r="18" fill="none" stroke="#8b7355" stroke-width="0.5"/>`;
  svg += `<line x1="0" y1="-16" x2="0" y2="16" stroke="#8b7355" stroke-width="0.5"/>`;
  svg += `<line x1="-16" y1="0" x2="16" y2="0" stroke="#8b7355" stroke-width="0.5"/>`;
  svg += `<text x="0" y="-20" font-size="9" fill="#5c4033" font-family="Georgia" text-anchor="middle" font-weight="bold">N</text>`;
  svg += `<text x="0" y="28" font-size="8" fill="#8b7355" font-family="Georgia" text-anchor="middle">S</text>`;
  svg += `<text x="22" y="3" font-size="8" fill="#8b7355" font-family="Georgia" text-anchor="middle">E</text>`;
  svg += `<text x="-22" y="3" font-size="8" fill="#8b7355" font-family="Georgia" text-anchor="middle">W</text>`;
  svg += `</g>`;

  svg += '</svg>';
  wrap.innerHTML = svg;
}

// === JOURNAL TRACKER RENDERING ===
function renderJournalTracker() {
  const tbody = document.getElementById('tracker-body');
  let html = '';

  for (let i = 0; i < STATIONS.length; i++) {
    const visited = state.visitedStations.has(i);

    const savedDate = state.journalEntries[`date_${i}`] || '';
    const savedAuthor = state.journalEntries[`author_${i}`] || '';
    const savedSummary = state.journalEntries[`summary_${i}`] || '';

    html += '<tr>';
    html += `<td class="tracker-station-num ${visited ? 'visited' : ''}">${i + 1}</td>`;
    html += `<td><input type="text" value="${escapeHtml(savedDate)}" placeholder="${visited ? 'Enter date(s)...' : '???'}" onchange="saveJournalField(${i}, 'date', this.value)" ${!visited ? 'disabled' : ''}/></td>`;
    html += `<td><input type="text" value="${escapeHtml(savedAuthor)}" placeholder="${visited ? 'Enter author(s)...' : '???'}" onchange="saveJournalField(${i}, 'author', this.value)" ${!visited ? 'disabled' : ''}/></td>`;
    html += `<td><textarea placeholder="${visited ? 'Summarize what happened...' : '???'}" onchange="saveJournalField(${i}, 'summary', this.value)" ${!visited ? 'disabled' : ''}>${escapeHtml(savedSummary)}</textarea></td>`;
    html += '</tr>';
  }

  tbody.innerHTML = html;
}

// === TRAVEL TRANSITION ===
function renderTravelTransition(fromIndex, toIndex, callback) {
  const overlay = document.getElementById('travel-overlay');
  const scene = document.getElementById('travel-scene');

  // Trail segment data (distances in approximate miles between stations)
  const distances = [0, 600, 180, 400, 0, 200, 350, 200, 300, 250];
  const miles = distances[toIndex] || 200;

  // Pick 2-3 random events for the journey
  const journeyEvents = [];
  const numEvents = 2 + Math.floor(Math.random() * 2); // 2-3 events
  const shuffled = [...TRAIL_EVENTS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(numEvents, shuffled.length); i++) {
    journeyEvents.push(shuffled[i]);
  }

  const stationNames = [
    "Camp Dubois", "Platte River", "Council Bluff", "Fort Mandan", "Fort Mandan",
    "Fort Mandan", "Great Falls", "Camp Fortunate", "Rocky Mountains", "Fort Clatsop"
  ];

  let html = `<div class="travel-title">Traveling to ${stationNames[toIndex]}...</div>`;
  html += `<div class="travel-distance">${miles} miles to the next station</div>`;
  html += '<div class="travel-progress"><div class="travel-progress-bar" id="travel-bar"></div></div>';
  html += '<div id="travel-events"></div>';
  html += '<button class="btn-travel-continue" id="travel-continue-btn" disabled onclick="finishTravel()">Arriving...</button>';

  scene.innerHTML = html;
  overlay.classList.add('active');
  window._travelCallback = callback;

  // Animate the journey
  const bar = document.getElementById('travel-bar');
  const eventsContainer = document.getElementById('travel-events');
  const continueBtn = document.getElementById('travel-continue-btn');

  let step = 0;
  const totalSteps = journeyEvents.length;
  const stepDelay = 1200;

  function showNextEvent() {
    if (step < totalSteps) {
      const evt = journeyEvents[step];
      const progress = Math.round(((step + 1) / totalSteps) * 100);
      bar.style.width = progress + '%';

      const eventHtml = `<div class="travel-event">
        <div class="travel-event-emoji">${evt.icon}</div>
        <div class="travel-event-msg"><strong>${evt.title}</strong> ${evt.text}</div>
      </div>`;

      eventsContainer.innerHTML = eventHtml;
      step++;
      setTimeout(showNextEvent, stepDelay + Math.random() * 800);
    } else {
      bar.style.width = '100%';
      continueBtn.disabled = false;
      continueBtn.textContent = 'Arrive at Station ' + (toIndex + 1) + ' \u2192';
    }
  }

  setTimeout(showNextEvent, 600);
}

function finishTravel() {
  document.getElementById('travel-overlay').classList.remove('active');
  if (window._travelCallback) {
    window._travelCallback();
    window._travelCallback = null;
  }
}
