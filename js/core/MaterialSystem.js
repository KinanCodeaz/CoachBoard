'use strict';
/**
 * CoachBoard Pro - Material System (Phase I)
 * 
 * Defines material properties that affect rendering.
 * Each material has: reflectivity, shininess, gradient stops, highlight alpha, outline width.
 * 
 * @example
 * // Get material properties
 * var metal = MaterialSystem.get('metal');
 * console.log(metal.reflectivity); // 0.6
 * 
 * @example
 * // Apply material gradient to canvas
 * var gradient = MaterialSystem.applyGradient(ctx, x, y, height, '#ffffff', 'metal');
 * ctx.fillStyle = gradient;
 * 
 * @namespace MaterialSystem
 * @version 2.0
 */
var MaterialSystem = {
  /**
   * Material definitions with rendering properties.
   * @type {Object.<string, MaterialDef>}
   */
  materials: {
    plastic: {
      name: 'Plastic',
      nameAr: 'بلاستيك',
      reflectivity: 0.3,
      shininess: 0.5,
      gradientStops: [
        { offset: 0, lighten: 25 },
        { offset: 0.5, lighten: 0 },
        { offset: 1, darken: 15 }
      ],
      strokeAlpha: 0.8,
      highlightAlpha: 0.35,
      outlineWidth: 0.5
    },
    metal: {
      name: 'Metal',
      nameAr: 'معدن',
      reflectivity: 0.6,
      shininess: 0.8,
      gradientStops: [
        { offset: 0, lighten: 35 },
        { offset: 0.3, lighten: 15 },
        { offset: 0.7, darken: 5 },
        { offset: 1, darken: 25 }
      ],
      strokeAlpha: 0.9,
      highlightAlpha: 0.5,
      outlineWidth: 0.7
    },
    fabric: {
      name: 'Fabric',
      nameAr: 'قماش',
      reflectivity: 0.1,
      shininess: 0.2,
      gradientStops: [
        { offset: 0, lighten: 10 },
        { offset: 0.5, lighten: 0 },
        { offset: 1, darken: 10 }
      ],
      strokeAlpha: 0.6,
      highlightAlpha: 0.2,
      outlineWidth: 0.4
    },
    wood: {
      name: 'Wood',
      nameAr: 'خشب',
      reflectivity: 0.15,
      shininess: 0.3,
      gradientStops: [
        { offset: 0, lighten: 15 },
        { offset: 0.5, lighten: 5 },
        { offset: 1, darken: 20 }
      ],
      strokeAlpha: 0.7,
      highlightAlpha: 0.25,
      outlineWidth: 0.6
    },
    rubber: {
      name: 'Rubber',
      nameAr: 'مطاط',
      reflectivity: 0.05,
      shininess: 0.1,
      gradientStops: [
        { offset: 0, lighten: 8 },
        { offset: 0.5, darken: 5 },
        { offset: 1, darken: 18 }
      ],
      strokeAlpha: 0.5,
      highlightAlpha: 0.15,
      outlineWidth: 0.4
    }
  },

  // Get material properties
  get: function(name) {
    return this.materials[name] || this.materials.plastic;
  },

  // Apply material gradient to canvas context
  applyGradient: function(cx2, x, y, h, color, materialName) {
    var mat = this.get(materialName);
    var g = cx2.createLinearGradient(x, y - h / 2, x, y + h / 2);
    mat.gradientStops.forEach(function(stop) {
      var c = color;
      if (stop.lighten > 0) c = DesignSystem.lighten(color, stop.lighten);
      else if (stop.darken > 0) c = DesignSystem.darken(color, stop.darken);
      g.addColorStop(stop.offset, c);
    });
    return g;
  },

  // Get highlight alpha for material
  getHighlightAlpha: function(materialName) {
    return this.get(materialName).highlightAlpha;
  },

  // Get outline width for material
  getOutlineWidth: function(materialName) {
    return this.get(materialName).outlineWidth;
  },

  // Draw material-specific texture overlay
  drawTexture: function(cx2, x, y, w, h, materialName) {
    var mat = this.get(materialName);
    if (materialName === 'metal') {
      // Metal: subtle vertical highlight streaks
      cx2.save();
      cx2.globalAlpha = 0.08;
      cx2.strokeStyle = '#ffffff';
      cx2.lineWidth = 1;
      for (var i = 0; i < 3; i++) {
        var sx = x - w * 0.3 + (w * 0.3 * i);
        cx2.beginPath();
        cx2.moveTo(sx, y - h * 0.4);
        cx2.lineTo(sx + 2, y + h * 0.4);
        cx2.stroke();
      }
      cx2.restore();
    } else if (materialName === 'wood') {
      // Wood: horizontal grain lines
      cx2.save();
      cx2.globalAlpha = 0.06;
      cx2.strokeStyle = '#000000';
      cx2.lineWidth = 0.5;
      for (var j = 0; j < 5; j++) {
        var gy = y - h * 0.4 + (h * 0.8 / 5) * j;
        cx2.beginPath();
        cx2.moveTo(x - w * 0.4, gy);
        cx2.quadraticCurveTo(x, gy + 2, x + w * 0.4, gy);
        cx2.stroke();
      }
      cx2.restore();
    } else if (materialName === 'fabric') {
      // Fabric: subtle cross-hatch
      cx2.save();
      cx2.globalAlpha = 0.04;
      cx2.strokeStyle = '#000000';
      cx2.lineWidth = 0.3;
      for (var k = 0; k < 6; k++) {
        var fx = x - w * 0.4 + (w * 0.8 / 6) * k;
        cx2.beginPath(); cx2.moveTo(fx, y - h * 0.4); cx2.lineTo(fx, y + h * 0.4); cx2.stroke();
      }
      cx2.restore();
    }
  }
};

if (typeof window !== 'undefined') window.MaterialSystem = MaterialSystem;