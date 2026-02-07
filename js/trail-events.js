// ============================================================
// trail-events.js — Trail event overlay logic
// ============================================================

function showTrailEvent(evt, callback) {
  document.getElementById('trail-event-icon').textContent = evt.icon;
  document.getElementById('trail-event-title').textContent = evt.title;
  document.getElementById('trail-event-text').textContent = evt.text;
  document.getElementById('trail-event-overlay').classList.add('active');
  window._trailEventCallback = callback;
}

function closeTrailEvent() {
  document.getElementById('trail-event-overlay').classList.remove('active');
  if (window._trailEventCallback) {
    window._trailEventCallback();
    window._trailEventCallback = null;
  }
}
