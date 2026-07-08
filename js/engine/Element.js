'use strict';
// CoachBoard Element Wrapper
// Thin wrapper around plain element objects in the els array.
// The els array still holds plain objects. This wrapper provides
// type-safe access and methods without changing the underlying data.
function ElementWrapper(el) {
  this._el = el;
}
ElementWrapper.prototype = {
  get id() { return this._el.id; },
  get type() { return this._el.type; },
  get x() { return this._el.x; },
  set x(v) { this._el.x = v; },
  get y() { return this._el.y; },
  set y(v) { this._el.y = v; },
  get size() { return this._el.size || 18; },
  set size(v) { this._el.size = v; },
  get color() { return this._el.color || '#ffffff'; },
  set color(v) { this._el.color = v; },
  get rotation() { return this._el.rotation || 0; },
  set rotation(v) { this._el.rotation = v; },
  get opacity() { return this._el.opacity !== undefined ? this._el.opacity : 1; },
  set opacity(v) { this._el.opacity = v; },
  get text() { return this._el.text || ''; },
  set text(v) { this._el.text = v; },
  get hidden() { return this._el.hidden || false; },
  set hidden(v) { this._el.hidden = v; },
  get locked() { return this._el.locked || false; },
  set locked(v) { this._el.locked = v; },
  get groupId() { return this._el.groupId || null; },
  set groupId(v) { this._el.groupId = v; },
  get linkedToId() { return this._el.linkedToId || null; },
  set linkedToId(v) { this._el.linkedToId = v; },
  get spotlight() { return this._el.spotlight || false; },
  set spotlight(v) { this._el.spotlight = v; },
  get poszone() { return this._el.poszone || false; },
  set poszone(v) { this._el.poszone = v; },
  get displayStyle() { return this._el.displayStyle || 'circle'; },
  set displayStyle(v) { this._el.displayStyle = v; },
  get playerName() { return this._el.playerName || ''; },
  set playerName(v) { this._el.playerName = v; },
  get ax2() { return this._el.ax2; },
  set ax2(v) { this._el.ax2 = v; },
  get ay2() { return this._el.ay2; },
  set ay2(v) { this._el.ay2 = v; },
  get points() { return this._el.points; },
  set points(v) { this._el.points = v; },
  get curve() { return this._el.curve || 0; },
  set curve(v) { this._el.curve = v; },
  get zoneW() { return this._el.zoneW; },
  set zoneW(v) { this._el.zoneW = v; },
  get zoneH() { return this._el.zoneH; },
  set zoneH(v) { this._el.zoneH = v; },
  get goalView() { return this._el.goalView || 'front'; },
  set goalView(v) { this._el.goalView = v; },
  get viewMode() { return this._el.viewMode || 'auto'; },
  set viewMode(v) { this._el.viewMode = v; },

  // --- Methods ---
  getBounds: function() { return typeof elBnd === 'function' ? elBnd(this._el) : { x: this.x - 18, y: this.y - 18, w: 36, h: 36 }; },
  getCenter: function() { return typeof eCen === 'function' ? eCen(this._el) : { x: this.x, y: this.y }; },

  // --- Type checks ---
  isPlayer: function() { return this._el.type === 'p_stand' || this._el.type === 'gk_stand'; },
  isBall: function() { return this._el.type === 'ball'; },
  isArrow: function() { return typeof isArr === 'function' ? isArr(this._el.type) : false; },
  isMultiArrow: function() { return typeof isMultiArr === 'function' ? isMultiArr(this._el.type) : false; },
  isZone: function() { return typeof isZone === 'function' ? isZone(this._el.type) : false; },
  isFreehand: function() { return typeof isFree === 'function' ? isFree(this._el.type) : false; },

  // --- Serialize (for engine use) ---
  serialize: function() { return JSON.parse(JSON.stringify(this._el)); },

  // --- Raw access (escape hatch) ---
  raw: function() { return this._el; }
};

// --- Factory ---
var ElementFactory = {
  wrap: function(el) { return el ? new ElementWrapper(el) : null; },
  wrapArray: function(arr) { return arr.map(function(el) { return new ElementWrapper(el); }); },
  findById: function(id) {
    var el = null;
    if (typeof els !== 'undefined') {
      for (var i = 0; i < els.length; i++) {
        if (els[i].id === id) { el = els[i]; break; }
      }
    }
    return el ? new ElementWrapper(el) : null;
  },
  findByType: function(type) {
    var results = [];
    if (typeof els !== 'undefined') {
      for (var i = 0; i < els.length; i++) {
        if (els[i].type === type) results.push(new ElementWrapper(els[i]));
      }
    }
    return results;
  },
  getSelected: function() {
    var results = [];
    if (typeof selIds !== 'undefined' && typeof els !== 'undefined') {
      for (var i = 0; i < els.length; i++) {
        if (selIds.has(els[i].id)) results.push(new ElementWrapper(els[i]));
      }
    }
    return results;
  }
};
