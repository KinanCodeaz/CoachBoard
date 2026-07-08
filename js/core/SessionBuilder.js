'use strict';
/**
 * CoachBoard Pro - Session Builder
 * 
 * Create, manage, and export training sessions.
 * Supports warmup/main/cooldown phases with steps, notes, and coaching points.
 * 
 * @example
 * // Create a new session
 * var session = SessionBuilder.createSession('Morning Drill', 'futsal', 60);
 * 
 * @example
 * // Quick add current page as exercise
 * SessionBuilder.quickAdd(session.id, 'main');
 * 
 * @example
 * // Start session timer
 * SessionBuilder.startTimer(15); // 15 minutes
 * 
 * @namespace SessionBuilder
 * @version 2.0
 */
var SessionBuilder = {
  _sessions: [],
  _currentSession: null,

  init: function() {
    this._loadSessions();
    return this;
  },

  // ============ CREATE SESSION ============
  createSession: function(name, sport, duration) {
    var session = {
      id: 'session_' + Date.now(),
      name: name || 'New Session',
      sport: sport || 'futsal',
      duration: duration || 60,
      intensity: 'medium',
      date: new Date().toISOString(),
      warmup: [],
      main: [],
      cooldown: [],
      notes: '',
      equipment: [],
      players: { count: 0, present: 0 },
      tags: [],
      favorite: false,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    this._sessions.push(session);
    this._saveSessions();
    return session;
  },

  // ============ SESSION STEPS ============
  addStep: function(sessionId, phase, step) {
    var session = this.getSession(sessionId);
    if (!session) return false;

    var phases = { warmup: session.warmup, main: session.main, cooldown: session.cooldown };
    if (!phases[phase]) return false;

    var stepData = {
      id: 'step_' + Date.now(),
      name: step.name || 'Step ' + (phases[phase].length + 1),
      pageId: step.pageId || null,
      duration: step.duration || 5,
      intensity: step.intensity || 'medium',
      notes: step.notes || '',
      coachingPoints: step.coachingPoints || '',
      elements: step.elements || [],
      created: new Date().toISOString()
    };

    phases[phase].push(stepData);
    session.modified = new Date().toISOString();
    this._saveSessions();
    return stepData;
  },

  removeStep: function(sessionId, phase, stepId) {
    var session = this.getSession(sessionId);
    if (!session) return false;

    var phases = { warmup: session.warmup, main: session.main, cooldown: session.cooldown };
    if (!phases[phase]) return false;

    var idx = phases[phase].findIndex(function(s) { return s.id === stepId; });
    if (idx === -1) return false;

    phases[phase].splice(idx, 1);
    session.modified = new Date().toISOString();
    this._saveSessions();
    return true;
  },

  reorderSteps: function(sessionId, phase, fromIdx, toIdx) {
    var session = this.getSession(sessionId);
    if (!session) return false;

    var phases = { warmup: session.warmup, main: session.main, cooldown: session.cooldown };
    if (!phases[phase]) return false;

    var arr = phases[phase];
    if (fromIdx < 0 || fromIdx >= arr.length || toIdx < 0 || toIdx >= arr.length) return false;

    var item = arr.splice(fromIdx, 1)[0];
    arr.splice(toIdx, 0, item);

    session.modified = new Date().toISOString();
    this._saveSessions();
    return true;
  },

  // ============ GET SESSIONS ============
  getSession: function(sessionId) {
    return this._sessions.find(function(s) { return s.id === sessionId; }) || null;
  },

  getSessions: function(sport) {
    if (sport) {
      return this._sessions.filter(function(s) { return s.sport === sport; });
    }
    return this._sessions.slice();
  },

  getFavorites: function() {
    return this._sessions.filter(function(s) { return s.favorite; });
  },

  // ============ MODIFY SESSION ============
  updateSession: function(sessionId, updates) {
    var session = this.getSession(sessionId);
    if (!session) return false;

    Object.assign(session, updates);
    session.modified = new Date().toISOString();
    this._saveSessions();
    return true;
  },

  deleteSession: function(sessionId) {
    var idx = this._sessions.findIndex(function(s) { return s.id === sessionId; });
    if (idx === -1) return false;

    this._sessions.splice(idx, 1);
    this._saveSessions();
    return true;
  },

  toggleFavorite: function(sessionId) {
    var session = this.getSession(sessionId);
    if (!session) return false;

    session.favorite = !session.favorite;
    this._saveSessions();
    return session.favorite;
  },

  // ============ DUPLICATE ============
  duplicateSession: function(sessionId, newName) {
    var original = this.getSession(sessionId);
    if (!original) return null;

    var copy = JSON.parse(JSON.stringify(original));
    copy.id = 'session_' + Date.now();
    copy.name = newName || original.name + ' (Copy)';
    copy.date = new Date().toISOString();
    copy.created = new Date().toISOString();
    copy.modified = new Date().toISOString();

    this._sessions.push(copy);
    this._saveSessions();
    return copy;
  },

  // ============ CALCULATIONS ============
  getTotalDuration: function(session) {
    var total = 0;
    var phases = [session.warmup, session.main, session.cooldown];
    phases.forEach(function(phase) {
      phase.forEach(function(step) {
        total += step.duration || 0;
      });
    });
    return total;
  },

  getStepCount: function(session) {
    return (session.warmup.length + session.main.length + session.cooldown.length);
  },

  // ============ EXPORT ============
  exportAsText: function(sessionId) {
    var session = this.getSession(sessionId);
    if (!session) return null;

    var lines = [];
    lines.push('=== ' + session.name + ' ===');
    lines.push('Sport: ' + session.sport);
    lines.push('Duration: ' + session.duration + ' min');
    lines.push('Intensity: ' + session.intensity);
    lines.push('');

    if (session.warmup.length > 0) {
      lines.push('--- WARM UP ---');
      session.warmup.forEach(function(step, i) {
        lines.push((i + 1) + '. ' + step.name + ' (' + step.duration + ' min)');
        if (step.notes) lines.push('   Notes: ' + step.notes);
        if (step.coachingPoints) lines.push('   Coaching: ' + step.coachingPoints);
      });
      lines.push('');
    }

    if (session.main.length > 0) {
      lines.push('--- MAIN ---');
      session.main.forEach(function(step, i) {
        lines.push((i + 1) + '. ' + step.name + ' (' + step.duration + ' min)');
        if (step.notes) lines.push('   Notes: ' + step.notes);
        if (step.coachingPoints) lines.push('   Coaching: ' + step.coachingPoints);
      });
      lines.push('');
    }

    if (session.cooldown.length > 0) {
      lines.push('--- COOL DOWN ---');
      session.cooldown.forEach(function(step, i) {
        lines.push((i + 1) + '. ' + step.name + ' (' + step.duration + ' min)');
        if (step.notes) lines.push('   Notes: ' + step.notes);
      });
      lines.push('');
    }

    if (session.notes) {
      lines.push('--- NOTES ---');
      lines.push(session.notes);
    }

    return lines.join('\n');
  },

  exportAsJSON: function(sessionId) {
    var session = this.getSession(sessionId);
    return session ? JSON.stringify(session, null, 2) : null;
  },

  // ============ PERSISTENCE ============
  _saveSessions: function() {
    try {
      localStorage.setItem('cb_sessions', JSON.stringify(this._sessions));
    } catch (e) {}
  },

  _loadSessions: function() {
    try {
      var data = localStorage.getItem('cb_sessions');
      if (data) {
        this._sessions = JSON.parse(data);
      }
    } catch (e) {
      this._sessions = [];
    }
  },

  // ============ UI ============
  createUI: function() {
    var panel = document.createElement('div');
    panel.id = 'session-panel';
    panel.className = 'panel';
    panel.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);width:500px;max-height:70vh;display:none;z-index:200;';

    var header = document.createElement('div');
    header.className = 'panel-header';
    header.style.cssText = 'background:linear-gradient(135deg,#f59e0b,#d97706);';
    header.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;"><span>📋 Session Builder</span><button onclick="SessionBuilder.toggleUI()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;">&times;</button></div>';
    panel.appendChild(header);

    var body = document.createElement('div');
    body.className = 'panel-body';
    body.id = 'session-list';
    body.style.cssText = 'max-height:50vh;overflow-y:auto;';
    panel.appendChild(body);

    var footer = document.createElement('div');
    footer.style.cssText = 'padding:12px;border-top:1px solid var(--border);display:flex;gap:8px;';
    footer.innerHTML = '<button class="btn-primary" style="flex:1;" onclick="SessionBuilder._createNew()">+ New Session</button>';
    panel.appendChild(footer);

    document.body.appendChild(panel);
    return panel;
  },

  _refreshList: function() {
    var list = document.getElementById('session-list');
    if (!list) return;

    list.innerHTML = '';
    var sessions = this.getSessions();

    if (sessions.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-secondary);">No sessions yet. Click "New Session" to start.</div>';
      return;
    }

    sessions.forEach(function(session) {
      var item = document.createElement('div');
      item.style.cssText = 'padding:12px;margin:4px 0;border-radius:8px;background:var(--bg-tertiary);cursor:pointer;';
      item.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div><strong>' + esc(session.name) + '</strong><div style="font-size:11px;color:var(--text-secondary);">' + esc(session.sport) + ' | ' + esc(session.duration) + ' min</div></div>' +
        '<div style="display:flex;gap:4px;">' +
        '<button onclick="SessionBuilder.toggleFavorite(\'' + session.id + '\');SessionBuilder._refreshList();" style="background:none;border:none;cursor:pointer;">' + (session.favorite ? '⭐' : '☆') + '</button>' +
        '<button onclick="SessionBuilder.deleteSession(\'' + session.id + '\');SessionBuilder._refreshList();" style="background:none;border:none;cursor:pointer;">🗑️</button>' +
        '</div></div>';
      list.appendChild(item);
    });
  },

  _createNew: function() {
    var name = prompt('Session name:');
    if (!name) return;

    var session = this.createSession(name);
    this._refreshList();
  },

  toggleUI: function() {
    var panel = document.getElementById('session-panel');
    if (!panel) {
      this.createUI();
      panel = document.getElementById('session-panel');
    }

    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      this._refreshList();
    } else {
      panel.style.display = 'none';
    }
  },

  // ============ Phase J: Session Builder UX ============

  // Quick Add: one-click to save current page as exercise step
  quickAdd: function(sessionId, phase) {
    sessionId = sessionId || (this._currentSession ? this._currentSession.id : null);
    phase = phase || 'main';
    if (!sessionId) {
      // Create new session if none exists
      var session = this.createSession('Quick Session');
      sessionId = session.id;
      this._currentSession = session;
    }
    var step = {
      name: 'Step ' + (this.getStepCount(this.getSession(sessionId)) + 1),
      pageId: typeof currentPageIndex !== 'undefined' ? currentPageIndex : 0,
      duration: 5,
      intensity: 'medium',
      notes: '',
      coachingPoints: '',
      elements: typeof els !== 'undefined' ? JSON.parse(JSON.stringify(els)) : []
    };
    this.addStep(sessionId, phase, step);
    if (typeof toast !== 'undefined') toast('Step added!');
    return step;
  },

  // Session Timer
  _timerInterval: null,
  _timerRemaining: 0,
  _timerTotal: 0,

  startTimer: function(durationMin) {
    this.stopTimer();
    this._timerTotal = durationMin * 60;
    this._timerRemaining = this._timerTotal;
    this._updateTimerDisplay();
    var self = this;
    this._timerInterval = setInterval(function() {
      self._timerRemaining--;
      self._updateTimerDisplay();
      if (self._timerRemaining <= 0) {
        self.stopTimer();
        if (typeof toast !== 'undefined') toast('Timer finished!');
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }, 1000);
  },

  stopTimer: function() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  },

  _updateTimerDisplay: function() {
    var el = document.getElementById('sessionTimer');
    if (!el) return;
    var min = Math.floor(this._timerRemaining / 60);
    var sec = this._timerRemaining % 60;
    el.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    // Progress bar
    var bar = document.getElementById('sessionTimerBar');
    if (bar) {
      var pct = this._timerTotal > 0 ? (this._timerRemaining / this._timerTotal) * 100 : 0;
      bar.style.width = pct + '%';
      bar.style.background = pct < 20 ? '#e84040' : pct < 50 ? '#f0c040' : '#50c878';
    }
  },

  // Print/Export session
  printSession: function(sessionId) {
    var text = this.exportAsText(sessionId);
    if (!text) return;
    var win = window.open('', '_blank');
    win.document.write('<html><head><title>CoachBoard Session</title><style>body{font-family:Arial,sans-serif;padding:20px;direction:ltr}h1{color:#3b82f6}h2{color:#555;border-bottom:1px solid #ddd;padding-bottom:4px}pre{white-space:pre-wrap;background:#f5f5f5;padding:10px;border-radius:4px}</style></head><body><h1>CoachBoard Pro - Training Session</h1><pre>' + esc(text) + '</pre><script>window.print();<\/script></body></html>');
    win.document.close();
  }
};
