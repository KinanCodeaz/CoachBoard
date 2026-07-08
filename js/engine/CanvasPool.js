'use strict';
/**
 * CoachBoard Pro - CanvasPool
 * Manages 6 layered canvases for efficient rendering.
 * Uses dirty flags to avoid unnecessary redraws.
 * 
 * @namespace CanvasPool
 * @version 2.0
 */
var CanvasPool = {
  _layers: [],        // Array of {canvas, ctx, dirty, visible}
  _container: null,   // Container element (#cc)
  _dpr: 1,
  _width: 0,
  _height: 0,
  _resizeTimeout: null, // Debounced resize timer

  // Layer names for reference
  LAYERS: {
    BACKGROUND: 0,
    EQUIPMENT: 1,
    PLAYERS: 2,
    DRAWING: 3,
    SELECTION: 4,
    OVERLAY: 5
  },

  // Initialize the canvas pool
  init: function(containerId) {
    this._container = document.getElementById(containerId || 'cc');
    if (!this._container) return false;

    this._dpr = window.devicePixelRatio || 1;

    // Hide the original single canvas
    var originalCanvas = document.getElementById('cv');
    if (originalCanvas) {
      originalCanvas.style.display = 'none';
    }

    // Create 6 canvas layers
    for (var i = 0; i < 6; i++) {
      var canvas = document.createElement('canvas');
      canvas.id = 'layer_' + i;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none'; // Only bottom layer gets events

      // Bottom layer (background) gets mouse events
      if (i === 0) {
        canvas.style.pointerEvents = 'auto';
        canvas.style.cursor = 'default';
      }

      this._container.appendChild(canvas);

      this._layers.push({
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        dirty: true,
        visible: true
      });
    }

    // Set z-index for proper stacking
    this._updateZIndices();

    // Initial size
    this.resize();

    return true;
  },

  // Debounced resize (performance optimization)
  resizeDebounced: function(displayW, displayH) {
    var self = this;
    if (this._resizeTimeout) clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(function() {
      self.resize(displayW, displayH);
    }, 100);
  },

  // Resize all canvases
  resize: function(displayW, displayH) {
    if (!displayW || !displayH) {
      var r = this._container.getBoundingClientRect();
      displayW = Math.max(100, Math.round(r.width));
      displayH = Math.max(100, Math.round(r.height));
    }

    this._width = displayW;
    this._height = displayH;
    var canvasW = Math.round(displayW * this._dpr);
    var canvasH = Math.round(displayH * this._dpr);

    for (var i = 0; i < this._layers.length; i++) {
      var layer = this._layers[i];
      if (layer.canvas.width !== canvasW || layer.canvas.height !== canvasH) {
        layer.canvas.width = canvasW;
        layer.canvas.height = canvasH;
        layer.dirty = true;
      }
    }

    return { width: displayW, height: displayH, canvasWidth: canvasW, canvasHeight: canvasH };
  },

  // Get layer context
  getCtx: function(layerIndex) {
    if (layerIndex < 0 || layerIndex >= this._layers.length) return null;
    return this._layers[layerIndex].ctx;
  },

  // Get layer canvas
  getCanvas: function(layerIndex) {
    if (layerIndex < 0 || layerIndex >= this._layers.length) return null;
    return this._layers[layerIndex].canvas;
  },

  // Mark layer as dirty (needs redraw)
  markDirty: function(layerIndex) {
    if (layerIndex < 0 || layerIndex >= this._layers.length) return;
    this._layers[layerIndex].dirty = true;
  },

  // Mark all layers as dirty
  markAllDirty: function() {
    for (var i = 0; i < this._layers.length; i++) {
      this._layers[i].dirty = true;
    }
  },

  // Check if layer is dirty
  isDirty: function(layerIndex) {
    if (layerIndex < 0 || layerIndex >= this._layers.length) return false;
    return this._layers[layerIndex].dirty;
  },

  // Clear dirty flag
  clearDirty: function(layerIndex) {
    if (layerIndex < 0 || layerIndex >= this._layers.length) return;
    this._layers[layerIndex].dirty = false;
  },

  // Set layer visibility
  setVisible: function(layerIndex, visible) {
    if (layerIndex < 0 || layerIndex >= this._layers.length) return;
    this._layers[layerIndex].visible = visible;
    this._layers[layerIndex].canvas.style.display = visible ? 'block' : 'none';
  },

  // Get layer visibility
  isVisible: function(layerIndex) {
    if (layerIndex < 0 || layerIndex >= this._layers.length) return false;
    return this._layers[layerIndex].visible;
  },

  // Clear a specific layer
  clear: function(layerIndex) {
    var ctx = this.getCtx(layerIndex);
    if (!ctx) return;
    ctx.clearRect(0, 0, this._width * this._dpr, this._height * this._dpr);
  },

  // Clear all layers
  clearAll: function() {
    for (var i = 0; i < this._layers.length; i++) {
      this.clear(i);
    }
  },

  // Apply zoom+pan transform to a specific layer
  applyTransform: function(layerIndex, zoomLevel, panX, panY) {
    var ctx = this.getCtx(layerIndex);
    if (!ctx) return;
    var s = zoomLevel || 1;
    var px = panX || 0;
    var py = panY || 0;
    ctx.setTransform(s * this._dpr, 0, 0, s * this._dpr, px, py);
  },

  // Reset transform for a layer
  resetTransform: function(layerIndex) {
    var ctx = this.getCtx(layerIndex);
    if (!ctx) return;
    ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
  },

  // Get display dimensions
  getSize: function() {
    return { width: this._width, height: this._height };
  },

  // Get DPR
  getDPR: function() {
    return this._dpr;
  },

  // Update z-index for proper stacking
  _updateZIndices: function() {
    for (var i = 0; i < this._layers.length; i++) {
      this._layers[i].canvas.style.zIndex = i;
    }
  },

  // Get bottom canvas (for event handling)
  getEventCanvas: function() {
    return this.getCanvas(0);
  },

  // Hide all layers except background (for export)
  hideForExport: function() {
    for (var i = 1; i < this._layers.length; i++) {
      this._layers[i].canvas.style.display = 'none';
    }
  },

  // Show all layers (after export)
  showAll: function() {
    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i].visible) {
        this._layers[i].canvas.style.display = 'block';
      }
    }
  },

  // Composite all layers onto a single canvas (for export)
  // targetCanvas: the canvas to draw onto
  // scale: optional scale factor (default 1)
  // offsetX, offsetY: optional offset (default 0,0)
  composite: function(targetCanvas, scale, offsetX, offsetY) {
    var ctx = targetCanvas.getContext('2d');
    var s = scale || 1;
    var ox = offsetX || 0;
    var oy = offsetY || 0;
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i].visible) {
        var src = this._layers[i].canvas;
        // Draw layer scaled to target canvas dimensions
        ctx.drawImage(src, 0, 0, src.width, src.height,
                      ox, oy, targetCanvas.width * s, targetCanvas.height * s);
      }
    }
  },

  // Create an offscreen composited canvas at specified dimensions
  // Returns a canvas element with all layers merged
  createComposited: function(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i].visible) {
        var src = this._layers[i].canvas;
        ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, width, height);
      }
    }

    return canvas;
  },

  // Capture canvas for video recording (hidden, receives composites each frame)
  _captureCanvas: null,
  _captureCtx: null,

  // Get or create the capture canvas for video recording
  getCaptureCanvas: function(width, height) {
    if (!this._captureCanvas) {
      this._captureCanvas = document.createElement('canvas');
      this._captureCanvas.style.display = 'none';
      document.body.appendChild(this._captureCanvas);
      this._captureCtx = this._captureCanvas.getContext('2d');
    }
    this._captureCanvas.width = width || this._width;
    this._captureCanvas.height = height || this._height;
    return this._captureCanvas;
  },

  // Composite all layers onto the capture canvas
  compositeToCapture: function() {
    if (!this._captureCanvas || !this._captureCtx) return;
    var ctx = this._captureCtx;
    var w = this._captureCanvas.width;
    var h = this._captureCanvas.height;
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i].visible) {
        var src = this._layers[i].canvas;
        ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, w, h);
      }
    }
  },

  // Destroy and cleanup
  destroy: function() {
    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i].canvas && this._layers[i].canvas.parentNode) {
        this._layers[i].canvas.parentNode.removeChild(this._layers[i].canvas);
      }
    }
    this._layers = [];
  }
};
