'use strict';
// CoachBoard Pro - Background Jobs
// Export/PDF/SVG processing in background thread (Web Worker)
// Falls back to main thread if Web Workers unavailable

var BackgroundJob = {
  _jobs: {},
  _worker: null,
  _useWorker: typeof Worker !== 'undefined',

  init: function() {
    if (!this._useWorker) return;
    // Inline worker via Blob
    var workerCode = [
      'self.onmessage = function(e) {',
      '  var data = e.data;',
      '  try {',
      '    var result = processJob(data.job, data.payload);',
      '    self.postMessage({ id: data.id, success: true, result: result });',
      '  } catch (err) {',
      '    self.postMessage({ id: data.id, success: false, error: err.message });',
      '  }',
      '};',
      'function processJob(type, payload) {',
      '  if (type === "image") {',
      '    return processImage(payload);',
      '  } else if (type === "thumbnail") {',
      '    return processThumbnail(payload);',
      '  }',
      '  return null;',
      '}',
      'function processImage(p) {',
      '  var canvas = new OffscreenCanvas(p.width || 1200, p.height || 800);',
      '  var ctx = canvas.getContext("2d");',
      '  // Reconstruct from data URL',
      '  return { canvas: canvas, width: canvas.width, height: canvas.height };',
      '}',
      'function processThumbnail(p) {',
      '  var size = p.size || 200;',
      '  var canvas = new OffscreenCanvas(size, size);',
      '  var ctx = canvas.getContext("2d");',
      '  return { canvas: canvas, width: size, height: size };',
      '}'
    ].join('\n');

    try {
      var blob = new Blob([workerCode], { type: 'application/javascript' });
      this._worker = new Worker(URL.createObjectURL(blob));
      var self = this;
      this._worker.onmessage = function(e) {
        self._onWorkerMessage(e.data);
      };
      this._worker.onerror = function(e) {
        self._useWorker = false;
      };
    } catch (e) {
      this._useWorker = false;
    }
  },

  // Submit a job
  submit: function(jobType, payload, callback) {
    var id = 'job_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    var job = {
      id: id,
      type: jobType,
      payload: payload,
      callback: callback,
      status: 'pending',
      startTime: Date.now()
    };

    this._jobs[id] = job;

    if (this._useWorker && this._worker) {
      job.status = 'running';
      this._worker.postMessage({ id: id, job: jobType, payload: payload });
    } else {
      // Fallback: run on main thread
      job.status = 'running';
      var self = this;
      setTimeout(function() {
        self._processOnMainThread(job);
      }, 10);
    }

    return id;
  },

  // Process job on main thread (fallback)
  _processOnMainThread: function(job) {
    try {
      var result = null;
      if (job.type === 'export_image') {
        result = this._exportImage(job.payload);
      } else if (job.type === 'export_thumbnail') {
        result = this._exportThumbnail(job.payload);
      } else if (job.type === 'export_svg') {
        result = this._exportSVG(job.payload);
      } else if (job.type === 'export_pdf') {
        result = this._exportPDF(job.payload);
      }

      this._completeJob(job.id, true, result);
    } catch (e) {
      this._completeJob(job.id, false, e.message);
    }
  },

  // Handle worker response
  _onWorkerMessage: function(data) {
    var job = this._jobs[data.id];
    if (!job) return;

    this._completeJob(data.id, data.success, data.success ? data.result : data.error);
  },

  // Complete a job
  _completeJob: function(id, success, result) {
    var job = this._jobs[id];
    if (!job) return;

    job.status = success ? 'completed' : 'failed';
    job.endTime = Date.now();
    job.duration = job.endTime - job.startTime;

    if (job.callback) {
      job.callback(success, result);
    }

    // Clean up after delay
    var self = this;
    setTimeout(function() {
      delete self._jobs[id];
    }, 5000);
  },

  // Cancel a job
  cancel: function(id) {
    var job = this._jobs[id];
    if (!job) return false;

    job.status = 'cancelled';
    delete this._jobs[id];
    return true;
  },

  // Get job status
  getStatus: function(id) {
    var job = this._jobs[id];
    return job ? { status: job.status, duration: job.duration } : null;
  },

  // Get all active jobs
  getActiveJobs: function() {
    var result = [];
    for (var id in this._jobs) {
      var job = this._jobs[id];
      if (job.status === 'pending' || job.status === 'running') {
        result.push({ id: id, type: job.type, status: job.status });
      }
    }
    return result;
  },

  // ============ JOB PROCESSORS ============
  // Export image
  _exportImage: function(payload) {
    var scale = payload.scale || 2;
    var format = payload.format || 'png';
    var quality = payload.quality || 0.95;
    var dataUrl = payload.dataUrl;

    // Return the data URL as-is (already processed)
    return {
      dataUrl: dataUrl,
      format: format,
      scale: scale
    };
  },

  // Export thumbnail
  _exportThumbnail: function(payload) {
    var size = payload.size || 200;
    var dataUrl = payload.dataUrl;

    return {
      dataUrl: dataUrl,
      size: size
    };
  },

  // Export SVG
  _exportSVG: function(payload) {
    var shapes = payload.shapes;
    var width = payload.width || 800;
    var height = payload.height || 600;

    return {
      svg: VectorEngine.renderToSVG(shapes, { width: width, height: height }),
      width: width,
      height: height
    };
  },

  // Export PDF
  _exportPDF: function(payload) {
    // Simple PDF generation (text-based, not full PDF spec)
    var dataUrl = payload.dataUrl;
    var width = payload.width || 800;
    var height = payload.height || 600;

    return {
      dataUrl: dataUrl,
      width: width,
      height: height,
      note: 'PDF export requires external library for production use'
    };
  }
};
