'use strict';
// CoachBoard Pro - Vector Engine
// Draw once, render to Canvas/PDF/SVG.
// Geometry → Vector Shape → Renderer

var VectorEngine = {
  // ============ VECTOR SHAPES ============
  // Create a vector shape from points
  createRect: function(x, y, w, h, options) {
    return {
      type: 'rect',
      x: x, y: y, w: w, h: h,
      fill: (options && options.fill) || 'transparent',
      stroke: (options && options.stroke) || '#000000',
      lineWidth: (options && options.lineWidth) || 1,
      radius: (options && options.radius) || 0,
      opacity: (options && options.opacity) || 1
    };
  },

  createCircle: function(cx, cy, r, options) {
    return {
      type: 'circle',
      cx: cx, cy: cy, r: r,
      fill: (options && options.fill) || 'transparent',
      stroke: (options && options.stroke) || '#000000',
      lineWidth: (options && options.lineWidth) || 1,
      opacity: (options && options.opacity) || 1
    };
  },

  createEllipse: function(cx, cy, rx, ry, options) {
    return {
      type: 'ellipse',
      cx: cx, cy: cy, rx: rx, ry: ry,
      fill: (options && options.fill) || 'transparent',
      stroke: (options && options.stroke) || '#000000',
      lineWidth: (options && options.lineWidth) || 1,
      opacity: (options && options.opacity) || 1
    };
  },

  createLine: function(x1, y1, x2, y2, options) {
    return {
      type: 'line',
      x1: x1, y1: y1, x2: x2, y2: y2,
      stroke: (options && options.stroke) || '#000000',
      lineWidth: (options && options.lineWidth) || 1,
      lineCap: (options && options.lineCap) || 'round',
      lineDash: (options && options.lineDash) || null,
      opacity: (options && options.opacity) || 1
    };
  },

  createPath: function(points, options) {
    return {
      type: 'path',
      points: points || [],
      fill: (options && options.fill) || 'transparent',
      stroke: (options && options.stroke) || '#000000',
      lineWidth: (options && options.lineWidth) || 1,
      lineCap: (options && options.lineCap) || 'round',
      lineJoin: (options && options.lineJoin) || 'round',
      closed: (options && options.closed) || false,
      opacity: (options && options.opacity) || 1
    };
  },

  createText: function(x, y, text, options) {
    return {
      type: 'text',
      x: x, y: y,
      text: text || '',
      font: (options && options.font) || '14px sans-serif',
      fill: (options && options.fill) || '#000000',
      align: (options && options.align) || 'left',
      baseline: (options && options.baseline) || 'top',
      opacity: (options && options.opacity) || 1
    };
  },

  createGroup: function(shapes, options) {
    return {
      type: 'group',
      shapes: shapes || [],
      x: (options && options.x) || 0,
      y: (options && options.y) || 0,
      opacity: (options && options.opacity) || 1
    };
  },

  // ============ CANVAS RENDERER ============
  renderToCanvas: function(shapes, ctx, options) {
    if (!ctx) return;
    var opts = options || {};
    var ox = opts.offsetX || 0;
    var oy = opts.offsetY || 0;
    var scale = opts.scale || 1;

    ctx.save();
    if (ox !== 0 || oy !== 0) ctx.translate(ox, oy);
    if (scale !== 1) ctx.scale(scale, scale);

    for (var i = 0; i < shapes.length; i++) {
      this._drawShape(ctx, shapes[i]);
    }

    ctx.restore();
  },

  _drawShape: function(ctx, shape) {
    if (!shape) return;

    ctx.globalAlpha = shape.opacity || 1;

    switch (shape.type) {
      case 'rect':
        ctx.beginPath();
        if (shape.radius > 0) {
          this._roundRect(ctx, shape.x, shape.y, shape.w, shape.h, shape.radius);
        } else {
          ctx.rect(shape.x, shape.y, shape.w, shape.h);
        }
        if (shape.fill && shape.fill !== 'transparent') {
          ctx.fillStyle = shape.fill;
          ctx.fill();
        }
        if (shape.stroke) {
          ctx.strokeStyle = shape.stroke;
          ctx.lineWidth = shape.lineWidth || 1;
          ctx.stroke();
        }
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
        if (shape.fill && shape.fill !== 'transparent') {
          ctx.fillStyle = shape.fill;
          ctx.fill();
        }
        if (shape.stroke) {
          ctx.strokeStyle = shape.stroke;
          ctx.lineWidth = shape.lineWidth || 1;
          ctx.stroke();
        }
        break;

      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(shape.cx, shape.cy, shape.rx, shape.ry, 0, 0, Math.PI * 2);
        if (shape.fill && shape.fill !== 'transparent') {
          ctx.fillStyle = shape.fill;
          ctx.fill();
        }
        if (shape.stroke) {
          ctx.strokeStyle = shape.stroke;
          ctx.lineWidth = shape.lineWidth || 1;
          ctx.stroke();
        }
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.strokeStyle = shape.stroke || '#000000';
        ctx.lineWidth = shape.lineWidth || 1;
        ctx.lineCap = shape.lineCap || 'round';
        if (shape.lineDash) ctx.setLineDash(shape.lineDash);
        ctx.stroke();
        if (shape.lineDash) ctx.setLineDash([]);
        break;

      case 'path':
        if (!shape.points || shape.points.length < 2) break;
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (var i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        if (shape.closed) ctx.closePath();
        if (shape.fill && shape.fill !== 'transparent') {
          ctx.fillStyle = shape.fill;
          ctx.fill();
        }
        if (shape.stroke) {
          ctx.strokeStyle = shape.stroke;
          ctx.lineWidth = shape.lineWidth || 1;
          ctx.lineCap = shape.lineCap || 'round';
          ctx.lineJoin = shape.lineJoin || 'round';
          ctx.stroke();
        }
        break;

      case 'text':
        ctx.font = shape.font || '14px sans-serif';
        ctx.fillStyle = shape.fill || '#000000';
        ctx.textAlign = shape.align || 'left';
        ctx.textBaseline = shape.baseline || 'top';
        ctx.fillText(shape.text, shape.x, shape.y);
        break;

      case 'group':
        ctx.save();
        if (shape.x || shape.y) ctx.translate(shape.x, shape.y);
        for (var i = 0; i < shape.shapes.length; i++) {
          this._drawShape(ctx, shape.shapes[i]);
        }
        ctx.restore();
        break;
    }

    ctx.globalAlpha = 1;
  },

  _roundRect: function(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },

  // ============ SVG RENDERER ============
  renderToSVG: function(shapes, options) {
    var opts = options || {};
    var width = opts.width || 800;
    var height = opts.height || 600;
    var ox = opts.offsetX || 0;
    var oy = opts.offsetY || 0;
    var scale = opts.scale || 1;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">';
    svg += '<g transform="translate(' + ox + ',' + oy + ') scale(' + scale + ')">';

    for (var i = 0; i < shapes.length; i++) {
      svg += this._shapeToSVG(shapes[i]);
    }

    svg += '</g></svg>';
    return svg;
  },

  _shapeToSVG: function(shape) {
    if (!shape) return '';

    var opacity = shape.opacity || 1;
    var fill = shape.fill || 'transparent';
    var stroke = shape.stroke || 'none';
    var strokeWidth = shape.lineWidth || 1;

    switch (shape.type) {
      case 'rect':
        return '<rect x="' + shape.x + '" y="' + shape.y + '" width="' + shape.w + '" height="' + shape.h +
               '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth +
               '" rx="' + (shape.radius || 0) + '" opacity="' + opacity + '"/>';

      case 'circle':
        return '<circle cx="' + shape.cx + '" cy="' + shape.cy + '" r="' + shape.r +
               '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth +
               '" opacity="' + opacity + '"/>';

      case 'ellipse':
        return '<ellipse cx="' + shape.cx + '" cy="' + shape.cy + '" rx="' + shape.rx + '" ry="' + shape.ry +
               '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth +
               '" opacity="' + opacity + '"/>';

      case 'line':
        return '<line x1="' + shape.x1 + '" y1="' + shape.y1 + '" x2="' + shape.x2 + '" y2="' + shape.y2 +
               '" stroke="' + stroke + '" stroke-width="' + strokeWidth +
               '" stroke-linecap="' + (shape.lineCap || 'round') + '" opacity="' + opacity + '"/>';

      case 'path':
        if (!shape.points || shape.points.length < 2) return '';
        var d = 'M' + shape.points[0].x + ',' + shape.points[0].y;
        for (var i = 1; i < shape.points.length; i++) {
          d += ' L' + shape.points[i].x + ',' + shape.points[i].y;
        }
        if (shape.closed) d += ' Z';
        return '<path d="' + d + '" fill="' + fill + '" stroke="' + stroke +
               '" stroke-width="' + strokeWidth + '" stroke-linecap="' + (shape.lineCap || 'round') +
               '" stroke-linejoin="' + (shape.lineJoin || 'round') + '" opacity="' + opacity + '"/>';

      case 'text':
        return '<text x="' + shape.x + '" y="' + shape.y + '" font="' + (shape.font || '14px sans-serif') +
               '" fill="' + (shape.fill || '#000000') + '" text-anchor="' + (shape.align || 'left') +
               '" opacity="' + opacity + '">' + (shape.text || '') + '</text>';

      case 'group':
        var svg = '<g transform="translate(' + (shape.x || 0) + ',' + (shape.y || 0) + ')" opacity="' + opacity + '">';
        for (var i = 0; i < shape.shapes.length; i++) {
          svg += this._shapeToSVG(shape.shapes[i]);
        }
        svg += '</g>';
        return svg;

      default:
        return '';
    }
  }
};
