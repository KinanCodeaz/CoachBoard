'use strict';
// CoachBoard Pro - Settings Store
// Persistent user preferences (theme, field style, display style, pitch color, etc.)
var Settings = {
  get theme() { return theme; },
  set theme(v) { theme = v; ThemeManager.apply(v); Store.save('theme', v); },
  get fieldStyle() { return fieldStyle; },
  set fieldStyle(v) { fieldStyle = v; Store.save('field_style', v); },
  get playerDisplayStyle() { return playerDisplayStyle; },
  set playerDisplayStyle(v) { playerDisplayStyle = v; Store.save('display_style', v); },
  get showPlayerNames() { return showPlayerNames; },
  set showPlayerNames(v) { showPlayerNames = v; Store.save('show_names', v); },
  get pitchColors() { return pitchColors; },
  get customPitchColor() { return customPitchColor; },
  set customPitchColor(v) { customPitchColor = v; },

  loadAll: function() {
    var ds = Store.load('display_style'); if(ds) playerDisplayStyle = ds;
    var fs = Store.load('field_style'); if(fs) fieldStyle = fs;
    var sn = Store.load('show_names'); if(sn !== null && sn !== undefined) showPlayerNames = !!sn;
  }
};
