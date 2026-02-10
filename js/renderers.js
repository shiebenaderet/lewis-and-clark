// ============================================================
// renderers.js — All DOM rendering functions
// ============================================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// === DISCOVERY NARRATIVE CONSTANTS (per reading level) ===
const DISCOVERY_INTROS = {
  beginner: [
    "Welcome to Camp Dubois! This is where Lewis and Clark started their big adventure. You found an old journal that tells the story of their journey west\u2026",
    "You made it to the Platte River! In some old records, you found pages from the expedition's journal about their first time seeing the Great Plains\u2026",
    "At Council Bluff, you found important records. Lewis and Clark held their first big meeting with Native American leaders here\u2026",
    "You reached the Mandan villages along the Missouri River. The Mandan and Hidatsa people welcomed the expedition. You found journal entries about building a fort for winter\u2026",
    "Inside Fort Mandan, you found frozen journal pages. They tell about the terrible cold, the birth of Sacagawea's baby, and plans for the journey ahead\u2026",
    "Spring is here! You found journal entries about leaving Fort Mandan. From here, the expedition entered land that had never been mapped by Americans\u2026",
    "You can hear a waterfall! You found journal pages about the Great Falls \u2014 one of the hardest parts of the whole trip\u2026",
    "In a mountain valley, you found an amazing story. Sacagawea was reunited with her brother, and the expedition got the horses they desperately needed\u2026",
    "High in the Bitterroot Mountains, you found journal pages about the scariest part of the journey. The expedition almost didn't make it through\u2026",
    "You reached the Pacific Ocean! Near Fort Clatsop, you found the last journal entries \u2014 including a vote where everyone got a say, even Sacagawea and York\u2026"
  ],
  standard: [
    "Your search for the lost expedition begins here, at Camp Dubois near St. Louis. A local historian hands you a tattered leather journal \u2014 the first pages describe the start of an incredible journey westward\u2026",
    "Following the expedition's route upriver, you reach the Platte River confluence. Among old trading post records, you find journal pages describing the Corps' first encounters with the Great Plains\u2026",
    "At Council Bluff, you discover records of a momentous meeting. The journals describe Lewis and Clark's first formal councils with Native American leaders \u2014 a pattern that would repeat throughout the expedition\u2026",
    "Pushing north along the Missouri, you find the remains of an earth lodge village. Here, the Mandan and Hidatsa peoples welcomed the Corps. You uncover journal entries about building a winter fort\u2026",
    "Inside the reconstructed Fort Mandan, you find pages pressed between frozen logs \u2014 the winter journals. They describe brutal cold, a remarkable birth, and preparations for the unknown journey ahead\u2026",
    "Spring has arrived in your retracing of the journey. You discover journal entries describing the moment the Corps departed Fort Mandan, leaving behind the last outpost of the known world\u2026",
    "The sound of thundering water leads you to the Great Falls of the Missouri. Scattered among the rocks, you find journal pages describing one of the expedition's greatest physical challenges\u2026",
    "In a mountain valley, you discover traces of a remarkable reunion. The journals describe the desperate search for horses \u2014 and an astonishing coincidence involving Sacagawea and her long-lost brother\u2026",
    "High in the Bitterroot Mountains, you find carved trail markers and journal fragments. These pages describe the most harrowing stretch of the entire expedition \u2014 a crossing that nearly ended it all\u2026",
    "At last, you reach the Pacific coast. Near the remains of Fort Clatsop, you uncover the final journals \u2014 including records of a remarkable democratic vote that was far ahead of its time\u2026"
  ],
  advanced: [
    "Your investigation into the Corps of Discovery begins at Camp Dubois, the staging ground near the confluence of the Mississippi and Missouri Rivers. Among deteriorating quartermaster records, you discover the expedition's initial journal entries \u2014 documenting the meticulous preparations that President Jefferson personally oversaw\u2026",
    "Tracing the expedition upriver, you arrive at the Platte River confluence \u2014 the gateway to the Great Plains. Among records from fur-trading outposts, you uncover journal entries describing the Corps' dawning realization of the vast, treeless landscape stretching a thousand miles ahead\u2026",
    "At Council Bluff, you discover meticulously recorded minutes from a momentous diplomatic encounter. Lewis and Clark's first formal councils with the Oto, Missouri, and Yankton Sioux nations established the pattern of ceremonial diplomacy that would shape U.S.-tribal relations for decades\u2026",
    "Following the Missouri northward, you find remnants of the Mandan and Hidatsa earth lodge villages \u2014 once among the largest settlements on the continent. Buried among trade records, journal entries describe the Corps' arrival at this crucial crossroads of Plains commerce and diplomacy\u2026",
    "Within the reconstructed Fort Mandan, you discover winter journals pressed between frozen cottonwood logs. These pages chronicle temperatures plunging to -45\u00B0F, the birth of Jean Baptiste Charbonneau to Sacagawea, and the systematic preparation of botanical specimens and maps for Jefferson\u2026",
    "Spring 1805 marks the expedition's point of no return. You find journal entries suffused with both excitement and trepidation \u2014 the keelboat has been sent back to St. Louis with specimens, and the Corps now ventures beyond the last outpost of documented geography\u2026",
    "The thundering cascade of the Great Falls confirms a landmark described by the Mandan. Among weathered journal fragments, you find accounts of the brutal 18-mile portage \u2014 a month of hauling 8,000 pounds of equipment across cactus fields, rattlesnake dens, and searing heat\u2026",
    "In a valley near present-day Dillon, Montana, you uncover evidence of one of the expedition's most pivotal moments \u2014 the desperate search for Shoshone horses, culminating in the extraordinary coincidence of Sacagawea recognizing Chief Cameahwait as her long-lost brother\u2026",
    "At the treeline of the Bitterroot Range, journal fragments describe what historians consider the expedition's closest brush with catastrophe. Eleven harrowing days of starvation, snow blindness, and slaughtered colts tested the limits of human endurance on the ancient Nez Perce trail\u2026",
    "Standing where the Columbia meets the Pacific, you discover the expedition's final journals near the remains of Fort Clatsop. Most remarkably, these pages record a democratic vote in which Sacagawea and York \u2014 a Native woman and an enslaved man \u2014 were given equal voice, decades before such equality would be recognized by law\u2026"
  ]
};

const NEXT_CLUES = {
  beginner: [
    "The journal mentions heading up the Missouri River to find where another big river joins it \u2014 the Platte River\u2026",
    "Clark's notes say they planned to meet with Native American chiefs at a high bluff near the river\u2026",
    "The journals talk about going north to find the Mandan people and building shelter before winter\u2026",
    "They mention getting ready for a very cold winter and building a warm place to stay\u2026",
    "It's spring! They're making new canoes and getting ready to explore land that no American had ever mapped\u2026",
    "People from the Mandan nation told them about a huge waterfall up the river. The expedition needs to find it\u2026",
    "They desperately need horses to cross the mountains. Sacagawea thinks her people, the Shoshone, are nearby\u2026",
    "The Shoshone warn about a terrible mountain crossing to the west. A guide named Old Toby will show the way\u2026",
    "After crossing the mountains, they'll build canoes and follow the Columbia River toward the Pacific Ocean\u2026"
  ],
  standard: [
    "A torn page mentions heading up the Missouri River, watching for \u201Cthe great river that flows from the west\u201D \u2014 the Platte River, where the plains stretch endlessly\u2026",
    "Clark's notes reference a planned council with chiefs of the Oto and Missouri nations at a bluff overlooking the river\u2026",
    "The journals describe pushing north into the territory of the Mandan people, seeking shelter before winter arrives\u2026",
    "References to building shelters and preparing for \u201Cthe most severe cold\u201D suggest the Corps is settling in for a long, harsh winter\u2026",
    "Spring preparations are underway \u2014 new canoes, packed specimens, and excitement about venturing into lands \u201Con which the foot of civilized man had never trod.\u201D",
    "Rumors from the Mandan people describe a massive waterfall upriver \u2014 the Great Falls of the Missouri. The expedition must find it\u2026",
    "Desperate entries mention the urgent need for horses to cross the mountains. Sacagawea recognizes landmarks from her childhood \u2014 her people, the Shoshone, must be near\u2026",
    "The Shoshone describe a terrible mountain crossing to the west \u2014 the Lolo Trail through the Bitterroot Mountains. Old Toby will guide them\u2026",
    "After surviving the mountains, the journals speak of building canoes and racing downriver. The Columbia River should lead them to the Pacific Ocean at last\u2026"
  ],
  advanced: [
    "A torn journal page references the convergence of the Platte River with the Missouri \u2014 a geographic landmark marking the transition from woodland to grassland ecosystems and the true beginning of the Great Plains\u2026",
    "Clark's diplomatic notes outline preparations for a formal council with chiefs of the Oto and Missouri nations, employing ceremonial protocols Jefferson designed to assert American sovereignty over the Louisiana Purchase\u2026",
    "The journals describe an urgent push northward into Mandan territory before the Missouri freezes, seeking the sophisticated agricultural communities that controlled the Northern Plains trade network\u2026",
    "Detailed references to constructing winter quarters and establishing a smithy suggest the Corps is preparing for months of extreme cold \u2014 and an opportunity to forge trade goods for the Mandan-Hidatsa exchange economy\u2026",
    "Meticulous spring preparations are documented \u2014 the keelboat returns to St. Louis bearing specimens for Jefferson while the Corps advances into terra incognita, relying on geographic intelligence gathered from Mandan and Hidatsa informants\u2026",
    "Geographic intelligence from the Hidatsa describes a series of massive cataracts on the Missouri \u2014 the Great Falls, which will require the most arduous portage of the entire expedition\u2026",
    "Entries convey growing urgency to locate the Lemhi Shoshone and negotiate for horses. Sacagawea's recognition of childhood landmarks signals the Corps is entering her people's homeland near the Continental Divide\u2026",
    "Shoshone geographic knowledge describes the Lolo Trail \u2014 an ancient Nez Perce route traversing the Bitterroot Range. Old Toby warns of snow, starvation, and terrain that will push the expedition to its absolute limit\u2026",
    "Having survived the mountain crossing, the journals describe constructing dugout canoes and committing to the Columbia River system \u2014 a waterway that should, according to Nez Perce intelligence, carry them to the Pacific at last\u2026"
  ]
};

// === DISCOVERIES (unlocked by getting challenges correct) ===
const DISCOVERIES = [
  { name: 'The Keelboat', icon: '\u26F5', desc: 'A 55-foot vessel that carried the Corps of Discovery into the unknown' },
  { name: 'Prairie Dog', icon: '\uD83D\uDC3F\uFE0F', desc: 'A species new to American science, sent alive to President Jefferson' },
  { name: 'Peace Medal Diplomacy', icon: '\uD83E\uDE99', desc: 'Jefferson\'s silver medals, given to tribal leaders to establish American relations' },
  { name: 'Mandan Trade Network', icon: '\uD83C\uDF3E', desc: 'A vast continental trading system connecting the Great Lakes to the Rockies' },
  { name: 'Jean Baptiste Charbonneau', icon: '\uD83D\uDC76', desc: 'Born Feb 11, 1805 at Fort Mandan \u2014 the youngest member of the expedition' },
  { name: 'Terra Incognita', icon: '\uD83D\uDDFA\uFE0F', desc: 'Beyond Fort Mandan, the Corps entered land no American had ever mapped' },
  { name: 'The Great Portage', icon: '\u26F0\uFE0F', desc: '18 miles overland \u2014 the most grueling physical challenge of the journey' },
  { name: 'Shoshone Horses', icon: '\uD83D\uDC0E', desc: '29 horses acquired through Sacagawea\'s incredible reunion with her brother' },
  { name: 'Nez Perce Rescue', icon: '\uD83E\uDE78', desc: 'The people who saved the starving expedition and taught them to build canoes' },
  { name: 'The Great Vote', icon: '\uD83D\uDDF3\uFE0F', desc: 'Everyone voted \u2014 including York and Sacagawea \u2014 decades ahead of their time' }
];

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

  const challengeId = `challenge_${index}`;
  const challengeCompleted = state.challengesCompleted.has(challengeId);

  let html = '<div class="station-card">';

  // Image gallery (supports both single image and images array)
  const images = data.images || (data.image ? [data.image] : []);
  if (images.length > 0) {
    html += `<div class="station-gallery" id="gallery-${index}">`;
    images.forEach((img, imgIdx) => {
      html += `<div class="gallery-slide ${imgIdx === 0 ? 'active' : ''}" data-slide="${imgIdx}">`;
      html += `<div class="gallery-img-wrap">`;
      html += `<img src="${img.url}" alt="${escapeHtml(img.alt)}" loading="${imgIdx === 0 ? 'eager' : 'lazy'}" onerror="galleryImgError(this, ${index})">`;
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

  // Discovery intro (varies by reading level)
  const intros = DISCOVERY_INTROS[state.level] || DISCOVERY_INTROS.standard;
  if (intros[index]) {
    html += '<div class="discovery-intro">';
    html += '<div class="discovery-intro-label">Discovery</div>';
    html += `<div class="discovery-intro-text">${intros[index]}</div>`;
    html += '</div>';
  }

  // Header (hide total station count for progressive discovery)
  html += '<div class="station-header">';
  html += `<div class="station-number">Station ${index + 1}</div>`;
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

  // "What Would You Do?" scenario (Stage 2 — appears before journals)
  const scenarioId = `scenario_${index}`;
  const scenarioCompleted = state.scenariosCompleted.has(scenarioId);
  if (data.scenario) {
    html += renderScenario(data.scenario, index, scenarioCompleted);
  }

  // Journal entries (dates and authors are clickable to auto-fill journal)
  // If scenario exists and not yet completed, journals start hidden
  const journalHidden = data.scenario && !scenarioCompleted ? ' style="display:none"' : '';
  html += `<div class="journal-entries-wrap" id="journals_${index}"${journalHidden}>`;
  if (data.scenario) {
    html += '<div class="journal-reveal-label">Now read what they actually wrote...</div>';
  }
  if (data.journals && data.journals.length > 0) {
    data.journals.forEach(j => {
      const safeDate = j.date.replace(/'/g, "\\'");
      const safeAuthor = j.author.replace(/'/g, "\\'");
      html += '<div class="journal-entry">';
      html += `<div class="journal-date clickable-fill" onclick="autoFillJournal(${index}, 'date', '${safeDate}')" title="Tap to add to your journal">${j.date} <span class="fill-hint">tap to add</span></div>`;
      html += '<div class="journal-text">';
      j.text.forEach(p => {
        html += `<p>${p}</p>`;
      });
      html += '</div>';
      html += `<div class="journal-author clickable-fill" onclick="autoFillJournal(${index}, 'author', '${safeAuthor}')" title="Tap to add to your journal">&mdash; ${j.author} <span class="fill-hint">tap to add</span></div>`;
      html += '</div>';
    });
  }
  html += '</div>';

  // Interactive challenge
  if (data.challenge) {
    html += renderChallenge(data.challenge, index, challengeCompleted);
  }

  // Journal entry prompts (populate the Expedition Journal)
  const savedDate = state.journalEntries[`date_${index}`] || '';
  const savedAuthor = state.journalEntries[`author_${index}`] || '';
  const savedSummary = state.journalEntries[`summary_${index}`] || '';
  const savedReflection = state.journalEntries[`reflection_${index}`] || '';

  html += '<div class="journal-prompts">';
  html += '<div class="journal-prompts-label">Your Expedition Journal Entry</div>';
  html += '<p class="journal-prompts-hint">Fill in these fields to complete your journal for this station. Your entries appear in the Journal tab.</p>';

  html += '<div class="journal-field">';
  html += `<label class="journal-field-label" for="jf-date-${index}">Date(s) covered at this station</label>`;
  html += `<input type="text" id="jf-date-${index}" class="journal-field-input" placeholder="e.g. ${data.dates || 'May 14, 1804'}" value="${escapeHtml(savedDate)}" onchange="saveJournalField(${index}, 'date', this.value)">`;
  html += '</div>';

  html += '<div class="journal-field">';
  html += `<label class="journal-field-label" for="jf-author-${index}">Who wrote the journal entries you read?</label>`;
  html += `<input type="text" id="jf-author-${index}" class="journal-field-input" placeholder="e.g. Captain Clark, Captain Lewis" value="${escapeHtml(savedAuthor)}" onchange="saveJournalField(${index}, 'author', this.value)">`;
  html += '</div>';

  html += '<div class="journal-field">';
  html += `<label class="journal-field-label" for="jf-summary-${index}">Summarize what happened at this station</label>`;
  html += `<textarea id="jf-summary-${index}" class="journal-field-textarea" placeholder="In your own words, describe the key events..." onchange="saveJournalField(${index}, 'summary', this.value)">${escapeHtml(savedSummary)}</textarea>`;
  html += '</div>';

  if (data.reflection) {
    html += '<div class="journal-field">';
    html += `<label class="journal-field-label" for="jf-reflection-${index}">Historian's Analysis: ${data.reflection}</label>`;
    html += `<textarea id="jf-reflection-${index}" class="journal-field-textarea" placeholder="Think critically and write your analysis..." onchange="saveReflection(${index}, this.value)">${escapeHtml(savedReflection)}</textarea>`;
    html += '</div>';
  }

  html += '</div>';

  // Explore Primary Sources (collapsible)
  const resources = STATION_RESOURCES[index];
  if (resources) {
    html += '<details class="primary-sources">';
    html += '<summary class="primary-sources-label">Explore Primary Sources</summary>';
    html += '<div class="primary-sources-links">';
    resources.journals.forEach(j => {
      html += `<a href="${j.url}" target="_blank" rel="noopener" class="source-link">Read the real journal &mdash; ${j.date} <span class="source-host">lewisandclarkjournals.unl.edu</span></a>`;
    });
    html += `<a href="${resources.atlas}" target="_blank" rel="noopener" class="source-link">Explore this location on the LC Atlas <span class="source-host">lcatlas.lclark.edu</span></a>`;
    html += `<a href="${resources.nps}" target="_blank" rel="noopener" class="source-link">NPS Lewis &amp; Clark Trail Maps <span class="source-host">nps.gov</span></a>`;
    html += '</div></details>';
  }

  // Next clue (shown after challenge is completed, if not last station)
  const clues = NEXT_CLUES[state.level] || NEXT_CLUES.standard;
  if (challengeCompleted && index < STATIONS.length - 1 && clues[index]) {
    html += '<div class="discovery-clue">';
    html += '<div class="discovery-clue-label">Clue to the Next Station</div>';
    html += `<div class="discovery-clue-text">${clues[index]}</div>`;
    html += '</div>';
  }

  // Navigation (gated behind challenge completion)
  html += '<div class="station-nav">';
  html += `<button class="btn-station-nav" onclick="goToStation(${index - 1})" ${index === 0 ? 'disabled' : ''}>&larr; Previous Station</button>`;
  if (index < STATIONS.length - 1) {
    if (challengeCompleted) {
      html += `<button class="btn-station-nav primary" onclick="travelToStation(${index + 1})">Continue West &rarr;</button>`;
    } else {
      html += `<button class="btn-station-nav locked" id="btn-continue-west" disabled>Complete the Knowledge Check &rarr;</button>`;
    }
  } else {
    if (challengeCompleted) {
      html += `<button class="btn-station-nav primary" onclick="completeExpedition()">Complete the Expedition &rarr;</button>`;
    } else {
      html += `<button class="btn-station-nav locked" id="btn-continue-west" disabled>Complete the Knowledge Check &rarr;</button>`;
    }
  }
  html += '</div>';

  html += '</div>'; // station-body
  html += '</div>'; // station-card

  document.getElementById('station-content').innerHTML = html;
  window.scrollTo(0, 0);

  // Initialize interactive challenge types after DOM is populated
  if (data.challenge && !challengeCompleted) {
    if (data.challenge.type === 'map_click') {
      initMapClickChallenge(index);
    } else if (data.challenge.type === 'ordering') {
      initOrderingChallenge(index);
    }
  }
}

// === SCENARIO RENDERING ("What Would You Do?") ===
function renderScenario(scenario, stationIndex, alreadyCompleted) {
  const scenarioId = `scenario_${stationIndex}`;
  let html = `<div class="scenario-box" id="${scenarioId}">`;
  html += '<div class="scenario-header">';
  html += '<span class="scenario-icon">&#x1F914;</span>';
  html += `<span class="scenario-label">${scenario.title}</span>`;
  html += '</div>';
  html += `<p class="scenario-situation">${scenario.situation}</p>`;

  if (alreadyCompleted) {
    // Show completed state — all choices visible, correct highlighted
    html += '<div class="scenario-choices completed">';
    scenario.choices.forEach((choice, i) => {
      const isCorrect = i === scenario.correct;
      html += `<div class="scenario-choice ${isCorrect ? 'correct' : ''}" ${!isCorrect ? 'style="opacity:0.5"' : ''}>`;
      html += `<span class="scenario-choice-letter">${String.fromCharCode(65 + i)}</span>`;
      html += `<span class="scenario-choice-text">${choice.text}</span>`;
      html += '</div>';
    });
    html += '</div>';
    html += `<div class="scenario-reveal show">${scenario.reveal}</div>`;
  } else {
    html += '<div class="scenario-choices">';
    scenario.choices.forEach((choice, i) => {
      html += `<div class="scenario-choice" onclick="answerScenario(${stationIndex}, ${i})" tabindex="0" role="button">`;
      html += `<span class="scenario-choice-letter">${String.fromCharCode(65 + i)}</span>`;
      html += `<span class="scenario-choice-text">${choice.text}</span>`;
      html += '</div>';
    });
    html += '</div>';
    html += `<div class="scenario-feedback" id="scenariofb_${stationIndex}"></div>`;
    html += `<div class="scenario-reveal" id="scenarioreveal_${stationIndex}"></div>`;
  }

  html += '</div>';
  return html;
}

function answerScenario(stationIndex, choiceIndex) {
  const station = STATIONS[stationIndex];
  const data = station[state.level] || station.standard;
  const scenario = data.scenario;
  const scenarioId = `scenario_${stationIndex}`;
  const isHistorical = choiceIndex === scenario.correct;

  // Mark completed
  state.scenariosCompleted.add(scenarioId);
  state.score += isHistorical ? 5 : 2;
  updateScoreDisplay();
  saveGame();

  // Disable all choices and highlight
  const box = document.getElementById(scenarioId);
  const choices = box.querySelectorAll('.scenario-choice');
  choices.forEach((el, i) => {
    el.onclick = null;
    el.style.cursor = 'default';
    el.removeAttribute('tabindex');
    if (i === scenario.correct) {
      el.classList.add('correct');
    } else if (i === choiceIndex && !isHistorical) {
      el.classList.add('chosen');
    }
    if (i !== scenario.correct && i !== choiceIndex) {
      el.style.opacity = '0.4';
    }
  });

  // Show feedback for the chosen option
  const feedback = document.getElementById(`scenariofb_${stationIndex}`);
  feedback.innerHTML = `<strong>${isHistorical ? 'That matches history!' : 'Interesting choice!'}</strong> ${scenario.choices[choiceIndex].feedback}`;
  feedback.className = `scenario-feedback show ${isHistorical ? 'historical' : 'alternate'}`;

  // Show the historical reveal
  const reveal = document.getElementById(`scenarioreveal_${stationIndex}`);
  reveal.innerHTML = '<strong>What actually happened:</strong> ' + scenario.reveal;
  reveal.classList.add('show');

  // Fade in the journal entries
  const journals = document.getElementById(`journals_${stationIndex}`);
  if (journals) {
    setTimeout(() => {
      journals.style.display = '';
      journals.classList.add('fade-in');
    }, 800);
  }
}

// === CHALLENGE RENDERING ===
function renderChallenge(challenge, stationIndex, alreadyCompleted) {
  // Dispatch to type-specific renderer
  switch (challenge.type) {
    case 'map_click':
      return renderMapClickChallenge(challenge, stationIndex, alreadyCompleted);
    case 'ordering':
      return renderOrderingChallenge(challenge, stationIndex, alreadyCompleted);
    case 'fill_in_blank':
      return renderFillInBlankChallenge(challenge, stationIndex, alreadyCompleted);
    case 'image_match':
      return renderImageMatchChallenge(challenge, stationIndex, alreadyCompleted);
    default:
      return renderMultipleChoiceChallenge(challenge, stationIndex, alreadyCompleted);
  }
}

// --- Challenge header (shared) ---
function challengeHeader(challengeId, label) {
  let html = `<div class="challenge-box" id="${challengeId}">`;
  html += '<div class="challenge-header">';
  html += '<span class="challenge-icon">&#x1F9ED;</span>';
  html += `<span class="challenge-label">${label || 'Knowledge Check'}</span>`;
  html += '</div>';
  return html;
}

// --- MULTIPLE CHOICE (stations 2, 5) ---
function renderMultipleChoiceChallenge(challenge, stationIndex, alreadyCompleted) {
  const challengeId = `challenge_${stationIndex}`;
  let html = challengeHeader(challengeId, 'Knowledge Check');
  html += `<p class="challenge-question">${challenge.question}</p>`;

  if (alreadyCompleted) {
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

// --- MAP CLICK (stations 1, 8) ---
function renderMapClickChallenge(challenge, stationIndex, alreadyCompleted) {
  const challengeId = `challenge_${stationIndex}`;
  let html = challengeHeader(challengeId, 'Map Challenge');
  html += `<p class="challenge-question">${challenge.question}</p>`;
  html += `<p class="challenge-instruction">${challenge.instruction}</p>`;

  if (alreadyCompleted) {
    html += `<div class="map-click-completed"><span class="map-click-pin">&#x1F4CD;</span> ${challenge.location_name}</div>`;
    html += `<div class="challenge-feedback show correct">${challenge.feedback_correct}</div>`;
  } else {
    html += `<div class="map-click-area" id="mapclick_${stationIndex}"></div>`;
    html += `<div class="challenge-feedback" id="feedback_${stationIndex}"></div>`;
  }

  html += '</div>';
  return html;
}

function initMapClickChallenge(stationIndex) {
  const container = document.getElementById(`mapclick_${stationIndex}`);
  if (!container) return;
  const station = STATIONS[stationIndex];
  const data = station[state.level] || station.standard;
  const challenge = data.challenge;

  // Projection constants (same as main map)
  const latMin = 36.5, latMax = 49.5, lonMin = -126.5, lonMax = -87.5;
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
  function unproj(px, py) {
    const lon = (px / svgW) * lonRange / cosLat + lonMin;
    const lat = latMax - (py / svgH) * latRange;
    return { lat, lon };
  }

  // Station coordinates for reference dots
  const mapStations = [
    { lat: 38.8, lon: -90.1 }, { lat: 41.0, lon: -96.0 }, { lat: 41.3, lon: -96.0 },
    { lat: 47.3, lon: -101.4 }, { lat: 47.3, lon: -101.4 }, { lat: 47.3, lon: -101.4 },
    { lat: 47.5, lon: -111.3 }, { lat: 45.9, lon: -112.5 }, { lat: 46.5, lon: -115.5 },
    { lat: 46.1, lon: -123.9 }
  ];

  // Build mini SVG map
  let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" class="map-click-svg" style="font-family:Georgia,serif;">`;
  svg += `<rect width="${svgW}" height="${svgH}" fill="#f4e8c1"/>`;

  // Rivers (simplified)
  const missouri = [[38.8,-90.1],[39.5,-92.5],[41.0,-96.0],[43.0,-98.5],[46.0,-100.5],[47.3,-101.4],[47.5,-111.3]];
  const columbia = [[45.9,-112.5],[46.5,-115.5],[46.2,-119.0],[46.1,-123.9]];
  [missouri, columbia].forEach(river => {
    const pts = river.map(c => proj(c[0], c[1]));
    svg += `<polyline points="${pts.map(p => p.x+','+p.y).join(' ')}" fill="none" stroke="#7bafd4" stroke-width="2.5" stroke-dasharray="6,3" opacity="0.6"/>`;
  });

  // Mountain ridgeline
  const mtns = [[44.5,-109],[45.5,-111],[46.5,-113],[47,-114.5],[46.5,-115.5],[45.5,-116]];
  const mtnPts = mtns.map(c => proj(c[0], c[1]));
  svg += `<polyline points="${mtnPts.map(p => p.x+','+p.y).join(' ')}" fill="none" stroke="#8b7355" stroke-width="2" opacity="0.5"/>`;

  // Labels
  const labP = proj(42, -100);
  svg += `<text x="${labP.x}" y="${labP.y}" text-anchor="middle" font-size="16" fill="#8b7355" font-style="italic" opacity="0.6">Great Plains</text>`;
  const labM = proj(46, -113.5);
  svg += `<text x="${labM.x}" y="${labM.y}" text-anchor="middle" font-size="14" fill="#6b4423" font-style="italic" opacity="0.5" transform="rotate(-15,${labM.x},${labM.y})">Rocky Mountains</text>`;

  // Station dots (dimmed reference)
  mapStations.forEach((s, i) => {
    const p = proj(s.lat, s.lon);
    svg += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#6b4423" opacity="0.25"/>`;
  });

  // Click target (invisible, full coverage)
  svg += `<rect width="${svgW}" height="${svgH}" fill="transparent" class="map-click-target" id="maptarget_${stationIndex}" style="cursor:crosshair;"/>`;

  // Pin placeholder
  svg += `<g id="mappin_${stationIndex}" style="display:none;"><circle r="8" fill="#c0392b" stroke="#fff" stroke-width="2"/><text dy="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">X</text></g>`;

  // Correct location marker (hidden until answer)
  const cp = proj(challenge.correct_lat, challenge.correct_lon);
  svg += `<g id="mapcorrect_${stationIndex}" style="display:none;"><circle cx="${cp.x}" cy="${cp.y}" r="10" fill="none" stroke="#27ae60" stroke-width="3"/><circle cx="${cp.x}" cy="${cp.y}" r="3" fill="#27ae60"/></g>`;

  svg += '</svg>';
  container.innerHTML = svg;

  // Add click handler
  const target = document.getElementById(`maptarget_${stationIndex}`);
  target.addEventListener('click', function(e) {
    const svgEl = target.closest('svg');
    const rect = svgEl.getBoundingClientRect();
    const scaleX = svgW / rect.width;
    const scaleY = svgH / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    // Show pin
    const pin = document.getElementById(`mappin_${stationIndex}`);
    pin.setAttribute('transform', `translate(${px},${py})`);
    pin.style.display = '';

    // Calculate distance
    const clicked = unproj(px, py);
    const dLat = clicked.lat - challenge.correct_lat;
    const dLon = (clicked.lon - challenge.correct_lon) * cosLat;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    const isCorrect = dist <= challenge.tolerance;

    // Show correct location
    document.getElementById(`mapcorrect_${stationIndex}`).style.display = '';

    // Disable further clicks
    target.style.pointerEvents = 'none';

    // Complete challenge
    completeChallengeResult(stationIndex, isCorrect, challenge);
  });
}

// --- ORDERING (stations 3, 9) ---
function renderOrderingChallenge(challenge, stationIndex, alreadyCompleted) {
  const challengeId = `challenge_${stationIndex}`;
  let html = challengeHeader(challengeId, 'Put It In Order');
  html += `<p class="challenge-question">${challenge.question}</p>`;

  if (alreadyCompleted) {
    html += '<div class="ordering-items completed">';
    challenge.items.forEach((item, i) => {
      html += `<div class="ordering-item correct"><span class="ordering-number">${i + 1}</span> ${item}</div>`;
    });
    html += '</div>';
    html += `<div class="challenge-feedback show correct">${challenge.feedback_correct}</div>`;
  } else {
    html += `<div class="ordering-items" id="ordering_${stationIndex}"></div>`;
    html += `<button class="challenge-submit-btn" id="ordersubmit_${stationIndex}" onclick="checkOrdering(${stationIndex})">Check My Order</button>`;
    html += `<div class="challenge-feedback" id="feedback_${stationIndex}"></div>`;
  }

  html += '</div>';
  return html;
}

function initOrderingChallenge(stationIndex) {
  const container = document.getElementById(`ordering_${stationIndex}`);
  if (!container) return;
  const station = STATIONS[stationIndex];
  const data = station[state.level] || station.standard;
  const challenge = data.challenge;

  // Shuffle items (store correct order as data attribute)
  const indices = challenge.items.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  let html = '';
  indices.forEach((origIdx) => {
    html += `<div class="ordering-item" draggable="true" data-correct="${origIdx}" tabindex="0">`;
    html += `<span class="ordering-handle">&#x2630;</span>`;
    html += `<span class="ordering-text">${challenge.items[origIdx]}</span>`;
    html += `<span class="ordering-arrows">`;
    html += `<button class="ordering-arrow up" onclick="moveOrderItem(this, -1)" title="Move up" aria-label="Move up">&#x25B2;</button>`;
    html += `<button class="ordering-arrow down" onclick="moveOrderItem(this, 1)" title="Move down" aria-label="Move down">&#x25BC;</button>`;
    html += `</span>`;
    html += '</div>';
  });
  container.innerHTML = html;

  // Drag-and-drop support
  let dragItem = null;
  container.addEventListener('dragstart', (e) => {
    dragItem = e.target.closest('.ordering-item');
    if (dragItem) {
      dragItem.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    }
  });
  container.addEventListener('dragend', () => {
    if (dragItem) dragItem.classList.remove('dragging');
    dragItem = null;
  });
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterEl = getDragAfterElement(container, e.clientY);
    if (dragItem) {
      if (afterEl == null) {
        container.appendChild(dragItem);
      } else {
        container.insertBefore(dragItem, afterEl);
      }
    }
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll('.ordering-item:not(.dragging)')];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function moveOrderItem(btn, direction) {
  const item = btn.closest('.ordering-item');
  const container = item.parentElement;
  const items = [...container.querySelectorAll('.ordering-item')];
  const idx = items.indexOf(item);
  if (direction === -1 && idx > 0) {
    container.insertBefore(item, items[idx - 1]);
  } else if (direction === 1 && idx < items.length - 1) {
    container.insertBefore(items[idx + 1], item);
  }
}

function checkOrdering(stationIndex) {
  const container = document.getElementById(`ordering_${stationIndex}`);
  const items = [...container.querySelectorAll('.ordering-item')];
  const station = STATIONS[stationIndex];
  const data = station[state.level] || station.standard;
  const challenge = data.challenge;

  const isCorrect = items.every((item, i) => parseInt(item.dataset.correct) === i);

  // Mark items
  items.forEach((item, i) => {
    item.setAttribute('draggable', 'false');
    item.classList.add(parseInt(item.dataset.correct) === i ? 'correct' : 'incorrect');
    // Remove interactivity
    item.querySelectorAll('.ordering-arrow').forEach(b => b.disabled = true);
    item.querySelector('.ordering-handle').style.cursor = 'default';
  });

  // Hide submit button
  document.getElementById(`ordersubmit_${stationIndex}`).style.display = 'none';

  completeChallengeResult(stationIndex, isCorrect, challenge);
}

// --- FILL IN BLANK (stations 6, 7) ---
function renderFillInBlankChallenge(challenge, stationIndex, alreadyCompleted) {
  const challengeId = `challenge_${stationIndex}`;
  let html = challengeHeader(challengeId, 'Complete the Quote');
  html += `<p class="challenge-question">${challenge.question}</p>`;

  html += '<div class="fill-blank-quote">';
  html += `<span class="quote-text">"${challenge.quote_before} </span>`;

  if (alreadyCompleted) {
    html += `<span class="fill-blank-answer revealed">${challenge.blank_answer}</span>`;
    html += `<span class="quote-text">${challenge.quote_after}"</span>`;
    html += '</div>';
    html += `<div class="challenge-feedback show correct">${challenge.feedback_correct}</div>`;
  } else {
    html += `<input type="text" class="fill-blank-input" id="blankinput_${stationIndex}" placeholder="fill in the blank…" autocomplete="off" onkeydown="if(event.key==='Enter')checkFillBlank(${stationIndex})">`;
    html += `<span class="quote-text">${challenge.quote_after}"</span>`;
    html += '</div>';
    if (challenge.hint) {
      html += `<p class="fill-blank-hint"><em>Hint: ${challenge.hint}</em></p>`;
    }
    html += `<button class="challenge-submit-btn" onclick="checkFillBlank(${stationIndex})">Check Answer</button>`;
    html += `<div class="challenge-feedback" id="feedback_${stationIndex}"></div>`;
  }

  html += '</div>';
  return html;
}

function checkFillBlank(stationIndex) {
  const input = document.getElementById(`blankinput_${stationIndex}`);
  if (!input) return;
  const station = STATIONS[stationIndex];
  const data = station[state.level] || station.standard;
  const challenge = data.challenge;

  const userAnswer = input.value.trim().toLowerCase().replace(/[.,;:!?'"]/g, '');
  const isCorrect = challenge.accepted_answers.some(a => {
    const accepted = a.toLowerCase().replace(/[.,;:!?'"]/g, '');
    // Check for exact match or if user answer contains the accepted answer
    return userAnswer === accepted || userAnswer.includes(accepted) || accepted.includes(userAnswer);
  });

  // Show the correct answer
  input.disabled = true;
  if (isCorrect) {
    input.value = challenge.blank_answer;
    input.classList.add('correct');
  } else {
    input.classList.add('incorrect');
    // Show correct answer after the input
    const reveal = document.createElement('div');
    reveal.className = 'fill-blank-reveal';
    reveal.innerHTML = `The answer: <strong>${challenge.blank_answer}</strong>`;
    input.parentNode.insertBefore(reveal, input.nextSibling);
  }

  // Hide submit button
  const btn = input.closest('.challenge-box').querySelector('.challenge-submit-btn');
  if (btn) btn.style.display = 'none';

  completeChallengeResult(stationIndex, isCorrect, challenge);
}

// --- IMAGE MATCH (stations 4, 10) ---
function renderImageMatchChallenge(challenge, stationIndex, alreadyCompleted) {
  const challengeId = `challenge_${stationIndex}`;
  let html = challengeHeader(challengeId, 'Image Match');
  html += `<p class="challenge-question">${challenge.question}</p>`;

  if (alreadyCompleted) {
    html += '<div class="image-match-grid">';
    challenge.options.forEach((opt, i) => {
      const isCorrect = i === challenge.correct;
      html += `<div class="image-match-option ${isCorrect ? 'correct' : ''}" ${!isCorrect ? 'style="opacity:0.4"' : ''}>`;
      html += `<img src="${opt.image}" alt="${opt.caption}" loading="lazy">`;
      html += `<div class="image-match-caption">${opt.caption}</div>`;
      html += '</div>';
    });
    html += '</div>';
    html += `<div class="challenge-feedback show correct">${challenge.feedback_correct}</div>`;
  } else {
    html += '<div class="image-match-grid">';
    challenge.options.forEach((opt, i) => {
      html += `<div class="image-match-option" onclick="answerImageMatch(${stationIndex}, ${i})" tabindex="0" role="button">`;
      html += `<img src="${opt.image}" alt="${opt.caption}" loading="lazy" onerror="this.parentElement.style.display='none'">`;
      html += `<div class="image-match-caption">${opt.caption}</div>`;
      html += '</div>';
    });
    html += '</div>';
    html += `<div class="challenge-feedback" id="feedback_${stationIndex}"></div>`;
  }

  html += '</div>';
  return html;
}

function answerImageMatch(stationIndex, choiceIndex) {
  const station = STATIONS[stationIndex];
  const data = station[state.level] || station.standard;
  const challenge = data.challenge;
  const challengeId = `challenge_${stationIndex}`;
  const isCorrect = choiceIndex === challenge.correct;

  // Mark all options
  const box = document.getElementById(challengeId);
  const options = box.querySelectorAll('.image-match-option');
  options.forEach((opt, i) => {
    opt.onclick = null;
    opt.style.cursor = 'default';
    opt.removeAttribute('tabindex');
    if (i === challenge.correct) {
      opt.classList.add('correct');
    } else if (i === choiceIndex && !isCorrect) {
      opt.classList.add('incorrect');
    }
    if (i !== challenge.correct) {
      opt.style.opacity = '0.4';
    }
  });

  completeChallengeResult(stationIndex, isCorrect, challenge);
}

// --- SHARED: Complete challenge result (all types) ---
function completeChallengeResult(stationIndex, isCorrect, challenge) {
  const challengeId = `challenge_${stationIndex}`;
  const feedback = document.getElementById(`feedback_${stationIndex}`);

  if (isCorrect) {
    feedback.textContent = challenge.feedback_correct;
    feedback.className = 'challenge-feedback show correct';
    state.score += 10;
    // Unlock discovery
    if (!state.discoveries.includes(stationIndex) && DISCOVERIES[stationIndex]) {
      state.discoveries.push(stationIndex);
      const d = DISCOVERIES[stationIndex];
      const banner = document.createElement('div');
      banner.className = 'discovery-banner';
      banner.innerHTML = `<span class="discovery-banner-icon">${d.icon}</span> <strong>Discovery Unlocked:</strong> ${d.name} <span class="discovery-banner-desc">&mdash; ${d.desc}</span>`;
      feedback.parentNode.insertBefore(banner, feedback.nextSibling);
    }
  } else {
    feedback.textContent = challenge.feedback_incorrect;
    feedback.className = 'challenge-feedback show incorrect';
    state.score += 3; // partial credit for trying
  }

  state.challengesCompleted.add(challengeId);
  updateScoreDisplay();
  saveGame();

  // Enable Continue West button now that challenge is answered
  const continueBtn = document.getElementById('btn-continue-west');
  if (continueBtn) {
    continueBtn.classList.remove('locked');
    continueBtn.disabled = false;
    continueBtn.classList.add('primary');
    if (stationIndex < STATIONS.length - 1) {
      continueBtn.textContent = 'Continue West \u2192';
      continueBtn.onclick = function() { travelToStation(stationIndex + 1); };
    } else {
      continueBtn.textContent = 'Complete the Expedition \u2192';
      continueBtn.onclick = function() { completeExpedition(); };
    }

    // Show the next clue
    const clueArr = (NEXT_CLUES[state.level] || NEXT_CLUES.standard);
    const navEl = continueBtn.closest('.station-nav');
    if (navEl && stationIndex < STATIONS.length - 1 && clueArr[stationIndex]) {
      const clueEl = document.createElement('div');
      clueEl.className = 'discovery-clue';
      clueEl.innerHTML = '<div class="discovery-clue-label">Clue to the Next Station</div>' +
        '<div class="discovery-clue-text">' + clueArr[stationIndex] + '</div>';
      navEl.parentNode.insertBefore(clueEl, navEl);
    }
  }
}

// --- Legacy wrapper for multiple-choice onclick ---
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

  completeChallengeResult(stationIndex, isCorrect, challenge);
}

function autoFillJournal(stationIndex, field, value) {
  // Auto-fill the journal field and save
  const inputId = `jf-${field}-${stationIndex}`;
  const el = document.getElementById(inputId);
  if (el) {
    // Append if field already has content (e.g., multiple authors)
    const current = el.value.trim();
    if (current && !current.includes(value)) {
      el.value = current + ', ' + value;
    } else if (!current) {
      el.value = value;
    }
    saveJournalField(stationIndex, field, el.value);
    // Visual feedback — flash the field
    el.classList.add('field-filled');
    setTimeout(() => el.classList.remove('field-filled'), 1200);
  }
  // Update the clicked element's hint
  const hint = event.currentTarget.querySelector('.fill-hint');
  if (hint) { hint.textContent = 'added!'; setTimeout(() => { hint.textContent = 'tap to add'; }, 1500); }
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

// === EXTERNAL RESOURCES PER STATION ===
const STATION_RESOURCES = [
  { // Station 1: May 14, 1804
    journals: [
      { date: "May 14, 1804", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1804-05-14" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 2: July 20, 1804
    journals: [
      { date: "July 20, 1804", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1804-07-20" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 3: August 2-3, 1804
    journals: [
      { date: "August 2, 1804", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1804-08-02" },
      { date: "August 3, 1804", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1804-08-03" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 4: October 28, 1804
    journals: [
      { date: "October 28, 1804", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1804-10-28" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 5: February 11, 1805
    journals: [
      { date: "February 11, 1805", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1805-02-11" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 6: April 7, 1805
    journals: [
      { date: "April 7, 1805", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1805-04-07" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 7: June 13, 1805
    journals: [
      { date: "June 13, 1805", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1805-06-13" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 8: August 17, 1805
    journals: [
      { date: "August 17, 1805", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1805-08-17" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 9: September-October 1805
    journals: [
      { date: "September 16, 1805", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1805-09-16" },
      { date: "October 1, 1805", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1805-10-01" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  },
  { // Station 10: November 1805
    journals: [
      { date: "November 7, 1805", url: "https://lewisandclarkjournals.unl.edu/item/lc.jrn.1805-11-07" }
    ],
    atlas: "http://lcatlas.lclark.edu/",
    nps: "https://www.nps.gov/lecl/planyourvisit/maps.htm"
  }
];

// === GALLERY IMAGE ERROR HANDLING ===
function galleryImgError(img, stationIndex) {
  const slide = img.closest('.gallery-slide');
  if (!slide) return;
  slide.style.display = 'none';
  slide.dataset.failed = 'true';

  const gallery = document.getElementById('gallery-' + stationIndex);
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.gallery-slide');
  const allFailed = Array.from(slides).every(s => s.dataset.failed === 'true');

  if (allFailed) {
    // Hide entire gallery if no images loaded
    gallery.style.display = 'none';
    return;
  }

  // If the active slide failed, show the next working one
  if (slide.classList.contains('active')) {
    slide.classList.remove('active');
    for (const s of slides) {
      if (s.dataset.failed !== 'true') {
        s.classList.add('active');
        // Update dot
        const dots = gallery.querySelectorAll('.gallery-dot');
        dots.forEach(d => d.classList.remove('active'));
        const idx = parseInt(s.dataset.slide);
        if (dots[idx]) dots[idx].classList.add('active');
        break;
      }
    }
  }
}

// === GALLERY NAVIGATION ===
function galleryNav(stationIndex, direction) {
  const gallery = document.getElementById('gallery-' + stationIndex);
  if (!gallery) return;
  const slides = gallery.querySelectorAll('.gallery-slide');
  const current = gallery.querySelector('.gallery-slide.active');
  const currentIdx = parseInt(current.dataset.slide);
  let next = currentIdx;
  for (let i = 0; i < slides.length; i++) {
    next = next + direction;
    if (next < 0) next = slides.length - 1;
    if (next >= slides.length) next = 0;
    if (slides[next].dataset.failed !== 'true') break;
  }
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

  // Project station positions (with offsets for tightly-clustered stations)
  const positions = mapStations.map((s, i) => {
    const p = proj(s.lat, s.lon);
    // Offset co-located Fort Mandan stations (3, 4, 5) — spread wider
    if (i === 3) { p.x -= 28; p.y += 14; }
    if (i === 4) { p.y -= 18; }
    if (i === 5) { p.x += 28; p.y += 14; }
    // Separate Platte River (1) and Council Bluff (2) — only 0.3° apart
    if (i === 1) { p.y += 10; p.x -= 8; }
    if (i === 2) { p.y -= 10; p.x += 8; }
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

  // --- Progressive reveal: determine which stations to show ---
  const visitedArr = Array.from(state.visitedStations).sort((a, b) => a - b);
  const maxVisited = visitedArr.length > 0 ? Math.max(...visitedArr) : 0;
  const nextStation = maxVisited < positions.length - 1 ? maxVisited + 1 : -1;

  // --- Layer 2: Visited trail (solid path between visited stations) ---
  if (visitedArr.length > 1) {
    let visitedPath = `M ${positions[visitedArr[0]].x} ${positions[visitedArr[0]].y}`;
    for (let i = 1; i < visitedArr.length; i++) {
      if (visitedArr[i] === visitedArr[i-1] + 1) {
        visitedPath += ` L ${positions[visitedArr[i]].x} ${positions[visitedArr[i]].y}`;
      }
    }
    svg += `<path d="${visitedPath}" fill="none" stroke="#d4760a" stroke-width="3"/>`;
  }

  // --- Dashed trail hint from last visited to next station ---
  if (nextStation >= 0) {
    const lastPos = positions[maxVisited];
    const nextPos = positions[nextStation];
    svg += `<path d="M ${lastPos.x} ${lastPos.y} L ${nextPos.x} ${nextPos.y}" fill="none" stroke="#6b4423" stroke-width="2" stroke-dasharray="5,3" opacity="0.4"/>`;
  }

  // --- Layer 3: Segment hit areas + midpoint markers (only for visited segments) ---
  for (let i = 0; i < positions.length - 1; i++) {
    if (!state.visitedStations.has(i) || !state.visitedStations.has(i + 1)) continue;
    const p1 = positions[i];
    const p2 = positions[i + 1];
    // Wider invisible hit area for the trail line
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" `;
    svg += `stroke="transparent" stroke-width="35" style="cursor:pointer;" `;
    svg += `onclick="showSegmentInfo(${i+1})" />`;
    // Clickable midpoint marker (scroll icon) — especially helpful for short legs
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    svg += `<g onclick="showSegmentInfo(${i+1})" style="cursor:pointer;" class="map-segment-marker">`;
    svg += `<circle cx="${mx}" cy="${my}" r="9" fill="#f4e8c1" stroke="#8b7355" stroke-width="1.5" opacity="0.9"/>`;
    svg += `<text x="${mx}" y="${my + 3.5}" font-size="10" fill="#5c4033" text-anchor="middle">&#x1F4DC;</text>`;
    svg += `</g>`;
  }

  // --- Layer 4: Pulsing glow for current station ---
  positions.forEach((pos, i) => {
    if (state.currentStation === i) {
      svg += `<circle cx="${pos.x}" cy="${pos.y}" r="18" fill="none" stroke="#f5a623" stroke-width="1.5" opacity="0.5" pointer-events="none"><animate attributeName="r" values="17;23;17" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0.15;0.5" dur="2s" repeatCount="indefinite"/></circle>`;
    }
  });

  // --- Layer 5: Station markers (progressive — only visited + next) ---
  positions.forEach((pos, i) => {
    const visited = state.visitedStations.has(i);
    const current = state.currentStation === i;
    const isNext = i === nextStation;

    // Only show visited stations and the next one
    if (!visited && !isNext) return;

    let fill, stroke, r, label, numberText;
    if (isNext && !visited) {
      // Undiscovered "next" station — dimmed with "?"
      fill = '#4a3a2a';
      stroke = '#6b5a4a';
      r = 10;
      numberText = '?';
    } else if (current) {
      fill = '#8b1a1a';
      stroke = '#ffffff';
      r = 14;
      numberText = String(i + 1);
    } else {
      fill = '#f5a623';
      stroke = '#d4760a';
      r = 12;
      numberText = String(i + 1);
    }

    if (isNext && !visited) {
      // Next station: clickable but shows message instead of navigating
      svg += `<g class="map-station" onclick="alert('Continue your journey to discover this station!')" style="cursor:pointer; opacity:0.5;">`;
    } else {
      svg += `<g class="map-station ${visited ? 'visited' : ''} ${current ? 'current' : ''}" onclick="goToStation(${i}); showView('station');" style="cursor:pointer;">`;
    }

    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
    svg += `<text x="${pos.x}" y="${pos.y + 4}" font-size="11" fill="#fff" font-family="sans-serif" text-anchor="middle" font-weight="bold">${numberText}</text>`;

    // Label placement: alternate above/below to avoid overlap
    const labelAbove = (i % 2 === 0) || i === 9;
    const labelY = labelAbove ? pos.y - r - 6 : pos.y + r + 16;
    const labelY2 = labelY + 13;

    if (isNext && !visited) {
      svg += `<text x="${pos.x}" y="${labelY}" font-size="11" fill="#8b7355" text-anchor="middle" font-style="italic">Unknown</text>`;
      svg += `<text x="${pos.x}" y="${labelY2}" font-size="9" fill="#8b7355" text-anchor="middle">destination</text>`;
    } else {
      svg += `<text x="${pos.x}" y="${labelY}" font-size="11" fill="#2c1810" text-anchor="middle" font-weight="bold">${pos.label}</text>`;
      svg += `<text x="${pos.x}" y="${labelY2}" font-size="9" fill="#5c4033" text-anchor="middle">${pos.sublabel}</text>`;
    }

    svg += '</g>';
  });

  // --- Fort Mandan cluster bracket (only show if station 3+ visited) ---
  if (state.visitedStations.has(3)) {
    const fm = proj(47.3, -101.4);
    svg += `<text x="${fm.x}" y="${fm.y - 30}" font-size="8" fill="#8b7355" text-anchor="middle" font-style="italic">Stations 4\u20136: Fort Mandan</text>`;
  }

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

  // --- Journey progress stats (only for visited segments) ---
  let traveledMiles = 0;
  let traveledDays = 0;
  for (let i = 1; i < SEGMENT_DATA.length; i++) {
    if (state.visitedStations.has(i) && SEGMENT_DATA[i]) {
      traveledMiles += SEGMENT_DATA[i].miles;
      traveledDays += SEGMENT_DATA[i].days;
    }
  }
  if (traveledMiles > 0) {
    svg += `<text x="${svgW / 2}" y="${svgH - 8}" font-size="9" fill="#8b7355" text-anchor="middle">Your journey so far: ~${traveledMiles.toLocaleString()} miles over ${traveledDays} days</text>`;
  }

  svg += '</svg>';
  wrap.innerHTML = svg;
}

// === MAP INFO PANEL (persistent HTML panel below the map) ===
function showSegmentInfo(segIndex) {
  const seg = SEGMENT_DATA[segIndex];
  if (!seg) return;

  const panel = document.getElementById('map-info-panel');

  let html = '<div class="map-info-header">';
  html += `<div class="map-info-title">Leg ${segIndex}: Station ${segIndex} \u2192 Station ${segIndex + 1}</div>`;
  html += '<button class="map-info-close" onclick="closeMapInfo()">&times;</button>';
  html += '</div>';

  html += '<div class="map-info-grid">';
  html += `<div class="map-info-item"><span class="map-info-item-label">Distance</span><span class="map-info-item-value">${seg.miles > 0 ? seg.miles + ' miles' : 'Same location'}</span></div>`;
  html += `<div class="map-info-item"><span class="map-info-item-label">Duration</span><span class="map-info-item-value">${seg.days} days</span></div>`;
  html += `<div class="map-info-item"><span class="map-info-item-label">Dates</span><span class="map-info-item-value">${seg.dateRange}</span></div>`;
  html += `<div class="map-info-item"><span class="map-info-item-label">Terrain</span><span class="map-info-item-value">${seg.terrain}</span></div>`;
  html += '</div>';

  html += '<div class="map-info-detail">';
  html += `<p><strong>Health:</strong> ${seg.health}</p>`;
  html += `<p><strong>Supplies:</strong> ${seg.supplies}</p>`;
  html += `<p><strong>Toll:</strong> ${seg.toll}</p>`;
  html += '</div>';

  // "Add to journal" button
  html += `<button class="map-info-btn" onclick="addSegmentToJournal(${segIndex})">Add journey details to your journal</button>`;

  panel.innerHTML = html;
  panel.classList.add('active');
}

function closeMapInfo() {
  const panel = document.getElementById('map-info-panel');
  if (panel) panel.classList.remove('active');
}

function addSegmentToJournal(segIndex) {
  const seg = SEGMENT_DATA[segIndex];
  if (!seg) return;

  // Destination station index (0-indexed) equals segIndex
  const destIdx = segIndex;
  const currentSummary = state.journalEntries[`summary_${destIdx}`] || '';
  const travelNote = `[Journey: ${seg.miles} miles, ${seg.days} days. ${seg.terrain}. ${seg.toll}]`;

  // Only add if not already present
  if (!currentSummary.includes('[Journey:')) {
    state.journalEntries[`summary_${destIdx}`] = travelNote + (currentSummary ? '\n\n' + currentSummary : '');
  }

  // Also set dates if not already filled
  if (!state.journalEntries[`date_${destIdx}`]) {
    state.journalEntries[`date_${destIdx}`] = seg.dateRange;
  }

  saveGame();

  // Visual feedback on the button
  const btns = document.querySelectorAll('.map-info-btn');
  btns.forEach(btn => {
    btn.textContent = 'Added to journal!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Add journey details to your journal';
      btn.disabled = false;
    }, 2000);
  });
}

// === JOURNAL TRACKER RENDERING (only show visited stations) ===
function renderJournalTracker() {
  const tbody = document.getElementById('tracker-body');
  let html = '';

  for (let i = 0; i < STATIONS.length; i++) {
    const visited = state.visitedStations.has(i);

    // Only show visited stations (progressive discovery)
    if (!visited) continue;

    const savedDate = state.journalEntries[`date_${i}`] || '';
    const savedAuthor = state.journalEntries[`author_${i}`] || '';
    const savedSummary = state.journalEntries[`summary_${i}`] || '';
    const savedReflection = state.journalEntries[`reflection_${i}`] || '';

    html += '<tr>';
    html += `<td class="tracker-station-num visited">${i + 1}</td>`;
    html += `<td><input type="text" value="${escapeHtml(savedDate)}" placeholder="Date(s)..." onchange="saveJournalField(${i}, 'date', this.value)"/></td>`;
    html += `<td><input type="text" value="${escapeHtml(savedAuthor)}" placeholder="Author(s)..." onchange="saveJournalField(${i}, 'author', this.value)"/></td>`;
    html += `<td><textarea placeholder="Summary..." onchange="saveJournalField(${i}, 'summary', this.value)">${escapeHtml(savedSummary)}</textarea></td>`;
    html += `<td><textarea placeholder="Analysis..." onchange="saveReflection(${i}, this.value)">${escapeHtml(savedReflection)}</textarea></td>`;
    html += '</tr>';
  }

  if (html === '') {
    html = '<tr><td colspan="5" style="text-align:center;color:#8b7355;padding:2rem;font-style:italic;">Visit stations to add entries to your journal.</td></tr>';
  }

  tbody.innerHTML = html;

  // Render discoveries section below the journal table
  const discPanel = document.getElementById('discoveries-panel');
  if (discPanel) {
    if (state.discoveries.length === 0) {
      discPanel.innerHTML = '<p style="color:#8b7355;font-style:italic;text-align:center;padding:1rem;">Answer Knowledge Checks correctly to unlock discoveries.</p>';
    } else {
      let dhtml = '<div class="discoveries-grid">';
      state.discoveries.sort((a, b) => a - b).forEach(idx => {
        const d = DISCOVERIES[idx];
        if (d) {
          dhtml += `<div class="discovery-item"><span class="discovery-item-icon">${d.icon}</span><div><strong>${d.name}</strong><br><span class="discovery-item-desc">${d.desc}</span></div></div>`;
        }
      });
      dhtml += '</div>';
      discPanel.innerHTML = dhtml;
    }
  }
}

// === INTERACTIVE TRAVEL TRANSITION ===
function renderTravelTransition(fromIndex, toIndex, callback) {
  const overlay = document.getElementById('travel-overlay');
  const scene = document.getElementById('travel-scene');

  const distances = [0, 600, 25, 400, 0, 0, 350, 200, 150, 300, 250];
  const miles = distances[toIndex] || 200;

  // Pick 2-3 random events (no repeats until all 29 have been shown)
  const numEvents = 2 + Math.floor(Math.random() * 2);

  // Filter out already-seen events; reset if all have been seen
  let available = TRAIL_EVENTS.filter(e => !state.seenEvents.includes(e.title));
  if (available.length < numEvents) {
    state.seenEvents = [];
    available = [...TRAIL_EVENTS];
  }

  // Fisher-Yates shuffle for unbiased randomization
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const journeyEvents = available.slice(0, Math.min(numEvents, available.length));

  // Track which events have been shown
  journeyEvents.forEach(e => state.seenEvents.push(e.title));
  saveGame();

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

  // Remove target if not tapped within 2.5s
  setTimeout(() => {
    if (target.parentNode) {
      target.classList.add('swat-miss');
      setTimeout(() => { if (target.parentNode) target.remove(); }, 300);
    }
  }, 2500);

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
