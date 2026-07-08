'use strict';
// CoachBoard Pro - LayeredRenderer
// The ONLY rendering engine. All drawing goes through here.
// Each layer renders to its own CanvasPool canvas.
// Layer 0: Background (pitch, grid, team info)
// Layer 1: Equipment (goals, cones, balls, barriers)
// Layer 2: Players (jerseys, numbers, names)
// Layer 3: Drawing (arrows, shapes, zones, freehand, links, trails)
// Layer 4: Selection (selection boxes, handles, guides)
// Layer 5: Overlay (live drawing previews, spotlight, poszone)

var LayeredRenderer = {
  _initialized: false,
  _layerDirty: [true, true, true, true, true, true],
  _elMap: {},
  _layerOrder: [0, 1, 2, 3, 4, 5],

  // Layer indices
  BACKGROUND: 0,
  EQUIPMENT: 1,
  PLAYERS: 2,
  DRAWING: 3,
  SELECTION: 4,
  OVERLAY: 5,

  // Initialize
  init: function() {
    if (typeof CanvasPool === 'undefined') return false;
    this._initialized = true;
    this.markAllDirty();
    return true;
  },

  // Mark a layer dirty
  markDirty: function(layer) {
    if (layer >= 0 && layer < 6) this._layerDirty[layer] = true;
  },

  // Mark all layers dirty
  markAllDirty: function() {
    for (var i = 0; i < 6; i++) this._layerDirty[i] = true;
  },

  // Check if any layer is dirty
  isAnyDirty: function() {
    for (var i = 0; i < 6; i++) {
      if (this._layerDirty[i]) return true;
    }
    return false;
  },

  // Clear dirty flags
  clearDirty: function() {
    for (var i = 0; i < 6; i++) this._layerDirty[i] = false;
  },

  // Build element map for O(1) lookups
  _buildElMap: function() {
    this._elMap = {};
    for (var i = 0; i < els.length; i++) {
      this._elMap[els[i].id] = els[i];
    }
  },

  // Main render - called by Engine.render()
  render: function() {
    if (!this._initialized) return false;
    if (!CanvasPool._layers || CanvasPool._layers.length === 0) return false;

    this._buildElMap();

    var anyDirty = false;
    for (var i = 0; i < 6; i++) {
      if (this._layerDirty[i]) { anyDirty = true; break; }
    }
    if (!anyDirty) return false;

    // Render each dirty layer
    for (var i = 0; i < 6; i++) {
      if (!this._layerDirty[i]) continue;
      this._layerDirty[i] = false;

      var ctx = CanvasPool.getCtx(i);
      if (!ctx) continue;

      // Clear this layer
      CanvasPool.clear(i);

      // Apply zoom+pan transform
      CanvasPool.applyTransform(i, zoomLevel, panX, panY);

      // Apply pitch rotation if needed
      if (pitchRotation !== 0) {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(pitchRotation * Math.PI / 180);
        ctx.translate(-W / 2, -H / 2);
      }

      // Render the layer
      switch (i) {
        case 0: this._renderBackground(ctx); break;
        case 1: this._renderEquipment(ctx); break;
        case 2: this._renderPlayers(ctx); break;
        case 3: this._renderDrawing(ctx); break;
        case 4: this._renderSelection(ctx); break;
        case 5: this._renderOverlay(ctx); break;
      }

      // Restore pitch rotation
      if (pitchRotation !== 0) {
        ctx.restore();
      }
    }

    return true;
  },

  // ============ LAYER 0: BACKGROUND ============
  _renderBackground: function(ctx) {
    // Background fill — cover the entire canvas in device pixels so no gaps
    // appear when zoomed out or when the pitch is rotated.
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = theme === 'dark' ? '#070a0e' : '#e8ecf0';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();

    // Pitch (handles perspective internally)
    drawPitch();

    // Animated pitch overlay
    drawPitchAnimOverlay();

    // Grid
    drawGrid();

    // Team logos on pitch
    drawTeamLogos();

    // Team info (names, scores)
    drawTeamInfo();

    // Canvas watermark (coach name, date)
    drawCanvasWatermark();
  },

  // ============ LAYER 1: EQUIPMENT ============
  _renderEquipment: function(ctx) {
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hidden) continue;
      if (this._isEquipment(el.type)) {
        this._drawElement(ctx, el);
      }
    }
  },

  // ============ LAYER 2: PLAYERS ============
  _renderPlayers: function(ctx) {
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hidden) continue;
      if (this._isPlayer(el.type)) {
        this._drawElement(ctx, el);
      }
    }
  },

  // ============ LAYER 3: DRAWING ============
  _renderDrawing: function(ctx) {
    // Draw zones first
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hidden) continue;
      if (isZone(el.type)) {
        this._drawElement(ctx, el);
      }
    }

    // Then arrows, text, freehand
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hidden) continue;
      if (this._isDrawing(el.type)) {
        this._drawElement(ctx, el);
      }
    }

    // Links between elements
    this._drawLinks(ctx);

    // Trails during animation
    drawTrails();
  },

  // ============ LAYER 4: SELECTION ============
  _renderSelection: function(ctx) {
    // Selection boxes and handles
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hidden) continue;
      if (selIds.has(el.id)) {
        var b = elBnd(el);
        ctx.strokeStyle = el.groupId ? '#3fb950' : '#2f81f7';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
        ctx.setLineDash([]);
        Renderer.drawHandles(el);
      }
    }

    // Alignment guides
    drawGuides();
  },

  // ============ LAYER 5: OVERLAY ============
  _renderOverlay: function(ctx) {
    // Live drawing previews (freehand, arrows while drawing)
    SEC.renderOverlay();

    // Spotlight effects
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hidden) continue;
      if (el.spotlight && this._isPlayer(el.type)) {
        this._drawSpotlight(ctx, el);
      }
    }

    // Position zone effects
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hidden) continue;
      if (el.poszone && this._isPlayer(el.type)) {
        this._drawPosZone(ctx, el);
      }
    }
  },

  // ============ ELEMENT DISPATCH ============
  _drawElement: function(ctx, el) {
    SEC.draw(el);
  },

  // ============ SPOTLIGHT EFFECT ============
  _drawSpotlight: function(ctx, el) {
    if (!el.spotlight) return;
    ctx.save();
    var s = el.size || 18;
    var spotCol = el.spotlightColor || '#ffe864';
    var spotSz = el.spotlightSize || 1;
    var r = s * 3 * spotSz;
    var pulse = Math.sin(spotlightPhase) * 0.12 + 1;
    r *= pulse;

    var topY = el.y - s * 3.5 * spotSz;
    var g = ctx.createLinearGradient(el.x, topY, el.x, el.y + s * 0.5);
    g.addColorStop(0, spotCol + '59');
    g.addColorStop(0.5, spotCol + '1F');
    g.addColorStop(1, spotCol + '00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(el.x - s * 0.3, topY);
    ctx.lineTo(el.x - r * 0.7, el.y + s * 0.5);
    ctx.lineTo(el.x + r * 0.7, el.y + s * 0.5);
    ctx.closePath();
    ctx.fill();

    var g2 = ctx.createRadialGradient(el.x, el.y - s * 0.3, 0, el.x, el.y - s * 0.3, r * 0.6);
    g2.addColorStop(0, spotCol + '33');
    g2.addColorStop(1, spotCol + '00');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.ellipse(el.x, el.y, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // ============ POSITION ZONE EFFECT ============
  _drawPosZone: function(ctx, el) {
    if (!el.poszone || !isP2D(el.type)) return;
    ctx.save();
    var pzCol = el.poszoneColor || el.color || '#4a90d9';
    var pzCnt = el.poszoneCount || 1;
    for (var zi = 0; zi < pzCnt; zi++) {
      var r = (el.size || 18) * (1.5 + zi * 0.8);
      var pulse = Math.sin(posZonePhase + zi * 0.5) * 0.15 + 1;
      r *= pulse;
      ctx.strokeStyle = pzCol + '60';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(el.x, el.y + el.size * 0.5, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = pzCol + '10';
      ctx.fill();
    }
    ctx.setLineDash([]);
    ctx.restore();
  },

  // ============ LINKS ============
  _drawLinks: function(ctx) {
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.linkedToId || el.hidden) continue;
      var par = this._elMap[el.linkedToId];
      if (par) {
        ctx.strokeStyle = 'rgba(80,232,112,0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(par.x, par.y);
        ctx.lineTo(el.x, el.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Player connection lines
    for (var i = 0; i < playerLinks.length; i++) {
      var lk = playerLinks[i];
      var e1 = this._elMap[lk.fromId], e2 = this._elMap[lk.toId];
      if (e1 && e2 && !e1.hidden && !e2.hidden) {
        var cl = lk.color || '#ffffff';
        var sz = lk.size || 3;
        ctx.save();
        ctx.strokeStyle = cl;
        ctx.lineWidth = sz;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(e1.x, e1.y);
        ctx.lineTo(e2.x, e2.y);
        ctx.stroke();
        ctx.strokeStyle = lightColor(cl, -60);
        ctx.lineWidth = Math.max(1, sz * 0.35);
        ctx.beginPath();
        ctx.moveTo(e1.x, e1.y);
        ctx.lineTo(e2.x, e2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Link preview while drawing
    if (drawingLink && linkStart && linkEnd) {
      ctx.save();
      ctx.strokeStyle = '#ffffff80';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(linkStart.x, linkStart.y);
      ctx.lineTo(linkEnd.x, linkEnd.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  },

  // ============ ELEMENT CLASSIFICATION ============
  _isEquipment: function(type) {
    return type === 'cone' || type === 'coneDisc' || type === 'coneTall' ||
           type === 'ring' || type === 'barrier' || type === 'hurdle' ||
           type === 'hurdleArc' || type === 'mannequin' || type === 'smallGoal' ||
           type === 'flag' || type === 'ladder' || type === 'stick' ||
           type === 'bib' || type === 'reboundBoard';
  },

  _isPlayer: function(type) {
    return type === 'p_stand' || type === 'gk_stand' || type === 'p_gk' || type === 'p_jersey' || type === 'ball' || type === 'coach';
  },

  _isDrawing: function(type) {
    return type === 'arrowSolid' || type === 'arrowDashed' || type === 'arrowDotted' ||
           type === 'arrowCurved' || type === 'arrowMulti' || type === 'arrowDoublePoly' ||
           type === 'arrowSlalom' || type === 'freehand' || type === 'highlighter' ||
           type === 'text' || type === 'number';
  },

  // ============ PUBLIC API ============
  forceRedraw: function() {
    this.markAllDirty();
    if (typeof reqRender === 'function') reqRender();
  },

  redrawLayer: function(layer) {
    this.markDirty(layer);
    if (typeof reqRender === 'function') reqRender();
  }
};
