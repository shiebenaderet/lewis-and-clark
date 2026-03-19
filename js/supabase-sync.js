// ============================================================
// supabase-sync.js — Cloud save sync via Supabase
// ============================================================

const SUPABASE_URL = 'https://opfzhgqbaomakovocpeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZnpoZ3FiYW9tYWtvdm9jcGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODQ5NjIsImV4cCI6MjA4ODI2MDk2Mn0.iVRzgVaz6Sk2M9FRu0O-zfWTuelWfG4zx-Q714oPYfw';

let _supabase = null;
let _syncStatus = 'idle'; // idle, syncing, synced, error

function getSupabase() {
  if (!_supabase) {
    // Supabase v2 CDN exposes supabase.createClient at top level
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }
  return _supabase;
}

function getSyncStatus() { return _syncStatus; }

function updateSyncIcon() {
  var el = document.getElementById('cloud-sync-icon');
  if (!el) return;
  if (_syncStatus === 'synced') {
    el.textContent = '\u2601\uFE0F';
    el.title = 'Saved to cloud';
    el.className = 'cloud-sync-icon synced';
  } else if (_syncStatus === 'syncing') {
    el.textContent = '\u2601\uFE0F';
    el.title = 'Syncing...';
    el.className = 'cloud-sync-icon syncing';
  } else if (_syncStatus === 'error') {
    el.textContent = '\u2601\uFE0F';
    el.title = 'Cloud sync unavailable';
    el.className = 'cloud-sync-icon error';
  } else {
    el.textContent = '';
    el.className = 'cloud-sync-icon';
  }
}

// === VALIDATE CLASS CODE ===
async function validateClassCode(code) {
  var sb = getSupabase();
  if (!sb) return false;
  try {
    var resp = await sb.from('lc_classes').select('class_code').eq('class_code', code.toUpperCase()).single();
    return resp.data !== null;
  } catch (e) { return false; }
}

// === SYNC TO CLOUD (called after every saveGame) ===
async function syncToCloud() {
  if (!state.classCode || !state.studentName || !state.period) return;
  var sb = getSupabase();
  if (!sb) return;

  _syncStatus = 'syncing';
  updateSyncIcon();

  try {
    var saveData = _buildSaveData();
    var resp = await sb.from('lc_saves').upsert({
      class_code: state.classCode,
      student_name: state.studentName,
      period: state.period,
      save_data: saveData,
      current_station: state.currentStation,
      score: state.score,
      completed: state.visitedStations.size >= 10 && state.challengesCompleted.size >= 10,
      updated_at: new Date().toISOString()
    }, { onConflict: 'class_code,student_name,period' });

    if (resp.error) {
      console.warn('Cloud sync error:', resp.error.message);
      _syncStatus = 'error';
    } else {
      _syncStatus = 'synced';
    }
  } catch (e) {
    console.warn('Cloud sync failed:', e);
    _syncStatus = 'error';
  }
  updateSyncIcon();
}

// === LOAD FROM CLOUD (for Day 2 on different device) ===
async function loadFromCloud(classCode, studentName, period) {
  var sb = getSupabase();
  if (!sb) return null;

  try {
    var resp = await sb.from('lc_saves')
      .select('save_data')
      .eq('class_code', classCode)
      .eq('student_name', studentName)
      .eq('period', period)
      .single();

    if (resp.data && resp.data.save_data) {
      return resp.data.save_data;
    }
    return null;
  } catch (e) {
    console.warn('Cloud load failed:', e);
    return null;
  }
}

// === CHECK IF CLOUD SAVE EXISTS ===
async function checkCloudSave(classCode, studentName, period) {
  var sb = getSupabase();
  if (!sb) return false;

  try {
    var resp = await sb.from('lc_saves')
      .select('id')
      .eq('class_code', classCode)
      .eq('student_name', studentName)
      .eq('period', period)
      .single();
    return resp.data !== null;
  } catch (e) { return false; }
}

// === HASH PASSWORD ===
// Consistent djb2 hash — works in all browsers, all contexts.
// Sufficient for a classroom tool (not protecting sensitive data).
async function hashPassword(password) {
  var hash = 5381;
  for (var i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash + password.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return 'h' + (hash >>> 0).toString(16).padStart(8, '0');
}

// === TEACHER: CREATE CLASS ===
async function createClass(teacherName, teacherEmail, password, classLabel) {
  var sb = getSupabase();
  if (!sb) {
    console.error('Supabase client not initialized');
    return { error: 'Cloud service not available. Please refresh and try again.' };
  }

  if (!teacherEmail.endsWith('@edmonds.wednet.edu')) {
    return { error: 'Email must end with @edmonds.wednet.edu' };
  }

  var passwordHash = await hashPassword(password);

  for (var attempt = 0; attempt < 5; attempt++) {
    var code = generateClassCode();
    var resp = await sb.from('lc_classes').insert({
      class_code: code,
      teacher_name: teacherName,
      teacher_email: teacherEmail,
      teacher_password_hash: passwordHash,
      class_label: classLabel || ''
    });

    if (!resp.error) {
      return { classCode: code };
    }
    console.warn('Class creation attempt failed:', resp.error);
    if (resp.error.code === '23505') continue;
    return { error: resp.error.message || 'Failed to create class. Check your email and try again.' };
  }
  return { error: 'Could not generate unique class code. Try again.' };
}

function generateClassCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1
  var code = '';
  for (var i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// === TEACHER: LOGIN (by class code or email) ===
async function teacherLogin(classCode, password) {
  var sb = getSupabase();
  if (!sb) return { error: 'Supabase not available' };

  var resp = await sb.from('lc_classes')
    .select('class_code, teacher_name, teacher_email, teacher_password_hash')
    .eq('class_code', classCode.toUpperCase())
    .single();

  if (!resp.data) return { error: 'Class not found' };

  var passwordHash = await hashPassword(password);
  if (passwordHash !== resp.data.teacher_password_hash) {
    return { error: 'Incorrect password' };
  }

  return {
    classCode: resp.data.class_code,
    teacherName: resp.data.teacher_name,
    teacherEmail: resp.data.teacher_email
  };
}

async function teacherLoginByEmail(email, password) {
  var sb = getSupabase();
  if (!sb) return { error: 'Supabase not available' };

  var resp = await sb.from('lc_classes')
    .select('class_code, teacher_name, teacher_email, teacher_password_hash')
    .eq('teacher_email', email.toLowerCase());

  if (!resp.data || resp.data.length === 0) return { error: 'No classes found for this email' };

  var passwordHash = await hashPassword(password);
  // Check password against the first class (all classes for same teacher use same password)
  if (passwordHash !== resp.data[0].teacher_password_hash) {
    return { error: 'Incorrect password' };
  }

  return {
    teacherName: resp.data[0].teacher_name,
    teacherEmail: resp.data[0].teacher_email,
    classes: resp.data.map(function(c) { return c.class_code; })
  };
}

// === TEACHER: FETCH ALL CLASSES FOR AN EMAIL ===
async function fetchTeacherClasses(teacherEmail) {
  var sb = getSupabase();
  if (!sb) return [];
  var resp = await sb.from('lc_classes')
    .select('class_code, teacher_name, class_label, created_at')
    .eq('teacher_email', teacherEmail.toLowerCase())
    .order('created_at', { ascending: false });
  return resp.data || [];
}

// === TEACHER: CHANGE PASSWORD ===
async function changeTeacherPassword(teacherEmail, oldPassword, newPassword) {
  var sb = getSupabase();
  if (!sb) return { error: 'Supabase not available' };

  // Verify old password
  var resp = await sb.from('lc_classes')
    .select('teacher_password_hash')
    .eq('teacher_email', teacherEmail.toLowerCase())
    .limit(1)
    .single();

  if (!resp.data) return { error: 'Account not found' };

  var oldHash = await hashPassword(oldPassword);
  if (oldHash !== resp.data.teacher_password_hash) {
    return { error: 'Current password is incorrect' };
  }

  var newHash = await hashPassword(newPassword);
  var updateResp = await sb.from('lc_classes')
    .update({ teacher_password_hash: newHash })
    .eq('teacher_email', teacherEmail.toLowerCase());

  if (updateResp.error) return { error: updateResp.error.message };
  return { success: true };
}

// === TEACHER: UPDATE CLASS LABEL ===
async function updateClassLabel(classCode, newLabel) {
  var sb = getSupabase();
  if (!sb) return { error: 'Supabase not available' };
  var resp = await sb.from('lc_classes').update({ class_label: newLabel }).eq('class_code', classCode);
  if (resp.error) return { error: resp.error.message };
  return { success: true };
}

// === TEACHER: DELETE CLASS ===
async function deleteClass(classCode) {
  var sb = getSupabase();
  if (!sb) return { error: 'Supabase not available' };
  // Delete saves first (foreign key constraint)
  await sb.from('lc_saves').delete().eq('class_code', classCode);
  var resp = await sb.from('lc_classes').delete().eq('class_code', classCode);
  if (resp.error) return { error: resp.error.message };
  return { success: true };
}

// === TEACHER: MOVE STUDENT TO ANOTHER CLASS ===
async function moveStudent(saveId, newClassCode) {
  var sb = getSupabase();
  if (!sb) return { error: 'Supabase not available' };
  var resp = await sb.from('lc_saves').update({ class_code: newClassCode }).eq('id', saveId);
  if (resp.error) return { error: resp.error.message };
  return { success: true };
}

// === TEACHER: DELETE STUDENT SAVE ===
async function deleteStudentSave(saveId) {
  var sb = getSupabase();
  if (!sb) return { error: 'Supabase not available' };
  var resp = await sb.from('lc_saves').delete().eq('id', saveId);
  if (resp.error) return { error: resp.error.message };
  return { success: true };
}

// === TEACHER: FETCH ALL SAVES FOR DASHBOARD ===
async function fetchClassSaves(classCode) {
  var sb = getSupabase();
  if (!sb) return [];

  var resp = await sb.from('lc_saves')
    .select('id, student_name, period, current_station, score, completed, save_data, updated_at')
    .eq('class_code', classCode)
    .order('period')
    .order('student_name');

  return resp.data || [];
}

// === TEACHER: REALTIME ACTIVITY FEED ===
var _realtimeChannel = null;
var _realtimeSnapshots = {}; // keyed by save id, stores last-known state for diffing

function subscribeToClassActivity(classCode, onActivity) {
  var sb = getSupabase();
  if (!sb) return;

  // Unsubscribe from any previous subscription
  unsubscribeClassActivity();

  // Build snapshots from current dashboard data for diffing
  // (caller should call snapshotSaves() after initial fetch)

  _realtimeChannel = sb
    .channel('class-activity-' + classCode)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'lc_saves', filter: 'class_code=eq.' + classCode },
      function(payload) {
        var row = payload.new;
        if (!row) return;
        var prev = _realtimeSnapshots[row.id] || null;
        var activities = diffSaveActivity(prev, row);
        // Update snapshot
        _realtimeSnapshots[row.id] = {
          student_name: row.student_name,
          period: row.period,
          current_station: row.current_station,
          score: row.score,
          completed: row.completed,
          save_data: row.save_data
        };
        if (activities.length > 0 && typeof onActivity === 'function') {
          onActivity(activities);
        }
      }
    )
    .subscribe();
}

function unsubscribeClassActivity() {
  if (_realtimeChannel) {
    var sb = getSupabase();
    if (sb) sb.removeChannel(_realtimeChannel);
    _realtimeChannel = null;
  }
}

function snapshotSaves(saves) {
  _realtimeSnapshots = {};
  saves.forEach(function(s) {
    _realtimeSnapshots[s.id] = {
      student_name: s.student_name,
      period: s.period,
      current_station: s.current_station,
      score: s.score,
      completed: s.completed,
      save_data: s.save_data
    };
  });
}

function diffSaveActivity(prev, curr) {
  var activities = [];
  var name = curr.student_name || 'A student';
  var period = curr.period ? ' (P' + curr.period + ')' : '';
  var label = name + period;
  var sd = curr.save_data || {};
  var prevSd = prev ? (prev.save_data || {}) : {};

  if (!prev) {
    // New student joined
    activities.push({ icon: '\uD83D\uDCDD', text: label + ' joined the expedition' });
    return activities;
  }

  // Station progress
  if (curr.current_station > prev.current_station) {
    activities.push({ icon: '\uD83D\uDCCD', text: label + ' reached Station ' + (curr.current_station + 1) });
  }

  // Completed expedition
  if (curr.completed && !prev.completed) {
    activities.push({ icon: '\uD83C\uDFC1', text: label + ' completed the expedition!' });
  }

  // Journal entries — check for new or updated summaries
  var prevEntries = prevSd.journalEntries || {};
  var currEntries = sd.journalEntries || {};
  for (var i = 0; i < 10; i++) {
    var sumKey = 'summary_' + i;
    var refKey = 'reflection_' + i;
    if (currEntries[sumKey] && !prevEntries[sumKey]) {
      activities.push({ icon: '\u270D\uFE0F', text: label + ' wrote a journal entry for Station ' + (i + 1) });
    }
    if (currEntries[refKey] && !prevEntries[refKey]) {
      activities.push({ icon: '\uD83D\uDD0D', text: label + ' completed a Historian\'s Analysis for Station ' + (i + 1) });
    }
  }

  // Challenges completed
  var prevChallenges = prevSd.challengesCompleted || [];
  var currChallenges = sd.challengesCompleted || [];
  if (currChallenges.length > prevChallenges.length) {
    activities.push({ icon: '\u2705', text: label + ' passed a Knowledge Check' });
  }

  // Discoveries
  var prevDisc = prevSd.discoveries || [];
  var currDisc = sd.discoveries || [];
  if (currDisc.length > prevDisc.length) {
    var newDisc = currDisc.filter(function(d) { return prevDisc.indexOf(d) === -1; });
    newDisc.forEach(function(idx) {
      if (typeof DISCOVERIES !== 'undefined' && DISCOVERIES[idx]) {
        activities.push({ icon: DISCOVERIES[idx].icon, text: label + ' unlocked ' + DISCOVERIES[idx].name });
      } else {
        activities.push({ icon: '\u2B50', text: label + ' made a discovery' });
      }
    });
  }

  // Glossary / word puzzles
  var prevGlossary = prevSd.glossary || [];
  var currGlossary = sd.glossary || [];
  if (currGlossary.length > prevGlossary.length) {
    activities.push({ icon: '\uD83D\uDCD6', text: label + ' solved a word puzzle' });
  }

  // Score change (only if significant, to avoid noise)
  if (curr.score - prev.score >= 10 && activities.length === 0) {
    activities.push({ icon: '\uD83D\uDCC8', text: label + ' earned ' + (curr.score - prev.score) + ' points' });
  }

  return activities;
}
