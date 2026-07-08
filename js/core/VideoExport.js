'use strict';
// CoachBoard Pro - Enhanced Video Export
// Professional quality video with animations, transitions, multiple formats

var VideoExport = {
  _isRecording: false,
  _mediaRecorder: null,
  _chunks: [],
  _settings: {
    quality: 'high',      // low, medium, high, ultra
    fps: 30,              // 24, 30, 60
    format: 'webm',       // webm, mp4
    width: 1920,
    height: 1080,
    includeAudio: false,
    watermark: true,
    transition: 'fade',   // none, fade, slide
    animationSpeed: 1.0
  },

  init: function() {
    this._loadSettings();
    return this;
  },

  _loadSettings: function() {
    try {
      var saved = localStorage.getItem('cb_video_settings');
      if (saved) {
        Object.assign(this._settings, JSON.parse(saved));
      }
    } catch (e) {}
  },

  _saveSettings: function() {
    try {
      localStorage.setItem('cb_video_settings', JSON.stringify(this._settings));
    } catch (e) {}
  },

  // ============ SETTINGS ============
  updateSettings: function(newSettings) {
    Object.assign(this._settings, newSettings);
    this._saveSettings();
  },

  getSettings: function() {
    return Object.assign({}, this._settings);
  },

  // ============ RECORDING ============
  // Start recording
  startRecording: function(options) {
    if (this._isRecording) return false;

    var opts = options || {};
    this._settings.fps = opts.fps || this._settings.fps;
    this._settings.quality = opts.quality || this._settings.quality;

    this._chunks = [];
    this._isRecording = true;

    // Get canvas stream
    var canvas = document.getElementById('cv');
    if (!canvas) return false;

    // Adjust canvas size for recording
    var originalWidth = canvas.width;
    var originalHeight = canvas.height;
    canvas.width = this._settings.width;
    canvas.height = this._settings.height;

    var stream = canvas.captureStream(this._settings.fps);

    // Configure recorder
    var mimeType = this._settings.format === 'mp4' ? 'video/webm;codecs=h264' : 'video/webm';
    
    try {
      this._mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: this._getBitrate()
      });
    } catch (e) {
      this._mediaRecorder = new MediaRecorder(stream);
    }

    var self = this;
    this._mediaRecorder.ondataavailable = function(e) {
      if (e.data.size > 0) {
        self._chunks.push(e.data);
      }
    };

    this._mediaRecorder.onstop = function() {
      self._onRecordingComplete();
      // Restore canvas size
      canvas.width = originalWidth;
      canvas.height = originalHeight;
    };

    this._mediaRecorder.start(100); // Collect 100ms chunks

    this._notify('recording:started', { settings: this._settings });
    return true;
  },

  // Stop recording
  stopRecording: function() {
    if (!this._isRecording || !this._mediaRecorder) return false;

    this._isRecording = false;
    this._mediaRecorder.stop();
    return true;
  },

  // Pause recording
  pauseRecording: function() {
    if (!this._isRecording || !this._mediaRecorder) return false;

    if (this._mediaRecorder.state === 'recording') {
      this._mediaRecorder.pause();
      return true;
    }
    return false;
  },

  // Resume recording
  resumeRecording: function() {
    if (!this._isRecording || !this._mediaRecorder) return false;

    if (this._mediaRecorder.state === 'paused') {
      this._mediaRecorder.resume();
      return true;
    }
    return false;
  },

  isRecording: function() {
    return this._isRecording;
  },

  // ============ FRAME CAPTURE ============
  // Capture a single frame as image
  captureFrame: function(format, quality) {
    var canvas = this._getCaptureCanvas();
    if (!canvas) return null;

    var fmt = format || 'png';
    var qual = quality || 0.95;

    return canvas.toDataURL('image/' + fmt, qual);
  },

  // Capture frame as Blob
  captureFrameBlob: function(callback, format, quality) {
    var canvas = this._getCaptureCanvas();
    if (!canvas) {
      callback(null);
      return;
    }

    var fmt = format || 'png';
    var qual = quality || 0.95;

    canvas.toBlob(function(blob) {
      callback(blob);
    }, 'image/' + fmt, qual);
  },

  _getCaptureCanvas: function() {
    if (typeof CanvasPool !== 'undefined') {
      return CanvasPool.createComposited();
    }
    return document.getElementById('cv');
  },

  // ============ BATCH CAPTURE ============
  // Capture multiple frames for animation
  captureFrames: function(frameCount, interval, callback) {
    var frames = [];
    var self = this;
    var count = 0;

    function captureNext() {
      if (count >= frameCount) {
        callback(frames);
        return;
      }

      var frame = self.captureFrame('png');
      frames.push({
        index: count,
        data: frame,
        timestamp: Date.now()
      });

      count++;
      setTimeout(captureNext, interval);
    }

    captureNext();
  },

  // ============ ANIMATION EXPORT ============
  // Export animation as sequence of images
  exportAsImageSequence: function(frames, callback) {
    var self = this;
    var zip = [];
    var count = 0;

    frames.forEach(function(frame, index) {
      var link = document.createElement('a');
      link.href = frame.data;
      link.download = 'frame_' + String(index).padStart(4, '0') + '.png';
      link.click();
      count++;

      if (count === frames.length) {
        callback(true);
      }
    });
  },

  // ============ QUALITY PRESETS ============
  getQualityPresets: function() {
    return {
      low: {
        width: 640,
        height: 480,
        fps: 24,
        bitrate: 1000000,
        label: 'Low (640x480, 24fps)'
      },
      medium: {
        width: 1280,
        height: 720,
        fps: 30,
        bitrate: 2500000,
        label: 'Medium (720p, 30fps)'
      },
      high: {
        width: 1920,
        height: 1080,
        fps: 30,
        bitrate: 5000000,
        label: 'High (1080p, 30fps)'
      },
      ultra: {
        width: 1920,
        height: 1080,
        fps: 60,
        bitrate: 8000000,
        label: 'Ultra (1080p, 60fps)'
      }
    };
  },

  _getBitrate: function() {
    var presets = this.getQualityPresets();
    var preset = presets[this._settings.quality];
    return preset ? preset.bitrate : 5000000;
  },

  // ============ DURATION CALCULATION ============
  calculateDuration: function(elementCount, animationSteps) {
    var baseDuration = 5; // seconds
    var perElement = 0.5;
    var perStep = 2;

    return baseDuration + (elementCount * perElement) + ((animationSteps || 0) * perStep);
  },

  // ============ COMPLETION ============
  _onRecordingComplete: function() {
    if (this._chunks.length === 0) return;

    var blob = new Blob(this._chunks, { type: 'video/webm' });
    var url = URL.createObjectURL(blob);

    // Create download link
    var a = document.createElement('a');
    a.href = url;
    a.download = 'coachboard_' + this._getTimestamp() + '.' + this._settings.format;
    a.click();

    // Clean up
    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, 100);

    this._notify('recording:complete', {
      url: url,
      size: blob.size,
      duration: this._chunks.length * 0.1
    });
  },

  _getTimestamp: function() {
    var now = new Date();
    return now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');
  },

  // ============ UI ============
  createSettingsUI: function() {
    var panel = document.createElement('div');
    panel.id = 'video-settings-panel';
    panel.className = 'panel';
    panel.style.cssText = 'position:fixed;top:60px;right:16px;width:300px;display:none;z-index:200;';

    var header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = '🎬 Video Export Settings';
    panel.appendChild(header);

    var body = document.createElement('div');
    body.className = 'panel-body';

    // Quality
    body.innerHTML = `
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;font-weight:500;">Quality</label>
        <select id="video-quality" style="width:100%;">
          <option value="low">Low (640x480)</option>
          <option value="medium">Medium (720p)</option>
          <option value="high" selected>High (1080p)</option>
          <option value="ultra">Ultra (1080p 60fps)</option>
        </select>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;font-weight:500;">Format</label>
        <select id="video-format" style="width:100%;">
          <option value="webm">WebM</option>
          <option value="mp4">MP4 (if supported)</option>
        </select>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;font-weight:500;">Transition</label>
        <select id="video-transition" style="width:100%;">
          <option value="none">None</option>
          <option value="fade" selected>Fade</option>
          <option value="slide">Slide</option>
        </select>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="video-watermark" checked>
          <span>Add watermark</span>
        </label>
      </div>
      <button class="btn-primary" style="width:100%;" onclick="VideoExport._applySettings()">Apply Settings</button>
    `;

    panel.appendChild(body);
    document.body.appendChild(panel);

    // Set current values
    document.getElementById('video-quality').value = this._settings.quality;
    document.getElementById('video-format').value = this._settings.format;
    document.getElementById('video-transition').value = this._settings.transition;
    document.getElementById('video-watermark').checked = this._settings.watermark;

    return panel;
  },

  _applySettings: function() {
    this.updateSettings({
      quality: document.getElementById('video-quality').value,
      format: document.getElementById('video-format').value,
      transition: document.getElementById('video-transition').value,
      watermark: document.getElementById('video-watermark').checked
    });

    this.toggleSettingsUI();
    this._notify('settings:updated', { settings: this._settings });
  },

  toggleSettingsUI: function() {
    var panel = document.getElementById('video-settings-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  },

  // ============ EVENTS ============
  _notify: function(event, data) {
    if (typeof EventBus !== 'undefined') {
      EventBus.emit(event, data);
    }
  }
};
