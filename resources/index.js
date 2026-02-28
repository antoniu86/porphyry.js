// ── Example datasets ───────────────────────────────────────────────────────

const EXAMPLES = [
  {
    label: 'Product Strategy',
    desc: 'Classic product roadmap',
    data: {
      topic: 'Product Strategy',
      url: 'https://en.wikipedia.org/wiki/Product_strategy',
      children: [
        {
          topic: 'Research',
          children: [
            { topic: 'User Interviews', url: 'https://www.nngroup.com/articles/user-interviews/' },
            { topic: 'Competitor Analysis' },
            { topic: 'Market Sizing' },
          ]
        },
        {
          topic: 'Design',
          children: [
            { topic: 'Wireframes' },
            { topic: 'Prototyping', url: 'https://www.figma.com' },
            { topic: 'Design System', url: 'https://m3.material.io' },
          ]
        },
        {
          topic: 'Engineering',
          children: [
            { topic: 'Frontend', url: 'https://developer.mozilla.org', children: [{ topic: 'React', url: 'https://react.dev' }, { topic: 'Tests' }] },
            { topic: 'Backend',  children: [{ topic: 'API' }, { topic: 'DB' }] },
            { topic: 'DevOps',   children: [{ topic: 'CI/CD', url: 'https://github.com/features/actions' }, { topic: 'Monitoring' }] },
          ]
        },
        {
          topic: 'Go-to-Market',
          children: [
            { topic: 'Pricing' },
            { topic: 'Campaigns' },
            { topic: 'Partnerships' },
          ]
        },
      ]
    }
  },

  {
    label: 'Solar System',
    desc: 'Science — astronomy',
    data: {
      topic: 'Solar System',
      url: 'https://solarsystem.nasa.gov',
      children: [
        {
          topic: 'Inner Planets',
          children: [
            { topic: 'Mercury', url: 'https://solarsystem.nasa.gov/planets/mercury/overview/' },
            { topic: 'Venus',   url: 'https://solarsystem.nasa.gov/planets/venus/overview/' },
            { topic: 'Earth',   url: 'https://solarsystem.nasa.gov/planets/earth/overview/', children: [{ topic: 'Moon', url: 'https://solarsystem.nasa.gov/moons/earths-moon/overview/' }] },
            { topic: 'Mars',    url: 'https://solarsystem.nasa.gov/planets/mars/overview/',  children: [{ topic: 'Phobos' }, { topic: 'Deimos' }] },
          ]
        },
        {
          topic: 'Asteroid Belt',
          children: [
            { topic: 'Ceres' },
            { topic: 'Vesta' },
          ]
        },
        {
          topic: 'Outer Planets',
          children: [
            { topic: 'Jupiter', url: 'https://solarsystem.nasa.gov/planets/jupiter/overview/', children: [{ topic: 'Io' }, { topic: 'Europa', url: 'https://europa.nasa.gov' }] },
            { topic: 'Saturn',  children: [{ topic: 'Titan', url: 'https://solarsystem.nasa.gov/moons/saturn-moons/titan/overview/' }, { topic: 'Rings' }] },
            { topic: 'Uranus'  },
            { topic: 'Neptune' },
          ]
        },
        {
          topic: 'Beyond',
          children: [
            { topic: 'Kuiper Belt', url: 'https://solarsystem.nasa.gov/solar-system/kuiper-belt/overview/' },
            { topic: 'Oort Cloud' },
            { topic: 'Pluto', url: 'https://solarsystem.nasa.gov/planets/dwarf-planets/pluto/overview/' },
          ]
        },
      ]
    }
  },

  {
    label: 'Product Strategy (onclick)',
    desc: 'Classic product roadmap — onclick',
    data: {
      topic: 'Product Strategy',
      onclick: function(node) { alert(node.topic); },
      children: [
        {
          topic: 'Research',
          children: [
            { topic: 'User Interviews', onclick: function(node) { alert(node.topic); } },
            { topic: 'Competitor Analysis' },
            { topic: 'Market Sizing' },
          ]
        },
        {
          topic: 'Design',
          children: [
            { topic: 'Wireframes' },
            { topic: 'Prototyping', onclick: function(node) { alert(node.topic); } },
            { topic: 'Design System', onclick: function(node) { alert(node.topic); } },
          ]
        },
        {
          topic: 'Engineering',
          children: [
            { topic: 'Frontend', onclick: function(node) { alert(node.topic); }, children: [{ topic: 'React', onclick: function(node) { alert(node.topic); } }, { topic: 'Tests' }] },
            { topic: 'Backend',  children: [{ topic: 'API' }, { topic: 'DB' }] },
            { topic: 'DevOps',   children: [{ topic: 'CI/CD', onclick: function(node) { alert(node.topic); } }, { topic: 'Monitoring' }] },
          ]
        },
        {
          topic: 'Go-to-Market',
          children: [
            { topic: 'Pricing' },
            { topic: 'Campaigns' },
            { topic: 'Partnerships' },
          ]
        },
      ]
    }
  },

  {
    label: 'Solar System (onclick)',
    desc: 'Science — astronomy — onclick',
    data: {
      topic: 'Solar System',
      onclick: function(node) { alert(node.topic); },
      children: [
        {
          topic: 'Inner Planets',
          children: [
            { topic: 'Mercury', onclick: function(node) { alert(node.topic); } },
            { topic: 'Venus',   onclick: function(node) { alert(node.topic); } },
            { topic: 'Earth',   onclick: function(node) { alert(node.topic); }, children: [{ topic: 'Moon', onclick: function(node) { alert(node.topic); } }] },
            { topic: 'Mars',    onclick: function(node) { alert(node.topic); }, children: [{ topic: 'Phobos' }, { topic: 'Deimos' }] },
          ]
        },
        {
          topic: 'Asteroid Belt',
          children: [
            { topic: 'Ceres' },
            { topic: 'Vesta' },
          ]
        },
        {
          topic: 'Outer Planets',
          children: [
            { topic: 'Jupiter', onclick: function(node) { alert(node.topic); }, children: [{ topic: 'Io' }, { topic: 'Europa', onclick: function(node) { alert(node.topic); } }] },
            { topic: 'Saturn',  children: [{ topic: 'Titan', onclick: function(node) { alert(node.topic); } }, { topic: 'Rings' }] },
            { topic: 'Uranus'  },
            { topic: 'Neptune' },
          ]
        },
        {
          topic: 'Beyond',
          children: [
            { topic: 'Kuiper Belt', onclick: function(node) { alert(node.topic); } },
            { topic: 'Oort Cloud' },
            { topic: 'Pluto', onclick: function(node) { alert(node.topic); } },
          ]
        },
      ]
    }
  },

  {
    label: 'Programming',
    desc: 'CS / Dev topics',
    data: {
      topic: 'Programming Languages',
      children: [
        {
          topic: 'Compiled',
          children: [
            { topic: 'C / C++', children: [{ topic: 'Systems' }, { topic: 'Games' }] },
            { topic: 'Rust', url: 'https://www.rust-lang.org', children: [{ topic: 'Safety' }, { topic: 'Speed' }] },
            { topic: 'Go',   url: 'https://go.dev', children: [{ topic: 'Concurrency' }] },
          ]
        },
        {
          topic: 'JVM',
          children: [
            { topic: 'Java',   url: 'https://dev.java' },
            { topic: 'Kotlin', url: 'https://kotlinlang.org' },
            { topic: 'Scala' },
          ]
        },
        {
          topic: 'Interpreted',
          children: [
            { topic: 'Python', url: 'https://python.org', children: [{ topic: 'ML/AI' }, { topic: 'Web' }] },
            { topic: 'Ruby',   children: [{ topic: 'Rails', url: 'https://rubyonrails.org' }] },
            { topic: 'PHP' },
          ]
        },
        {
          topic: 'Web',
          children: [
            { topic: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', children: [{ topic: 'Node.js', url: 'https://nodejs.org' }, { topic: 'Deno', url: 'https://deno.com' }] },
            { topic: 'TypeScript', url: 'https://www.typescriptlang.org' },
            { topic: 'WebAssembly', url: 'https://webassembly.org' },
          ]
        },
      ]
    }
  },

  {
    label: 'Long Labels',
    desc: 'Tests text wrapping',
    data: {
      topic: 'Long Node Name Wrapping Test',
      children: [
        {
          topic: 'A Branch With A Very Long Label That Should Wrap',
          children: [
            { topic: 'Short' },
            { topic: 'This leaf node also has a rather long description that will wrap' },
            { topic: 'Another moderately long leaf label here' },
          ]
        },
        {
          topic: 'Another Lengthy Branch Name To Test',
          children: [
            { topic: 'Perfectly normal' },
            { topic: 'SuperLongSingleWordWithoutSpacesThatShouldStillRender' },
          ]
        },
        {
          topic: 'Short',
          children: [
            { topic: 'Mix of short and very long leaf names to ensure spacing stays consistent' },
            { topic: 'OK' },
            { topic: 'Medium length name' },
          ]
        },
        {
          topic: 'Right Side With A Long Branch Label Too',
          url: 'https://example.com',
          children: [
            { topic: 'Sub with link', url: 'https://example.com' },
            { topic: 'Sub without link' },
          ]
        },
      ]
    }
  },

  {
    label: 'Minimal',
    desc: 'Simple one-level map',
    data: {
      topic: 'Core Idea',
      children: [
        { topic: 'First Thought',  url: 'https://example.com' },
        { topic: 'Second Thought' },
        { topic: 'Third Thought'  },
        { topic: 'Fourth Thought', url: 'https://example.com' },
      ]
    }
  },

  {
    label: 'Human Body',
    desc: 'Biology — organ systems',
    data: {
      topic: 'Human Body',
      url: 'https://en.wikipedia.org/wiki/Human_body',
      children: [
        {
          topic: 'Nervous System',
          url: 'https://en.wikipedia.org/wiki/Nervous_system',
          children: [
            { topic: 'Brain',          url: 'https://en.wikipedia.org/wiki/Brain' },
            { topic: 'Spinal Cord' },
            { topic: 'Peripheral Nerves' },
          ]
        },
        {
          topic: 'Cardiovascular',
          url: 'https://en.wikipedia.org/wiki/Circulatory_system',
          children: [
            { topic: 'Heart',    url: 'https://en.wikipedia.org/wiki/Heart' },
            { topic: 'Arteries' },
            { topic: 'Veins' },
            { topic: 'Blood',    url: 'https://en.wikipedia.org/wiki/Blood' },
          ]
        },
        {
          topic: 'Skeletal',
          children: [
            { topic: '206 Bones' },
            { topic: 'Cartilage' },
            { topic: 'Joints' },
          ]
        },
        {
          topic: 'Muscular',
          children: [
            { topic: 'Skeletal Muscle' },
            { topic: 'Smooth Muscle' },
            { topic: 'Cardiac Muscle' },
          ]
        },
        {
          topic: 'Digestive',
          url: 'https://en.wikipedia.org/wiki/Human_digestive_system',
          children: [
            { topic: 'Stomach' },
            { topic: 'Small Intestine' },
            { topic: 'Large Intestine' },
            { topic: 'Liver', url: 'https://en.wikipedia.org/wiki/Liver' },
          ]
        },
        {
          topic: 'Immune',
          children: [
            { topic: 'Lymph Nodes' },
            { topic: 'White Blood Cells' },
            { topic: 'Antibodies' },
          ]
        },
      ]
    }
  },

  {
    label: 'Personal Finance',
    desc: 'Money management basics',
    data: {
      topic: 'Personal Finance',
      children: [
        {
          topic: 'Budgeting',
          children: [
            { topic: '50/30/20 Rule' },
            { topic: 'Track Expenses' },
            { topic: 'Emergency Fund', children: [{ topic: '3–6 months expenses' }] },
          ]
        },
        {
          topic: 'Investing',
          url: 'https://www.investopedia.com',
          children: [
            { topic: 'Index Funds',  url: 'https://www.investopedia.com/terms/i/indexfund.asp' },
            { topic: 'ETFs' },
            { topic: 'Real Estate' },
            { topic: 'Bonds' },
          ]
        },
        {
          topic: 'Retirement',
          children: [
            { topic: '401(k) / IRA' },
            { topic: 'Compound Interest' },
            { topic: 'Start Early' },
          ]
        },
        {
          topic: 'Debt',
          children: [
            { topic: 'Avalanche Method' },
            { topic: 'Snowball Method' },
            { topic: 'Avoid High-Interest' },
          ]
        },
        {
          topic: 'Insurance',
          children: [
            { topic: 'Health' },
            { topic: 'Life' },
            { topic: 'Home / Renters' },
          ]
        },
      ]
    }
  },

  {
    label: 'Wide Map (9 branches)',
    desc: 'Tests many first-level nodes',
    data: {
      topic: 'Knowledge',
      children: [
        {
          topic: 'Natural Sciences',
          children: [
            { topic: 'Physics',   url: 'https://en.wikipedia.org/wiki/Physics' },
            { topic: 'Chemistry', url: 'https://en.wikipedia.org/wiki/Chemistry' },
            { topic: 'Biology',   url: 'https://en.wikipedia.org/wiki/Biology' },
          ]
        },
        {
          topic: 'Formal Sciences',
          children: [
            { topic: 'Mathematics' },
            { topic: 'Logic' },
            { topic: 'Statistics' },
          ]
        },
        {
          topic: 'Social Sciences',
          children: [
            { topic: 'Economics' },
            { topic: 'Psychology' },
            { topic: 'Sociology' },
          ]
        },
        {
          topic: 'Humanities',
          children: [
            { topic: 'History' },
            { topic: 'Philosophy' },
            { topic: 'Linguistics' },
          ]
        },
        {
          topic: 'Arts',
          children: [
            { topic: 'Visual Arts' },
            { topic: 'Music' },
            { topic: 'Literature' },
          ]
        },
        {
          topic: 'Technology',
          children: [
            { topic: 'Computer Science', url: 'https://en.wikipedia.org/wiki/Computer_science' },
            { topic: 'Engineering' },
            { topic: 'Robotics' },
          ]
        },
        {
          topic: 'Medicine',
          children: [
            { topic: 'Anatomy' },
            { topic: 'Pharmacology' },
            { topic: 'Surgery' },
          ]
        },
        {
          topic: 'Law',
          children: [
            { topic: 'Civil Law' },
            { topic: 'Criminal Law' },
            { topic: 'International Law' },
          ]
        },
        {
          topic: 'Applied Sciences',
          children: [
            { topic: 'Architecture' },
            { topic: 'Agriculture' },
            { topic: 'Environmental Science' },
          ]
        },
      ]
    }
  }
];

// ── Init ───────────────────────────────────────────────────────────────────

let currentLayout = 'auto';
const mm = new Porphyry('#porphyry-container', {
  layout: currentLayout,
  spacing: 0.6,
  interactions: { pan: true, zoom: true, hud: true, tips: true, collapse: true, download: true },
});

// Build example buttons
const exList = document.getElementById('examples-list');
EXAMPLES.forEach((ex, i) => {
  const btn = document.createElement('button');
  btn.className = 'example-btn' + (i === 0 ? ' active' : '');
  btn.innerHTML = ex.label + '<small>' + ex.desc + '</small>';
  btn.addEventListener('click', () => {
    document.querySelectorAll('.example-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadExample(ex);
  });
  exList.appendChild(btn);
});

// Layout toggle
document.getElementById('layout-toggle').addEventListener('click', e => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn) return;
  document.querySelectorAll('#layout-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentLayout = btn.dataset.layout;
  mm.options.layout = currentLayout;
  syncThemeDropdown(currentLayout);
  // Re-render the current JSON
  const raw = document.getElementById('json-editor').value;
  try {
    const data = JSON.parse(raw);
    mm.render(data);
  } catch (e) { /* ignore parse errors during toggle */ }
});

// Center edge toggle
document.getElementById('center-edge-toggle').addEventListener('click', e => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn) return;
  document.querySelectorAll('#center-edge-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  mm.options.centerEdge = btn.dataset.edge;
  const raw = document.getElementById('json-editor').value;
  try {
    const data = JSON.parse(raw);
    mm.render(data);
  } catch (e) { /* ignore parse errors during toggle */ }
});

// ── Sidebar toggles ─────────────────────────────────────────────────────────

// Full sidebar collapse
const sidebarEl  = document.getElementById('sidebar');
const sidebarBtn = document.getElementById('sidebar-toggle');
const sidebarArrow = sidebarBtn.querySelector('path');

sidebarBtn.addEventListener('click', () => {
  const collapsed = sidebarEl.classList.toggle('collapsed');
  sidebarBtn.classList.toggle('collapsed', collapsed);
  // Flip arrow direction: ‹ when open, › when closed
  sidebarArrow.setAttribute('d', collapsed
    ? 'M2 1l5 5-5 5'   // pointing right (re-open)
    : 'M6 1L1 6l5 5'   // pointing left  (collapse)
  );
  sidebarEl.addEventListener('transitionend', () => mm.fit(), { once: true });
});

// Examples list collapse
const examplesWrap    = document.getElementById('examples-wrap');
const examplesBtn     = document.getElementById('examples-toggle');
const examplesChevron = document.getElementById('examples-chevron').querySelector('path');

examplesBtn.addEventListener('click', () => {
  const collapsed = examplesWrap.classList.toggle('collapsed');
  // Rotate chevron: ∧ when collapsed, ∨ when expanded
  examplesChevron.setAttribute('d', collapsed
    ? 'M2 8l4-4 4 4'   // pointing up (expand)
    : 'M2 4l4 4 4-4'   // pointing down (collapse)
  );
  examplesBtn.title = collapsed ? 'Show examples' : 'Collapse examples';
});

// Load first example
loadExample(EXAMPLES[0]);

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadExample(ex) {
  const editor = document.getElementById('json-editor');
  editor.value = JSON.stringify(ex.data, null, 2);
  clearError();
  mm.render(ex.data);
}

function applyJSON() {
  const raw = document.getElementById('json-editor').value;
  try {
    const data = JSON.parse(raw);
    clearError();
    mm.render(data);
    document.querySelectorAll('.example-btn').forEach(b => b.classList.remove('active'));
  } catch (e) {
    showError('JSON Error: ' + e.message);
  }
}

function showError(msg) { document.getElementById('json-error').textContent = msg; }
function clearError()   { document.getElementById('json-error').textContent = ''; }

function setTheme(val) {
  mm.options.theme = val;
  mm._renderInternal(false);
}

const THEMES_HORIZONTAL = [
  { value: 'classic',       label: 'Classic'       },
  { value: 'ghost',         label: 'Ghost'         },
  { value: 'underline',     label: 'Underline'     },
  { value: 'baseline',      label: 'Baseline'      },
  { value: 'outline',       label: 'Outline'       },
  { value: 'solid',         label: 'Solid'         },
  { value: 'solid-sharp',   label: 'Solid Sharp'   },
  { value: 'outline-sharp', label: 'Outline Sharp' },
  { value: 'minimal',       label: 'Minimal'       },
];

const THEMES_VERTICAL = [
  { value: 'outline',       label: 'Outline'       },
  { value: 'solid',         label: 'Solid'         },
  { value: 'solid-sharp',   label: 'Solid Sharp'   },
  { value: 'outline-sharp', label: 'Outline Sharp' },
  { value: 'minimal',       label: 'Minimal'       },
];

function syncThemeDropdown(layout) {
  const sel = document.getElementById('theme-select');
  const isVertical = layout === 'up' || layout === 'down';
  const themes = isVertical ? THEMES_VERTICAL : THEMES_HORIZONTAL;
  // Use mm.options.theme as source of truth so returning to horizontal
  // correctly restores the original theme even after a vertical fallback.
  const current = mm.options.theme;
  sel.innerHTML = themes.map(t =>
    `<option value="${t.value}"${t.value === current ? ' selected' : ''}>${t.label}</option>`
  ).join('');
  // If the current theme isn't available in this layout (e.g. classic in vertical),
  // select the first available option but leave mm.options.theme untouched so
  // it can be restored when switching back to a horizontal layout.
  if (!themes.find(t => t.value === current)) {
    sel.value = themes[0].value;
  }
}

function setSpacing(val) {
  const v = parseFloat(val);
  mm.options.spacing = v;
  document.getElementById('spacing-value').textContent = v.toFixed(1) + '×';
  mm._renderInternal(true);
}

function setInteraction() {
  const pan      = document.getElementById('toggle-pan').checked;
  const zoom     = document.getElementById('toggle-zoom').checked;
  const collapse = document.getElementById('toggle-collapse').checked;
  const hud       = document.getElementById('toggle-hud').checked;
  const tips      = document.getElementById('toggle-tips').checked;
  const linkIcons = document.getElementById('toggle-link-icons').checked;
  mm.options.interactions.pan      = pan;
  mm.options.interactions.zoom     = zoom;
  mm.options.interactions.collapse = collapse;
  mm.options.showLinkIcons         = linkIcons;
  mm._rebindInteractions();
  // If collapse was just disabled, expand everything first
  if (!collapse) mm._collapsed.clear();
  mm._renderInternal(false);
  // HUD and tips are built once at init — toggle visibility directly.
  // HUD uses display:flex in its inline cssText, so we must restore 'flex'
  // explicitly (not '' which would fall back to the block default).
  if (mm._hud)  mm._hud.style.display  = hud  ? 'flex'  : 'none';
  if (mm._tips) mm._tips.style.display = tips ? 'block' : 'none';
}

// ── Zoom controls (delegated to library HUD) ─────────────────────────────

// ── Tab switching ─────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const workspace  = document.querySelector('.workspace');
    const docsPanel  = document.getElementById('docs-panel');

    if (tab === 'docs') {
      workspace.classList.add('hidden');
      docsPanel.classList.add('active');
    } else {
      workspace.classList.remove('hidden');
      docsPanel.classList.remove('active');
      // Re-fit in case container was hidden during a render
      requestAnimationFrame(() => mm.fit());
    }
  });
});

document.getElementById('json-editor').addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') applyJSON();
});

// ── Demo container size preview ────────────────────────────────────────────

const canvasStage   = document.getElementById('canvas-stage');
const demoContainer = document.getElementById('porphyry-container');

function applyDemoSize() {
  const w = parseInt(document.getElementById('demo-w').value, 10);
  const h = parseInt(document.getElementById('demo-h').value, 10);
  if (w > 0 && h > 0) {
    demoContainer.style.width  = w + 'px';
    demoContainer.style.height = h + 'px';
    canvasStage.classList.add('sized');
    mm.fit();
  }
}

function resetDemoSize() {
  document.getElementById('demo-w').value = '';
  document.getElementById('demo-h').value = '';
  demoContainer.style.width  = '';
  demoContainer.style.height = '';
  canvasStage.classList.remove('sized');
  mm.fit();
}

['demo-w', 'demo-h'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') applyDemoSize();
  });
  document.getElementById(id).addEventListener('change', applyDemoSize);
});

document.getElementById('demo-dim-reset').addEventListener('click', resetDemoSize);
