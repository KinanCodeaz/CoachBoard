'use strict';
// CoachBoard Pro - ResourceManager
// Lazy-load + cache images, SVGs, and other assets
// Avoids loading unused resources, reduces memory usage

var ResourceManager = {
  _cache: {},        // url → {img, loaded, error, width, height}
  _pending: {},      // url → Promise (loading in progress)
  _maxCache: 200,    // max cached items
  _accessOrder: [],  // LRU tracking

  // Initialize (required by CoreInit)
  init: function() {
    console.log('[ResourceManager] Initialized');
    return this;
  },

  // Load an image/SVG lazily. Returns cached version if available.
  load: function(url, callback) {
    if (!url) return callback(null);

    // Return cached if available
    if (this._cache[url] && this._cache[url].loaded) {
      this._touch(url);
      callback(this._cache[url].img, this._cache[url]);
      return this._cache[url].img;
    }

    // Already loading? Just add callback
    if (this._pending[url]) {
      this._pending[url].then(function(data) {
        callback(data.img, data);
      }).catch(function(err) {
        callback(null, {error: err});
      });
      return null;
    }

    // Start loading
    var self = this;
    var promise = new Promise(function(resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = function() {
        var data = {
          img: img,
          loaded: true,
          error: null,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          url: url
        };
        self._cache[url] = data;
        self._touch(url);
        self._evict();
        delete self._pending[url];
        callback(data.img, data);
        resolve(data);
      };

      img.onerror = function() {
        var data = {
          img: null,
          loaded: false,
          error: 'Failed to load: ' + url,
          url: url
        };
        self._cache[url] = data;
        delete self._pending[url];
        callback(null, data);
        reject(data);
      };

      img.src = url;
    });

    this._pending[url] = promise;
    return null;
  },

  // Load SVG as text (for inline rendering)
  loadSVG: function(url, callback) {
    if (!url) return callback(null);

    if (this._cache[url] && this._cache[url].loaded) {
      this._touch(url);
      callback(this._cache[url].svgText, this._cache[url]);
      return this._cache[url].svgText;
    }

    if (this._pending[url]) {
      this._pending[url].then(function(data) {
        callback(data.svgText, data);
      }).catch(function(err) {
        callback(null, {error: err});
      });
      return null;
    }

    var self = this;
    var promise = new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 0) {
          var data = {
            svgText: xhr.responseText,
            loaded: true,
            error: null,
            url: url
          };
          // Also create an image for canvas rendering
          var img = new Image();
          var blob = new Blob([xhr.responseText], {type: 'image/svg+xml'});
          var blobUrl = URL.createObjectURL(blob);
          img.onload = function() {
            data.img = img;
            data.width = img.naturalWidth || img.width;
            data.height = img.naturalHeight || img.height;
            URL.revokeObjectURL(blobUrl);
          };
          img.src = blobUrl;
          self._cache[url] = data;
          self._touch(url);
          self._evict();
          delete self._pending[url];
          callback(data.svgText, data);
          resolve(data);
        } else {
          var errData = {svgText: null, loaded: false, error: 'HTTP ' + xhr.status, url: url};
          delete self._pending[url];
          callback(null, errData);
          reject(errData);
        }
      };
      xhr.onerror = function() {
        var errData = {svgText: null, loaded: false, error: 'Network error', url: url};
        delete self._pending[url];
        callback(null, errData);
        reject(errData);
      };
      xhr.send();
    });

    this._pending[url] = promise;
    return null;
  },

  // Preload a batch of URLs (for loading screens)
  preload: function(urls, onProgress, onComplete) {
    var self = this;
    var total = urls.length;
    var loaded = 0;
    var errors = 0;

    if (total === 0) return onComplete && onComplete({loaded: 0, errors: 0});

    urls.forEach(function(url) {
      self.load(url, function(img, data) {
        loaded++;
        if (data && data.error) errors++;
        if (onProgress) onProgress(loaded, total, url);
        if (loaded === total) {
          onComplete && onComplete({loaded: loaded - errors, errors: errors, total: total});
        }
      });
    });
  },

  // Get cached resource (sync, returns null if not loaded)
  get: function(url) {
    var entry = this._cache[url];
    if (entry && entry.loaded) {
      this._touch(url);
      return entry;
    }
    return null;
  },

  // Check if resource is loaded (sync)
  isLoaded: function(url) {
    return !!(this._cache[url] && this._cache[url].loaded);
  },

  // Get cache stats
  stats: function() {
    var loaded = 0;
    var pending = 0;
    for (var k in this._cache) {
      if (this._cache[k].loaded) loaded++;
    }
    for (var k in this._pending) {
      pending++;
    }
    return {
      cached: loaded,
      pending: pending,
      maxCache: this._maxCache,
      accessOrder: this._accessOrder.length
    };
  },

  // Clear all cached resources
  clear: function() {
    this._cache = {};
    this._pending = {};
    this._accessOrder = [];
  },

  // Clear only error entries
  clearErrors: function() {
    for (var k in this._cache) {
      if (this._cache[k].error) {
        delete this._cache[k];
      }
    }
  },

  // Internal: track LRU access order
  _touch: function(url) {
    var idx = this._accessOrder.indexOf(url);
    if (idx !== -1) this._accessOrder.splice(idx, 1);
    this._accessOrder.push(url);
  },

  // Internal: evict oldest entries if over limit
  _evict: function() {
    while (this._accessOrder.length > this._maxCache) {
      var oldest = this._accessOrder.shift();
      delete this._cache[oldest];
    }
  }
};
