'use strict';
// CoachBoard Pro - Animation System (Placeholder)
// Scene animation is currently handled in script.js (playAnim/interpolate).
// This module is a placeholder for future improvements: easing curves,
// per-element animation paths, timeline scrubbing, animation export.
var AnimationSystem = {
  playing: false,
  currentStep: 0,
  _keyframes: {},

  play: function() {
    this.playing = true;
    if (typeof animPlay === 'function') animPlay();
  },

  stop: function() {
    this.playing = false;
    if (typeof animStop === 'function') animStop();
  },

  pause: function() {
    // The app has no separate pause state; emulate it by stopping playback
    // while keeping the current step visible (best-effort, never throws).
    this.playing = false;
    if (typeof animStop === 'function') animStop();
  },

  seekTo: function(step) {
    if (typeof goToStep === 'function') goToStep(step);
  },

  // Per-element keyframe support (stored locally; consumed by future exporters)
  addKeyframe: function(elId, step, props) {
    if (!this._keyframes[elId]) this._keyframes[elId] = {};
    this._keyframes[elId][step] = props || {};
  },

  removeKeyframe: function(elId, step) {
    if (this._keyframes[elId]) delete this._keyframes[elId][step];
  },

  getKeyframes: function(elId) {
    return this._keyframes[elId] || {};
  },

  // Easing library
  easings: {
    linear: function(t) { return t; },
    easeInQuad: function(t) { return t*t; },
    easeOutQuad: function(t) { return t*(2-t); },
    easeInOutQuad: function(t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; }
  }
};
