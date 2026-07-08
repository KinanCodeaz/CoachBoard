'use strict';
// CoachBoard Pro - Grid System
// Manages grid drawing, grid snap, and guide snapping.
// State lives in globals: gridSnap, gridSize, guides[].
var GridSystem = {
  get enabled() { return gridSnap; },
  get size() { return gridSize; },

  toggle: function() {
    gridSnap = !gridSnap;
    var si = document.getElementById('snapInd');
    if(si) si.classList.toggle('show', gridSnap);
    if(typeof render==='function') render();
  },

  enable: function() { gridSnap = true; },
  disable: function() { gridSnap = false; },

  setSize: function(s) { gridSize = Math.max(5, Math.min(100, s)); },

  snapValue: function(v) {
    if(!gridSnap) return v;
    return Math.round(v / gridSize) * gridSize;
  },

  snapElement: function(el) {
    if(gridSnap) {
      var s = gridSize;
      el.x = Math.round(el.x / s) * s;
      el.y = Math.round(el.y / s) * s;
    }
  },

  calcGuides: function(draggedEl) {
    guides = [];
    if(!draggedEl) return;
    var dc = eCen(draggedEl), th = 6;
    for(var i = 0; i < els.length; i++) {
      var el = els[i];
      if(el.id === draggedEl.id) continue;
      var ec = eCen(el);
      if(Math.abs(dc.x - ec.x) < th) guides.push({t:'v', p:ec.x});
      if(Math.abs(dc.y - ec.y) < th) guides.push({t:'h', p:ec.y});
    }
    var seen = {};
    guides = guides.filter(function(g) {
      var k = g.t + Math.round(g.p);
      if(seen[k]) return false;
      seen[k] = true;
      return true;
    });
  },

  snapToGuides: function(el) {
    if(!guides.length) return;
    var dc = eCen(el), th = 6;
    for(var i = 0; i < guides.length; i++) {
      if(guides[i].t==='v' && Math.abs(dc.x - guides[i].p) < th) el.x += guides[i].p - dc.x;
      if(guides[i].t==='h' && Math.abs(dc.y - guides[i].p) < th) el.y += guides[i].p - dc.y;
    }
  },

  snapElementFull: function(el) {
    GridSystem.snapElement(el);
    GridSystem.snapToGuides(el);
  },

  drawGuides: function() {
    if(!guides.length) return;
    cx.setLineDash([4,3]); cx.lineWidth = 1;
    cx.strokeStyle = 'rgba(0,229,255,0.5)';
    for(var i = 0; i < guides.length; i++) {
      cx.beginPath();
      if(guides[i].t==='v') { cx.moveTo(guides[i].p, 0); cx.lineTo(guides[i].p, H); }
      else { cx.moveTo(0, guides[i].p); cx.lineTo(W, guides[i].p); }
      cx.stroke();
    }
    cx.setLineDash([]);
  }
};

function calcGuides(de) { GridSystem.calcGuides(de); }
function drawGuides() { GridSystem.drawGuides(); }
function snapG(el) { GridSystem.snapElementFull(el); }
