'use strict';
// CoachBoard Pro - History State
// Wraps undo/redo stack globals.
var HistoryState = {
  get stack() { return hist; },
  get index() { return hI; },
  get canUndo() { return hI > 0; },
  get canRedo() { return hI < hist.length - 1; },
  get position() { return hI + 1; },
  get total() { return hist.length; }
};
