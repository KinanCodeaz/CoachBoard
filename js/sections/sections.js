'use strict';
// CoachBoard Pro - Section Registry
// Each section registers its tools, renderer, handlers here
var SEC = {
  _list: [],
  _toolCache: {},
  add: function(s) { this._list.push(s); this._toolCache = {}; },
  byTool: function(tool) {
    if (this._toolCache[tool] !== undefined) return this._toolCache[tool];
    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].tools.indexOf(tool) >= 0) { this._toolCache[tool] = this._list[i]; return this._list[i]; }
    }
    this._toolCache[tool] = null;
    return null;
  },
  draw: function(el) {
    var s = this.byTool(el.type);
    if (s && s.draw) s.draw(el);
  },
  name: function(type) {
    var s = this.byTool(type);
    return s ? s.elName(type) : type;
  },
  bounds: function(el) {
    var s = this.byTool(el.type);
    if (s && s.bounds) return s.bounds(el);
    var sz = el.size || 18;
    return { x: el.x - sz, y: el.y - sz, w: sz * 2, h: sz * 2 };
  },
  center: function(el) {
    var s = this.byTool(el.type);
    if (s && s.center) return s.center(el);
    return { x: el.x, y: el.y };
  },
  defaultColor: function(type) {
    var s = this.byTool(type);
    return s ? s.dc(type) : '#ffffff';
  },
  arrowColor: function(type) {
    return '';
  },
  placeEl: function(type, x, y, el) {
    var s = this.byTool(type);
    if (s && s.placeEl) s.placeEl(type, x, y, el);
  },
  mouseDown: function(e, p) {
    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].mouseDown && this._list[i].mouseDown(e, p)) return true;
    }
    return false;
  },
  mouseMove: function(e, p) {
    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].mouseMove && this._list[i].mouseMove(e, p)) return true;
    }
    return false;
  },
  mouseUp: function(e, p) {
    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].mouseUp && this._list[i].mouseUp(e, p)) return true;
    }
    return false;
  },
  renderOverlay: function() {
    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].renderOverlay) this._list[i].renderOverlay();
    }
  },
  dblClick: function(e) {
    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].dblClick && this._list[i].dblClick(e)) return true;
    }
    return false;
  }
};
