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

// Escape key to dismiss overlays
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Trail event overlay
    if (document.getElementById('trail-event-overlay').classList.contains('active')) {
      closeTrailEvent();
      return;
    }
    // Figure popup
    var popup = document.querySelector('.figure-popup');
    if (popup) { popup.remove(); return; }
    // Map info panel
    var mapPanel = document.getElementById('map-info-panel');
    if (mapPanel && mapPanel.classList.contains('active')) {
      if (typeof closeMapInfo === 'function') closeMapInfo();
      return;
    }
  }
});
