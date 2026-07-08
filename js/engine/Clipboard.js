'use strict';
// CoachBoard Pro - Clipboard System
// Copy/paste/duplicate for elements. clipboard[] is a global array in state.js.
var Clipboard = {
  get items() { return clipboard; },
  get hasItems() { return clipboard.length > 0; },

  copy: function() {
    clipboard = [];
    selIds.forEach(function(id) {
      var el = els.find(function(e){return e.id===id;});
      if(el) clipboard.push(JSON.parse(JSON.stringify(el)));
    });
    toast(t('copied'));
  },

  paste: function() {
    if(!clipboard.length) return;
    selIds.clear();
    clipboard.forEach(function(cp) {
      var ne = JSON.parse(JSON.stringify(cp));
      ne.id = uid();
      ne.x += 20; ne.y += 20;
      if(ne.points) ne.points = ne.points.map(function(p) {
        return {x: p.x + 20, y: p.y + 20};
      });
      if(ne.ax2 !== undefined) { ne.ax2 += 20; ne.ay2 += 20; }
      els.push(ne);
      selIds.add(ne.id);
    });
    HistorySystem.save();
    if(typeof updateProps==='function') updateProps();
    if(typeof updateLayers==='function') updateLayers();
    if(typeof render==='function') render();
    toast(t('pasted'));
  },

  duplicate: function() {
    var ne = [];
    selIds.forEach(function(id) {
      var el = els.find(function(e){return e.id===id;});
      if(el) {
        var cp = JSON.parse(JSON.stringify(el));
        cp.id = uid();
        cp.x += 20; cp.y += 20;
        if(cp.points) {
          cp.points = cp.points.map(function(p) {
            var np = {x: p.x + 20, y: p.y + 20};
            if(p.linkedToId) np.linkedToId = null;
            return np;
          });
        }
        if(cp.ax2 !== undefined) { cp.ax2 += 20; cp.ay2 += 20; }
        cp.linkedToId = null;
        ne.push(cp);
      }
    });
    ne.forEach(function(e) { els.push(e); });
    selIds.clear();
    ne.forEach(function(e) { selIds.add(e.id); });
    HistorySystem.save();
    if(typeof updateProps==='function') updateProps();
    if(typeof updateLayers==='function') updateLayers();
    if(typeof render==='function') render();
    toast(t('copied'));
  }
};

function duplicateSel() { Clipboard.duplicate(); }
function pasteClipboard() { Clipboard.paste(); }
