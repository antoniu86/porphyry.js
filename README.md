# Porphyry.js

A lightweight, zero-dependency JavaScript library for rendering interactive mind maps as SVG.

Named after [Porphyry of Tyre](https://en.wikipedia.org/wiki/Porphyry_(philosopher)), the ancient philosopher who introduced the *Isagoge* — a hierarchical tree of categories that became one of the most influential diagrams in the history of logic.

[![version](https://img.shields.io/badge/version-1.4.2-blue)](#) [![zero dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)](#) [![license](https://img.shields.io/badge/license-MIT-purple)](#)

---

## Features

- **Zero dependencies** — pure JavaScript, no build step required
- **SVG-based** — crisp at any resolution, fully scalable
- **Five layout modes** — auto-balanced, left, right, down, up
- **Collapsible branches** — +/− toggle buttons to expand and collapse subtrees
- **9 built-in themes** — classic, ghost, underline, baseline, outline, solid, solid-sharp, outline-sharp, minimal; smart defaults per layout
- **Text wrapping** — long labels wrap automatically within a configurable max width
- **Adaptive spacing** — column gaps scale down automatically for deep trees
- **Clickable nodes** — add a `url` field to any node to make it a link
- **Opt-in interactions** — pan, zoom, collapse, HUD and tips are all off by default for clean embedding
- **Touch support** — single-finger pan, two-finger pinch-to-zoom

---

## Quick Start

> See the [live demo](https://antoniu86.github.io/porphyry.js/demo.html) to explore all features interactively.

### Via CDN (recommended)

The fastest way to get started — no download or build step needed:

```html
<!-- Latest release via jsDelivr -->
<script src="https://cdn.jsdelivr.net/gh/antoniu86/porphyry.js@latest/porphyry.min.js"></script>

<!-- Pin to a specific version -->
<script src="https://cdn.jsdelivr.net/gh/antoniu86/porphyry.js@v1.4.2/porphyry.min.js"></script>
```

### Self-hosted

Download `porphyry.min.js` (or `porphyry.js` for the commented source) and include it directly:

```html
<script src="porphyry.min.js"></script>
```

### Example

```html
<!-- Include from CDN -->
<script src="https://cdn.jsdelivr.net/gh/antoniu86/porphyry.js@v1.4.2/porphyry.min.js"></script>

<!-- Give it a container with explicit dimensions -->
<div id="map" style="width: 100%; height: 500px;"></div>

<script>
  const map = new Porphyry('#map');
  map.render({
    topic: 'My Topic',
    children: [
      { topic: 'Branch A' },
      { topic: 'Branch B', children: [
        { topic: 'Sub-node' }
      ]}
    ]
  });
</script>
```

> **Note:** The container must have an explicit `width` and `height`. Porphyry fills 100% of it.

---

## Data Format

Porphyry accepts a plain JSON object. Every node needs a `topic`; everything else is optional.

```json
{
  "topic": "Root Subject",
  "url": "https://example.com",
  "children": [
    {
      "topic": "First Branch",
      "direction": "left",
      "children": [
        { "topic": "Leaf node" },
        { "topic": "Linked leaf", "url": "https://..." }
      ]
    },
    { "topic": "Second Branch" }
  ]
}
```

### Node fields

| Field | Type | Description |
|---|---|---|
| `topic` | `string` | Node label. Long text wraps automatically within the configured max width. |
| `url` | `string?` | Makes the node clickable — opens in a new tab. A ↗ icon appears inside the node. |
| `direction` | `"left" \| "right"?` | Pin a root-level child to a specific side in horizontal layouts. Ignored in vertical layouts. |
| `children` | `Node[]?` | Child nodes. Omit or leave empty for leaf nodes. |

---

## Constructor

```js
new Porphyry(selector, options)
```

| Parameter | Type | Description |
|---|---|---|
| `selector` | `string \| Element` | A CSS selector string or a DOM element to render into. |
| `options` | `object?` | Optional configuration — see Options below. |

---

## Options

### Layout

| Option | Default | Description |
|---|---|---|
| `layout` | `"auto"` | Direction mode: `"auto"`, `"left"`, `"right"`, `"down"`, or `"up"`. |
| `fitPadding` | `20` | Pixels of padding when auto-fitting to the container. |
| `lineHeight` | `1.45` | Line height multiplier for wrapped text. |
| `spacing` | `1` | Spacing multiplier applied to all node distances before depth-adaptive scaling. Accepts any value from `0.1` (extremely compact) to `2.0` (very spread out). `1` is the default. |
| `theme` | `"classic"` | Visual theme. See the [Themes](#themes) section for all options. |

### Spacing — horizontal layouts

| Option | Default | Description |
|---|---|---|
| `branchSpacingX` | `220` | Gap (px) between the center node and depth-1 branches. Auto-scales for deep trees. |
| `subSpacingX` | `170` | Gap (px) between sub-levels (depth ≥ 2). Also auto-scales. |
| `verticalSpacing` | `50` | Minimum vertical gap (px) between siblings. |

### Spacing — vertical layouts

| Option | Default | Description |
|---|---|---|
| `verticalSpacingY` | `60` | Vertical gap (px) between depth levels. |
| `horizontalSpacing` | `30` | Horizontal gap (px) between sibling subtrees. |

### Node styles

| Option | Default | Description |
|---|---|---|
| `center.fontSize` | `17` | Font size of the root node. |
| `center.paddingX / paddingY` | `28 / 16` | Inner padding of the root node. |
| `center.maxWidth` | `240` | Max node width (px) before text wraps. |
| `center.radius` | `12` | Corner radius of the root rectangle. |
| `center.fill` | `"#1A1F2E"` | Root node background color. |
| `center.color` | `"#FFFFFF"` | Root node text color. |
| `branch.fontSize` | `14` | Font size of depth-1 nodes. |
| `branch.paddingX / paddingY` | `18 / 10` | Inner padding of depth-1 nodes. |
| `branch.maxWidth` | `200` | Max width before text wraps. |
| `branch.color` | `"#FFFFFF"` | Depth-1 text color (fill comes from the color palette). |
| `leaf.fontSize` | `13` | Font size of depth ≥ 2 nodes. |
| `leaf.paddingX / paddingY` | `10 / 7` | Inner padding of leaf nodes. |
| `leaf.maxWidth` | `170` | Max width before text wraps. |
| `leaf.color` | `"#2D3748"` | Leaf node text color. |

### Themes

The `theme` option controls node shapes, fills, borders and edge connection points across the whole map. Pass it as a string when initialising or change it at runtime and call `_renderInternal(true)`.

```js
new Porphyry('#map', { theme: 'solid' });

// Change at runtime
map.options.theme = 'baseline';
map._renderInternal(true);
```

**Themes available in all layouts:**

| Theme | Shape | Fill | Border | Edge anchor |
|---|---|---|---|---|
| `outline` | pill / rounded rect | white | colored full border | center |
| `solid` | pill / rounded rect | solid color | none | center |
| `solid-sharp` | rectangle | solid color | none | center |
| `outline-sharp` | rectangle | white | colored full border | center |
| `minimal` | none | — | none | center |

**Horizontal-layout themes** (auto / left / right):

| Theme | Shape | Fill | Border | Edge anchor |
|---|---|---|---|---|
| `classic` | pill/transparent/underline | dark center, colored branch, transparent leaf | bottom line on leaves | bottom for leaves, center otherwise |
| `ghost` | flat rect | 10% tinted | none | center — all nodes |
| `underline` | flat rect | 10% tinted | bottom solid line | bottom — all nodes |
| `baseline` | none | none | bottom solid line | bottom — all nodes |

> When `classic` is used with a vertical layout (`up` / `down`), it automatically falls back to `outline`.

> Edge anchors for `underline` and `baseline` connect at the bottom of every node — including the center subject — so the bezier curves flow continuously from the border lines.

### Colors & edges

| Option | Default | Description |
|---|---|---|
| `colors` | 10-color palette | Array of hex strings. Each root branch gets one in order; descendants inherit it. |
| `edgeWidth.root` | `2.5` | Stroke width of edges from the center node. |
| `edgeWidth.branch` | `2` | Stroke width of depth-1 → depth-2 edges. |
| `edgeWidth.leaf` | `1.5` | Stroke width of deeper edges. |
| `edgeOpacity` | `0.85` | Global opacity of all edges. |

### Interactions

All interactions are **off by default** for clean embedding. Opt in explicitly to what you need.

| Option | Default | Description |
|---|---|---|
| `interactions.pan` | `false` | Enable drag-to-pan (mouse + touch). |
| `interactions.zoom` | `false` | Enable scroll-wheel zoom and pinch-to-zoom. |
| `interactions.collapse` | `false` | Show +/− toggle buttons on nodes to expand/collapse subtrees. |
| `interactions.hud` | `false` | Inject a zoom HUD (−, %, +, fit) into the bottom-right of the container. |
| `interactions.tips` | `false` | Inject a hint bar at the bottom-center describing active interactions. |
| `interactions.download` | `false` | Add a download-as-SVG button. When `hud: true` it appears inside the HUD; otherwise a standalone button is injected in the bottom-right corner. |
| `minZoom` | `0.08` | Minimum zoom scale. |
| `maxZoom` | `4` | Maximum zoom scale. |
| `zoomSensitivity` | `0.12` | Scroll-wheel zoom speed per tick. |

---

## Layout Modes

Set via `options.layout` at init, or mutate `instance.options.layout` before calling `render()` again.

| Value | Description |
|---|---|
| `"auto"` | Branches distributed evenly left and right. Explicit `direction` fields are honoured first; the rest are balanced. |
| `"left"` | All branches grow left. Node `direction` fields ignored. |
| `"right"` | All branches grow right. Node `direction` fields ignored. |
| `"down"` | Tree grows downward, siblings spread horizontally. All nodes use an **outlined button** style. |
| `"up"` | Tree grows upward, siblings spread horizontally. All nodes use an **outlined button** style. |

> In `"down"` and `"up"` modes, all nodes — including the center and branches — use an outlined style (white fill, colored border) rather than the solid fills used in horizontal layouts.

---

## Collapsible Branches

When `interactions.collapse` is enabled, a small circular toggle button appears at the child-facing edge of every non-root node that has children. Clicking it collapses or expands that subtree.

- The button shows **−** when expanded, **+** when collapsed
- Button color matches the node's branch color; hover inverts fill and icon
- Collapsed nodes are treated as leaves by the layout engine — the rest of the tree reflows automatically
- Button position adapts to layout direction: left/right edge in horizontal layouts, top/bottom edge in vertical layouts
- Collapse state is preserved across re-renders triggered by layout switching or data edits
- Calling `render()` clears all collapse state and restores the full tree

```js
const map = new Porphyry('#map', {
  interactions: { collapse: true }
});

map.render(data);

// Programmatically collapse a branch by its internal node ID
// (IDs are assigned in depth-first order starting from 0)
map._collapsed.add(3);
map._renderInternal(false);   // re-render without re-fitting
```

---

## Methods

| Method | Description |
|---|---|
| `render(data)` | Parse data, lay out and draw the full tree. Clears all collapse state. Auto-calls `fit()` after the first paint. |
| `fit()` | Scale and pan so the graph fits neatly inside the container, respecting `fitPadding`. |
| `reset()` | Reset pan and zoom to 1:1, centered. |
| `downloadSVG(filename?)` | Download the current mind map as a standalone SVG file. `filename` defaults to `'mindmap.svg'`. The export strips the pan/zoom transform and recalculates a clean viewBox from the content bounds. |
| `_renderInternal(autoFit)` | Re-layout and redraw while preserving collapse state. Pass `false` to skip re-fitting (e.g. after a collapse toggle). |
| `_rebindInteractions()` | Call after mutating `options.interactions` at runtime. Re-attaches event listeners and refreshes the cursor and tips text. |

### Example

```js
const map = new Porphyry('#map', {
  layout: 'auto',
  interactions: { pan: true, zoom: true, collapse: true, hud: true, tips: true, download: true },
  colors: ['#E05C5C', '#4A90D9', '#4CAF82'],
  branchSpacingX: 200,
});

map.render(myData);

// Switch to vertical layout and re-render
map.options.layout = 'down';
map.render(myData);

// Toggle pan off at runtime
map.options.interactions.pan = false;
map._rebindInteractions();
```

---

## SVG Download

The `downloadSVG()` method exports the current mind map as a clean, self-contained SVG file.

```js
// Option 1 — enable via the HUD (download icon appears alongside zoom controls)
const map = new Porphyry('#map', {
  interactions: { hud: true, download: true }
});

// Option 2 — standalone button in the bottom-right corner (no zoom controls needed)
const map = new Porphyry('#map', {
  interactions: { download: true }
});

// Option 3 — programmatic, wire to any button in your own UI
document.getElementById('my-btn').addEventListener('click', () => {
  map.downloadSVG('my-diagram.svg');  // filename is optional
});
```

The exported file opens correctly in browsers, Illustrator, Inkscape and other SVG editors. System fonts (`system-ui`, `sans-serif`) are referenced by name — text renders on any machine that has them, which is effectively everywhere.

---

## Node Links

Any node can carry an optional `url` field. When present:

- A small ↗ external-link icon appears inside the node, right-aligned with padding from the edge.
- The cursor changes to a pointer on hover.
- Clicking opens the URL in a new tab (`noopener noreferrer`).
- Drags longer than 5 px never trigger the link, so panning over linked nodes is safe.

```json
{ "topic": "React", "url": "https://react.dev" }
```

---

## Text Wrapping

Long node labels wrap automatically. Each depth level has a configurable `maxWidth`. Text is measured with a hidden Canvas 2D context before layout runs, so node dimensions are always exact.

- Words are greedily packed onto lines.
- A single word wider than `maxWidth` gets its own line rather than being clipped.
- Multi-line branch nodes (depth 1) automatically switch from a pill to a rounded rectangle (`rx=10`).
- Vertical spacing accounts for the actual wrapped height, so nodes never overlap.

---

## Adaptive Column Spacing

In horizontal layouts, column gaps scale down automatically as the tree gets deeper.

| Max depth | Factor | `branchSpacingX` | `subSpacingX` |
|---|---|---|---|
| ≤ 2 | 1.00 | 220 px | 170 px |
| 3 | 0.83 | 183 px | 141 px |
| 4 | 0.63 | 138 px | 107 px |
| 5 | 0.50 | 110 px | 85 px |
| ≥ 6 | 0.45 | 99 px | 77 px |

The floor is 45 % of the configured defaults. Vertical layouts are unaffected.

---

## Files

| File | Description |
|---|---|
| `porphyry.js` | Full source with comments |
| `index.html` | Interactive demo + built-in documentation |

---

## License

MIT — see [LICENSE](LICENSE) for details.
