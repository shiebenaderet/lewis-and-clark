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

// === SEGMENT DATA: distance, time, health & supply toll between stations ===
const SEGMENT_DATA = [
  null, // no segment before station 0
  { miles: 600, days: 67, dateRange: "May 14 \u2013 Jul 20, 1804",
    terrain: "Missouri River upstream",
    health: "Good health overall, adjusting to river life",
    supplies: "Full provisions, hunting along the way",
    toll: "Boils, sunburn, ticks. One man court-martialed for desertion." },
  { miles: 25, days: 14, dateRange: "Jul 20 \u2013 Aug 3, 1804",
    terrain: "Plains along the Missouri",
    health: "Mosquitoes causing constant misery",
    supplies: "Adequate provisions, trading with Oto and Missouri",
    toll: "Swarms of mosquitoes. First diplomacy with Native nations." },
  { miles: 400, days: 84, dateRange: "Aug 3 \u2013 Oct 26, 1804",
    terrain: "Upper Missouri through Dakota territory",
    health: "Sgt. Charles Floyd dies (Aug 20) \u2014 likely appendicitis",
    supplies: "Trading with Arikara nation for corn and beans",
    toll: "Only death of the expedition. Tense standoff with Teton Sioux." },
  { miles: 0, days: 7, dateRange: "Oct 26 \u2013 Nov 2, 1804",
    terrain: "Building Fort Mandan near Knife River villages",
    health: "Crew exhausted from months of travel",
    supplies: "Traded with Mandan and Hidatsa for winter provisions",
    toll: "Beginning of brutal winter. Hired Charbonneau and Sacagawea." },
  { miles: 0, days: 156, dateRange: "Nov 2, 1804 \u2013 Apr 7, 1805",
    terrain: "Wintering at Fort Mandan",
    health: "Frostbite common in \u221245\u00b0F temps. Sacagawea gives birth (Feb 11).",
    supplies: "Forge operating, built canoes for spring departure",
    toll: "Several men frostbitten. Teeth cracking from cold. Men sent back with specimens." },
  { miles: 350, days: 67, dateRange: "Apr 7 \u2013 Jun 13, 1805",
    terrain: "Upper Missouri through the breaks",
    health: "Grizzly bear encounters, near-drownings in flash floods",
    supplies: "Hunting bison and elk, provisions strong",
    toll: "Multiple grizzly attacks. Sacagawea nearly swept away in flash flood with her baby." },
  { miles: 200, days: 60, dateRange: "Jun 13 \u2013 Aug 12, 1805",
    terrain: "Great Falls portage, 18 miles overland",
    health: "Exhaustion, prickly pear cactus through moccasins, hailstorms",
    supplies: "Iron boat experiment failed; need horses desperately",
    toll: "Month-long portage. Men limping from cactus. Mosquitoes and gnats relentless." },
  { miles: 150, days: 10, dateRange: "Aug 12 \u2013 Aug 22, 1805",
    terrain: "Three Forks to Camp Fortunate, Shoshone territory",
    health: "Improving morale after finding Sacagawea's people",
    supplies: "Acquired 29 horses from Shoshone",
    toll: "Near-starvation before finding Shoshone. Incredible luck: chief was Sacagawea's brother." },
  { miles: 300, days: 32, dateRange: "Sep 1 \u2013 Oct 6, 1805",
    terrain: "Bitterroot Mountains via Lolo Trail",
    health: "Near-starvation, eating horses, candles, and portable soup",
    supplies: "Almost nothing left; Nez Perce saved expedition with food",
    toll: "Worst stretch of the expedition. Snow, no game, men collapsing. Nez Perce rescue." },
  { miles: 250, days: 40, dateRange: "Oct 6 \u2013 Nov 15, 1805",
    terrain: "Clearwater to Columbia River to the Pacific",
    health: "Dysentery from diet change to salmon and roots",
    supplies: "Built new canoes, running dangerous rapids",
    toll: "Fleas, rain, spoiled food. But on Nov 7: 'Ocean in view! O! the joy!'" }
];

// === MAP RENDERING (Geographically Accurate) ===
function renderMap() {
  const wrap = document.getElementById('map-svg-wrap');

  // --- Geographic station data (real lat/lon) ---
  const mapStations = [
    { lat: 38.8, lon: -90.1,  label: "Camp Dubois", sublabel: "St. Louis" },
    { lat: 41.0, lon: -96.0,  label: "Platte River", sublabel: "Great Plains" },
    { lat: 41.3, lon: -96.0,  label: "Council Bluff", sublabel: "Omaha" },
    { lat: 47.3, lon: -101.4, label: "Fort Mandan", sublabel: "Knife River" },
    { lat: 47.3, lon: -101.4, label: "Fort Mandan", sublabel: "Winter Camp" },
    { lat: 47.3, lon: -101.4, label: "Depart", sublabel: "Fort Mandan" },
    { lat: 47.5, lon: -111.3, label: "Great Falls", sublabel: "Missouri" },
    { lat: 45.9, lon: -112.5, label: "Camp Fortunate", sublabel: "Shoshone" },
    { lat: 46.5, lon: -115.5, label: "Lolo Trail", sublabel: "Rocky Mtns" },
    { lat: 46.1, lon: -123.9, label: "Fort Clatsop", sublabel: "Pacific Ocean" }
  ];

  // --- Equirectangular projection ---
  const PAD = 2.0;
  const latMin = 36.5;
  const latMax = 49.5;
  const lonMin = -126.5;
  const lonMax = -87.5;
  const midLat = (latMin + latMax) / 2;
  const cosLat = Math.cos(midLat * Math.PI / 180);

  const svgW = 900;
  const lonRange = (lonMax - lonMin) * cosLat;
  const latRange = latMax - latMin;
  const svgH = Math.round(svgW * (latRange / lonRange));

  function proj(lat, lon) {
    const x = ((lon - lonMin) * cosLat / lonRange) * svgW;
    const y = ((latMax - lat) / latRange) * svgH;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }

  // Project station positions (with Fort Mandan offsets for stations 4-6)
  const positions = mapStations.map((s, i) => {
    const p = proj(s.lat, s.lon);
    // Offset co-located Fort Mandan stations (3, 4, 5)
    if (i === 3) { p.x -= 15; p.y += 8; }
    if (i === 5) { p.x += 15; p.y += 8; }
    return { ...p, ...s };
  });

  let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="font-family:Georgia,serif;">`;

  // --- Layer 1: Background ---
  svg += `<rect width="${svgW}" height="${svgH}" fill="#f4e8c1"/>`;

  // Subtle parchment texture with cross-hatching
  svg += `<defs>`;
  svg += `<pattern id="parch" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="none"/><path d="M0,0 L4,4 M4,0 L0,4" stroke="#d4c08a" stroke-width="0.15" opacity="0.3"/></pattern>`;
  svg += `</defs>`;
  svg += `<rect width="${svgW}" height="${svgH}" fill="url(#parch)"/>`;

  // --- Great Plains region (subtle fill) ---
  const gp1 = proj(49, -96); const gp2 = proj(49, -105);
  const gp3 = proj(37, -105); const gp4 = proj(37, -96);
  svg += `<polygon points="${gp1.x},${gp1.y} ${gp2.x},${gp2.y} ${gp3.x},${gp3.y} ${gp4.x},${gp4.y}" fill="#d4c98a" opacity="0.3"/>`;

  // --- Rocky Mountains (ridge polygon) ---
  const mtnPts = [
    [49, -109], [48.5, -111], [47.5, -113], [46.5, -114.5],
    [45, -114], [44, -112.5], [43, -111], [42, -110.5],
    [41, -110], [40, -109], [39, -108],
    [39, -106.5], [40, -107.5], [41, -108], [42, -109],
    [43, -109.5], [44, -110.5], [45, -112], [46, -112.5],
    [47, -111.5], [48, -109.5], [49, -107.5]
  ].map(p => proj(p[0], p[1]));
  svg += `<polygon points="${mtnPts.map(p => p.x+','+p.y).join(' ')}" fill="#b8a88a" opacity="0.35"/>`;

  // Mountain peak marks
  const peaks = [[47.5, -113.5], [46, -114], [44.5, -113.5], [43, -111.5], [41.5, -110]];
  peaks.forEach(pk => {
    const p = proj(pk[0], pk[1]);
    svg += `<polygon points="${p.x},${p.y-8} ${p.x-5},${p.y+3} ${p.x+5},${p.y+3}" fill="#9a8a6a" opacity="0.5"/>`;
    svg += `<polygon points="${p.x},${p.y-8} ${p.x-2},${p.y-2} ${p.x+2},${p.y-2}" fill="#c8b898" opacity="0.6"/>`;
  });

  // --- Pacific coastline ---
  const coast = [
    [49, -123], [48.5, -124.5], [47.5, -124.3], [46.5, -124],
    [46, -123.8], [45.5, -124], [44, -124.2], [43, -124.5], [42, -124.5],
    [41, -124.2], [40, -124.3], [39, -123.8], [38, -123.5], [37, -122.5]
  ].map(p => proj(p[0], p[1]));
  let coastPath = `M ${coast[0].x},${coast[0].y}`;
  for (let i = 1; i < coast.length; i++) {
    coastPath += ` L ${coast[i].x},${coast[i].y}`;
  }
  // Ocean fill (west of coast)
  svg += `<path d="${coastPath} L 0,${svgH} L 0,0 L ${coast[0].x},${coast[0].y}" fill="#c8dce8" opacity="0.4"/>`;
  svg += `<path d="${coastPath}" fill="none" stroke="#5a9bbc" stroke-width="2" opacity="0.7"/>`;

  // --- Missouri River (approximate path) ---
  const missouri = [
    [38.6, -90.2], [38.8, -91.5], [39.0, -92.8], [39.1, -94.5],
    [39.3, -95.3], [40.0, -95.7], [41.0, -96.0], [41.8, -96.5],
    [42.5, -97.3], [43.0, -98.5], [43.8, -99.5], [44.5, -100.2],
    [46.0, -100.5], [47.0, -101.0], [47.3, -101.4],
    [47.8, -104.0], [48.0, -106.0], [47.8, -108.5],
    [47.5, -110.5], [47.5, -111.3],
    [46.8, -111.5], [46.2, -111.8], [45.9, -112.0]
  ].map(p => proj(p[0], p[1]));
  let riverPath = `M ${missouri[0].x},${missouri[0].y}`;
  for (let i = 1; i < missouri.length; i++) {
    const prev = missouri[i-1];
    const curr = missouri[i];
    const cx = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * 3;
    const cy = (prev.y + curr.y) / 2 + (Math.random() - 0.5) * 3;
    riverPath += ` Q ${cx},${cy} ${curr.x},${curr.y}`;
  }
  svg += `<path d="${riverPath}" fill="none" stroke="#5a9bbc" stroke-width="2.5" stroke-dasharray="6,2" opacity="0.55"/>`;

  // --- Columbia River ---
  const columbia = [
    [46.2, -116.5], [46.3, -117.5], [46.0, -118.5], [45.8, -119.5],
    [45.6, -120.5], [45.7, -121.5], [46.0, -122.5], [46.1, -123.5], [46.2, -124]
  ].map(p => proj(p[0], p[1]));
  let colPath = `M ${columbia[0].x},${columbia[0].y}`;
  for (let i = 1; i < columbia.length; i++) {
    colPath += ` L ${columbia[i].x},${columbia[i].y}`;
  }
  svg += `<path d="${colPath}" fill="none" stroke="#5a9bbc" stroke-width="2" stroke-dasharray="5,2" opacity="0.5"/>`;

  // --- Mississippi River (for reference, east side) ---
  const miss = [
    [49, -89.5], [47, -90.0], [44, -90.5], [41, -91.0], [39, -90.5], [38, -90.2], [37, -89.5]
  ].map(p => proj(p[0], p[1]));
  let missPath = `M ${miss[0].x},${miss[0].y}`;
  for (let i = 1; i < miss.length; i++) { missPath += ` L ${miss[i].x},${miss[i].y}`; }
  svg += `<path d="${missPath}" fill="none" stroke="#5a9bbc" stroke-width="2" opacity="0.35"/>`;

  // --- Geographic labels ---
  const lbl = (lat, lon, text, size, color, anchor) => {
    const p = proj(lat, lon);
    svg += `<text x="${p.x}" y="${p.y}" font-size="${size || 10}" fill="${color || '#8b7355'}" text-anchor="${anchor || 'middle'}" font-style="italic">${text}</text>`;
  };
  lbl(43, -100, 'Great Plains', 12, '#a09070');
  lbl(44, -112, 'Rocky', 11, '#8a7a5a');
  lbl(43, -112, 'Mountains', 11, '#8a7a5a');
  lbl(43.5, -91.5, 'Mississippi R.', 8, '#7a9aac');
  lbl(42, -121.5, 'Pacific', 10, '#5a9bbc');
  lbl(41, -121.5, 'Ocean', 10, '#5a9bbc');

  // Missouri River label (along river path)
  const mLbl = proj(44, -97.5);
  svg += `<text x="${mLbl.x}" y="${mLbl.y}" font-size="8" fill="#7a9aac" text-anchor="middle" font-style="italic" transform="rotate(-25, ${mLbl.x}, ${mLbl.y})">Missouri River</text>`;
  const cLbl = proj(45.2, -120);
  svg += `<text x="${cLbl.x}" y="${cLbl.y}" font-size="8" fill="#7a9aac" text-anchor="middle" font-style="italic" transform="rotate(5, ${cLbl.x}, ${cLbl.y})">Columbia River</text>`;

  // --- Layer 2: Trail path (full route, dashed) ---
  let trailD = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    trailD += ` L ${positions[i].x} ${positions[i].y}`;
  }
  svg += `<path d="${trailD}" fill="none" stroke="#6b4423" stroke-width="2" stroke-dasharray="5,3" opacity="0.4"/>`;

  // --- Visited trail (progressive solid path) ---
  if (state.visitedStations.size > 1) {
    const visited = Array.from(state.visitedStations).sort((a,b) => a - b);
    let visitedPath = `M ${positions[visited[0]].x} ${positions[visited[0]].y}`;
    for (let i = 1; i < visited.length; i++) {
      if (visited[i] === visited[i-1] + 1) {
        visitedPath += ` L ${positions[visited[i]].x} ${positions[visited[i]].y}`;
      }
    }
    svg += `<path d="${visitedPath}" fill="none" stroke="#d4760a" stroke-width="3"/>`;
  }

  // --- Layer 3: Segment hit areas (invisible, wide for hover/click) ---
  for (let i = 0; i < positions.length - 1; i++) {
    const p1 = positions[i];
    const p2 = positions[i + 1];
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" `;
    svg += `stroke="transparent" stroke-width="20" style="cursor:pointer;" `;
    svg += `onmouseenter="showSegmentTooltip(${i+1}, ${Math.round(mx)}, ${Math.round(my)})" `;
    svg += `onmouseleave="hideSegmentTooltip()" `;
    svg += `onclick="showSegmentTooltip(${i+1}, ${Math.round(mx)}, ${Math.round(my)})" />`;
  }

  // --- Layer 4: Station markers ---
  positions.forEach((pos, i) => {
    const visited = state.visitedStations.has(i);
    const current = state.currentStation === i;

    let fill = '#6b4423';
    let stroke = '#5c2e0a';
    let r = 8;
    if (visited) { fill = '#f5a623'; stroke = '#d4760a'; }
    if (current) { fill = '#8b1a1a'; stroke = '#ffffff'; r = 10; }

    svg += `<g class="map-station ${visited ? 'visited' : ''} ${current ? 'current' : ''}" onclick="goToStation(${i}); showView('station');" style="cursor:pointer;">`;

    // Glow for current station
    if (current) {
      svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${r + 4}" fill="none" stroke="#f5a623" stroke-width="1" opacity="0.5"><animate attributeName="r" values="${r+3};${r+7};${r+3}" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/></circle>`;
    }

    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    svg += `<text x="${pos.x}" y="${pos.y + 3.5}" font-size="9" fill="#fff" font-family="sans-serif" text-anchor="middle" font-weight="bold">${i + 1}</text>`;

    // Label placement: alternate above/below to avoid overlap
    const labelAbove = (i % 2 === 0) || i === 9;
    const labelY = labelAbove ? pos.y - r - 6 : pos.y + r + 12;
    const labelY2 = labelAbove ? labelY + 10 : labelY + 10;

    svg += `<text x="${pos.x}" y="${labelY}" font-size="8" fill="#2c1810" text-anchor="middle" font-weight="bold">${pos.label}</text>`;
    svg += `<text x="${pos.x}" y="${labelY2}" font-size="7" fill="#5c4033" text-anchor="middle">${pos.sublabel}</text>`;

    svg += '</g>';
  });

  // --- Fort Mandan cluster bracket (stations 4-6) ---
  const fm = proj(47.3, -101.4);
  svg += `<text x="${fm.x}" y="${fm.y - 25}" font-size="7" fill="#8b7355" text-anchor="middle" font-style="italic">Stations 4\u20136: Fort Mandan</text>`;

  // --- Compass rose (upper-right) ---
  const crX = svgW - 45;
  const crY = 40;
  svg += `<g transform="translate(${crX},${crY})">`;
  svg += `<circle cx="0" cy="0" r="20" fill="rgba(244,232,193,0.7)" stroke="#8b7355" stroke-width="0.7"/>`;
  svg += `<line x1="0" y1="-17" x2="0" y2="17" stroke="#8b7355" stroke-width="0.5"/>`;
  svg += `<line x1="-17" y1="0" x2="17" y2="0" stroke="#8b7355" stroke-width="0.5"/>`;
  // Arrow for North
  svg += `<polygon points="0,-16 -3,-10 3,-10" fill="#5c4033"/>`;
  svg += `<text x="0" y="-22" font-size="10" fill="#5c4033" text-anchor="middle" font-weight="bold">N</text>`;
  svg += `<text x="0" y="30" font-size="8" fill="#8b7355" text-anchor="middle">S</text>`;
  svg += `<text x="24" y="3" font-size="8" fill="#8b7355" text-anchor="middle">E</text>`;
  svg += `<text x="-24" y="3" font-size="8" fill="#8b7355" text-anchor="middle">W</text>`;
  svg += `</g>`;

  // --- Scale bar (bottom-right) ---
  const scaleBarMiles = 200;
  const milesPerDegLon = 69.17 * cosLat;
  const scaleBarDegLon = scaleBarMiles / milesPerDegLon;
  const scaleBarPx = (scaleBarDegLon * cosLat / lonRange) * svgW;
  const sbX = svgW - 50 - scaleBarPx;
  const sbY = svgH - 20;
  svg += `<line x1="${sbX}" y1="${sbY}" x2="${sbX + scaleBarPx}" y2="${sbY}" stroke="#5c4033" stroke-width="1.5"/>`;
  svg += `<line x1="${sbX}" y1="${sbY - 4}" x2="${sbX}" y2="${sbY + 4}" stroke="#5c4033" stroke-width="1"/>`;
  svg += `<line x1="${sbX + scaleBarPx}" y1="${sbY - 4}" x2="${sbX + scaleBarPx}" y2="${sbY + 4}" stroke="#5c4033" stroke-width="1"/>`;
  svg += `<text x="${sbX + scaleBarPx / 2}" y="${sbY + 14}" font-size="8" fill="#5c4033" text-anchor="middle">${scaleBarMiles} miles</text>`;

  // --- Map title ---
  svg += `<text x="${svgW / 2}" y="22" font-size="13" fill="#2c1810" text-anchor="middle" font-weight="bold" letter-spacing="0.5">The Trail of the Corps of Discovery, 1804\u20131806</text>`;

  // --- Cumulative journey stats ---
  const totalMiles = SEGMENT_DATA.reduce((sum, s) => sum + (s ? s.miles : 0), 0);
  const totalDays = SEGMENT_DATA.reduce((sum, s) => sum + (s ? s.days : 0), 0);
  svg += `<text x="${svgW / 2}" y="${svgH - 8}" font-size="8" fill="#8b7355" text-anchor="middle">Total journey: ~${totalMiles.toLocaleString()} miles over ${totalDays} days (one way)</text>`;

  // --- Segment tooltip (hidden by default) ---
  svg += `<g id="segment-tooltip" display="none" pointer-events="none">`;
  svg += `<rect id="seg-tip-bg" rx="6" fill="#2c1810" fill-opacity="0.95" stroke="#8b4513" stroke-width="1.5" width="240" height="140"/>`;
  svg += `<text id="seg-tip-title" x="12" y="20" fill="#f5a623" font-size="11" font-weight="bold"></text>`;
  svg += `<text id="seg-tip-miles" x="12" y="38" fill="#f4e8c1" font-size="9"></text>`;
  svg += `<text id="seg-tip-time" x="12" y="52" fill="#f4e8c1" font-size="9"></text>`;
  svg += `<text id="seg-tip-terrain" x="12" y="66" fill="#b8cfe8" font-size="8"></text>`;
  svg += `<line id="seg-tip-divider" x1="12" y1="72" x2="228" y2="72" stroke="#8b4513" stroke-width="0.5"/>`;
  svg += `<text id="seg-tip-health-label" x="12" y="86" fill="#e8a0a0" font-size="8" font-weight="bold"></text>`;
  svg += `<text id="seg-tip-health" x="12" y="98" fill="#e8c0c0" font-size="8"></text>`;
  svg += `<text id="seg-tip-supply-label" x="12" y="114" fill="#b5e8a0" font-size="8" font-weight="bold"></text>`;
  svg += `<text id="seg-tip-supply" x="12" y="126" fill="#c8e8b8" font-size="8"></text>`;
  svg += `</g>`;

  svg += '</svg>';
  wrap.innerHTML = svg;
}

// === SEGMENT TOOLTIP FUNCTIONS ===
function showSegmentTooltip(segIndex, cx, cy) {
  const seg = SEGMENT_DATA[segIndex];
  if (!seg) return;

  const g = document.getElementById('segment-tooltip');
  const svgEl = g.closest('svg');
  const svgW = svgEl.viewBox.baseVal.width;
  const svgH = svgEl.viewBox.baseVal.height;

  // Populate text
  document.getElementById('seg-tip-title').textContent = `Leg ${segIndex}: Station ${segIndex} \u2192 ${segIndex + 1}`;
  document.getElementById('seg-tip-miles').textContent = seg.miles > 0 ? `\u{1F4CF} ${seg.miles} miles` : '\u{1F3D5} Same location';
  document.getElementById('seg-tip-time').textContent = `\u{1F4C5} ${seg.days} days (${seg.dateRange})`;
  document.getElementById('seg-tip-terrain').textContent = `\u{1F30D} ${seg.terrain}`;
  document.getElementById('seg-tip-health-label').textContent = 'Health:';
  document.getElementById('seg-tip-health').textContent = seg.health;
  document.getElementById('seg-tip-supply-label').textContent = 'Supplies:';
  document.getElementById('seg-tip-supply').textContent = seg.supplies;

  // Truncate long text lines for SVG
  const healthEl = document.getElementById('seg-tip-health');
  const supplyEl = document.getElementById('seg-tip-supply');
  if (seg.health.length > 45) {
    healthEl.textContent = seg.health.substring(0, 44) + '\u2026';
  }
  if (seg.supplies.length > 45) {
    supplyEl.textContent = seg.supplies.substring(0, 44) + '\u2026';
  }

  // Position tooltip, clamped to viewport
  const tipW = 240;
  const tipH = 140;
  let tx = cx - tipW / 2;
  let ty = cy - tipH - 12;
  if (tx < 5) tx = 5;
  if (tx + tipW > svgW - 5) tx = svgW - tipW - 5;
  if (ty < 5) ty = cy + 15; // flip below if too high

  g.setAttribute('transform', `translate(${tx}, ${ty})`);
  g.setAttribute('display', 'block');
}

function hideSegmentTooltip() {
  const g = document.getElementById('segment-tooltip');
  if (g) g.setAttribute('display', 'none');
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
