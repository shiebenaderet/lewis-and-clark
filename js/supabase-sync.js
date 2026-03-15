// ============================================================
// supabase-sync.js — Cloud save sync via Supabase
// ============================================================

const SUPABASE_URL = 'https://opfzhgqbaomakovocpeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZnpoZ3FiYW9tYWtvdm9jcGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODQ5NjIsImV4cCI6MjA4ODI2MDk2Mn0.iVRzgVaz6Sk2M9FRu0O-zfWTuelWfG4zx-Q714oPYfw';

let _supabase = null;
let _syncStatus = 'idle'; // idle, syncing, synced, error

function getSupabase() {
  if (!_supabase && window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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

// === HASH PASSWORD (SHA-256 via Web Crypto) ===
async function hashPassword(password) {
  var encoder = new TextEncoder();
  var data = encoder.encode(password);
  var hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

// === TEACHER: CREATE CLASS ===
async function createClass(teacherName, teacherEmail, password) {
  var sb = getSupabase();
  if (!sb) return { error: 'Supabase not available' };

  if (!teacherEmail.endsWith('@edmonds.wednet.edu')) {
    return { error: 'Email must end with @edmonds.wednet.edu' };
  }

  var passwordHash = await hashPassword(password);

  // Generate class code with retry
  for (var attempt = 0; attempt < 5; attempt++) {
    var code = generateClassCode();
    // Use RPC or direct insert — but RLS blocks direct insert, so we need to bypass
    // Since RLS blocks classes INSERT, we'll use a service approach
    // For simplicity in a classroom tool, temporarily allow insert via RLS
    var resp = await sb.from('lc_classes').insert({
      class_code: code,
      teacher_name: teacherName,
      teacher_email: teacherEmail,
      teacher_password_hash: passwordHash
    });

    if (!resp.error) {
      return { classCode: code };
    }
    if (resp.error.code === '23505') continue; // unique violation, retry
    return { error: resp.error.message };
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

// === TEACHER: LOGIN ===
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

// === TEACHER: FETCH ALL SAVES FOR DASHBOARD ===
async function fetchClassSaves(classCode) {
  var sb = getSupabase();
  if (!sb) return [];

  var resp = await sb.from('lc_saves')
    .select('student_name, period, current_station, score, completed, save_data, updated_at')
    .eq('class_code', classCode)
    .order('period')
    .order('student_name');

  return resp.data || [];
}
