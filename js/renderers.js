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

  const station = STATIONS[index];
  const level = state.level;
  const data = station[level] || station.standard;

  let html = '<div class="station-card">';

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

// === MAP RENDERING ===
function renderMap() {
  const wrap = document.getElementById('map-svg-wrap');

  // Station positions on the map (approximate geographic placement)
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

  // Background
  svg += `<rect width="560" height="350" fill="#f4e8c1"/>`;

  // Simple terrain hints
  svg += `<rect x="350" y="180" width="200" height="170" rx="20" fill="#d4c98a" opacity="0.4"/>`;
  svg += `<polygon points="100,140 130,80 160,130 190,70 220,140 250,90 280,145" fill="#b8a88a" opacity="0.35"/>`;
  svg += `<path d="M 490 290 Q 460 275 420 260 Q 380 240 350 210 Q 320 185 300 165 Q 260 150 220 165 Q 180 155 140 160 Q 100 170 60 180" fill="none" stroke="#5a9bbc" stroke-width="3" stroke-dasharray="6,3" opacity="0.6"/>`;

  // Labels
  svg += `<text x="490" y="310" font-size="9" fill="#8b7355" font-family="Georgia" text-anchor="middle">Missouri River</text>`;
  svg += `<text x="80" y="200" font-size="9" fill="#8b7355" font-family="Georgia" text-anchor="middle">Columbia River</text>`;
  svg += `<text x="200" y="95" font-size="9" fill="#8b7355" font-family="Georgia" text-anchor="middle">Rocky Mountains</text>`;
  svg += `<text x="420" y="310" font-size="9" fill="#8b7355" font-family="Georgia" text-anchor="middle">Great Plains</text>`;
  svg += `<text x="30" y="190" font-size="8" fill="#5a9bbc" font-family="Georgia">Pacific</text>`;

  // Trail path connecting stations
  let pathD = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    pathD += ` L ${positions[i].x} ${positions[i].y}`;
  }
  svg += `<path d="${pathD}" fill="none" stroke="#6b4423" stroke-width="2" stroke-dasharray="5,3" opacity="0.5"/>`;

  // Visited trail (solid)
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

  // Station dots and labels
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

    // Label below
    const lines = pos.label.split('\n');
    lines.forEach((line, li) => {
      svg += `<text x="${pos.x}" y="${pos.y + r + 10 + li * 10}" font-size="7" fill="#5c4033" font-family="Georgia" text-anchor="middle">${line}</text>`;
    });

    svg += '</g>';
  });

  // Compass rose
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
    const station = STATIONS[i];
    const data = station ? (station[state.level] || station.standard) : null;

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
