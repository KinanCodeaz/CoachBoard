'use strict';
// CoachBoard Pro - EventBus
// Simple pub/sub for decoupled communication
// No priorities, no async queue, no middleware — just on/off/emit/once

var EventBus = {
  _listeners: {},

  // Subscribe to an event
  on: function(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return this;
  },

  // Unsubscribe from an event
  off: function(event, callback) {
    if (!this._listeners[event]) return this;
    if (!callback) {
      // Remove all listeners for this event
      delete this._listeners[event];
    } else {
      // Remove specific callback
      var idx = this._listeners[event].indexOf(callback);
      if (idx !== -1) this._listeners[event].splice(idx, 1);
    }
    return this;
  },

  // Emit an event with data
  emit: function(event, data) {
    if (!this._listeners[event]) return this;
    var listeners = this._listeners[event].slice(); // copy to avoid mutation issues
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](data);
      } catch (e) {
        console.error('EventBus error in "' + event + '":', e);
      }
    }
    return this;
  },

  // Subscribe once (auto-unsubscribe after first call)
  once: function(event, callback) {
    var self = this;
    var wrapper = function(data) {
      self.off(event, wrapper);
      callback(data);
    };
    return this.on(event, wrapper);
  },

  // Check if event has listeners
  has: function(event) {
    return !!(this._listeners[event] && this._listeners[event].length > 0);
  },

  // Get listener count for an event
  count: function(event) {
    return this._listeners[event] ? this._listeners[event].length : 0;
  },

  // Get all events with listeners
  events: function() {
    var result = [];
    for (var event in this._listeners) {
      if (this._listeners[event].length > 0) {
        result.push(event);
      }
    }
    return result;
  },

  // Clear all listeners
  clear: function() {
    this._listeners = {};
    return this;
  },

  // Clear listeners for a specific event
  clearEvent: function(event) {
    delete this._listeners[event];
    return this;
  }
};
