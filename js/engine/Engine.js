'use strict';
// CoachBoard Pro - Engine
// The ONLY entry point for rendering.
// Replaces the old render() function in script.js.
// All rendering goes through Engine.render() → LayeredRenderer → CanvasPool.

var Engine = {
  // --- Element access ---
  get elements() { return els; },
  get elementCount() { return els.length; },

  // --- Selection ---
  get selection() { return selIds; },
  select: function(id) {
    selIds.clear();
    selIds.add(id);
    if (typeof updateProps === 'function') updateProps();
    if (typeof updateLayers === 'function') updateLayers();
    Engine.requestRender();
  },
  addToSelection: function(id) {
    selIds.add(id);
    if (typeof updateProps === 'function') updateProps();
    if (typeof updateLayers === 'function') updateLayers();
    Engine.requestRender();
  },
  toggleSelection: function(id) {
    selIds.has(id) ? selIds.delete(id) : selIds.add(id);
    if (typeof updateProps === 'function') updateProps();
    if (typeof updateLayers === 'function') updateLayers();
    Engine.requestRender();
  },
  clearSelection: function() {
    selIds.clear();
    if (typeof updateProps === 'function') updateProps();
    if (typeof updateLayers === 'function') updateLayers();
    Engine.requestRender();
  },
  selectAll: function() {
    if (typeof selectAllEls === 'function') selectAllEls();
  },

  // --- Tool ---
  get currentTool() { return tool; },
  setTool: function(t) { if (typeof setTool === 'function') setTool(t); },

  // --- Sport & Theme ---
  get sport() { return sport; },
  setSport: function(s) {
    sport = s;
    if (typeof applySportUI === 'function') applySportUI();
    Engine.markAllDirty();
    Engine.requestRender();
  },
  get theme() { return theme; },
  setTheme: function(t) {
    theme = t;
    document.documentElement.dataset.theme = t;
    if (typeof updateThemeIcon === 'function') updateThemeIcon();
    Engine.markAllDirty();
    Engine.requestRender();
  },

  // --- Zoom ---
  get zoom() { return zoomLevel; },
  zoomIn: function() { Camera.zoomIn(); },
  zoomOut: function() { Camera.zoomOut(); },
  zoomReset: function() { Camera.zoomReset(); },

  // --- History ---
  saveState: function() { if (typeof saveH === 'function') saveH(); },
  undo: function() { if (typeof undo === 'function') undo(); },
  redo: function() { if (typeof redo === 'function') redo(); },

  // --- RENDERING (the only render entry point) ---

  // Request a render (sets dirty flag, schedules RAF)
  requestRender: function() {
    if (typeof reqRender === 'function') reqRender();
  },

  // Mark specific layer dirty
  markDirty: function(layer) {
    if (typeof LayeredRenderer !== 'undefined') {
      LayeredRenderer.markDirty(layer);
    }
    _dirty = true;
  },

  // Mark all layers dirty
  markAllDirty: function() {
    if (typeof LayeredRenderer !== 'undefined') {
      LayeredRenderer.markAllDirty();
    }
    _dirty = true;
  },

  // THE render function - called by _renderFrame()
  // This replaces the old global render()
  render: function() {
    if (typeof LayeredRenderer !== 'undefined' && LayeredRenderer._initialized) {
      // Always mark all layers dirty when render() is called
      // This ensures everything redraws (matches old behavior)
      LayeredRenderer.markAllDirty();
      LayeredRenderer.render();
    }
  },

  // --- Element CRUD ---
  addElement: function(el) {
    els.push(el);
    Engine.saveState();
    Engine.markAllDirty();
    Engine.requestRender();
  },
  removeElement: function(id) {
    var idx = els.findIndex(function(e) { return e.id === id; });
    if (idx >= 0) {
      els.splice(idx, 1);
      selIds.delete(id);
      Engine.saveState();
      Engine.markAllDirty();
      Engine.requestRender();
    }
  },
  findElement: function(id) {
    return els.find(function(e) { return e.id === id; });
  },
  duplicateSelection: function() {
    if (typeof duplicateSel === 'function') duplicateSel();
  },

  // --- Element info ---
  getBounds: function(el) {
    return typeof elBnd === 'function' ? elBnd(el) : { x: el.x - 18, y: el.y - 18, w: 36, h: 36 };
  },
  getCenter: function(el) {
    return typeof eCen === 'function' ? eCen(el) : { x: el.x, y: el.y };
  },
  hitTest: function(mx, my) {
    return typeof hitTest === 'function' ? hitTest(mx, my) : null;
  },

  // --- Canvas info ---
  get width() { return W; },
  get height() { return H; },
  get canvasEl() { return cv; },
  get containerEl() { return cc; },
  get context() { return cx; },

  // --- Pitch ---
  get pitchRect() {
    return typeof pRect === 'function' ? pRect() : { x: 0, y: 0, w: W, h: H };
  },

  // --- Teams ---
  get currentTeam() { return curTeam; },
  setTeam: function(t) { if (typeof setTeam === 'function') setTeam(t); },

  // --- Grid ---
  get gridSnap() { return gridSnap; },
  toggleGrid: function() { GridSystem.toggle(); },

  // --- Canvas setup ---
  setupCanvas: function() {
    if (typeof setupCanvas === 'function') setupCanvas();
  },

  // --- Render loop control ---
  startRenderLoop: function() {
    if (!_rafId) _rafId = requestAnimationFrame(_renderFrame);
  },
  stopRenderLoop: function() {
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  },
  setExportActive: function(v) { _exportActive = v; },

  // --- Undo indicator ---
  get undoInfo() { return { index: hI, length: hist.length }; },

  // --- Layer access (for advanced use) ---
  getLayerCtx: function(layer) {
    return typeof CanvasPool !== 'undefined' ? CanvasPool.getCtx(layer) : null;
  },
  getLayerCanvas: function(layer) {
    return typeof CanvasPool !== 'undefined' ? CanvasPool.getCanvas(layer) : null;
  }
};
