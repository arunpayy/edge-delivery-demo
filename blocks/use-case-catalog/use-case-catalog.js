import {
  normalizeSheetPayload,
  extractCategories,
  filterUseCases,
} from './catalog-utils.js';

function createCardElement(item) {
  const card = document.createElement('article');
  card.className = 'ucc-card';

  const metaRow = document.createElement('div');
  metaRow.className = 'ucc-card-meta';

  const catBadge = document.createElement('span');
  catBadge.className = 'ucc-badge ucc-badge-category';
  catBadge.textContent = item.category;

  const impactBadge = document.createElement('span');
  impactBadge.className = 'ucc-badge ucc-badge-impact';
  impactBadge.textContent = item.impactMetric;

  metaRow.append(catBadge, impactBadge);

  const title = document.createElement('h3');
  title.className = 'ucc-card-title';
  title.textContent = item.title;

  const summary = document.createElement('p');
  summary.className = 'ucc-card-summary';
  summary.textContent = item.summary;

  const surface = document.createElement('p');
  surface.className = 'ucc-card-surface';
  surface.innerHTML = '<strong>Authoring:</strong> ';
  surface.append(document.createTextNode(item.authoringSurface));

  const footer = document.createElement('div');
  footer.className = 'ucc-card-footer';

  const chips = document.createElement('div');
  chips.className = 'ucc-block-chips';
  item.blocks.forEach((blk) => {
    const chip = document.createElement('code');
    chip.textContent = blk;
    chips.append(chip);
  });

  const link = document.createElement('a');
  link.className = 'ucc-card-link';
  link.href = item.path;
  link.textContent = 'Explore pattern →';

  footer.append(chips, link);
  card.append(metaRow, title, summary, surface, footer);
  return card;
}

async function loadCatalog(block, endpoint) {
  const state = {
    items: [],
    category: 'All',
    query: '',
  };

  try {
    const resp = await fetch(endpoint);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const payload = await resp.json();
    state.items = normalizeSheetPayload(payload);
  } catch (err) {
    block.innerHTML = `<p class="ucc-error">Unable to load EDS sheet data from <code>${endpoint}</code>.</p>`;
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'ucc-controls';

  const filters = document.createElement('div');
  filters.className = 'ucc-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter use cases by category');

  const searchWrap = document.createElement('div');
  searchWrap.className = 'ucc-search-wrap';
  const searchLabel = document.createElement('label');
  searchLabel.className = 'ucc-sr-only';
  searchLabel.htmlFor = 'ucc-search-input';
  searchLabel.textContent = 'Search AEM Edge Delivery use cases';

  const searchInput = document.createElement('input');
  searchInput.id = 'ucc-search-input';
  searchInput.type = 'search';
  searchInput.className = 'ucc-search-input';
  searchInput.placeholder = 'Search use cases, blocks, or authoring modes...';
  searchWrap.append(searchLabel, searchInput);

  controls.append(filters, searchWrap);

  const status = document.createElement('p');
  status.className = 'ucc-status';
  status.setAttribute('aria-live', 'polite');

  const grid = document.createElement('div');
  grid.className = 'ucc-grid';

  const renderGrid = () => {
    const filtered = filterUseCases(state.items, {
      category: state.category,
      query: state.query,
    });
    status.textContent = `Showing ${filtered.length} of ${state.items.length} Edge Delivery use cases (live from ${endpoint})`;
    grid.textContent = '';
    if (filtered.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'ucc-empty';
      empty.textContent = 'No matching use cases. Try clearing the search or selecting "All".';
      grid.append(empty);
      return;
    }
    filtered.forEach((item) => grid.append(createCardElement(item)));
  };

  extractCategories(state.items).forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ucc-filter-btn';
    btn.setAttribute('aria-pressed', cat === 'All' ? 'true' : 'false');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      state.category = cat;
      filters.querySelectorAll('.ucc-filter-btn').forEach((b) => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      renderGrid();
    });
    filters.append(btn);
  });

  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    renderGrid();
  });

  block.textContent = '';
  block.append(controls, status, grid);
  renderGrid();
}

/**
 * Sheet-driven interactive AEM Edge Delivery use-case catalog.
 * Defers JSON fetch until the block approaches the viewport to protect LCP.
 * @param {Element} block The use-case-catalog block element
 */
export default function decorate(block) {
  const link = block.querySelector('a[href]');
  const endpoint = link ? link.getAttribute('href') : '/data/use-cases.json';

  block.textContent = '';
  const placeholder = document.createElement('p');
  placeholder.className = 'ucc-loading';
  placeholder.textContent = 'Loading Edge Delivery use cases...';
  block.append(placeholder);

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadCatalog(block, endpoint);
      }
    }, { rootMargin: '250px' });
    observer.observe(block);
  } else {
    loadCatalog(block, endpoint);
  }
}
