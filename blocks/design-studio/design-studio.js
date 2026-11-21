const THEMES = [
  {
    id: 'adobe-editorial',
    label: 'Adobe Editorial',
    note: 'Crisp Spectrum-inspired canvas, crimson action color, 6px–14px editorial radii.',
    swatches: [
      { token: '--accent-color', name: 'Brand Accent', contrast: 'AA Large / White' },
      { token: '--dark-color', name: 'Ink / Dark Surface', contrast: 'AAA 17.5:1' },
      { token: '--link-color', name: 'Interactive Cobalt', contrast: 'AA 4.7:1' },
      { token: '--surface-muted', name: 'Section Highlight', contrast: 'Subtle Band' },
      { token: '--success-color', name: 'Verified CWV', contrast: 'AA 4.9:1' },
    ],
  },
  {
    id: 'nordic-luxury',
    label: 'Nordic Luxury',
    note: 'Warm stone paper, deep forest pine accent, architectural 2px–8px sharp corners.',
    swatches: [
      { token: '--accent-color', name: 'Forest Pine', contrast: 'AAA 9.4:1' },
      { token: '--dark-color', name: 'Espresso Ink', contrast: 'AAA 16.8:1' },
      { token: '--link-color', name: 'Burnished Amber', contrast: 'AA 5.1:1' },
      { token: '--surface-muted', name: 'Warm Linen Band', contrast: 'Editorial Tint' },
      { token: '--success-color', name: 'Verified CWV', contrast: 'AA 4.9:1' },
    ],
  },
  {
    id: 'fintech-midnight',
    label: 'Fintech Midnight',
    note: 'Cool mist surface, electric cobalt accent, soft modern 8px–18px geometry.',
    swatches: [
      { token: '--accent-color', name: 'Electric Cobalt', contrast: 'AA 5.2:1' },
      { token: '--dark-color', name: 'Obsidian Navy', contrast: 'AAA 18.2:1' },
      { token: '--link-color', name: 'Sky Action', contrast: 'AA 4.6:1' },
      { token: '--surface-muted', name: 'Mist Band', contrast: 'Clean Contrast' },
      { token: '--success-color', name: 'Verified CWV', contrast: 'AA 4.9:1' },
    ],
  },
];

function applyBrandTheme(themeId) {
  if (themeId === 'adobe-editorial') {
    delete document.documentElement.dataset.brandTheme;
  } else {
    document.documentElement.dataset.brandTheme = themeId;
  }
  try {
    sessionStorage.setItem('eds-brand-theme', themeId);
  } catch (e) {
    // ignore storage errors
  }
}

function getComputedTokenHex(tokenName) {
  return getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim() || '—';
}

/**
 * Interactive Design System & Multi-Brand Token Switcher.
 * Demonstrates to Design Directors how CSS tokens + Figma variables re-skin
 * an entire Edge Delivery site instantaneously without touching authored content.
 * @param {Element} block The design-studio block element
 */
export default function decorate(block) {
  const titleText = block.querySelector('h2, h3, strong')?.textContent?.trim()
    || 'Live Design System & Multi-Brand Token Studio';
  const subtitleText = block.querySelector('p:last-of-type')?.textContent?.trim()
    || 'Switch brand themes below to re-skin the entire multi-page showcase instantly — zero code rebuilds, zero author changes.';

  let activeId = document.documentElement.dataset.brandTheme || 'adobe-editorial';

  const panel = document.createElement('div');
  panel.className = 'ds-panel';

  const header = document.createElement('div');
  header.className = 'ds-header';

  const headingWrap = document.createElement('div');
  const h2 = document.createElement('h2');
  h2.textContent = titleText;
  const sub = document.createElement('p');
  sub.textContent = subtitleText;
  headingWrap.append(h2, sub);

  const switcher = document.createElement('div');
  switcher.className = 'ds-switcher';
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', 'Switch live brand design tokens');

  const themeNote = document.createElement('p');
  themeNote.className = 'ds-theme-note';
  themeNote.setAttribute('aria-live', 'polite');

  const swatchGrid = document.createElement('div');
  swatchGrid.className = 'ds-swatch-grid';

  const specimen = document.createElement('div');
  specimen.className = 'ds-specimen';
  specimen.innerHTML = `<div class="ds-type-scale">
      <span class="ds-specimen-label">Fluid Type Scale (clamp)</span>
      <p class="ds-type-h1">Display H1 · Design-Locked Rhythm</p>
      <p class="ds-type-h2">Section H2 · Semantic Hierarchy</p>
      <p class="ds-type-body">Body copy stays readable (60–72ch max measure, 1.6 line-height) — authors never inject rogue fonts or inline colors.</p>
    </div>
    <div class="ds-component-preview">
      <span class="ds-specimen-label">Guardrailed Interactive States</span>
      <div class="ds-preview-actions">
        <a href="/docs/library/blocks" class="button">Primary CTA</a>
        <a href="/use-cases" class="button secondary">Secondary CTA</a>
      </div>
      <div class="ds-token-pills">
        <code>--radius-sm</code>
        <code>--radius-md</code>
        <code>--radius-lg</code>
        <code>WCAG 2.2 AA</code>
      </div>
    </div>`;

  const renderSwatches = () => {
    const theme = THEMES.find((t) => t.id === activeId) || THEMES[0];
    themeNote.textContent = `Active Design System: ${theme.label} — ${theme.note}`;
    swatchGrid.textContent = '';

    theme.swatches.forEach((sw) => {
      const card = document.createElement('div');
      card.className = 'ds-swatch-card';

      const chip = document.createElement('div');
      chip.className = 'ds-swatch-chip';
      chip.style.backgroundColor = `var(${sw.token})`;

      const info = document.createElement('div');
      info.className = 'ds-swatch-info';
      const val = getComputedTokenHex(sw.token);
      info.innerHTML = `<strong>${sw.name}</strong>
        <code>${sw.token}</code>
        <span>${val} · ${sw.contrast}</span>`;

      card.append(chip, info);
      swatchGrid.append(card);
    });
  };

  THEMES.forEach((theme) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ds-theme-btn';
    btn.setAttribute('aria-pressed', theme.id === activeId ? 'true' : 'false');
    btn.textContent = theme.label;
    btn.addEventListener('click', () => {
      activeId = theme.id;
      applyBrandTheme(theme.id);
      switcher.querySelectorAll('.ds-theme-btn').forEach((b) => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      renderSwatches();
    });
    switcher.append(btn);
  });

  header.append(headingWrap, switcher);
  panel.append(header, themeNote, swatchGrid, specimen);
  block.textContent = '';
  block.append(panel);
  renderSwatches();
}
