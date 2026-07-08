'use strict';
// CoachBoard Pro - Selection System
// Centralized selection API. selIds remains the source of truth (global Set).
var SelectionSystem = {
  get ids() { return selIds; },
  get count() { return selIds.size; },
  get first() { var id = selIds.values().next().value; return id ? els.find(function(e){return e.id===id;}) : null; },
  get all() { var r = []; selIds.forEach(function(id){ var el = els.find(function(e){return e.id===id;}); if(el) r.push(el); }); return r; },

  select: function(id) { selIds.clear(); selIds.add(id); SelectionSystem._update(); },
  toggle: function(id) { if(selIds.has(id)) selIds.delete(id); else selIds.add(id); SelectionSystem._update(); },
  add: function(id) { selIds.add(id); SelectionSystem._update(); },
  remove: function(id) { selIds.delete(id); SelectionSystem._update(); },
  clear: function() { selIds.clear(); SelectionSystem._update(); },
  selectAll: function() { els.forEach(function(el){ if(!el.hidden&&!el.locked) selIds.add(el.id); }); SelectionSystem._update(); },

  isSelected: function(id) { return selIds.has(id); },

  selectByType: function(type) {
    selIds.clear();
    els.forEach(function(el){ if(el.type===type && !el.hidden && !el.locked) selIds.add(el.id); });
    SelectionSystem._update();
  },

  selectInRect: function(rx, ry, rw, rh) {
    selIds.clear();
    els.forEach(function(el){
      if(el.hidden||el.locked) return;
      var ec = eCen(el);
      if(ec.x>=rx && ec.x<=rx+rw && ec.y>=ry && ec.y<=ry+rh) selIds.add(el.id);
    });
    SelectionSystem._update();
  },

  selectConnected: function(id) {
    var el = els.find(function(e){return e.id===id;});
    if(!el) return;
    selIds.clear();
    selIds.add(id);
    if(el.groupId) {
      els.forEach(function(e){ if(e.groupId===el.groupId) selIds.add(e.id); });
    }
    if(el.linkedToId) selIds.add(el.linkedToId);
    els.forEach(function(e){ if(e.linkedToId===id) selIds.add(e.id); });
    SelectionSystem._update();
  },

  _update: function() {
    if(typeof updateProps==='function') updateProps();
    if(typeof updateLayers==='function') updateLayers();
    if(typeof render==='function') render();
  }
};

function selectAllEls() { SelectionSystem.selectAll(); }
