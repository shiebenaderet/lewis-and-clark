// ============================================================
// accessibility.js — Font and accessibility preferences
// ============================================================
const A11Y_KEY = 'lost-expedition-a11y';

function loadA11yPrefs() {
  try {
    var saved = JSON.parse(localStorage.getItem(A11Y_KEY) || '{}');
    if (saved.dyslexicFont) applyDyslexicFont(true, false);
  } catch (e) {}
}

function toggleDyslexicFont() {
  var isOn = document.body.classList.contains('dyslexic-font');
  applyDyslexicFont(!isOn, true);
}

function applyDyslexicFont(enable, persist) {
  document.body.classList.toggle('dyslexic-font', enable);
  document.querySelectorAll('.btn-dyslexic, .btn-dyslexic-small').forEach(function(btn) {
    btn.setAttribute('aria-pressed', String(enable));
    btn.classList.toggle('active', enable);
  });
  if (persist) {
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify({ dyslexicFont: enable }));
    } catch (e) {}
  }
}

document.addEventListener('DOMContentLoaded', loadA11yPrefs);
