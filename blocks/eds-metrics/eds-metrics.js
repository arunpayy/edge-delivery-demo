function formatMs(value) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) return '—';
  return `${Math.round(value)} ms`;
}

function getAssetWeightKb() {
  if (!window.performance || !performance.getEntriesByType) return null;
  const resources = performance.getEntriesByType('resource');
  const bytes = resources
    .filter((entry) => entry.initiatorType === 'script' || entry.initiatorType === 'link')
    .reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0), 0);
  if (bytes <= 0) return null;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function readMetrics(state) {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  const ttfb = nav ? Math.max(0, nav.responseStart - nav.requestStart) : null;
  const paints = performance.getEntriesByType?.('paint') || [];
  const fcpEntry = paints.find((p) => p.name === 'first-contentful-paint');
  const fcp = fcpEntry ? fcpEntry.startTime : null;
  const loadedBlocks = document.querySelectorAll('main [data-block-status="loaded"]').length;
  const totalBlocks = document.querySelectorAll('main [data-block-name]').length;
  const assetKb = getAssetWeightKb();

  return {
    ttfb: formatMs(ttfb),
    fcp: formatMs(fcp),
    lcp: state.lcp !== null ? formatMs(state.lcp) : formatMs(fcp),
    cls: state.cls.toFixed(3),
    blocks: `${loadedBlocks} / ${totalBlocks}`,
    assets: assetKb || 'Zero bundle',
  };
}

function createMetricCard(id, label, hint) {
  const card = document.createElement('div');
  card.className = 'eds-metric-card';
  card.innerHTML = `<span class="eds-metric-label">${label}</span>
    <strong class="eds-metric-value" data-metric="${id}">—</strong>
    <span class="eds-metric-hint">${hint}</span>`;
  return card;
}

function updatePhaseBadges(container) {
  const timings = window.edsShowcaseTimings || {};
  const phases = [
    { key: 'eager', value: timings.eagerEnd, label: 'Phase 1 · Eager (LCP)' },
    { key: 'lazy', value: timings.lazyEnd, label: 'Phase 2 · Lazy (Blocks)' },
    { key: 'delayed', value: timings.delayedStart, label: 'Phase 3 · Delayed (RUM)' },
  ];
  phases.forEach(({ key, value, label }) => {
    const el = container.querySelector(`[data-phase="${key}"]`);
    if (!el) return;
    if (typeof value === 'number') {
      el.classList.add('is-complete');
      el.textContent = `${label}: ${value} ms`;
    } else {
      el.classList.remove('is-complete');
      el.textContent = `${label}: Deferred (3s)`;
    }
  });
}

/**
 * Live EDS Performance Telemetry & Interactive Block Inspector.
 * Reads real browser Performance APIs without blocking LCP.
 * @param {Element} block The eds-metrics block element
 */
export default function decorate(block) {
  const headingText = block.querySelector('h2, h3, strong')?.textContent?.trim()
    || 'Live Edge Delivery Telemetry';
  const subtitleText = block.querySelector('p:last-of-type')?.textContent?.trim()
    || 'Measured directly from this browser session (zero-build ES modules, 3-phase loading).';

  const state = {
    lcp: null,
    cls: 0,
  };

  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) state.lcp = last.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // ignore unsupported entry types
    }

    try {
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) state.cls += entry.value;
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // ignore unsupported entry types
    }
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'eds-metrics-panel';

  const topBar = document.createElement('div');
  topBar.className = 'eds-metrics-header';

  const titleGroup = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = headingText;
  const subtitle = document.createElement('p');
  subtitle.textContent = subtitleText;
  titleGroup.append(title, subtitle);

  const actions = document.createElement('div');
  actions.className = 'eds-metrics-actions';

  const inspectBtn = document.createElement('button');
  inspectBtn.type = 'button';
  inspectBtn.className = 'secondary eds-inspect-toggle';
  inspectBtn.setAttribute('aria-pressed', 'false');
  inspectBtn.textContent = 'Inspect EDS Blocks';
  inspectBtn.addEventListener('click', () => {
    const active = document.body.classList.toggle('eds-inspect-active');
    inspectBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    inspectBtn.textContent = active ? 'Hide Block Outlines' : 'Inspect EDS Blocks';
  });

  const refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'secondary';
  refreshBtn.textContent = 'Refresh Metrics';

  actions.append(inspectBtn, refreshBtn);
  topBar.append(titleGroup, actions);

  const grid = document.createElement('div');
  grid.className = 'eds-metrics-grid';
  grid.append(
    createMetricCard('ttfb', 'TTFB', 'Edge / Server response'),
    createMetricCard('fcp', 'FCP', 'First Contentful Paint'),
    createMetricCard('lcp', 'LCP', 'Target < 2500 ms'),
    createMetricCard('cls', 'CLS', 'Target < 0.100'),
    createMetricCard('blocks', 'EDS Blocks', 'Decorated on page'),
    createMetricCard('assets', 'JS + CSS', 'Zero bundler weight'),
  );

  const phaseStrip = document.createElement('div');
  phaseStrip.className = 'eds-phase-strip';
  ['eager', 'lazy', 'delayed'].forEach((phase) => {
    const badge = document.createElement('span');
    badge.className = 'eds-phase-badge';
    badge.dataset.phase = phase;
    phaseStrip.append(badge);
  });

  const render = () => {
    const snapshot = readMetrics(state);
    Object.entries(snapshot).forEach(([key, val]) => {
      const valueEl = grid.querySelector(`[data-metric="${key}"]`);
      if (valueEl) valueEl.textContent = val;
    });
    updatePhaseBadges(phaseStrip);
  };

  refreshBtn.addEventListener('click', render);
  window.addEventListener('eds:phase-updated', render);
  window.addEventListener('load', () => window.setTimeout(render, 250));

  wrapper.append(topBar, grid, phaseStrip);
  block.textContent = '';
  block.append(wrapper);

  // Schedule initial read after current frame so decorated blocks are counted
  window.setTimeout(render, 120);
}
