'use strict';
// CoachBoard Pro - History System
// Wraps undo/redo stack. hist[] and hI are globals in state.js.
var HistorySystem = {
  MAX: 50,

  save: function() {
    hist = hist.slice(0, hI + 1);
    hist.push(JSON.stringify(els));
    hI = hist.length - 1;
    if(hist.length > HistorySystem.MAX) { hist.shift(); hI--; }
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(autoSave, 500);
    HistorySystem.updateIndicator();
  },

  undo: function() {
    if(hI > 0) {
      hI--;
      els = JSON.parse(hist[hI]);
      SelectionSystem.clear();
      HistorySystem._afterNav();
    }
    HistorySystem.updateIndicator();
  },

  redo: function() {
    if(hI < hist.length - 1) {
      hI++;
      els = JSON.parse(hist[hI]);
      SelectionSystem.clear();
      HistorySystem._afterNav();
    }
    HistorySystem.updateIndicator();
  },

  canUndo: function() { return hI > 0; },
  canRedo: function() { return hI < hist.length - 1; },
  position: function() { return hI + 1; },
  total: function() { return hist.length; },

  updateIndicator: function() {
    var ui = document.getElementById('undoIndicator');
    if(ui) ui.textContent = (hI + 1) + '/' + hist.length;
  },

  _afterNav: function() {
    if(typeof updateProps==='function') updateProps();
    if(typeof updateLayers==='function') updateLayers();
    if(typeof render==='function') render();
  }
};

function saveH() { HistorySystem.save(); }
function undo() { HistorySystem.undo(); }
function redo() { HistorySystem.redo(); }
