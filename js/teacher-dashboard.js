// ============================================================
// teacher-dashboard.js — Teacher registration, login, dashboard
// All user content escaped via escapeHtml() (defined in renderers.js)
// ============================================================

var TeacherDashboard = (function() {

  var _session = null; // { classCode, teacherName, teacherEmail }

  // Station coordinates (same as renderers.js renderMap)
  var STATION_COORDS = [
    { lat: 38.8, lon: -90.1 },
    { lat: 41.0, lon: -96.0 },
    { lat: 41.3, lon: -96.0 },
    { lat: 47.3, lon: -101.4 },
    { lat: 47.3, lon: -101.4 },
    { lat: 47.3, lon: -101.4 },
    { lat: 47.5, lon: -111.3 },
    { lat: 45.9, lon: -112.5 },
    { lat: 46.5, lon: -115.5 },
    { lat: 46.1, lon: -123.9 }
  ];

  var STATION_NAMES = [
    'Camp Dubois', 'Platte River', 'Council Bluff', 'Fort Mandan',
    'Fort Mandan', 'Fort Mandan', 'Great Falls', 'Camp Fortunate',
    'Lolo Trail', 'Fort Clatsop'
  ];

  var PERIOD_COLORS = [
    '#5a9bbc', '#4a7c2e', '#d4760a', '#8b4513',
    '#8b1a1a', '#2d5016', '#c44', '#f5a623'
  ];

  var latMin = 36.5, latMax = 49.5, lonMin = -126.5, lonMax = -87.5;
  var midLat = (latMin + latMax) / 2;
  var cosLat = Math.cos(midLat * Math.PI / 180);
  var svgW = 900;
  var lonRange = (lonMax - lonMin) * cosLat;
  var latRange = latMax - latMin;
  var svgH = Math.round(svgW * (latRange / lonRange));

  function proj(lat, lon) {
    var x = ((lon - lonMin) * cosLat / lonRange) * svgW;
    var y = ((latMax - lat) / latRange) * svgH;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }

  function getEl() {
    return document.getElementById('dashboard-content');
  }

  var _dashSaves = [];
  var _dashView = 'map';

  // === RENDER: Login / Registration ===
  function renderLogin() {
    var el = getEl();
    var h = '';
    h += '<div class="dash-card">';
    h += '<h2 class="dash-title">Teacher Dashboard</h2>';
    h += '<p class="dash-subtitle">Sign in with your class code, or create a new class.</p>';
    h += '<div class="dash-section">';
    h += '<h3>Sign In</h3>';
    h += '<div class="dash-field"><label>Class Code</label>';
    h += '<input type="text" id="dash-login-code" placeholder="e.g. CLARK3" maxlength="6" style="text-transform:uppercase;"></div>';
    h += '<div class="dash-field"><label>Password</label>';
    h += '<input type="password" id="dash-login-pass" placeholder="Your teacher password"></div>';
    h += '<div class="dash-error" id="dash-login-error"></div>';
    h += '<button class="btn-start" onclick="TeacherDashboard.login()" style="width:100%;margin-top:0.5rem;">Sign In</button>';
    h += '</div>';
    h += '<div class="dash-divider"></div>';
    h += '<div class="dash-section">';
    h += '<h3>Create a New Class</h3>';
    h += '<div class="dash-field"><label>Your Name</label>';
    h += '<input type="text" id="dash-reg-name" placeholder="e.g. Mr. B"></div>';
    h += '<div class="dash-field"><label>School Email</label>';
    h += '<input type="text" id="dash-reg-email" placeholder="Must end with @edmonds.wednet.edu"></div>';
    h += '<div class="dash-field"><label>Class Name</label>';
    h += '<input type="text" id="dash-reg-label" placeholder="e.g. Period 3, Block A"></div>';
    h += '<div class="dash-field"><label>Choose a Password</label>';
    h += '<input type="password" id="dash-reg-pass" placeholder="For accessing your dashboard"></div>';
    h += '<div class="dash-error" id="dash-reg-error"></div>';
    h += '<button class="btn-start" onclick="TeacherDashboard.register()" style="width:100%;margin-top:0.5rem;">Create Class</button>';
    h += '</div>';
    h += '</div>';
    el.textContent = '';
    el.insertAdjacentHTML('afterbegin', h);
  }

  // === RENDER: Class Created ===
  function renderClassCreated(classCode) {
    var el = getEl();
    var h = '';
    h += '<div class="dash-card" style="text-align:center;">';
    h += '<h2 class="dash-title">Class Created!</h2>';
    h += '<p class="dash-subtitle">Share this code with your students:</p>';
    h += '<div class="dash-class-code">' + escapeHtml(classCode) + '</div>';
    h += '<p style="font-size:0.85rem;color:var(--ink-light);margin:1rem 0;">Students will enter this code when they start the expedition. Their progress will sync automatically.</p>';
    h += '<button class="btn-start" onclick="TeacherDashboard.goToDashboard()" style="width:100%;">Go to Dashboard</button>';
    h += '</div>';
    el.textContent = '';
    el.insertAdjacentHTML('afterbegin', h);
  }

  // === RENDER: Dashboard ===
  function renderDashboard(saves) {
    var el = getEl();
    var periods = [];
    saves.forEach(function(s) {
      if (periods.indexOf(s.period) === -1) periods.push(s.period);
    });
    periods.sort();

    var h = '';
    h += '<div class="dash-header">';
    h += '<div class="dash-header-left">';
    var dashLabel = _session.classLabel ? escapeHtml(_session.classLabel) : escapeHtml(_session.teacherName) + '\'s Class';
    h += '<h2 class="dash-title" style="margin:0;">' + dashLabel + '</h2>';
    h += '<span class="dash-code-badge">Code: ' + escapeHtml(_session.classCode) + '</span>';
    h += '</div>';
    h += '<div class="dash-header-right">';
    h += '<select id="dash-period-filter" onchange="TeacherDashboard.filterPeriod()">';
    h += '<option value="all">All Periods</option>';
    periods.forEach(function(p) {
      h += '<option value="' + escapeHtml(p) + '">Period ' + escapeHtml(p) + '</option>';
    });
    h += '</select>';
    h += '<button class="btn-save-code" onclick="TeacherDashboard.myClasses()">My Classes</button>';
    h += '<button class="btn-save-code" onclick="TeacherDashboard.refresh()">Refresh</button>';
    h += '<button class="btn-save-code" onclick="TeacherDashboard.toggleView()">Toggle View</button>';
    h += '</div>';
    h += '</div>';

    // Stats
    var totalStudents = saves.length;
    var completedCount = saves.filter(function(s) { return s.completed; }).length;
    var avgScore = totalStudents > 0 ? Math.round(saves.reduce(function(sum, s) { return sum + (s.score || 0); }, 0) / totalStudents) : 0;
    h += '<div class="dash-stats">';
    h += '<div class="dash-stat"><span class="dash-stat-num">' + totalStudents + '</span><span class="dash-stat-label">Students</span></div>';
    h += '<div class="dash-stat"><span class="dash-stat-num">' + completedCount + '</span><span class="dash-stat-label">Completed</span></div>';
    h += '<div class="dash-stat"><span class="dash-stat-num">' + avgScore + '</span><span class="dash-stat-label">Avg Score</span></div>';
    h += '<div class="dash-stat"><span class="dash-stat-num">' + periods.length + '</span><span class="dash-stat-label">Periods</span></div>';
    h += '</div>';

    h += '<div id="dash-map-view"></div>';
    h += '<div id="dash-table-view" style="display:none;"></div>';

    el.textContent = '';
    el.insertAdjacentHTML('afterbegin', h);
    _dashSaves = saves;
    _dashView = 'map';

    // Render map into its container
    document.getElementById('dash-map-view').insertAdjacentHTML('afterbegin', buildMapView(saves, periods));
  }

  // === BUILD MAP VIEW ===
  function buildMapView(saves, periods) {
    var filter = null;
    var filterEl = document.getElementById('dash-period-filter');
    if (filterEl && filterEl.value !== 'all') filter = filterEl.value;

    var h = '<div class="dash-map-wrap">';
    var svg = '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" xmlns="http://www.w3.org/2000/svg" style="font-family:Georgia,serif;width:100%;height:auto;">';
    svg += '<rect width="' + svgW + '" height="' + svgH + '" fill="#e8dcc8"/>';

    // Coastline
    var coast = [[49,-124.5],[48.4,-124.6],[47.5,-124.4],[46.2,-124.0],[45.5,-124.0],[44,-124.2],[42,-124.5],[40,-124.3],[38,-123.0],[37,-122.5]];
    var coastPts = coast.map(function(c) { return proj(c[0], c[1]); });
    svg += '<path d="M0,0 L0,' + svgH + ' L' + coastPts[coastPts.length-1].x + ',' + svgH;
    for (var ci = coastPts.length - 1; ci >= 0; ci--) svg += ' L' + coastPts[ci].x + ',' + coastPts[ci].y;
    svg += ' L0,0 Z" fill="#c5dbe8" opacity="0.5"/>';

    // Mountains
    var mtnPts = [[49,-109],[47.5,-113],[45,-114],[43,-111],[41,-110],[39,-108],[39,-106.5],[41,-108],[43,-109.5],[45,-112],[47,-111.5],[49,-107.5]];
    svg += '<polygon points="' + mtnPts.map(function(p) { var pt = proj(p[0],p[1]); return pt.x+','+pt.y; }).join(' ') + '" fill="#b8a88a" opacity="0.3"/>';

    // Station markers and trail
    var stationPts = STATION_COORDS.map(function(s) { return proj(s.lat, s.lon); });
    svg += '<polyline points="' + stationPts.map(function(p) { return p.x+','+p.y; }).join(' ') + '" fill="none" stroke="#8b7355" stroke-width="2" stroke-dasharray="6,3" opacity="0.5"/>';

    stationPts.forEach(function(p, i) {
      svg += '<circle cx="' + p.x + '" cy="' + p.y + '" r="8" fill="#6b4423" stroke="#f4e8c1" stroke-width="1.5" opacity="0.6"/>';
      var labelY = (i % 2 === 0) ? p.y - 14 : p.y + 20;
      svg += '<text x="' + p.x + '" y="' + labelY + '" font-size="8" fill="#5c4033" text-anchor="middle">' + STATION_NAMES[i] + '</text>';
    });

    // Student dots grouped by station
    var stationGroups = {};
    saves.forEach(function(s) {
      if (filter && s.period !== filter) return;
      var station = s.current_station || 0;
      if (!stationGroups[station]) stationGroups[station] = [];
      stationGroups[station].push(s);
    });

    Object.keys(stationGroups).forEach(function(si) {
      var group = stationGroups[si];
      var pt = stationPts[si] || stationPts[0];

      if (group.length <= 8) {
        for (var gi = 0; gi < group.length; gi++) {
          var s = group[gi];
          var pIdx = periods.indexOf(s.period);
          var color = PERIOD_COLORS[pIdx % PERIOD_COLORS.length];
          var angle = (gi / Math.max(group.length, 1)) * Math.PI * 2 - Math.PI / 2;
          var radius = group.length === 1 ? 0 : 14;
          var ox = Math.cos(angle) * radius + 18;
          var oy = Math.sin(angle) * radius;
          svg += '<circle cx="' + (pt.x + ox) + '" cy="' + (pt.y + oy) + '" r="5" fill="' + color + '" stroke="#fff" stroke-width="1">';
          svg += '<title>' + escapeHtml(s.student_name) + ' (P' + escapeHtml(s.period) + ') \u2014 Station ' + (parseInt(si)+1) + ', ' + (s.score||0) + ' pts</title>';
          svg += '</circle>';
        }
      } else {
        // Too many to show individually — show count
        for (var gi = 0; gi < 6; gi++) {
          var s = group[gi];
          var pIdx = periods.indexOf(s.period);
          var color = PERIOD_COLORS[pIdx % PERIOD_COLORS.length];
          var angle = (gi / 6) * Math.PI * 2 - Math.PI / 2;
          svg += '<circle cx="' + (pt.x + Math.cos(angle)*14 + 18) + '" cy="' + (pt.y + Math.sin(angle)*14) + '" r="4" fill="' + color + '" stroke="#fff" stroke-width="1"/>';
        }
        svg += '<text x="' + (pt.x + 18) + '" y="' + (pt.y + 30) + '" font-size="10" fill="#5c4033" text-anchor="middle" font-family="system-ui">\u00D7' + group.length + '</text>';
      }
    });

    svg += '<text x="' + (svgW/2) + '" y="20" font-size="13" fill="#2c1810" text-anchor="middle" font-weight="bold">Student Progress \u2014 ' + escapeHtml(_session.classCode) + '</text>';

    // Legend
    if (periods.length > 0) {
      var legendX = svgW - 130;
      var legendY = svgH - 10 - periods.length * 16;
      svg += '<rect x="' + (legendX - 10) + '" y="' + (legendY - 12) + '" width="140" height="' + (periods.length * 16 + 16) + '" fill="rgba(244,232,193,0.8)" rx="4"/>';
      periods.forEach(function(p, i) {
        var color = PERIOD_COLORS[i % PERIOD_COLORS.length];
        svg += '<circle cx="' + legendX + '" cy="' + (legendY + i * 16) + '" r="5" fill="' + color + '"/>';
        svg += '<text x="' + (legendX + 10) + '" y="' + (legendY + i * 16 + 4) + '" font-size="9" fill="#5c4033" font-family="system-ui">Period ' + escapeHtml(p) + '</text>';
      });
    }

    svg += '</svg>';
    h += svg + '</div>';
    return h;
  }

  // === BUILD TABLE VIEW ===
  function buildTableView(saves) {
    var filter = null;
    var filterEl = document.getElementById('dash-period-filter');
    if (filterEl && filterEl.value !== 'all') filter = filterEl.value;
    var filtered = filter ? saves.filter(function(s) { return s.period === filter; }) : saves;

    var h = '<div class="dash-table-wrap">';
    h += '<div style="text-align:right;margin-bottom:0.5rem;"><button class="btn-save-code" onclick="TeacherDashboard.exportCSV()">Export CSV</button></div>';
    h += '<table class="dash-table"><thead><tr>';
    h += '<th>Name</th><th>Period</th><th>Station</th><th>Score</th><th>Status</th><th>Last Active</th><th></th>';
    h += '</tr></thead><tbody>';

    filtered.forEach(function(s, i) {
      var statusText = s.completed ? '\u2705 Complete' : 'Station ' + ((s.current_station||0)+1) + '/10';
      var lastActive = s.updated_at ? new Date(s.updated_at).toLocaleDateString() : '\u2014';
      var saveId = s.id || '';
      h += '<tr class="dash-row">';
      h += '<td onclick="TeacherDashboard.expandRow(' + i + ')" style="cursor:pointer;">' + escapeHtml(s.student_name) + '</td>';
      h += '<td>' + escapeHtml(s.period) + '</td>';
      h += '<td>' + ((s.current_station||0)+1) + '</td>';
      h += '<td>' + (s.score||0) + '</td>';
      h += '<td>' + statusText + '</td>';
      h += '<td>' + lastActive + '</td>';
      h += '<td class="dash-student-actions">';
      h += '<button class="dash-class-action-btn" onclick="TeacherDashboard.moveStudent(\'' + saveId + '\', \'' + escapeHtml(s.student_name) + '\')" title="Move to another class">\u27A1\uFE0F</button>';
      h += '<button class="dash-class-action-btn dash-class-delete" onclick="TeacherDashboard.removeStudent(\'' + saveId + '\', \'' + escapeHtml(s.student_name) + '\')" title="Remove student">\u1F5D1\uFE0F</button>';
      h += '</td>';
      h += '</tr>';
      h += '<tr class="dash-expand" id="dash-expand-' + i + '" style="display:none;"><td colspan="7">';
      h += buildJournalPreview(s);
      h += '</td></tr>';
    });

    if (filtered.length === 0) {
      h += '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#8b7355;font-style:italic;">No students have joined this class yet.</td></tr>';
    }

    h += '</tbody></table></div>';
    return h;
  }

  function buildJournalPreview(save) {
    var data = save.save_data;
    if (!data || !data.journalEntries) return '<p style="color:#8b7355;font-style:italic;">No journal entries yet.</p>';

    var h = '<div class="dash-journal-preview">';
    var entries = data.journalEntries;
    var visited = data.visitedStations || [];
    var hasContent = false;

    for (var i = 0; i < 10; i++) {
      if (visited.indexOf(i) === -1) continue;
      var summary = entries['summary_' + i] || '';
      var reflection = entries['reflection_' + i] || '';
      if (!summary && !reflection) continue;
      hasContent = true;
      h += '<div class="dash-journal-entry">';
      h += '<strong>Station ' + (i+1) + '</strong>';
      if (summary) h += '<p><em>Summary:</em> ' + escapeHtml(summary) + '</p>';
      if (reflection) h += '<p><em>Analysis:</em> ' + escapeHtml(reflection) + '</p>';
      h += '</div>';
    }

    if (!hasContent) {
      h += '<p style="color:#8b7355;font-style:italic;">Stations visited but no journal entries written yet.</p>';
    }
    h += '</div>';
    return h;
  }

  // === RENDER: Class Picker (multi-class teachers) ===
  function renderClassPicker(classes, teacherName, teacherEmail, password) {
    var el = getEl();
    var h = '';
    h += '<div class="dash-card">';
    h += '<h2 class="dash-title">Your Classes</h2>';
    h += '<p class="dash-subtitle">Select a class to view its dashboard, or create a new one.</p>';
    h += '<div class="dash-class-list">';
    classes.forEach(function(c) {
      var created = c.created_at ? new Date(c.created_at).toLocaleDateString() : '';
      var label = c.class_label || '';
      var code = c.class_code;
      h += '<div class="dash-class-item">';
      h += '<div style="display:flex;flex-direction:column;cursor:pointer;flex:1;" onclick="TeacherDashboard.selectClass(\'' + escapeHtml(code) + '\')">';
      if (label) h += '<div class="dash-class-item-label">' + escapeHtml(label) + '</div>';
      h += '<div class="dash-class-item-code">' + escapeHtml(code) + '</div>';
      h += '<div class="dash-class-item-info">Created ' + created + '</div>';
      h += '</div>';
      h += '<div class="dash-class-actions">';
      h += '<button class="dash-class-action-btn" onclick="event.stopPropagation();TeacherDashboard.editClass(\'' + escapeHtml(code) + '\')" title="Rename">&#x270F;&#xFE0F;</button>';
      h += '<button class="dash-class-action-btn dash-class-delete" onclick="event.stopPropagation();TeacherDashboard.deleteClass(\'' + escapeHtml(code) + '\')" title="Delete">&#x1F5D1;&#xFE0F;</button>';
      h += '</div>';
      h += '</div>';
    });
    h += '</div>';
    h += '<div class="dash-divider"></div>';
    h += '<button class="btn-start" onclick="TeacherDashboard.quickCreateClass()" style="width:100%;">Create Another Class</button>';
    h += '<div id="quick-create-status" style="text-align:center;margin-top:0.5rem;font-size:0.8rem;color:var(--ink-light);"></div>';
    h += '</div>';
    el.textContent = '';
    el.insertAdjacentHTML('afterbegin', h);
  }

  // === PUBLIC API ===
  return {
    show: function() {
      document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
      document.getElementById('dashboard-screen').classList.add('active');
      renderLogin();
    },

    login: function() {
      var code = (document.getElementById('dash-login-code').value || '').trim().toUpperCase();
      var pass = (document.getElementById('dash-login-pass').value || '').trim();
      var errEl = document.getElementById('dash-login-error');
      if (!code || !pass) { errEl.textContent = 'Please enter class code and password.'; return; }
      errEl.textContent = 'Signing in...';
      teacherLogin(code, pass).then(function(result) {
        if (result.error) { errEl.textContent = result.error; return; }
        _session = result;
        // Check if teacher has multiple classes
        fetchTeacherClasses(result.teacherEmail).then(function(classes) {
          if (classes.length > 1) {
            renderClassPicker(classes, result.teacherName, result.teacherEmail, pass);
          } else {
            TeacherDashboard.refresh();
          }
        });
      });
    },

    selectClass: function(classCode) {
      if (!_session) return;
      _session.classCode = classCode;
      // Find the label for this class
      fetchTeacherClasses(_session.teacherEmail).then(function(classes) {
        var match = classes.find(function(c) { return c.class_code === classCode; });
        _session.classLabel = match ? (match.class_label || '') : '';
        TeacherDashboard.refresh();
      });
    },

    showCreateFromPicker: function() {
      // Go back to login screen with register section visible
      renderLogin();
      // Pre-fill teacher info if we have it
      if (_session) {
        var nameEl = document.getElementById('dash-reg-name');
        var emailEl = document.getElementById('dash-reg-email');
        if (nameEl && _session.teacherName) nameEl.value = _session.teacherName;
        if (emailEl && _session.teacherEmail) emailEl.value = _session.teacherEmail;
      }
    },

    register: function() {
      var name = (document.getElementById('dash-reg-name').value || '').trim();
      var email = (document.getElementById('dash-reg-email').value || '').trim().toLowerCase();
      var label = (document.getElementById('dash-reg-label').value || '').trim();
      var pass = (document.getElementById('dash-reg-pass').value || '').trim();
      var errEl = document.getElementById('dash-reg-error');
      if (!name || !email || !pass) { errEl.textContent = 'Please fill in all fields.'; return; }
      if (!email.endsWith('@edmonds.wednet.edu')) { errEl.textContent = 'Email must end with @edmonds.wednet.edu'; return; }
      if (pass.length < 4) { errEl.textContent = 'Password must be at least 4 characters.'; return; }
      errEl.textContent = 'Creating class...';
      createClass(name, email, pass, label).then(function(result) {
        if (result.error) { errEl.textContent = result.error; }
        else { _session = { classCode: result.classCode, teacherName: name, teacherEmail: email }; renderClassCreated(result.classCode); }
      });
    },

    goToDashboard: function() {
      if (_session) { TeacherDashboard.refresh(); }
      else { renderLogin(); }
    },

    myClasses: function() {
      if (!_session || !_session.teacherEmail) { renderLogin(); return; }
      fetchTeacherClasses(_session.teacherEmail).then(function(classes) {
        renderClassPicker(classes, _session.teacherName, _session.teacherEmail);
      });
    },

    quickCreateClass: function() {
      if (!_session) return;
      var label = prompt('Class name (e.g. Period 3, Block A):');
      if (label === null) return;
      var pass = prompt('Enter your teacher password:');
      if (!pass) return;
      var statusEl = document.getElementById('quick-create-status');
      if (statusEl) statusEl.textContent = 'Creating...';
      createClass(_session.teacherName, _session.teacherEmail, pass, label).then(function(result) {
        if (result.error) {
          alert('Error: ' + result.error);
          if (statusEl) statusEl.textContent = '';
        } else {
          alert('New class created! Code: ' + result.classCode + (label ? ' (' + label + ')' : ''));
          TeacherDashboard.myClasses();
        }
      });
    },

    refresh: function() {
      if (!_session) { renderLogin(); return; }
      fetchClassSaves(_session.classCode).then(function(saves) { renderDashboard(saves); });
    },

    toggleView: function() {
      var mapEl = document.getElementById('dash-map-view');
      var tableEl = document.getElementById('dash-table-view');
      if (_dashView === 'map') {
        mapEl.style.display = 'none';
        tableEl.style.display = '';
        tableEl.textContent = '';
        var periods = [];
        _dashSaves.forEach(function(s) { if (periods.indexOf(s.period) === -1) periods.push(s.period); });
        tableEl.insertAdjacentHTML('afterbegin', buildTableView(_dashSaves));
        _dashView = 'table';
      } else {
        tableEl.style.display = 'none';
        mapEl.style.display = '';
        _dashView = 'map';
      }
    },

    filterPeriod: function() {
      if (!_dashSaves) return;
      var periods = [];
      _dashSaves.forEach(function(s) { if (periods.indexOf(s.period) === -1) periods.push(s.period); });
      periods.sort();
      if (_dashView === 'map') {
        var mapEl = document.getElementById('dash-map-view');
        mapEl.textContent = '';
        mapEl.insertAdjacentHTML('afterbegin', buildMapView(_dashSaves, periods));
      } else {
        var tableEl = document.getElementById('dash-table-view');
        tableEl.textContent = '';
        tableEl.insertAdjacentHTML('afterbegin', buildTableView(_dashSaves));
      }
    },

    expandRow: function(idx) {
      var row = document.getElementById('dash-expand-' + idx);
      if (row) row.style.display = row.style.display === 'none' ? '' : 'none';
    },

    moveStudent: function(saveId, studentName) {
      if (!_session || !_session.teacherEmail) return;
      fetchTeacherClasses(_session.teacherEmail).then(function(classes) {
        var otherClasses = classes.filter(function(c) { return c.class_code !== _session.classCode; });
        if (otherClasses.length === 0) {
          alert('You only have one class. Create another class first to move students.');
          return;
        }
        var options = otherClasses.map(function(c, i) {
          return (i + 1) + '. ' + (c.class_label || c.class_code) + ' (' + c.class_code + ')';
        }).join('\n');
        var choice = prompt('Move ' + studentName + ' to which class?\n\n' + options + '\n\nEnter the number:');
        if (!choice) return;
        var idx = parseInt(choice) - 1;
        if (idx < 0 || idx >= otherClasses.length) { alert('Invalid choice.'); return; }
        var targetCode = otherClasses[idx].class_code;
        var targetLabel = otherClasses[idx].class_label || targetCode;
        if (!confirm('Move ' + studentName + ' to ' + targetLabel + '?')) return;
        moveStudent(saveId, targetCode).then(function(result) {
          if (result.error) { alert('Error: ' + result.error); }
          else { alert(studentName + ' moved to ' + targetLabel); TeacherDashboard.refresh(); }
        });
      });
    },

    removeStudent: function(saveId, studentName) {
      if (!confirm('Remove ' + studentName + ' from this class? Their save data will be permanently deleted.')) return;
      deleteStudentSave(saveId).then(function(result) {
        if (result.error) { alert('Error: ' + result.error); }
        else { alert(studentName + ' has been removed.'); TeacherDashboard.refresh(); }
      });
    },

    editClass: function(classCode) {
      var newLabel = prompt('Enter a new name for class ' + classCode + ':');
      if (newLabel === null) return;
      updateClassLabel(classCode, newLabel.trim()).then(function(result) {
        if (result.error) { alert('Error: ' + result.error); }
        else { TeacherDashboard.myClasses(); }
      });
    },

    deleteClass: function(classCode) {
      if (!confirm('Delete class ' + classCode + '? This will permanently delete all student saves for this class. This cannot be undone.')) return;
      if (!confirm('Are you sure? Type the class code to confirm.')) return;
      var typed = prompt('Type the class code to confirm deletion:');
      if (typed !== classCode) { alert('Class code did not match. Deletion cancelled.'); return; }
      deleteClass(classCode).then(function(result) {
        if (result.error) { alert('Error: ' + result.error); }
        else {
          alert('Class ' + classCode + ' has been deleted.');
          TeacherDashboard.myClasses();
        }
      });
    },

    exportCSV: function() {
      if (!_dashSaves || !_dashSaves.length) return;
      var rows = [['Name','Period','Station','Score','Completed','Last Active']];
      _dashSaves.forEach(function(s) {
        rows.push([s.student_name, s.period, (s.current_station||0)+1, s.score||0, s.completed?'Yes':'No', s.updated_at?new Date(s.updated_at).toLocaleDateString():'']);
      });
      var csv = rows.map(function(r) { return r.map(function(c) { return '"'+String(c).replace(/"/g,'""')+'"'; }).join(','); }).join('\n');
      var blob = new Blob([csv], {type:'text/csv'});
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'lewis-clark-' + _session.classCode + '.csv';
      a.click();
    },

    exitDashboard: function() {
      _session = null;
      document.getElementById('dashboard-screen').classList.remove('active');
      document.getElementById('title-screen').classList.add('active');
    }
  };
})();
