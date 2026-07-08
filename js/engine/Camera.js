'use strict';
/**
 * CoachBoard Pro - Camera System
 * 
 * Handles zoom and pan via canvas transform (no canvas resize = no flicker).
 * Canvas is sized once at displayW*dpr × displayH*dpr. Zoom scales via transform.
 * 
 * @example
 * // Zoom in
 * Camera.zoomIn();
 * 
 * @example
 * // Set specific zoom level
 * Camera.setZoom(1.5);
 * 
 * @example
 * // Reset view
 * Camera.zoomReset();
 * 
 * @namespace Camera
 * @version 2.0
 */
var Camera = {
  /** @returns {number} Current zoom level (0.3 to 3.0) */
  get zoom() { return zoomLevel; },
  /** @returns {number} Current pan X offset */
  get panX() { return panX; },
  /** @returns {number} Current pan Y offset */
  get panY() { return panY; },
  /** @returns {boolean} Whether 3D perspective is active */
  get is3D() { return pitch3d; },

  /**
   * Zoom in by 0.1 (max 3.0).
   */
  zoomIn: function() {
    var old = zoomLevel;
    zoomLevel = Math.min(3, zoomLevel + 0.1);
    Camera._zoomCenter(old);
    Camera.apply();
  },

  /**
   * Zoom out by 0.1 (min 0.3).
   */
  zoomOut: function() {
    var old = zoomLevel;
    zoomLevel = Math.max(0.3, zoomLevel - 0.1);
    Camera._zoomCenter(old);
    Camera.apply();
  },

  /**
   * Reset zoom to 1.0 and center pan.
   */
  zoomReset: function() {
    zoomLevel = 1; panX = 0; panY = 0;
    Camera.apply();
  },

  /**
   * Set zoom level (clamped to 0.3-3.0).
   * @param {number} z - Target zoom level
   */
  setZoom: function(z) {
    var old = zoomLevel;
    zoomLevel = Math.max(0.3, Math.min(3, z));
    Camera._zoomCenter(old);
    Camera.apply();
  },

  _zoomCenter: function(oldZoom) {
    var cx = W / 2, cy = H / 2;
    panX = cx - (cx - panX) * (zoomLevel / oldZoom);
    panY = cy - (cy - panY) * (zoomLevel / oldZoom);
  },

  pan: function(dx, dy) {
    panX += dx;
    panY += dy;
    Camera.apply();
  },

  setPan: function(x, y) {
    panX = x; panY = y;
    Camera.apply();
  },

  apply: function() {
    _dirty = true;
    if(!_rafId) _rafId = requestAnimationFrame(_renderFrame);
    // Apply CSS perspective transform for 3D pitch tilt
    // Use CanvasPool layer 0 if available, otherwise fallback to original canvas
    var targetCanvas = (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0)
      ? CanvasPool.getCanvas(0)
      : cv;
    if(pitch3d && targetCanvas) {
      targetCanvas.style.transform = 'perspective(800px) rotateX('+pitchRotX+'deg) rotateY('+pitchRotY+'deg)';
    } else if(targetCanvas) {
      targetCanvas.style.transform = '';
    }
    var zl = document.getElementById('zoomLbl'); if(zl) zl.textContent = Math.round(zoomLevel*100)+'%';
    var zi = document.getElementById('zoomInfo'); if(zi) zi.textContent = Math.round(zoomLevel*100)+'%';
  },

  // Setup canvas - only resizes on window resize, not on zoom
  setupCanvas: function(displayW, displayH) {
    // Use CanvasPool if initialized
    if (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0) {
      var size = CanvasPool.resize(displayW, displayH);
      W = size.width;
      H = size.height;
      // Update legacy references
      cv = CanvasPool.getCanvas(0);
      cx = CanvasPool.getCtx(0);
      return true;
    }

    // Fallback to original single canvas
    if(!cv || !cx || !cc) return;
    if(!displayW || !displayH) {
      var r = cc.getBoundingClientRect();
      displayW = Math.max(100, Math.round(r.width));
      displayH = Math.max(100, Math.round(r.height));
    }
    var canvasW = Math.round(displayW * dpr);
    var canvasH = Math.round(displayH * dpr);
    var resized = (cv.width !== canvasW || cv.height !== canvasH);
    if(resized) {
      cv.width = canvasW;
      cv.height = canvasH;
    }
    cv.style.width = displayW + 'px';
    cv.style.height = displayH + 'px';
    W = displayW;
    H = displayH;
    return resized;
  },

  // Apply zoom+pan transform - called every render
  applyTransform: function(layerIndex) {
    // Apply to specific layer if CanvasPool is active
    if (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0) {
      if (layerIndex !== undefined) {
        CanvasPool.applyTransform(layerIndex, zoomLevel, panX, panY);
      } else {
        // Apply to all visible layers
        for (var i = 0; i < 6; i++) {
          if (CanvasPool.isVisible(i)) {
            CanvasPool.applyTransform(i, zoomLevel, panX, panY);
          }
        }
      }
      return;
    }

    // Fallback to single canvas
    if(!cx) return;
    var s = zoomLevel;
    cx.setTransform(s * dpr, 0, 0, s * dpr, panX, panY);
  },

  // Convert screen coords to world coords
  screenToWorld: function(sx, sy) {
    return {
      x: (sx - panX) / zoomLevel,
      y: (sy - panY) / zoomLevel
    };
  },

  // Convert world coords to screen coords
  worldToScreen: function(wx, wy) {
    return {
      x: wx * zoomLevel + panX,
      y: wy * zoomLevel + panY
    };
  }
};

function zoomIn() { Camera.zoomIn(); }
function zoomOut() { Camera.zoomOut(); }
function zoomReset() { Camera.zoomReset(); }
function applyZoom() { Camera.apply(); }
