'use strict';
// CoachBoard Pro - Offline Support
// Service Worker registration and offline detection

var OfflineSupport = {
  _isOnline: navigator.onLine,
  _swRegistration: null,
  _pendingSaves: [],

  init: function() {
    this._bindEvents();
    this._registerServiceWorker();
    this._checkOnlineStatus();
    return this;
  },

  _bindEvents: function() {
    var self = this;

    window.addEventListener('online', function() {
      self._isOnline = true;
      self._onOnline();
      if (typeof EventBus !== 'undefined') {
        EventBus.emit('network:online');
      }
    });

    window.addEventListener('offline', function() {
      self._isOnline = false;
      self._onOffline();
      if (typeof EventBus !== 'undefined') {
        EventBus.emit('network:offline');
      }
    });
  },

  _registerServiceWorker: function() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    var self = this;
    navigator.serviceWorker.register('sw.js')
      .then(function(registration) {
        self._swRegistration = registration;
        console.log('Service Worker registered:', registration.scope);
      })
      .catch(function(error) {
        console.log('Service Worker registration failed:', error);
      });
  },

  _checkOnlineStatus: function() {
    this._isOnline = navigator.onLine;
    this._updateUI();
  },

  _onOnline: function() {
    this._updateUI();
    this._syncPendingSaves();
  },

  _onOffline: function() {
    this._updateUI();
  },

  _updateUI: function() {
    // Online/Offline indicator removed - not needed for coach workflow
  },

  // ============ PENDING SAVES ============
  // Queue a save for when online
  queueSave: function(data, key) {
    var save = {
      key: key || 'cb_pending_save',
      data: data,
      timestamp: Date.now()
    };
    this._pendingSaves.push(save);

    // Also save to localStorage
    try {
      localStorage.setItem(save.key + '_' + save.timestamp, JSON.stringify(save));
    } catch (e) {}
  },

  _syncPendingSaves: function() {
    if (this._pendingSaves.length === 0) return;

    var saves = this._pendingSaves.slice();
    this._pendingSaves = [];

    for (var i = 0; i < saves.length; i++) {
      try {
        // Re-apply the queued data to its real key so it is not lost,
        // then remove the temporary pending entry.
        if (saves[i].data !== undefined) {
          localStorage.setItem(saves[i].key, JSON.stringify(saves[i].data));
        }
        localStorage.removeItem(saves[i].key + '_' + saves[i].timestamp);
      } catch (e) {}
    }

    if (typeof EventBus !== 'undefined') {
      EventBus.emit('sync:complete', { count: saves.length });
    }
  },

  // ============ CACHE HELPERS ============
  // Cache a project for offline use
  cacheProject: function(projectData) {
    try {
      localStorage.setItem('cb_cached_project', JSON.stringify(projectData));
      return true;
    } catch (e) {
      return false;
    }
  },

  getCachedProject: function() {
    try {
      var data = localStorage.getItem('cb_cached_project');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  clearCache: function() {
    try {
      localStorage.removeItem('cb_cached_project');
      return true;
    } catch (e) {
      return false;
    }
  },

  // ============ STATUS ============
  isOnline: function() {
    return this._isOnline;
  },

  getStatus: function() {
    return {
      online: this._isOnline,
      swRegistered: !!this._swRegistration,
      pendingSaves: this._pendingSaves.length
    };
  }
};
