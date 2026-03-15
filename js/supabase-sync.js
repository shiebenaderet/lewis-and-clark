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
// Uses Web Crypto when available (HTTPS), falls back to simple hash
async function hashPassword(password) {
  if (window.crypto && window.crypto.subtle) {
    try {
      var encoder = new TextEncoder();
      var data = encoder.encode(password);
      var hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) { /* fall through to simple hash */ }
  }
  // Simple hash fallback (djb2 variant) — sufficient for a classroom tool
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
