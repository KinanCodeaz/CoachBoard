'use strict';
/**
 * CoachBoard Pro - SVG Generator (Phase H)
 * 
 * Parameter-based SVG generation for export.
 * Converts canvas elements to SVG format for vector export.
 * 
 * @example
 * // Generate SVG for a single element
 * var svg = SVGGenerator.generate(element, { scale: 2 });
 * 
 * @example
 * // Generate complete SVG document
 * var doc = SVGGenerator.generateDocument(elements, {
 *   width: 1920,
 *   height: 1080,
 *   background: '#1a5c2a'
 * });
 * SVGGenerator.downloadSVG(doc, 'tactics.svg');
 * 
 * @namespace SVGGenerator
 * @version 2.0
 */
var SVGGenerator = {
  /**
   * Generate SVG string for a single element.
   * @param {Object} el - The element to convert
   * @param {Object} [opts] - Options
   * @param {number} [opts.scale=1] - Scale factor
   * @returns {string} SVG string for the element
   */
  generate: function(el, opts) {
    opts = opts || {};
    var scale = opts.scale || 1;
    var svg = '';
    var type = el.type;
    var s = (el.size || 18) * scale;
    var cl = el.color || '#ffffff';

    // Common attributes
    var transform = 'translate(' + (el.x * scale) + ',' + (el.y * scale) + ')';
    if (el.rotation) transform += ' rotate(' + el.rotation + ')';
    if (el.flipH) transform += ' scale(-1,1)';
    if (el.flipV) transform += ' scale(1,-1)';

    switch (type) {
      case 'cone':
        var ch = (el.coneHeight || 1.0) * s;
        var cbr = (el.coneBaseRadius || 1.0) * s * 0.75;
        svg = '<g transform="' + transform + '">';
        svg += '<ellipse cx="0" cy="' + (s * 0.5) + '" rx="' + cbr + '" ry="' + (s * 0.12) + '" fill="rgba(0,0,0,0.12)"/>';
        svg += '<polygon points="0,' + (-ch * 0.8) + ' ' + (-cbr) + ',' + (s * 0.35) + ' ' + cbr + ',' + (s * 0.35) + '" fill="' + cl + '"/>';
        svg += '<ellipse cx="0" cy="' + (s * 0.32) + '" rx="' + cbr + '" ry="' + (s * 0.1) + '" fill="' + cl + '"/>';
        svg += '</g>';
        break;

      case 'ball':
        svg = '<g transform="' + transform + '">';
        svg += '<circle cx="0" cy="0" r="' + s + '" fill="' + cl + '"/>';
        svg += '<circle cx="0" cy="0" r="' + s + '" fill="none" stroke="' + cl + '" stroke-width="0.5"/>';
        // Pentagon pattern
        for (var i = 0; i < 5; i++) {
          var a = (i * 72 - 90) * Math.PI / 180;
          var px = Math.cos(a) * s * 0.5;
          var py = Math.sin(a) * s * 0.5;
          svg += '<circle cx="' + px + '" cy="' + py + '" r="' + (s * 0.18) + '" fill="#333" opacity="0.3"/>';
        }
        svg += '</g>';
        break;

      case 'p_stand': case 'p_walk': case 'p_run': case 'p_shoot':
      case 'gk_stand': case 'gk_dive': case 'gk_save':
        svg = '<g transform="' + transform + '">';
        // Body circle
        svg += '<circle cx="0" cy="0" r="' + s + '" fill="' + cl + '"/>';
        // Number if present
        if (el.number) {
          svg += '<text x="0" y="' + (s * 0.35) + '" text-anchor="middle" font-size="' + (s * 0.7) + '" fill="' + (el.numberColor || '#fff') + '" font-family="Arial" font-weight="bold">' + el.number + '</text>';
        }
        svg += '</g>';
        break;

      case 'hurdle':
        var hw = (el.hurdleWidth || 1.0) * s * 1.4;
        var hh = (el.hurdleHeight || 1.0) * s;
        svg = '<g transform="' + transform + '">';
        svg += '<line x1="' + (-hw / 2) + '" y1="0" x2="' + (-hw / 2) + '" y2="' + (-hh) + '" stroke="' + cl + '" stroke-width="2.5" stroke-linecap="round"/>';
        svg += '<line x1="' + (hw / 2) + '" y1="0" x2="' + (hw / 2) + '" y2="' + (-hh) + '" stroke="' + cl + '" stroke-width="2.5" stroke-linecap="round"/>';
        svg += '<line x1="' + (-hw / 2) + '" y1="' + (-hh) + '" x2="' + (hw / 2) + '" y2="' + (-hh) + '" stroke="' + cl + '" stroke-width="3.5" stroke-linecap="round"/>';
        svg += '</g>';
        break;

      case 'flag':
        var fpH = (el.flagPoleHeight || 1.0) * s;
        var fs = (el.flagSize || 1.0) * s;
        svg = '<g transform="' + transform + '">';
        svg += '<line x1="0" y1="' + (fpH * 0.5) + '" x2="0" y2="' + (-fpH * 0.5) + '" stroke="#777" stroke-width="2" stroke-linecap="round"/>';
        svg += '<polygon points="0,' + (-fpH * 0.5) + ' ' + (fs * 0.6) + ',' + (-fpH * 0.5 + fs * 0.15) + ' ' + (fs * 0.5) + ',' + (-fpH * 0.5 + fs * 0.3) + ' 0,' + (-fpH * 0.5 + fs * 0.4) + '" fill="' + cl + '"/>';
        svg += '</g>';
        break;

      case 'ring':
        var rt = (el.ringThickness || 1.0);
        svg = '<g transform="' + transform + '">';
        svg += '<circle cx="0" cy="0" r="' + s + '" fill="none" stroke="' + cl + '" stroke-width="' + (3 * rt) + '"/>';
        svg += '</g>';
        break;

      case 'barrier':
        var bw = (el.barrierWidth || 1.0) * s * 1.6;
        var bh = (el.barrierHeight || 1.0) * s * 0.45;
        svg = '<g transform="' + transform + '">';
        svg += '<rect x="' + (-bw / 2) + '" y="' + (-bh / 2) + '" width="' + bw + '" height="' + bh + '" fill="' + cl + '" rx="2"/>';
        svg += '</g>';
        break;

      case 'arrowSolid': case 'arrowDashed':
        svg = '<g transform="' + transform + '">';
        var dx = (el.ax2 || el.x + 50) - el.x;
        var dy = (el.ay2 || el.y) - el.y;
        var dash = type === 'arrowDashed' ? ' stroke-dasharray="6,4"' : '';
        svg += '<line x1="0" y1="0" x2="' + (dx * scale) + '" y2="' + (dy * scale) + '" stroke="' + cl + '" stroke-width="' + ((el.size || 2.5) * scale) + '"' + dash + '/>';
        // Arrowhead
        var angle = Math.atan2(dy, dx);
        var headLen = 10 * scale;
        svg += '<polygon points="' + (dx * scale) + ',' + (dy * scale) + ' ' + (dx * scale - headLen * Math.cos(angle - 0.4)) + ',' + (dy * scale - headLen * Math.sin(angle - 0.4)) + ' ' + (dx * scale - headLen * Math.cos(angle + 0.4)) + ',' + (dy * scale - headLen * Math.sin(angle + 0.4)) + '" fill="' + cl + '"/>';
        svg += '</g>';
        break;

      case 'text': case 'number':
        svg = '<g transform="' + transform + '">';
        svg += '<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="' + ((el.fontSize || 18) * scale) + '" fill="' + cl + '" font-family="' + (el.fontFamily || 'Arial') + '">' + (el.text || '') + '</text>';
        svg += '</g>';
        break;

      default:
        // Generic rectangle fallback
        svg = '<g transform="' + transform + '">';
        svg += '<rect x="' + (-s) + '" y="' + (-s) + '" width="' + (s * 2) + '" height="' + (s * 2) + '" fill="' + cl + '" rx="3"/>';
        svg += '</g>';
    }

    return svg;
  },

  // Generate complete SVG document
  generateDocument: function(elements, opts) {
    opts = opts || {};
    var w = opts.width || 1920;
    var h = opts.height || 1080;
    var bg = opts.background || '#1a5c2a';

    var svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
    svg += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">\n';
    svg += '<rect width="' + w + '" height="' + h + '" fill="' + bg + '"/>\n';

    elements.forEach(function(el) {
      if (!el.hidden) {
        svg += '  ' + SVGGenerator.generate(el, opts) + '\n';
      }
    });

    svg += '</svg>';
    return svg;
  },

  // Export SVG as file
  downloadSVG: function(svgContent, filename) {
    var blob = new Blob([svgContent], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'coachboard.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

if (typeof window !== 'undefined') window.SVGGenerator = SVGGenerator;