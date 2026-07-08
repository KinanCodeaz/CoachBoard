'use strict';
// CoachBoard Pro - Performance Benchmark Utility
// Measures: FPS, render time, memory, element count, undo/redo time
var Benchmark = {
  _running: false,
  _frames: 0,
  _lastTime: 0,
  _fps: 0,
  _renderTimes: [],
  _results: {},

  start: function(duration) {
    if (this._running) return;
    this._running = true;
    this._frames = 0;
    this._renderTimes = [];
    this._lastTime = performance.now();
    this._duration = duration || 3000;
    this._startTime = this._lastTime;
    this._tick();
  },

  _tick: function() {
    if (!this._running) return;
    var now = performance.now();
    var delta = now - this._lastTime;
    if (delta >= 1000) {
      this._fps = Math.round((this._frames * 1000) / delta);
      this._frames = 0;
      this._lastTime = now;
    }
    this._frames++;
    if (now - this._startTime < this._duration) {
      requestAnimationFrame(this._tick.bind(this));
    } else {
      this._running = false;
      this._finalize();
    }
  },

  measureRender: function(fn) {
    var t0 = performance.now();
    fn();
    var t1 = performance.now();
    this._renderTimes.push(t1 - t0);
    return t1 - t0;
  },

  _finalize: function() {
    var avgRender = 0;
    var maxRender = 0;
    var minRender = Infinity;
    for (var i = 0; i < this._renderTimes.length; i++) {
      avgRender += this._renderTimes[i];
      if (this._renderTimes[i] > maxRender) maxRender = this._renderTimes[i];
      if (this._renderTimes[i] < minRender) minRender = this._renderTimes[i];
    }
    if (this._renderTimes.length > 0) avgRender /= this._renderTimes.length;

    var memInfo = null;
    if (performance && performance.memory) {
      memInfo = {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }

    var undoTime = this._measureUndoRedo();

    this._results = {
      fps: this._fps,
      renderAvg: avgRender.toFixed(2),
      renderMin: minRender.toFixed(2),
      renderMax: maxRender.toFixed(2),
      renderSamples: this._renderTimes.length,
      memory: memInfo,
      elementCount: typeof els !== 'undefined' ? els.length : 0,
      undoTime: undoTime.toFixed(2),
      timestamp: new Date().toISOString()
    };

    this._printResults();
    return this._results;
  },

  _measureUndoRedo: function() {
    if (typeof hist === 'undefined' || hist.length === 0) return 0;
    var t0 = performance.now();
    for (var i = 0; i < 10; i++) {
      if (typeof undo === 'function') undo();
    }
    var t1 = performance.now();
    for (var i = 0; i < 10; i++) {
      if (typeof redo === 'function') redo();
    }
    var t2 = performance.now();
    return ((t1 - t0) + (t2 - t1)) / 20;
  },

  _printResults: function() {
    var r = this._results;
    console.log('=== CoachBoard Benchmark Results ===');
    console.log('FPS: ' + r.fps);
    console.log('Render Time: avg=' + r.renderAvg + 'ms, min=' + r.renderMin + 'ms, max=' + r.renderMax + 'ms');
    console.log('Render Samples: ' + r.renderSamples);
    console.log('Element Count: ' + r.elementCount);
    console.log('Undo/Redo Time: ' + r.undoTime + 'ms');
    if (r.memory) {
      console.log('Memory: used=' + r.memory.used + 'MB, total=' + r.memory.total + 'MB, limit=' + r.memory.limit + 'MB');
    }
    console.log('Timestamp: ' + r.timestamp);
    console.log('====================================');
  },

  getResults: function() {
    return this._results;
  },

  stop: function() {
    this._running = false;
  }
};

function runBenchmark(duration) {
  Benchmark.start(duration || 3000);
  return 'Benchmark started... will complete in ' + (duration || 3) + ' seconds. Check console for results.';
}

function quickBench() {
  var times = [];
  var samples = 50;
  for (var i = 0; i < samples; i++) {
    var t0 = performance.now();
    render();
    var t1 = performance.now();
    times.push(t1 - t0);
  }
  var avg = 0, max = 0, min = Infinity;
  for (var i = 0; i < times.length; i++) {
    avg += times[i];
    if (times[i] > max) max = times[i];
    if (times[i] < min) min = times[i];
  }
  avg /= times.length;
  var memInfo = null;
  if (performance.memory) {
    memInfo = {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576)
    };
  }
  var result = {
    renderAvg: avg.toFixed(2),
    renderMin: min.toFixed(2),
    renderMax: max.toFixed(2),
    elementCount: els.length,
    memory: memInfo
  };
  console.log('=== Quick Bench ===');
  console.log('Render: avg=' + result.renderAvg + 'ms, min=' + result.renderMin + 'ms, max=' + result.renderMax + 'ms');
  console.log('Elements: ' + result.elementCount);
  if (memInfo) console.log('Memory: ' + memInfo.used + 'MB / ' + memInfo.total + 'MB');
  console.log('===================');
  return result;
}
