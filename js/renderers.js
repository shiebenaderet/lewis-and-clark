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

  // Image gallery (supports both single image and images array)
  const images = data.images || (data.image ? [data.image] : []);
  if (images.length > 0) {
    html += `<div class="station-gallery" id="gallery-${index}">`;
    images.forEach((img, imgIdx) => {
      html += `<div class="gallery-slide ${imgIdx === 0 ? 'active' : ''}" data-slide="${imgIdx}">`;
      html += `<div class="gallery-img-wrap">`;
      html += `<img src="${img.url}" alt="${escapeHtml(img.alt)}" loading="${imgIdx === 0 ? 'eager' : 'lazy'}" onerror="this.closest('.gallery-slide').style.display='none'">`;
      html += `</div>`;
      if (img.caption) {
        html += `<div class="gallery-caption">${escapeHtml(img.caption)}</div>`;
      }
      html += `</div>`;
    });
    if (images.length > 1) {
      html += `<div class="gallery-nav">`;
      html += `<button class="gallery-arrow gallery-prev" onclick="galleryNav(${index}, -1)">&lsaquo;</button>`;
      html += `<div class="gallery-dots">`;
      images.forEach((_, imgIdx) => {
        html += `<button class="gallery-dot ${imgIdx === 0 ? 'active' : ''}" onclick="galleryGo(${index}, ${imgIdx})"></button>`;
      });
      html += `</div>`;
      html += `<button class="gallery-arrow gallery-next" onclick="galleryNav(${index}, 1)">&rsaquo;</button>`;
      html += `</div>`;
    }
    html += `</div>`;
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

// === GALLERY NAVIGATION ===
function galleryNav(stationIndex, direction) {
  const gallery = document.getElementById('gallery-' + stationIndex);
  if (!gallery) return;
  const slides = gallery.querySelectorAll('.gallery-slide');
  const dots = gallery.querySelectorAll('.gallery-dot');
  const current = gallery.querySelector('.gallery-slide.active');
  const currentIdx = parseInt(current.dataset.slide);
  let next = currentIdx + direction;
  if (next < 0) next = slides.length - 1;
  if (next >= slides.length) next = 0;
  galleryGo(stationIndex, next);
}

function galleryGo(stationIndex, slideIdx) {
  const gallery = document.getElementById('gallery-' + stationIndex);
  if (!gallery) return;
  gallery.querySelectorAll('.gallery-slide').forEach(s => s.classList.remove('active'));
  gallery.querySelectorAll('.gallery-dot').forEach(d => d.classList.remove('active'));
  const target = gallery.querySelector(`[data-slide="${slideIdx}"]`);
  if (target) target.classList.add('active');
  const dot = gallery.querySelectorAll('.gallery-dot')[slideIdx];
  if (dot) dot.classList.add('active');
}

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

  // --- Layer 4: Pulsing glow for current station (separate from clickable group) ---
  positions.forEach((pos, i) => {
    if (state.currentStation === i) {
      svg += `<circle cx="${pos.x}" cy="${pos.y}" r="14" fill="none" stroke="#f5a623" stroke-width="1.5" opacity="0.5" pointer-events="none"><animate attributeName="r" values="13;18;13" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0.15;0.5" dur="2s" repeatCount="indefinite"/></circle>`;
    }
  });

  // --- Layer 5: Station markers (clickable) ---
  positions.forEach((pos, i) => {
    const visited = state.visitedStations.has(i);
    const current = state.currentStation === i;

    let fill = '#6b4423';
    let stroke = '#5c2e0a';
    let r = 8;
    if (visited) { fill = '#f5a623'; stroke = '#d4760a'; }
    if (current) { fill = '#8b1a1a'; stroke = '#ffffff'; r = 10; }

    svg += `<g class="map-station ${visited ? 'visited' : ''} ${current ? 'current' : ''}" onclick="goToStation(${i}); showView('station');" style="cursor:pointer;">`;

    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    svg += `<text x="${pos.x}" y="${pos.y + 3.5}" font-size="9" fill="#fff" font-family="sans-serif" text-anchor="middle" font-weight="bold">${i + 1}</text>`;

    // Label placement: alternate above/below to avoid overlap
    const labelAbove = (i % 2 === 0) || i === 9;
    const labelY = labelAbove ? pos.y - r - 6 : pos.y + r + 14;
    const labelY2 = labelY + 11;

    svg += `<text x="${pos.x}" y="${labelY}" font-size="9" fill="#2c1810" text-anchor="middle" font-weight="bold">${pos.label}</text>`;
    svg += `<text x="${pos.x}" y="${labelY2}" font-size="8" fill="#5c4033" text-anchor="middle">${pos.sublabel}</text>`;

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

  // --- Segment tooltip (hidden by default, larger text) ---
  svg += `<g id="segment-tooltip" display="none" pointer-events="none">`;
  svg += `<rect id="seg-tip-bg" rx="8" fill="#2c1810" fill-opacity="0.96" stroke="#8b4513" stroke-width="2" width="300" height="175"/>`;
  svg += `<text id="seg-tip-title" x="15" y="24" fill="#f5a623" font-size="14" font-weight="bold"></text>`;
  svg += `<text id="seg-tip-miles" x="15" y="46" fill="#f4e8c1" font-size="12"></text>`;
  svg += `<text id="seg-tip-time" x="15" y="64" fill="#f4e8c1" font-size="11"></text>`;
  svg += `<text id="seg-tip-terrain" x="15" y="82" fill="#b8cfe8" font-size="10"></text>`;
  svg += `<line x1="15" y1="90" x2="285" y2="90" stroke="#8b4513" stroke-width="0.5"/>`;
  svg += `<text id="seg-tip-health-label" x="15" y="108" fill="#e8a0a0" font-size="10" font-weight="bold"></text>`;
  svg += `<text id="seg-tip-health" x="15" y="124" fill="#e8c0c0" font-size="10"></text>`;
  svg += `<text id="seg-tip-supply-label" x="15" y="144" fill="#b5e8a0" font-size="10" font-weight="bold"></text>`;
  svg += `<text id="seg-tip-supply" x="15" y="160" fill="#c8e8b8" font-size="10"></text>`;
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
  if (seg.health.length > 50) {
    healthEl.textContent = seg.health.substring(0, 49) + '\u2026';
  }
  if (seg.supplies.length > 50) {
    supplyEl.textContent = seg.supplies.substring(0, 49) + '\u2026';
  }

  // Position tooltip, clamped to viewport
  const tipW = 300;
  const tipH = 175;
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

// === INTERACTIVE TRAVEL TRANSITION ===
function renderTravelTransition(fromIndex, toIndex, callback) {
  const overlay = document.getElementById('travel-overlay');
  const scene = document.getElementById('travel-scene');

  const distances = [0, 600, 25, 400, 0, 0, 350, 200, 150, 300, 250];
  const miles = distances[toIndex] || 200;

  // Pick 2-3 random events
  const shuffled = [...TRAIL_EVENTS].sort(() => Math.random() - 0.5);
  const numEvents = 2 + Math.floor(Math.random() * 2);
  const journeyEvents = shuffled.slice(0, Math.min(numEvents, shuffled.length));

  const stationNames = [
    "Camp Dubois", "Platte River", "Council Bluff", "Fort Mandan", "Fort Mandan",
    "Fort Mandan", "Great Falls", "Camp Fortunate", "Lolo Trail", "Fort Clatsop"
  ];

  let html = `<div class="travel-title">Traveling to ${stationNames[toIndex]}...</div>`;
  html += `<div class="travel-distance">${miles} miles to the next station</div>`;
  html += '<div class="travel-progress"><div class="travel-progress-bar" id="travel-bar"></div></div>';
  html += '<div class="travel-score-line" id="travel-score-line"></div>';
  html += '<div id="travel-events"></div>';
  html += '<button class="btn-travel-continue" id="travel-continue-btn" style="display:none" onclick="finishTravel()">Continue</button>';

  scene.innerHTML = html;
  overlay.classList.add('active');
  window._travelCallback = callback;
  window._travelEvents = journeyEvents;
  window._travelStep = 0;
  window._travelToIndex = toIndex;
  window._travelPoints = 0;

  // Show first event after a brief pause
  setTimeout(() => travelShowEvent(), 500);
}

function travelShowEvent() {
  const events = window._travelEvents;
  const step = window._travelStep;
  const total = events.length;
  const toIndex = window._travelToIndex;

  const bar = document.getElementById('travel-bar');
  const container = document.getElementById('travel-events');
  const scoreLine = document.getElementById('travel-score-line');

  if (step >= total) {
    // Journey complete — show arrival
    bar.style.width = '100%';
    const pts = window._travelPoints;
    container.innerHTML = `<div class="travel-event travel-arrival">
      <div class="travel-event-emoji">\u2b50</div>
      <div class="travel-event-msg"><strong>Journey Complete!</strong> You earned <strong>${pts}</strong> trail ${pts === 1 ? 'point' : 'points'} on this leg.</div>
    </div>`;
    const btn = document.getElementById('travel-continue-btn');
    btn.style.display = 'block';
    btn.textContent = 'Arrive at Station ' + (toIndex + 1) + ' \u2192';
    state.score += pts;
    updateScoreDisplay();
    saveGame();
    return;
  }

  // Update progress
  bar.style.width = Math.round((step / total) * 100) + '%';

  const evt = events[step];

  if (evt.action === 'tap_swat') {
    renderTapChallenge(evt, container);
  } else {
    renderChoiceEvent(evt, container);
  }
}

// --- Choice-based events ---
function renderChoiceEvent(evt, container) {
  let html = `<div class="travel-event">`;
  html += `<div class="travel-event-emoji">${evt.icon}</div>`;
  html += `<div class="travel-event-msg"><strong>${evt.title}</strong></div>`;
  html += `<div class="travel-event-desc">${evt.text}</div>`;
  html += `<div class="travel-choices">`;
  evt.choices.forEach((choice, i) => {
    html += `<button class="travel-choice-btn" onclick="handleTravelChoice(${i})">${choice.text}</button>`;
  });
  html += `</div></div>`;
  container.innerHTML = html;
}

function handleTravelChoice(choiceIndex) {
  const events = window._travelEvents;
  const step = window._travelStep;
  const evt = events[step];
  const choice = evt.choices[choiceIndex];

  const container = document.getElementById('travel-events');
  const buttons = container.querySelectorAll('.travel-choice-btn');

  // Disable all buttons and highlight chosen
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    btn.onclick = null;
    if (i === choiceIndex) {
      btn.classList.add(choice.good ? 'choice-good' : 'choice-bad');
    }
  });

  // Award points
  const pts = choice.good ? 5 : 1;
  window._travelPoints += pts;

  // Show result
  const resultDiv = document.createElement('div');
  resultDiv.className = 'travel-result ' + (choice.good ? 'result-good' : 'result-bad');
  resultDiv.innerHTML = `<span class="result-points">${choice.good ? '+5' : '+1'}</span> ${choice.result}`;
  container.querySelector('.travel-event').appendChild(resultDiv);

  // Update score line
  document.getElementById('travel-score-line').textContent = `Trail points this leg: ${window._travelPoints}`;

  // Advance to next after pause
  window._travelStep++;
  setTimeout(() => travelShowEvent(), 2500);
}

// --- Tap/swat mini-game ---
function renderTapChallenge(evt, container) {
  const count = evt.swat_count || 6;
  const timeLimit = evt.swat_time || 5;

  let html = `<div class="travel-event">`;
  html += `<div class="travel-event-emoji">${evt.icon}</div>`;
  html += `<div class="travel-event-msg"><strong>${evt.title}</strong></div>`;
  html += `<div class="travel-event-desc">${evt.text}</div>`;
  html += `<div class="swat-arena" id="swat-arena">`;
  html += `<div class="swat-timer" id="swat-timer">${timeLimit}s</div>`;
  html += `<div class="swat-counter" id="swat-counter">0 / ${count}</div>`;
  html += `<div class="swat-field" id="swat-field"></div>`;
  html += `</div></div>`;
  container.innerHTML = html;

  // Start spawning targets
  window._swatData = { target: evt.swat_target, needed: count, hit: 0, timeLeft: timeLimit, active: true };
  window._swatResult = { success: evt.success_text, fail: evt.fail_text };
  spawnSwatTarget();
  startSwatTimer();
}

function spawnSwatTarget() {
  if (!window._swatData || !window._swatData.active) return;
  const field = document.getElementById('swat-field');
  if (!field) return;

  const target = document.createElement('button');
  target.className = 'swat-target';
  target.textContent = window._swatData.target;
  target.style.left = Math.floor(Math.random() * 80) + '%';
  target.style.top = Math.floor(Math.random() * 70) + '%';
  target.onclick = function() {
    hitSwatTarget(this);
  };

  field.appendChild(target);

  // Remove target if not tapped within 1.5s
  setTimeout(() => {
    if (target.parentNode) {
      target.classList.add('swat-miss');
      setTimeout(() => { if (target.parentNode) target.remove(); }, 300);
    }
  }, 1500);

  // Spawn next target
  if (window._swatData.active) {
    const delay = 400 + Math.random() * 600;
    setTimeout(spawnSwatTarget, delay);
  }
}

function hitSwatTarget(el) {
  if (!window._swatData || !window._swatData.active) return;
  el.classList.add('swat-hit');
  el.onclick = null;
  setTimeout(() => { if (el.parentNode) el.remove(); }, 200);

  window._swatData.hit++;
  const counter = document.getElementById('swat-counter');
  if (counter) counter.textContent = `${window._swatData.hit} / ${window._swatData.needed}`;

  // Check win
  if (window._swatData.hit >= window._swatData.needed) {
    window._swatData.active = false;
    endSwatChallenge(true);
  }
}

function startSwatTimer() {
  const interval = setInterval(() => {
    if (!window._swatData || !window._swatData.active) { clearInterval(interval); return; }
    window._swatData.timeLeft--;
    const timer = document.getElementById('swat-timer');
    if (timer) timer.textContent = window._swatData.timeLeft + 's';

    if (window._swatData.timeLeft <= 0) {
      clearInterval(interval);
      window._swatData.active = false;
      endSwatChallenge(window._swatData.hit >= window._swatData.needed);
    }
  }, 1000);
}

function endSwatChallenge(success) {
  const field = document.getElementById('swat-field');
  if (field) field.innerHTML = '';

  const pts = success ? 5 : 2;
  window._travelPoints += pts;

  const resultText = success ? window._swatResult.success : window._swatResult.fail;
  const container = document.getElementById('travel-events');
  const resultDiv = document.createElement('div');
  resultDiv.className = 'travel-result ' + (success ? 'result-good' : 'result-bad');
  resultDiv.innerHTML = `<span class="result-points">${success ? '+5' : '+2'}</span> ${resultText}`;
  const evtEl = container.querySelector('.travel-event');
  if (evtEl) evtEl.appendChild(resultDiv);

  document.getElementById('travel-score-line').textContent = `Trail points this leg: ${window._travelPoints}`;

  window._travelStep++;
  setTimeout(() => travelShowEvent(), 2500);
}

function finishTravel() {
  document.getElementById('travel-overlay').classList.remove('active');
  if (window._travelCallback) {
    window._travelCallback();
    window._travelCallback = null;
  }
}
