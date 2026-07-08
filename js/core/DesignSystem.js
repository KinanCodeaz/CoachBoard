'use strict';
/**
 * CoachBoard Pro - Design Language System (Phase G)
 * 
 * Centralized visual DNA that ensures consistency across all rendering.
 * All objects follow the same lighting, shadow, stroke, and color rules.
 * 
 * @example
 * // Use DesignSystem to draw a consistent gradient
 * var gradient = DesignSystem.gradient(ctx, x, y, height, '#e84040');
 * ctx.fillStyle = gradient;
 * ctx.fillRect(x, y, width, height);
 * 
 * @example
 * // Draw a ground shadow
 * DesignSystem.drawGroundShadow(ctx, x, y, 20, 5);
 * 
 * @namespace DesignSystem
 * @version 2.0
 */
var DesignSystem = {
  /** @constant {number} lightAngle - Light angle in radians (top-left, 135°) */
  lightAngle: -Math.PI * 0.25,
  /** @constant {Object} lightDir - Normalized light direction vector */
  lightDir: { x: -0.707, y: -0.707 },

  // Shadow system
  shadow: {
    ground: { offsetX: 3, offsetY: 5, blur: 0, alpha: 0.12 },
    drop: { offsetX: 2, offsetY: 2, blur: 4, alpha: 0.15 },
    ambient: { offsetX: 0, offsetY: 0, blur: 8, alpha: 0.08 }
  },

  // Stroke widths
  stroke: {
    frame: 5,        // Main frame (goals, barriers)
    secondary: 2.5,  // Legs, supports
    detail: 1.5,     // Highlights, outlines
    outline: 0.5,    // Object outlines
    net: 0.6         // Goal net
  },

  // Corner radius
  corner: {
    standard: 3,
    round: 999,
    sharp: 0
  },

  // Color adjustments
  lighten: function(color, percent) {
    var num = parseInt(color.replace('#', ''), 16);
    var r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
    var g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
    var b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  },

  darken: function(color, percent) {
    var num = parseInt(color.replace('#', ''), 16);
    var r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
    var g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(2.55 * percent));
    var b = Math.max(0, (num & 0x0000FF) - Math.round(2.55 * percent));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  },

  // Gradient: top (lighter) to bottom (darker)
  gradient: function(cx2, x, y, h, color) {
    var g = cx2.createLinearGradient(x, y - h / 2, x, y + h / 2);
    g.addColorStop(0, DesignSystem.lighten(color, 20));
    g.addColorStop(0.5, color);
    g.addColorStop(1, DesignSystem.darken(color, 15));
    return g;
  },

  // Ground shadow
  drawGroundShadow: function(cx2, x, y, w, h) {
    var s = DesignSystem.shadow.ground;
    cx2.save();
    cx2.fillStyle = 'rgba(0,0,0,' + s.alpha + ')';
    cx2.beginPath();
    cx2.ellipse(x + s.offsetX, y + s.offsetY, w, h, 0, 0, Math.PI * 2);
    cx2.fill();
    cx2.restore();
  },

  // Drop shadow
  drawDropShadow: function(cx2, x, y, w, h) {
    var s = DesignSystem.shadow.drop;
    cx2.save();
    cx2.fillStyle = 'rgba(0,0,0,' + s.alpha + ')';
    cx2.beginPath();
    cx2.ellipse(x + s.offsetX, y + s.offsetY, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    cx2.fill();
    cx2.restore();
  },

  // Highlight (top-left light)
  drawHighlight: function(cx2, x, y, w, h) {
    cx2.save();
    cx2.fillStyle = 'rgba(255,255,255,0.25)';
    cx2.beginPath();
    cx2.ellipse(x - w * 0.2, y - h * 0.2, w * 0.4, h * 0.3, -0.5, 0, Math.PI * 2);
    cx2.fill();
    cx2.restore();
  },

  // Consistent outline
  drawOutline: function(cx2, color) {
    cx2.strokeStyle = DesignSystem.darken(color, 15);
    cx2.lineWidth = DesignSystem.stroke.outline;
  },

  // Consistent frame stroke
  drawFrame: function(cx2, x1, y1, x2, y2, color, width) {
    cx2.strokeStyle = color;
    cx2.lineWidth = width || DesignSystem.stroke.frame;
    cx2.lineCap = 'round';
    cx2.beginPath(); cx2.moveTo(x1, y1); cx2.lineTo(x2, y2); cx2.stroke();
    // Highlight
    cx2.strokeStyle = 'rgba(255,255,255,0.25)';
    cx2.lineWidth = 1.5;
    cx2.beginPath(); cx2.moveTo(x1 - 1, y1 - 1); cx2.lineTo(x2 - 1, y2 - 1); cx2.stroke();
  },

  // Sport-specific color palettes
  palettes: {
    futsal: { primary: '#e84040', secondary: '#4a90d9', accent: '#f0c040', ball: '#ffffff' },
    football: { primary: '#4a90d9', secondary: '#e84040', accent: '#50c878', ball: '#ffffff' },
    basketball: { primary: '#ff6b2b', secondary: '#4a90d9', accent: '#f0c040', ball: '#ff6b2b' },
    volleyball: { primary: '#f0c040', secondary: '#4a90d9', accent: '#e84040', ball: '#f0f0f0' },
    handball: { primary: '#4a90d9', secondary: '#e84040', accent: '#50c878', ball: '#ffffff' }
  },

  // Apply palette to current sport
  getPalette: function() {
    var sport = typeof currentSport !== 'undefined' ? currentSport : 'futsal';
    return DesignSystem.palettes[sport] || DesignSystem.palettes.futsal;
  }
};

// Make globally available
if (typeof window !== 'undefined') window.DesignSystem = DesignSystem;