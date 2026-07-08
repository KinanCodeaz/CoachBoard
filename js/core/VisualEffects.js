'use strict';
// CoachBoard Pro - Visual Effects Engine
// Shadows, gradients, glows, and other visual enhancements

var VisualEffects = {
  _enabled: true,
  _quality: 'high', // low, medium, high

  init: function() {
    this._loadSettings();
    return this;
  },

  _loadSettings: function() {
    try {
      var settings = localStorage.getItem('cb_visual_effects');
      if (settings) {
        var parsed = JSON.parse(settings);
        this._enabled = parsed.enabled !== false;
        this._quality = parsed.quality || 'high';
      }
    } catch (e) {}
  },

  _saveSettings: function() {
    try {
      localStorage.setItem('cb_visual_effects', JSON.stringify({
        enabled: this._enabled,
        quality: this._quality
      }));
    } catch (e) {}
  },

  // ============ SHADOW EFFECTS ============
  drawShadow: function(ctx, x, y, w, h, options) {
    if (!this._enabled) return;

    var opts = options || {};
    var blur = opts.blur || 4;
    var offsetX = opts.offsetX || 2;
    var offsetY = opts.offsetY || 2;
    var color = opts.color || 'rgba(0,0,0,0.3)';

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  },

  drawCircleShadow: function(ctx, cx, cy, r, options) {
    if (!this._enabled) return;

    var opts = options || {};
    var blur = opts.blur || 4;
    var color = opts.color || 'rgba(0,0,0,0.3)';

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // ============ GLOW EFFECTS ============
  drawGlow: function(ctx, x, y, w, h, options) {
    if (!this._enabled) return;

    var opts = options || {};
    var color = opts.color || '#3b82f6';
    var blur = opts.blur || 10;

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  },

  drawSelectionGlow: function(ctx, x, y, w, h) {
    this.drawGlow(ctx, x, y, w, h, {
      color: 'rgba(59,130,246,0.5)',
      blur: 8
    });
  },

  // ============ GRADIENT EFFECTS ============
  createGradient: function(ctx, x1, y1, x2, y2, colors) {
    var gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach(function(color, i) {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    return gradient;
  },

  createRadialGradient: function(ctx, cx, cy, r, colors) {
    var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    colors.forEach(function(color, i) {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    return gradient;
  },

  drawGradientRect: function(ctx, x, y, w, h, colors, options) {
    var opts = options || {};
    var direction = opts.direction || 'vertical';

    var gradient;
    if (direction === 'vertical') {
      gradient = this.createGradient(ctx, x, y, x, y + h, colors);
    } else {
      gradient = this.createGradient(ctx, x, y, x + w, y, colors);
    }

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  },

  // ============ PLAYER EFFECTS ============
  drawPlayerGlow: function(ctx, x, y, w, h, team) {
    if (!this._enabled) return;

    var color = team === 'away' ? 'rgba(204,0,0,0.4)' : 'rgba(0,85,170,0.4)';
    this.drawGlow(ctx, x - 4, y - 4, w + 8, h + 8, {
      color: color,
      blur: 6
    });
  },

  drawPlayerGradient: function(ctx, x, y, w, h, team) {
    var colors = team === 'away' ?
      ['#ff4444', '#cc0000', '#990000'] :
      ['#4488ff', '#0055aa', '#003377'];

    this.drawGradientRect(ctx, x, y, w, h, colors, { direction: 'vertical' });
  },

  // ============ EQUIPMENT EFFECTS ============
  drawEquipmentShadow: function(ctx, x, y, w, h) {
    if (!this._enabled) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 2, w / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // ============ ARROW EFFECTS ============
  drawArrowGlow: function(ctx, x1, y1, x2, y2, color) {
    if (!this._enabled) return;

    ctx.save();
    ctx.strokeStyle = color || '#ff0000';
    ctx.lineWidth = 4;
    ctx.shadowColor = color || '#ff0000';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },

  // ============ ZONE EFFECTS ============
  drawZoneGradient: function(ctx, x, y, w, h, color) {
    if (!this._enabled) return;

    var gradient = ctx.createRadialGradient(
      x + w / 2, y + h / 2, 0,
      x + w / 2, y + h / 2, Math.max(w, h) / 2
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  },

  // ============ CANVAS EFFECTS ============
  drawVignette: function(ctx, w, h) {
    if (!this._enabled) return;

    var gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  },

  drawHighlight: function(ctx, x, y, w, h) {
    if (!this._enabled) return;

    var gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  },

  // ============ SETTINGS ============
  setEnabled: function(enabled) {
    this._enabled = enabled;
    this._saveSettings();
  },

  setQuality: function(quality) {
    this._quality = quality;
    this._saveSettings();
  },

  isEnabled: function() {
    return this._enabled;
  },

  getQuality: function() {
    return this._quality;
  },

  // Get blur amount based on quality
  getBlur: function(base) {
    var multipliers = { low: 0.5, medium: 0.75, high: 1 };
    return (base || 4) * (multipliers[this._quality] || 1);
  }
};
