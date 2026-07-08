'use strict';
// CoachBoard Pro - Central Store
// Facade for reading/writing app state. Delegates to state.js globals.
var Store = {
  get sport() { return sport; },
  set sport(v) { sport = v; },
  get tool() { return tool; },
  set tool(v) { tool = v; },
  get lang() { return lang; },
  set lang(v) { lang = v; },
  get theme() { return theme; },
  set theme(v) { theme = v; },
  get team() { return curTeam; },
  set team(v) { curTeam = v; },
  get elements() { return els; },
  set elements(v) { els = v; },
  get selection() { return selIds; },
  get clipboard() { return clipboard; },
  set clipboard(v) { clipboard = v; },

  get settings() { return Settings; },
  get viewport() { return ViewportState; },
  get history() { return HistoryState; },

  save: function(key, val) { try { localStorage.setItem('cb_' + key, JSON.stringify(val)); } catch(e) {} },
  load: function(key) { try { var d = localStorage.getItem('cb_' + key); return d ? JSON.parse(d) : null; } catch(e) { return null; } }
};
