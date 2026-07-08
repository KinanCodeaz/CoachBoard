'use strict';
// CoachBoard Pro - Multi-page UI
// Page tabs, add/remove/rename pages, thumbnails

var PagesUI = {
  _container: null,
  _tabsContainer: null,
  _addBtn: null,

  init: function() {
    this._createUI();
    this._bindEvents();
    this.refresh();
    return this;
  },

  _createUI: function() {
    // Create container
    this._container = document.createElement('div');
    this._container.id = 'pages-ui';
    this._container.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:48px;background:var(--bg-secondary);border-top:1px solid var(--border);display:flex;align-items:center;z-index:100;';

    // Tabs container
    this._tabsContainer = document.createElement('div');
    this._tabsContainer.style.cssText = 'display:flex;gap:4px;padding:0 12px;overflow-x:auto;flex:1;';
    this._container.appendChild(this._tabsContainer);

    // Add button
    this._addBtn = document.createElement('button');
    this._addBtn.textContent = '+';
    this._addBtn.style.cssText = 'width:32px;height:32px;border:none;border-radius:4px;background:var(--accent);color:white;font-size:16px;cursor:pointer;margin-left:8px;';
    this._addBtn.title = 'Add Page';
    this._addBtn.onclick = this.addPage.bind(this);
    this._container.appendChild(this._addBtn);

    // Append to body
    document.body.appendChild(this._container);

    // Adjust canvas height
    this._adjustCanvas();
  },

  _adjustCanvas: function() {
    var cv = document.getElementById('cv');
    if (cv) {
      cv.style.bottom = '48px';
    }
  },

  _bindEvents: function() {
    var self = this;
    // Listen for project changes
    if (typeof EventBus !== 'undefined') {
      EventBus.on('project:changed', function() { self.refresh(); });
      EventBus.on('page:added', function() { self.refresh(); });
      EventBus.on('page:removed', function() { self.refresh(); });
      EventBus.on('page:switched', function() { self.refresh(); });
    }
  },

  // ============ REFRESH ============
  refresh: function() {
    this._tabsContainer.innerHTML = '';

    if (typeof DocumentModel === 'undefined') return;

    var pages = DocumentModel.getPages();
    var currentPage = DocumentModel.getCurrentPage();

    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      var tab = this._createTab(page, page.id === (currentPage && currentPage.id));
      this._tabsContainer.appendChild(tab);
    }
  },

  _createTab: function(page, isActive) {
    var tab = document.createElement('div');
    tab.className = 'page-tab' + (isActive ? ' active' : '');
    tab.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;cursor:pointer;white-space:nowrap;font-size:13px;transition:all 0.15s;' +
      (isActive ? 'background:var(--accent);color:white;' : 'background:var(--bg-tertiary);color:var(--text);');

    // Page number
    var num = document.createElement('span');
    num.textContent = page.name || ('Page ' + (this._getPageIndex(page.id) + 1));
    num.style.cssText = 'font-weight:500;';
    tab.appendChild(num);

    // Close button (if more than 1 page)
    var pages = DocumentModel.getPages();
    if (pages.length > 1) {
      var close = document.createElement('span');
      close.textContent = '×';
      close.style.cssText = 'font-size:14px;opacity:0.6;margin-left:4px;';
      close.onclick = function(e) {
        e.stopPropagation();
        PagesUI.removePage(page.id);
      };
      tab.appendChild(close);
    }

    // Click to switch
    var self = this;
    tab.onclick = function() {
      self.switchPage(page.id);
    };

    // Double-click to rename
    tab.ondblclick = function(e) {
      e.stopPropagation();
      self._renamePage(page.id, tab);
    };

    return tab;
  },

  _getPageIndex: function(pageId) {
    var pages = DocumentModel.getPages();
    for (var i = 0; i < pages.length; i++) {
      if (pages[i].id === pageId) return i;
    }
    return -1;
  },

  // ============ ACTIONS ============
  addPage: function() {
    if (typeof DocumentModel === 'undefined') return;

    var page = DocumentModel.addPage();
    if (page) {
      DocumentModel.switchPage(page.id);
      this.refresh();
      if (typeof EventBus !== 'undefined') {
        EventBus.emit('page:added', { page: page });
      }
    }
  },

  removePage: function(pageId) {
    if (typeof DocumentModel === 'undefined') return;

    var pages = DocumentModel.getPages();
    if (pages.length <= 1) return;

    if (!confirm('Delete this page?')) return;

    var currentPage = DocumentModel.getCurrentPage();
    if (currentPage && currentPage.id === pageId) {
      // Switch to another page first
      var idx = this._getPageIndex(pageId);
      var newIdx = idx > 0 ? idx - 1 : 1;
      DocumentModel.switchPage(pages[newIdx].id);
    }

    DocumentModel.removePage(pageId);
    this.refresh();
    if (typeof EventBus !== 'undefined') {
      EventBus.emit('page:removed', { pageId: pageId });
    }
  },

  switchPage: function(pageId) {
    if (typeof DocumentModel === 'undefined') return;

    DocumentModel.switchPage(pageId);
    this.refresh();

    // Trigger re-render
    if (typeof Engine !== 'undefined' && Engine.render) {
      Engine.render();
    }

    if (typeof EventBus !== 'undefined') {
      EventBus.emit('page:switched', { pageId: pageId });
    }
  },

  _renamePage: function(pageId, tabElement) {
    var pages = DocumentModel.getPages();
    var page = null;
    for (var i = 0; i < pages.length; i++) {
      if (pages[i].id === pageId) {
        page = pages[i];
        break;
      }
    }
    if (!page) return;

    var currentName = page.name || ('Page ' + (this._getPageIndex(pageId) + 1));
    var newName = prompt('Page name:', currentName);
    if (newName && newName !== currentName) {
      page.name = newName;
      this.refresh();
    }
  },

  // Get container element
  getContainer: function() {
    return this._container;
  }
};
