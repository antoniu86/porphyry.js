/**
 * Porphyry.js — A lightweight, zero-dependency mind map library
 * Renders interactive SVG mind maps from JSON data
 * @version 1.4.4
 * @license MIT
 */
(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────

  const DEFAULT_COLORS = [
    '#E05C5C', // coral red
    '#F0883E', // warm orange
    '#D4A017', // golden
    '#4CAF82', // emerald
    '#29A8AB', // teal
    '#4A90D9', // sky blue
    '#8B6FD4', // violet
    '#D46FAB', // rose
    '#5BB8A0', // seafoam
    '#7DAA44', // olive green
  ];

  const NS = 'http://www.w3.org/2000/svg';

  // Extra width reserved for the external-link icon when a node has a url
  const LINK_ICON_SPACE = 25; // px — space reserved on the right for the external-link icon

  // ─── Defaults ─────────────────────────────────────────────────────────────

  const DEFAULT_OPTIONS = {
    colors: DEFAULT_COLORS,
    // Layout direction for first-level branches:
    //   'auto'  — balanced left/right (default)
    //   'left'  — all branches go left
    //   'right' — all branches go right
    //   'down'  — tree grows downward; siblings spread horizontally
    //   'up'    — tree grows upward;   siblings spread horizontally
    layout: 'auto',
    // Where first-level branch edges connect on the center node (horizontal layouts only).
    //   'side'     — edges exit from the left/right walls of the center node (default)
    //   'vertical' — edges exit from the top or bottom center of the root node;
    //                top vs bottom is chosen automatically per branch based on its
    //                vertical position relative to the center. Branches above the
    //                center connect from the top, branches below from the bottom.
    //                This decouples branch placement from the center node's width,
    //                so the center can grow wide without pushing branches further apart.
    centerEdge: 'side',
    // Spacing (horizontal layouts)
    branchSpacingX: 220,   // horizontal gap between depth levels
    subSpacingX: 170,      // horizontal gap for sub-levels
    verticalSpacing: 50,   // minimum vertical gap between sibling nodes
    // Spacing (vertical layouts)
    verticalSpacingY: 60,  // vertical gap between depth levels
    horizontalSpacing: 30, // horizontal gap between sibling subtrees
    // Line height multiplier for wrapped text
    lineHeight: 1.45,
    // Center node
    center: {
      fontSize: 17,
      paddingX: 28,
      paddingY: 16,
      radius: 12,
      maxWidth: 240,        // max node width before text wraps
      fill: '#1A1F2E',
      color: '#FFFFFF',
      shadowColor: 'rgba(0,0,0,0.35)',
    },
    // First-level branch nodes
    branch: {
      fontSize: 14,
      paddingX: 18,
      paddingY: 10,
      radius: 99, // pill — auto-reduces to 10 when multiline
      maxWidth: 200,
      color: '#FFFFFF',
      shadowColor: 'rgba(0,0,0,0.2)',
    },
    // Deeper nodes (underline style)
    leaf: {
      fontSize: 13,
      paddingX: 10,
      paddingY: 7,
      maxWidth: 170,
      color: '#2D3748',
    },
    // Connection curves
    edgeWidth: { root: 2.5, branch: 2, leaf: 1.5 },
    edgeOpacity: 0.85,
    // Pan/zoom limits (only relevant when interactions are enabled)
    minZoom: 0.08,
    maxZoom: 4,
    zoomSensitivity: 0.12,
    // Interactions — all off by default for clean embedding.
    // Enable explicitly when you need them (e.g. in a demo or full-screen viewer).
    interactions: {
      pan:      false,  // drag to pan
      zoom:     false,  // scroll-wheel + pinch to zoom
      hud:      false,  // zoom level indicator + fit/+/- buttons (injected into container)
      tips:     false,  // keyboard/mouse hint bar (injected into container)
      collapse: false,  // +/- toggle buttons to expand/collapse subtrees
      download: false,  // download icon in the HUD — calls downloadSVG()
    },
    // Animation
    animationDuration: 350,
    // Padding around the graph when auto-fitting
    fitPadding: 20,
    // Spacing multiplier — applied on top of all spacing values before depth-adaptive scaling.
    // 1.0 = default, 0.3 = very compact, 2.0 = very spread out.
    spacing: 1,
    // Visual theme — controls node shapes, fills and borders.
    // 'classic'      : default horizontal style (solid dark center, colored branch pills, transparent leaf with underline)
    // 'outline'      : white fill, colored border, rounded corners (default vertical style)
    // 'solid'        : colored fill, rounded corners
    // 'solid-sharp'  : colored fill, sharp corners
    // 'outline-sharp': white fill, colored border, sharp corners
    // 'minimal'      : no box, just colored text
    // Horizontal-only:
    // 'ghost'        : transparent colored bg on all nodes, no border, center-anchored edges
    // 'underline'    : transparent colored bg + bottom border, bottom-anchored edges
    // 'baseline'     : no background, bottom border only, bottom-anchored edges
    theme: 'classic',
  };

  // ─── Utility ──────────────────────────────────────────────────────────────

  function merge(target, source) {
    const out = Object.assign({}, target);
    if (!source) return out;
    Object.keys(source).forEach(k => {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        out[k] = merge(target[k] || {}, source[k]);
      } else {
        out[k] = source[k];
      }
    });
    return out;
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
    }
    return el;
  }

  /**
   * Break `text` into lines so that no line exceeds `maxPx` pixels wide.
   * Splits on whitespace first; if a single word still exceeds maxPx it is
   * sliced character-by-character until it fits.
   * Returns an array of strings (always at least one element).
   */
  function wrapText(text, maxPx, measureFn) {
    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) return [''];

    // Break a single word that is too wide into character-level chunks
    function breakWord(word) {
      const chunks = [];
      let chunk = '';
      for (let i = 0; i < word.length; i++) {
        const candidate = chunk + word[i];
        if (measureFn(candidate) <= maxPx) {
          chunk = candidate;
        } else {
          if (chunk) chunks.push(chunk);
          chunk = word[i];
        }
      }
      if (chunk) chunks.push(chunk);
      return chunks.length ? chunks : [word];
    }

    const lines = [];
    let current = '';

    words.forEach(word => {
      // If the word itself is too wide, break it into sub-chunks first
      const parts = measureFn(word) > maxPx ? breakWord(word) : [word];

      parts.forEach(part => {
        const candidate = current ? current + ' ' + part : part;
        if (measureFn(candidate) <= maxPx) {
          current = candidate;
        } else {
          if (current) lines.push(current);
          current = part;
        }
      });
    });

    if (current) lines.push(current);
    return lines;
  }

  // ─── Porphyry Class ───────────────────────────────────────────────────────

  function Porphyry(selector, options) {
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.container) {
      throw new Error('[Porphyry] Container element not found: ' + selector);
    }

    this.options = merge(DEFAULT_OPTIONS, options || {});
    this._tree = null;
    this._pz = { tx: 0, ty: 0, scale: 1 };
    this._textCache = {};
    this._collapsed = new Set();   // set of node._id values that are collapsed
    this._lastData = null;          // stored for collapse re-render

    this._buildDOM();
    this._bindPanZoom();

    // Auto-fit whenever the container is resized (e.g. flexible layouts, window resize).
    // Debounced at 50 ms so rapid resize events don't trigger excessive reflows.
    if (typeof ResizeObserver !== 'undefined') {
      const self = this;
      let _resizeTimer;
      this._resizeObserver = new ResizeObserver(function () {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(function () { self.fit(); }, 50);
      });
      this._resizeObserver.observe(this.container);
    }
  }

  // ── DOM Setup ──────────────────────────────────────────────────────────────

  Porphyry.prototype._buildDOM = function () {
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.userSelect = 'none';

    this.svg = svgEl('svg', { width: '100%', height: '100%' });
    this.svg.style.display = 'block';
    this.svg.style.cursor = this.options.interactions.pan ? 'grab' : 'default';
    this.svg.style.transform = 'translateZ(0)';
    this.svg.style.willChange = 'transform';

    // Defs for filters
    const defs = svgEl('defs');

    // Center node shadow filter
    const fCenter = svgEl('filter', { id: 'mm-shadow-center', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    const feGC = svgEl('feDropShadow', { dx: '0', dy: '3', stdDeviation: '5', 'flood-color': this.options.center.shadowColor });
    fCenter.appendChild(feGC);
    defs.appendChild(fCenter);

    // Branch node shadow
    const fBranch = svgEl('filter', { id: 'mm-shadow-branch', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    const feGB = svgEl('feDropShadow', { dx: '0', dy: '2', stdDeviation: '3.5', 'flood-color': this.options.branch.shadowColor });
    fBranch.appendChild(feGB);
    defs.appendChild(fBranch);

    this.svg.appendChild(defs);

    // Render groups (edges below nodes, toggles on top)
    this.gMain = svgEl('g');
    this.gEdges = svgEl('g', { class: 'mm-edges' });
    this.gNodes = svgEl('g', { class: 'mm-nodes' });
    this.gToggles = svgEl('g', { class: 'mm-toggles' });
    this.gMain.appendChild(this.gEdges);
    this.gMain.appendChild(this.gNodes);
    this.gMain.appendChild(this.gToggles);
    this.svg.appendChild(this.gMain);

    this.container.appendChild(this.svg);

    if (this.options.interactions.hud)  this._buildHUD();
    if (this.options.interactions.tips) this._buildTips();
    if (this.options.interactions.download && !this.options.interactions.hud) this._buildDownloadBtn();
  };

  /** Inject the zoom HUD (−, level, +, fit) into the container. */
  Porphyry.prototype._buildHUD = function () {
    const self = this;

    const hud = document.createElement('div');
    hud.className = 'porphyry-hud';
    hud.style.cssText = [
      'position:absolute', 'bottom:14px', 'right:14px',
      'display:flex', 'align-items:center', 'gap:5px',
      'background:#fff', 'border:1px solid #E2E8F0', 'border-radius:10px',
      'padding:4px 9px', 'box-shadow:0 2px 10px rgba(0,0,0,0.08)',
      'z-index:10', 'font-family:system-ui,sans-serif',
      'opacity:0.4', 'transition:opacity 0.2s',
    ].join(';');
    hud.addEventListener('mouseenter', () => { hud.style.opacity = '1'; });
    hud.addEventListener('mouseleave', () => { hud.style.opacity = '0.4'; });

    const btnStyle = [
      'width:26px', 'height:26px', 'border:1px solid #E2E8F0', 'border-radius:6px',
      'background:#F7F8FC', 'font-size:15px', 'line-height:1', 'cursor:pointer',
      'display:flex', 'align-items:center', 'justify-content:center',
      'color:#1A202C', 'transition:all 0.12s', 'padding:0',
    ].join(';');

    function makeBtn(label, title, onClick) {
      const b = document.createElement('button');
      b.textContent = label;
      b.title = title;
      b.style.cssText = btnStyle;
      b.addEventListener('click', onClick);
      b.addEventListener('mouseenter', () => { b.style.background = '#EBF4FF'; b.style.color = '#4A90D9'; b.style.borderColor = '#4A90D9'; });
      b.addEventListener('mouseleave', () => { b.style.background = '#F7F8FC'; b.style.color = '#1A202C'; b.style.borderColor = '#E2E8F0'; });
      return b;
    }

    const zoomLevel = document.createElement('span');
    zoomLevel.style.cssText = 'font-size:12px;font-weight:600;color:#718096;min-width:40px;text-align:center';
    zoomLevel.textContent = '100%';
    this._hudZoomLevel = zoomLevel;   // stored so _applyTransform can update it

    hud.appendChild(makeBtn('−', 'Zoom out', () => self._hudZoom(1 / 1.25)));
    hud.appendChild(zoomLevel);
    hud.appendChild(makeBtn('+', 'Zoom in',  () => self._hudZoom(1.25)));
    hud.appendChild(makeBtn('⤢', 'Fit to view', () => self.fit()));

    if (this.options.interactions.download) {
      const sep = document.createElement('span');
      sep.style.cssText = 'width:1px;height:18px;background:#E2E8F0;margin:0 2px';
      hud.appendChild(sep);

      const dlBtn = document.createElement('button');
      dlBtn.title = 'Download as SVG';
      dlBtn.style.cssText = btnStyle;
      dlBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 1v7M7 8l-3-3M7 8l3-3M1 10.5v1A1.5 1.5 0 0 0 2.5 13h9A1.5 1.5 0 0 0 13 11.5v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      dlBtn.addEventListener('click', () => self.downloadSVG());
      dlBtn.addEventListener('mouseenter', () => { dlBtn.style.background = '#EBF4FF'; dlBtn.style.color = '#4A90D9'; dlBtn.style.borderColor = '#4A90D9'; });
      dlBtn.addEventListener('mouseleave', () => { dlBtn.style.background = '#F7F8FC'; dlBtn.style.color = '#1A202C'; dlBtn.style.borderColor = '#E2E8F0'; });
      hud.appendChild(dlBtn);
    }

    this.container.appendChild(hud);
    this._hud = hud;
  };

  /**
   * Download the current mind map as an SVG file.
   * Can be called programmatically from anywhere — wire it to any button in your UI.
   * @param {string} [filename='mindmap.svg'] — the name of the downloaded file
   */
  Porphyry.prototype.downloadSVG = function (filename) {
    if (!this.svg) return;
    filename = filename || 'mindmap.svg';

    // Clone so we don't mutate the live SVG
    const clone = this.svg.cloneNode(true);

    // Ensure xmlns is present for standalone SVG files
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Use the inner group's bounding box for clean fit, ignoring pan/zoom state
    const innerLive = this.svg.querySelector('g');
    const bbox = innerLive ? innerLive.getBBox() : null;
    const pad = this.options.fitPadding;
    if (bbox && bbox.width > 0) {
      clone.setAttribute('viewBox', [
        bbox.x - pad, bbox.y - pad,
        bbox.width + pad * 2, bbox.height + pad * 2,
      ].join(' '));
      clone.setAttribute('width',  bbox.width  + pad * 2);
      clone.setAttribute('height', bbox.height + pad * 2);
    }

    // Reset any pan/zoom transform on the inner group so the export is clean
    const inner = clone.querySelector('[transform]');
    if (inner) inner.removeAttribute('transform');

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(clone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /** Inject a standalone download button when hud is disabled but download is enabled. */
  Porphyry.prototype._buildDownloadBtn = function () {
    const self = this;
    const btn = document.createElement('button');
    btn.title = 'Download as SVG';
    btn.style.cssText = [
      'position:absolute', 'bottom:14px', 'right:14px',
      'width:32px', 'height:32px', 'border-radius:8px',
      'background:#fff', 'border:1px solid #E2E8F0',
      'box-shadow:0 2px 10px rgba(0,0,0,0.08)',
      'cursor:pointer', 'z-index:10',
      'display:flex', 'align-items:center', 'justify-content:center',
      'color:#1A202C', 'transition:all 0.12s', 'padding:0',
    ].join(';');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 1v7M7 8l-3-3M7 8l3-3M1 10.5v1A1.5 1.5 0 0 0 2.5 13h9A1.5 1.5 0 0 0 13 11.5v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.addEventListener('click', () => self.downloadSVG());
    btn.addEventListener('mouseenter', () => { btn.style.background = '#EBF4FF'; btn.style.color = '#4A90D9'; btn.style.borderColor = '#4A90D9'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = '#fff'; btn.style.color = '#1A202C'; btn.style.borderColor = '#E2E8F0'; });
    this.container.appendChild(btn);
  };

  /** Zoom by a factor, centered on the container midpoint. */
  Porphyry.prototype._hudZoom = function (factor) {
    const cw = this.container.clientWidth  / 2;
    const ch = this.container.clientHeight / 2;
    const newScale = Math.min(this.options.maxZoom, Math.max(this.options.minZoom, this._pz.scale * factor));
    this._pz.tx    = cw - (cw - this._pz.tx) * (newScale / this._pz.scale);
    this._pz.ty    = ch - (ch - this._pz.ty) * (newScale / this._pz.scale);
    this._pz.scale = newScale;
    this._applyTransform();
  };

  /** Inject the tips bar at the bottom-center of the container. */
  Porphyry.prototype._buildTips = function () {
    const tips = document.createElement('div');
    tips.className = 'porphyry-tips';
    tips.style.cssText = [
      'position:absolute', 'bottom:14px', 'left:50%', 'transform:translateX(-50%)',
      'font-size:11.5px', 'color:#718096',
      'background:#fff', 'border:1px solid #E2E8F0', 'border-radius:8px',
      'padding:5px 14px', 'box-shadow:0 2px 10px rgba(0,0,0,0.08)',
      'white-space:nowrap', 'z-index:10',
      'font-family:system-ui,sans-serif',
      'opacity:0.4', 'transition:opacity 0.2s',
    ].join(';');
    tips.addEventListener('mouseenter', () => { tips.style.opacity = '1'; });
    tips.addEventListener('mouseleave', () => { tips.style.opacity = '0.4'; });
    this.container.appendChild(tips);
    this._tips = tips;
    this._updateTips();
  };

  /** Rebuild the tips text to reflect current interaction settings. */
  Porphyry.prototype._updateTips = function () {
    if (!this._tips) return;
    const ix = this.options.interactions;
    const parts = [];
    if (ix.zoom)     parts.push('Scroll to zoom');
    if (ix.pan)      parts.push('Drag to pan');
    if (ix.collapse) parts.push('+/− to collapse');
    parts.push('↗ click node to open link');
    this._tips.textContent = parts.join('  ·  ');
  };

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Render a mind map from JSON data.
   * Clears any existing collapse state.
   * @param {Object} data - Mind map data
   */
  Porphyry.prototype.render = function (data) {
    this._collapsed.clear();
    this._lastData = data;
    this._renderInternal(true);
  };

  /**
   * Internal render — re-lays out and redraws without clearing collapse state.
   * @param {boolean} autoFit  Whether to fit the view after rendering.
   */
  Porphyry.prototype._renderInternal = function (autoFit) {
    this.gEdges.innerHTML   = '';
    this.gNodes.innerHTML   = '';
    this.gToggles.innerHTML = '';

    this._nodeIdCounter = 0;
    this._tree = this._buildTree(this._lastData, null, -1, 0);
    this._assignDirections(this._tree);
    this._computeSizes(this._tree);
    this._computeAdaptiveSpacing(this._tree);
    this._layoutTree(this._tree);
    this._drawTree(this._tree);

    if (autoFit) {
      const self = this;
      this.svg.style.transition = 'none';  // hide instantly, no fade-out of old layout
      this.svg.style.opacity = '0';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self.fit();
          self.svg.style.transition = 'opacity 0.15s';
          self.svg.style.opacity = '1';
        });
      });
    }
  };

  /**
   * Fit the mind map into the viewport.
   */
  Porphyry.prototype.fit = function () {
    if (!this._tree) return;
    try {
      const bbox = this.gMain.getBBox();
      if (!bbox || bbox.width === 0) return;
      const cw = this.container.clientWidth;
      const ch = this.container.clientHeight;
      const p = this.options.fitPadding;
      const scaleX = (cw - p * 2) / bbox.width;
      const scaleY = (ch - p * 2) / bbox.height;
      const scale = Math.min(scaleX, scaleY, 1.4);
      const tx = cw / 2 - (bbox.x + bbox.width / 2) * scale;
      const ty = ch / 2 - (bbox.y + bbox.height / 2) * scale;
      this._pz = { tx, ty, scale };
      this._applyTransform();
    } catch (e) {
      // getBBox can fail in some environments
    }
  };

  /**
   * Tear down the instance: disconnects the ResizeObserver.
   * Call when removing the container from the DOM.
   */
  Porphyry.prototype.destroy = function () {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  };

  /**
   * Reset zoom to 1:1 and center.
   */
  Porphyry.prototype.reset = function () {
    this._pz = { tx: this.container.clientWidth / 2, ty: this.container.clientHeight / 2, scale: 1 };
    this._applyTransform();
  };

  // ── Tree Building ──────────────────────────────────────────────────────────

  Porphyry.prototype._buildTree = function (data, parent, colorIdx, depth) {
    const node = {
      topic: data.topic || '',
      url: data.url || null,           // optional link; null = no link
      direction: data.direction || null, // 'left' | 'right' | null (auto)
      depth: depth,
      parent: parent,
      colorIdx: colorIdx, // -1 for center
      children: [],
      _id: this._nodeIdCounter++,      // stable ID for collapse tracking
      // Layout
      x: 0, y: 0,
      width: 0, height: 0,
      fontSize: 0,
    };

    if (Array.isArray(data.children)) {
      data.children.forEach(function (childData, i) {
        // Color index: root children each get a new color; descendants inherit
        const ci = depth === 0 ? i % DEFAULT_COLORS.length : colorIdx;
        node.children.push(this._buildTree(childData, node, ci, depth + 1));
      }, this);
    }

    return node;
  };

  Porphyry.prototype._assignDirections = function (root) {
    const layout = this.options.layout;

    if (layout === 'down' || layout === 'up') {
      // Vertical layouts don't use left/right — propagate the layout name
      // as a direction marker so edge drawing knows the flow direction.
      root.children.forEach(c => _propagateDir(c, layout));
      return;
    }

    if (layout === 'left') {
      root.children.forEach(c => _propagateDir(c, 'left'));
      return;
    }

    if (layout === 'right') {
      root.children.forEach(c => _propagateDir(c, 'right'));
      return;
    }

    // ── Auto: balanced left / right ───────────────────────────────
    const fixed  = root.children.filter(c => c.direction === 'left' || c.direction === 'right');
    const floats = root.children.filter(c => !c.direction);

    let rightCount = fixed.filter(c => c.direction === 'right').length;
    let leftCount  = fixed.filter(c => c.direction === 'left').length;

    floats.forEach(c => {
      if (rightCount <= leftCount) { c.direction = 'right'; rightCount++; }
      else                         { c.direction = 'left';  leftCount++;  }
    });

    root.children.forEach(c => _propagateDir(c, c.direction));
  };

  function _propagateDir(node, dir) {
    node.direction = dir;
    node.children.forEach(function (c) { _propagateDir(c, dir); });
  }

  // ── Size Computation ───────────────────────────────────────────────────────

  Porphyry.prototype._measureText = function (text, fontSize) {
    const key = text + ':' + fontSize;
    if (this._textCache[key]) return this._textCache[key];

    if (!this._measureCanvas) {
      this._measureCanvas = document.createElement('canvas');
      this._measureCtx = this._measureCanvas.getContext('2d');
    }
    this._measureCtx.font = 'bold ' + fontSize + 'px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const w = this._measureCtx.measureText(text).width;
    this._textCache[key] = w;
    return w;
  };

  Porphyry.prototype._computeSizes = function (node) {
    const o = this.options;
    let fs, px, py, maxW;

    if (node.depth === 0) {
      fs = o.center.fontSize; px = o.center.paddingX; py = o.center.paddingY; maxW = o.center.maxWidth;
    } else if (node.depth === 1) {
      fs = o.branch.fontSize; px = o.branch.paddingX; py = o.branch.paddingY; maxW = o.branch.maxWidth;
    } else {
      fs = o.leaf.fontSize;   px = o.leaf.paddingX;   py = o.leaf.paddingY;   maxW = o.leaf.maxWidth;
    }

    const iconExtra = node.url ? LINK_ICON_SPACE : 0;
    // The content area width available for text (inside padding, minus icon)
    const maxContentW = maxW - px * 2 - iconExtra;

    const measure = (t) => this._measureText(t, fs);
    const lines = wrapText(node.topic, maxContentW, measure);

    // Actual width = widest line + padding + icon, capped at maxW
    const maxLineW = lines.reduce((m, l) => Math.max(m, measure(l)), 0);
    const lh = fs * o.lineHeight;

    node.fontSize   = fs;
    node.lineHeight = lh;
    node.paddingX   = px;
    node.paddingY   = py;
    node.lines      = lines;                                          // ← new
    node.width      = Math.ceil(Math.min(maxLineW + px * 2 + iconExtra, maxW));
    node.height     = Math.ceil(lines.length * lh + py * 2);

    node.children.forEach(c => this._computeSizes(c));
  };

  // ── Layout ─────────────────────────────────────────────────────────────────

  /** Returns the deepest depth value in the subtree. */
  Porphyry.prototype._maxDepth = function (node) {
    if (!node.children.length) return node.depth;
    return Math.max(...node.children.map(c => this._maxDepth(c)));
  };

  /**
   * Compute adaptive horizontal spacing for left/right layouts.
   * The deeper the tree, the tighter the columns — but never wider than the
   * configured defaults, and never narrower than 45 % of them.
   * The spacing preset multiplier is applied first, then depth-adaptive scaling.
   *
   * Stored on this._sp so layout methods don't mutate options.
   */
  Porphyry.prototype._computeAdaptiveSpacing = function (root) {
    const o = this.options;
    const sm = typeof o.spacing === 'number' ? o.spacing : 1;

    // Vertical layouts — apply preset only, no depth-adaptive scaling
    if (o.layout === 'up' || o.layout === 'down') {
      this._sp = {
        branchSpacingX:    Math.round(o.branchSpacingX    * sm),
        subSpacingX:       Math.round(o.subSpacingX       * sm),
        verticalSpacingY:  Math.round(o.verticalSpacingY  * sm),
        horizontalSpacing: Math.round(o.horizontalSpacing * sm),
        verticalSpacing:   Math.round(o.verticalSpacing   * sm),
      };
      return;
    }

    const maxD = this._maxDepth(root);

    const MIN_FACTOR    = 0.45;
    const FULL_UP_TO    = 2;
    const SCALE_DIVISOR = 2.5;

    const depthFactor = maxD <= FULL_UP_TO
      ? 1.0
      : Math.max(MIN_FACTOR, SCALE_DIVISOR / maxD);

    const factor = sm * depthFactor;

    this._sp = {
      branchSpacingX:    Math.round(o.branchSpacingX    * factor),
      subSpacingX:       Math.round(o.subSpacingX       * factor),
      verticalSpacingY:  Math.round(o.verticalSpacingY  * sm),
      horizontalSpacing: Math.round(o.horizontalSpacing * sm),
      verticalSpacing:   Math.round(o.verticalSpacing   * sm),
    };
  };
  Porphyry.prototype._subtreeHeight = function (node) {
    const vs = this._sp ? this._sp.verticalSpacing : this.options.verticalSpacing;
    if (!node.children.length || this._collapsed.has(node._id)) {
      return node.height + vs;
    }
    const childH = node.children.reduce((sum, c) => sum + this._subtreeHeight(c), 0);
    return Math.max(childH, node.height + vs);
  };

  Porphyry.prototype._layoutTree = function (root) {
    root.x = 0;
    root.y = 0;

    const layout = this.options.layout;

    if (layout === 'down' || layout === 'up') {
      this._layoutVerticalNode(root, layout === 'down' ? 1 : -1);
      return;
    }

    const rightBranches = root.children.filter(c => c.direction === 'right');
    const leftBranches  = root.children.filter(c => c.direction === 'left');

    this._layoutSide(root, rightBranches, 'right');
    this._layoutSide(root, leftBranches, 'left');
  };

  /**
   * Returns the total horizontal space needed by a subtree in vertical layouts.
   */
  Porphyry.prototype._subtreeWidth = function (node) {
    const hs = this._sp ? this._sp.horizontalSpacing : this.options.horizontalSpacing;
    if (!node.children.length || this._collapsed.has(node._id)) {
      return node.width + hs;
    }
    const childW = node.children.reduce((sum, c) => sum + this._subtreeWidth(c), 0);
    return Math.max(childW, node.width + hs);
  };

  /**
   * Recursively position a node and its children for vertical (up/down) layout.
   * @param {Object} node
   * @param {number} sign  +1 for down, -1 for up
   */
  Porphyry.prototype._layoutVerticalNode = function (node, sign) {
    if (!node.children.length || this._collapsed.has(node._id)) return;
    const o = this.options;

    // The near edge of the children row (top edge for down, bottom for up)
    const edgeY = node.y + sign * (node.height / 2 + (this._sp ? this._sp.verticalSpacingY : o.verticalSpacingY));

    const widths = node.children.map(c => this._subtreeWidth(c));
    const totalW = widths.reduce((a, b) => a + b, 0);
    let x = node.x - totalW / 2;

    node.children.forEach((child, i) => {
      child.x = x + widths[i] / 2;
      child.y = edgeY + sign * child.height / 2;
      this._layoutVerticalNode(child, sign);
      x += widths[i];
    });
  };

  Porphyry.prototype._layoutSide = function (root, branches, dir) {
    if (!branches.length) return;

    const sp = this._sp;
    const o = this.options;
    // When centerEdge is 'vertical', branches are positioned from root center
    // (not root edge) so the center node width doesn't push branches further out.
    const edgeX = dir === 'right'
      ? (o.centerEdge === 'side' ? root.width / 2 + sp.branchSpacingX : sp.branchSpacingX)
      : (o.centerEdge === 'side' ? -(root.width / 2 + sp.branchSpacingX) : -sp.branchSpacingX);

    const heights = branches.map(c => this._subtreeHeight(c));
    const totalH = heights.reduce((a, b) => a + b, 0);
    let y = -totalH / 2;

    branches.forEach((branch, i) => {
      const cy = y + heights[i] / 2;
      this._layoutNode(branch, edgeX, cy, dir);
      y += heights[i];
    });
  };

  Porphyry.prototype._layoutNode = function (node, anchorX, y, dir) {
    const sp = this._sp;
    // anchorX is the closest-to-center edge; convert to center-x
    node.x = dir === 'right'
      ? anchorX + node.width / 2
      : anchorX - node.width / 2;
    node.y = y;

    if (!node.children.length || this._collapsed.has(node._id)) return;

    // Next column's anchor = this node's far edge + spacing
    const nextAnchor = dir === 'right'
      ? node.x + node.width / 2 + sp.subSpacingX
      : node.x - node.width / 2 - sp.subSpacingX;

    const heights = node.children.map(c => this._subtreeHeight(c));
    const totalH = heights.reduce((a, b) => a + b, 0);
    let cy = y - totalH / 2;

    node.children.forEach((child, i) => {
      this._layoutNode(child, nextAnchor, cy + heights[i] / 2, dir);
      cy += heights[i];
    });
  };

  // ── Drawing ────────────────────────────────────────────────────────────────

  Porphyry.prototype._drawTree = function (root) {
    this._drawNode(root);
    this._drawSubtree(root);
    // Draw collapse toggle buttons on top after all nodes/edges
    if (this.options.interactions.collapse) {
      this._drawAllToggles(root);
    }
  };

  Porphyry.prototype._drawSubtree = function (node) {
    if (this._collapsed.has(node._id)) return;  // subtree hidden
    node.children.forEach(child => {
      this._drawEdge(node, child);
      this._drawNode(child);
      this._drawSubtree(child);
    });
  };

  Porphyry.prototype._drawNode = function (node) {
    const o = this.options;
    const hasLink = !!node.url;
    const layout = o.layout;
    const vertical = layout === 'up' || layout === 'down';
    const theme = (o.theme === 'classic' && vertical) ? 'outline' : (o.theme || 'classic');

    const g = svgEl('g', {
      class: 'mm-node' + (hasLink ? ' mm-node-linked' : ''),
      'data-depth': node.depth,
    });

    const textX = hasLink ? node.x - LINK_ICON_SPACE / 2 : node.x;
    const color = node.depth === 0 ? o.center.fill : o.colors[node.colorIdx];
    const fontWeight = node.depth === 0 ? '700' : node.depth === 1 ? '600' : '500';

    // ── Classic horizontal layout (original style, unchanged) ──
    if ((theme === 'classic' || theme === 'ghost' || theme === 'underline' || theme === 'baseline') && !vertical) {
      if (theme === 'classic' && node.depth === 0) {
        // Classic: solid dark center
        const rect = svgEl('rect', {
          x: node.x - node.width / 2, y: node.y - node.height / 2,
          width: node.width, height: node.height,
          rx: o.center.radius, ry: o.center.radius,
          fill: o.center.fill, filter: 'url(#mm-shadow-center)',
        });
        g.appendChild(rect);
        g.appendChild(this._makeText(node.lines, textX, node.y, node.fontSize, node.lineHeight, o.center.color, '700'));
        if (hasLink) g.appendChild(this._makeLinkIcon(node, 'rgba(255,255,255,0.7)'));

      } else if (theme === 'classic') {
        // ── Classic: solid pill for depth 1, transparent+underline for depth 2+ ──
        if (node.depth === 1) {
          const rx = node.lines.length === 1 ? node.height / 2 : 10;
          const rect = svgEl('rect', {
            x: node.x - node.width / 2, y: node.y - node.height / 2,
            width: node.width, height: node.height,
            rx: rx, ry: rx, fill: color, filter: 'url(#mm-shadow-branch)',
          });
          g.appendChild(rect);
          g.appendChild(this._makeText(node.lines, textX, node.y, node.fontSize, node.lineHeight, o.branch.color, '600'));
          if (hasLink) g.appendChild(this._makeLinkIcon(node, 'rgba(255,255,255,0.8)'));
        } else {
          const bg = svgEl('rect', {
            x: node.x - node.width / 2, y: node.y - node.height / 2,
            width: node.width, height: node.height,
            rx: 3, ry: 3, fill: color, opacity: hasLink ? '0.14' : '0.08',
          });
          g.appendChild(bg);
          const underline = svgEl('line', {
            x1: node.x - node.width / 2, y1: node.y + node.height / 2,
            x2: node.x + node.width / 2, y2: node.y + node.height / 2,
            stroke: color, 'stroke-width': '1.8', 'stroke-linecap': 'round',
          });
          g.appendChild(underline);
          g.appendChild(this._makeText(node.lines, textX, node.y, node.fontSize, node.lineHeight, o.leaf.color, '500'));
          if (hasLink) g.appendChild(this._makeLinkIcon(node, color));
        }

      } else if (theme === 'ghost') {
        // ── Ghost: transparent colored bg on all nodes, no border ──
        const tintColor = node.depth === 0 ? o.center.fill : color;
        const bg = svgEl('rect', {
          x: node.x - node.width / 2, y: node.y - node.height / 2,
          width: node.width, height: node.height,
          rx: 3, ry: 3, fill: tintColor, opacity: '0.10',
        });
        g.appendChild(bg);
        g.appendChild(this._makeText(node.lines, textX, node.y, node.fontSize, node.lineHeight, o.leaf.color, fontWeight));
        if (hasLink) g.appendChild(this._makeLinkIcon(node, tintColor));

      } else {
        // ── Underline / Baseline: optional transparent bg + bottom border ──
        const tintColor = node.depth === 0 ? o.center.fill : color;
        if (theme === 'underline') {
          const bg = svgEl('rect', {
            x: node.x - node.width / 2, y: node.y - node.height / 2,
            width: node.width, height: node.height,
            rx: 3, ry: 3, fill: tintColor, opacity: '0.10',
          });
          g.appendChild(bg);
        } else {
          // baseline: invisible hit-area rect so click events register
          const hitRect = svgEl('rect', {
            x: node.x - node.width / 2, y: node.y - node.height / 2,
            width: node.width, height: node.height,
            fill: 'transparent',
          });
          g.appendChild(hitRect);
        }
        const border = svgEl('line', {
          x1: node.x - node.width / 2, y1: node.y + node.height / 2,
          x2: node.x + node.width / 2, y2: node.y + node.height / 2,
          stroke: tintColor, 'stroke-width': node.depth === 0 ? '2.5' : '1.8', 'stroke-linecap': 'round',
        });
        g.appendChild(border);
        g.appendChild(this._makeText(node.lines, textX, node.y, node.fontSize, node.lineHeight, o.leaf.color, fontWeight));
        if (hasLink) g.appendChild(this._makeLinkIcon(node, tintColor));
      }

    // ── Themed styles (apply to all nodes, both vertical and horizontal) ──
    } else if (theme === 'minimal') {
      // No box — just colored text, slightly larger for center
      const textColor = node.depth === 0 ? o.center.fill : color;
      const fw = fontWeight;
      // Invisible hit-area rect so click events register with no visible background
      const hitRect = svgEl('rect', {
        x: node.x - node.width / 2, y: node.y - node.height / 2,
        width: node.width, height: node.height,
        fill: 'transparent',
      });
      g.appendChild(hitRect);
      g.appendChild(this._makeText(node.lines, textX, node.y, node.fontSize, node.lineHeight, textColor, fw));
      if (hasLink) g.appendChild(this._makeLinkIcon(node, textColor));

    } else {
      // All box-based themes: outline, solid, solid-sharp, outline-sharp
      const isSharp   = theme === 'solid-sharp' || theme === 'outline-sharp';
      const isSolid   = theme === 'solid'        || theme === 'solid-sharp';
      const isOutline = theme === 'outline'       || theme === 'outline-sharp';

      // Corner radius: pill for center/branch single-line, rounded rect for multiline, 0 for sharp
      let rx;
      if (isSharp) {
        rx = 0;
      } else if (node.depth <= 1 && node.lines.length === 1) {
        rx = node.height / 2; // pill
      } else {
        rx = 10;
      }

      const fill        = isSolid   ? color : '#FFFFFF';
      const stroke      = isOutline ? color : 'none';
      const strokeW     = node.depth === 0 ? '2.5' : '2';
      const textColor   = isSolid   ? '#FFFFFF' : color;
      const filter      = node.depth === 0 ? 'url(#mm-shadow-center)'
                        : node.depth === 1 ? 'url(#mm-shadow-branch)' : '';

      const rect = svgEl('rect', {
        x: node.x - node.width / 2, y: node.y - node.height / 2,
        width: node.width, height: node.height,
        rx: rx, ry: rx, fill: fill,
        stroke: stroke, 'stroke-width': strokeW,
      });
      if (filter) rect.setAttribute('filter', filter);
      g.appendChild(rect);
      g.appendChild(this._makeText(node.lines, textX, node.y, node.fontSize, node.lineHeight, textColor, fontWeight));
      if (hasLink) g.appendChild(this._makeLinkIcon(node, isSolid ? 'rgba(255,255,255,0.8)' : color));
    }

    // ── Hover ──
    g.style.transition = 'opacity 0.15s';
    g.style.willChange = 'opacity';
    g.addEventListener('mouseenter', () => {
      g.style.opacity = '0.82';
      if (hasLink) this.svg.style.cursor = 'pointer';
    });
    g.addEventListener('mouseleave', () => {
      g.style.opacity = '1';
      if (hasLink) this.svg.style.cursor = this.options.interactions.pan
        ? (this._dragging ? 'grabbing' : 'grab')
        : 'default';
    });

    // ── Link click ──
    if (hasLink) {
      g.addEventListener('click', (e) => {
        if (this._dragMoved) return;
        e.stopPropagation();
        window.open(node.url, '_blank', 'noopener,noreferrer');
      });
    }

    this.gNodes.appendChild(g);
  };

  /**
   * Walk the visible tree and draw a collapse toggle on every non-root node
   * that has children.
   */
  Porphyry.prototype._drawAllToggles = function (node) {
    if (node.depth > 0 && node.children.length > 0) {
      this._drawCollapseBtn(node);
    }
    // Walk into children only if this node is not collapsed
    if (!this._collapsed.has(node._id)) {
      node.children.forEach(c => this._drawAllToggles(c));
    }
  };

  /**
   * Draw a +/− toggle button at the far edge of a node (the side facing its children).
   */
  Porphyry.prototype._drawCollapseBtn = function (node) {
    const self = this;
    const o = this.options;
    const collapsed = this._collapsed.has(node._id);
    const layout = o.layout;
    const vertical = layout === 'up' || layout === 'down';
    const R = 8; // circle radius

    // Position the button center at the child-facing edge of the node
    let bx, by;
    if (vertical) {
      bx = node.x;
      by = layout === 'down'
        ? node.y + node.height / 2 + R + 1
        : node.y - node.height / 2 - R - 1;
    } else {
      const dir = node.direction || 'right';
      by = node.y;
      bx = dir === 'right'
        ? node.x + node.width / 2 + R + 1
        : node.x - node.width / 2 - R - 1;
    }

    const color = o.colors[node.colorIdx] || o.center.fill;

    const g = svgEl('g', { class: 'mm-collapse-btn', cursor: 'pointer' });

    const circle = svgEl('circle', {
      cx: bx, cy: by, r: R,
      fill: '#fff',
      stroke: color,
      'stroke-width': '1.8',
    });

    const icon = svgEl('text', {
      x: bx, y: by - 1,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '13',
      'font-weight': '700',
      fill: color,
      'pointer-events': 'none',
      style: 'font-family:system-ui,sans-serif;user-select:none',
    });
    icon.textContent = collapsed ? '+' : '−';

    g.appendChild(circle);
    g.appendChild(icon);

    // Hover: invert colors
    g.addEventListener('mouseenter', function () {
      circle.setAttribute('fill', color);
      icon.setAttribute('fill', '#fff');
    });
    g.addEventListener('mouseleave', function () {
      circle.setAttribute('fill', '#fff');
      icon.setAttribute('fill', color);
    });

    // Click: toggle and re-render (no fit, preserve pan/zoom)
    g.addEventListener('click', function (e) {
      e.stopPropagation();
      if (collapsed) {
        self._collapsed.delete(node._id);
      } else {
        self._collapsed.add(node._id);
      }
      self._renderInternal(false);
    });

    this.gToggles.appendChild(g);
  };

  /**
   * Draw a small external-link icon inside the node, right-aligned.
   * @param {Object} node
   * @param {string} color  icon stroke color
   */
  Porphyry.prototype._makeLinkIcon = function (node, color) {
    const s = 9;  // icon size
    const margin = 12; // px from right edge (+5 from original 7)
    // Position: vertically centered, near right edge
    const ix = node.x + node.width / 2 - margin - s;
    const iy = node.y - s / 2;

    const g = svgEl('g', { 'pointer-events': 'none' });

    // Box outline (partial — top-right, right, bottom)
    const box = document.createElementNS(NS, 'path');
    box.setAttribute('d', `
      M ${ix + 3} ${iy}
      H ${ix + s}
      V ${iy + s}
      H ${ix}
      V ${iy + 3}
    `);
    box.setAttribute('stroke', color);
    box.setAttribute('stroke-width', '1.4');
    box.setAttribute('fill', 'none');
    box.setAttribute('stroke-linecap', 'round');
    box.setAttribute('stroke-linejoin', 'round');
    g.appendChild(box);

    // Arrow diagonal
    const arrow = document.createElementNS(NS, 'path');
    arrow.setAttribute('d', `M ${ix} ${iy + s} L ${ix - 5} ${iy + s + 5}`);
    arrow.setAttribute('stroke', color);
    arrow.setAttribute('stroke-width', '1.4');
    arrow.setAttribute('stroke-linecap', 'round');
    g.appendChild(arrow);

    return g;
  };

  /**
   * Render node text, supporting multiple wrapped lines via <tspan>.
   * @param {string[]} lines   - pre-wrapped lines from node.lines
   * @param {number}   cx      - center x of the text block
   * @param {number}   cy      - center y of the text block
   * @param {number}   fontSize
   * @param {number}   lineHeight  - px between baselines
   * @param {string}   fill
   * @param {string}   weight
   */
  Porphyry.prototype._makeText = function (lines, cx, cy, fontSize, lineHeight, fill, weight) {
    const el = document.createElementNS(NS, 'text');
    el.setAttribute('text-anchor', 'middle');
    el.setAttribute('fill', fill);
    el.setAttribute('font-size', fontSize);
    el.setAttribute('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif');
    el.setAttribute('font-weight', weight || 'normal');
    el.setAttribute('pointer-events', 'none');

    const totalH = (lines.length - 1) * lineHeight;
    // y of the first baseline so the whole block is vertically centered around cy
    const startY = cy - totalH / 2;

    lines.forEach((line, i) => {
      const tspan = document.createElementNS(NS, 'tspan');
      tspan.setAttribute('x', cx);
      tspan.setAttribute('y', startY + i * lineHeight);
      tspan.setAttribute('dominant-baseline', 'central');
      tspan.textContent = line;
      el.appendChild(tspan);
    });

    return el;
  };

  /**
   * Returns the Y coordinate on a node where a horizontal edge should connect.
   * @param {Object} node
   * @param {'start'|'end'} role  'start' = leaving the node, 'end' = arriving at the node
   * @returns {number}
   *
   * Connection point strategy (horizontal layouts only):
   *   classic    — leaf nodes (depth > 1) connect at the bottom baseline (underline style)
   *   ghost      — all nodes connect at vertical center
   *   underline  — all nodes connect at bottom (continuous with the bottom border)
   *   baseline   — all nodes connect at bottom (continuous with the bottom border)
   *   all others — all nodes connect at vertical center
   */
  Porphyry.prototype._nodeEdgeAnchorY = function (node, role) {
    const theme = this.options.theme || 'classic';
    if (theme === 'underline' || theme === 'baseline') {
      // Bottom anchor — makes edges flow continuously from the border line
      return node.y + node.height / 2;
    }
    if (theme === 'classic' && node.depth > 1) {
      // Classic leaf nodes anchor at bottom to match the underline
      return node.y + node.height / 2;
    }
    // All other themes: vertical center
    return node.y;
  };

  Porphyry.prototype._drawEdge = function (parent, child) {
    const o = this.options;
    const layout = o.layout;

    // Dispatch to vertical edge drawer
    if (layout === 'down' || layout === 'up') {
      this._drawEdgeVertical(parent, child, layout);
      return;
    }

    const color = o.colors[child.colorIdx];
    const dir = child.direction;

    // Determine start point (on parent's near edge)
    let x1, y1;
    if (parent.depth === 0) {
      const ce = o.centerEdge || 'side';
      if (ce === 'vertical') {
        // Auto-pick top or bottom based on where the branch sits relative to center.
        // Branches at or above center connect from the top; below center from the bottom.
        x1 = 0;
        y1 = child.y <= 0 ? -parent.height / 2 : parent.height / 2;
      } else {
        // 'side' — default: exit from left/right wall of center node
        x1 = dir === 'right' ? parent.width / 2 : -parent.width / 2;
        y1 = this._nodeEdgeAnchorY(parent, 'start');
      }
    } else {
      x1 = dir === 'right' ? parent.x + parent.width / 2 : parent.x - parent.width / 2;
      y1 = this._nodeEdgeAnchorY(parent, 'start');
    }

    // End point (child's near edge)
    const x2 = dir === 'right' ? child.x - child.width / 2 : child.x + child.width / 2;
    const y2 = this._nodeEdgeAnchorY(child, 'end');

    // S-curve bezier.
    // For vertical center-edge connections the curve departs vertically (toward
    // the branch's Y level) then sweeps sideways to the child's near edge.
    // For standard side connections both control points share the midpoint X,
    // so the curve departs and arrives horizontally.
    const isVerticalFan = parent.depth === 0 && (o.centerEdge || 'side') === 'vertical';
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const d = isVerticalFan
      ? `M ${x1} ${y1} C ${x1} ${my}, ${mx} ${y2}, ${x2} ${y2}`
      : `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;

    const strokeW = parent.depth === 0
      ? o.edgeWidth.root
      : parent.depth === 1
        ? o.edgeWidth.branch
        : o.edgeWidth.leaf;

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', strokeW);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', o.edgeOpacity);

    this.gEdges.appendChild(path);
  };

  /**
   * Draw a bezier edge flowing along the Y axis for vertical layouts.
   */
  Porphyry.prototype._drawEdgeVertical = function (parent, child, layout) {
    const o = this.options;
    const sign = layout === 'down' ? 1 : -1;
    const color = o.colors[child.colorIdx];

    // Start: bottom-center (down) or top-center (up) of parent
    const x1 = parent.x;
    const y1 = parent.y + sign * parent.height / 2;

    // End: top-center (down) or bottom-center (up) of child
    const x2 = child.x;
    const y2 = child.y - sign * child.height / 2;

    // S-curve along Y axis — control points share the midpoint Y
    const my = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;

    const strokeW = parent.depth === 0
      ? o.edgeWidth.root
      : parent.depth === 1
        ? o.edgeWidth.branch
        : o.edgeWidth.leaf;

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', strokeW);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', o.edgeOpacity);

    this.gEdges.appendChild(path);
  };

  // ── Pan & Zoom ─────────────────────────────────────────────────────────────

  Porphyry.prototype._applyTransform = function () {
    const { tx, ty, scale } = this._pz;
    this.gMain.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`);
    if (this._hudZoomLevel) {
      this._hudZoomLevel.textContent = Math.round(scale * 100) + '%';
    }
  };

  Porphyry.prototype._bindPanZoom = function () {
    const self = this;
    this._dragging  = false;
    this._dragMoved = false;

    // Nothing to bind if both interactions are off
    if (!this.options.interactions.pan && !this.options.interactions.zoom) return;

    let dragging = false, startX = 0, startY = 0;
    let mouseDownX = 0, mouseDownY = 0;
    const DRAG_THRESHOLD = 5; // px

    if (this.options.interactions.pan) {
      // ── Mouse pan ──────────────────────────────────────────────────────────
      this.svg.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        dragging = true;
        self._dragging  = true;
        self._dragMoved = false;
        startX     = e.clientX - self._pz.tx;
        startY     = e.clientY - self._pz.ty;
        mouseDownX = e.clientX;
        mouseDownY = e.clientY;
        self.svg.style.cursor = 'grabbing';
        e.preventDefault();
      });

      window.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        const dx = e.clientX - mouseDownX;
        const dy = e.clientY - mouseDownY;
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          self._dragMoved = true;
        }
        self._pz.tx = e.clientX - startX;
        self._pz.ty = e.clientY - startY;
        self._applyTransform();
      });

      window.addEventListener('mouseup', function () {
        if (!dragging) return;
        dragging       = false;
        self._dragging = false;
        self.svg.style.cursor = 'grab';
        setTimeout(() => { self._dragMoved = false; }, 0);
      });
    }

    if (this.options.interactions.zoom) {
      // ── Scroll-wheel zoom ──────────────────────────────────────────────────
      this.svg.addEventListener('wheel', function (e) {
        e.preventDefault();
        const rect      = self.container.getBoundingClientRect();
        const mx        = e.clientX - rect.left;
        const my        = e.clientY - rect.top;
        const direction = e.deltaY < 0 ? 1 : -1;
        const factor    = 1 + direction * self.options.zoomSensitivity;
        const newScale  = Math.min(
          self.options.maxZoom,
          Math.max(self.options.minZoom, self._pz.scale * factor)
        );
        self._pz.tx    = mx - (mx - self._pz.tx) * (newScale / self._pz.scale);
        self._pz.ty    = my - (my - self._pz.ty) * (newScale / self._pz.scale);
        self._pz.scale = newScale;
        self._applyTransform();
      }, { passive: false });
    }

    if (this.options.interactions.pan || this.options.interactions.zoom) {
      // ── Touch: pan (1 finger) + pinch-zoom (2 fingers) ────────────────────
      let lastTouchDist = 0;

      this.svg.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1 && self.options.interactions.pan) {
          dragging = true;
          startX   = e.touches[0].clientX - self._pz.tx;
          startY   = e.touches[0].clientY - self._pz.ty;
        } else if (e.touches.length === 2 && self.options.interactions.zoom) {
          dragging      = false;
          const t0      = e.touches[0], t1 = e.touches[1];
          lastTouchDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        }
      }, { passive: true });

      this.svg.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (e.touches.length === 1 && dragging && self.options.interactions.pan) {
          self._pz.tx = e.touches[0].clientX - startX;
          self._pz.ty = e.touches[0].clientY - startY;
          self._applyTransform();
        } else if (e.touches.length === 2 && self.options.interactions.zoom) {
          const t0   = e.touches[0], t1 = e.touches[1];
          const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
          const cx   = (t0.clientX + t1.clientX) / 2;
          const cy   = (t0.clientY + t1.clientY) / 2;
          const rect = self.container.getBoundingClientRect();
          const mx   = cx - rect.left, my = cy - rect.top;
          if (lastTouchDist) {
            const factor   = dist / lastTouchDist;
            const newScale = Math.min(self.options.maxZoom, Math.max(self.options.minZoom, self._pz.scale * factor));
            self._pz.tx    = mx - (mx - self._pz.tx) * (newScale / self._pz.scale);
            self._pz.ty    = my - (my - self._pz.ty) * (newScale / self._pz.scale);
            self._pz.scale = newScale;
            self._applyTransform();
          }
          lastTouchDist = dist;
        }
      }, { passive: false });

      this.svg.addEventListener('touchend', function () {
        dragging      = false;
        lastTouchDist = 0;
      }, { passive: true });
    }
  };

  /**
   * Re-apply the cursor style and re-bind interaction listeners.
   * Call this after mutating options.interactions at runtime.
   */
  Porphyry.prototype._rebindInteractions = function () {
    // Update cursor to match current pan setting
    this.svg.style.cursor = this.options.interactions.pan ? 'grab' : 'default';
    // Clone the svg to strip all existing listeners, then re-attach
    const oldSvg  = this.svg;
    const newSvg  = oldSvg.cloneNode(true);
    this.svg      = newSvg;
    oldSvg.parentNode.replaceChild(newSvg, oldSvg);
    // Re-point internal group references into the new svg
    this.gMain    = newSvg.querySelector('.mm-edges').parentNode;
    this.gEdges   = newSvg.querySelector('.mm-edges');
    this.gNodes   = newSvg.querySelector('.mm-nodes');
    this.gToggles = newSvg.querySelector('.mm-toggles');
    this._bindPanZoom();
    this._updateTips();
  };

  // ── Export ──────────────────────────────────────────────────────────────────

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Porphyry;
  } else {
    global.Porphyry = Porphyry;
  }

})(typeof window !== 'undefined' ? window : this);
