import { createOptimizedPicture } from '../../scripts/aem.js';

function isSvgSource(src) {
  return src && src.toLowerCase().split('?')[0].endsWith('.svg');
}

function appendEagerVisual(mediaCol, mediaEl) {
  const img = mediaEl.tagName === 'IMG' ? mediaEl : mediaEl.querySelector('img');
  if (!img) return;
  if (!isSvgSource(img.src)) {
    const optimized = createOptimizedPicture(
      img.src,
      img.alt,
      true,
      [{ media: '(min-width: 600px)', width: '1600' }, { width: '750' }],
    );
    optimized.querySelector('img')?.setAttribute('fetchpriority', 'high');
    mediaCol.append(optimized);
  } else {
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
    mediaCol.append(mediaEl);
  }
}

/**
 * Decorates the hero block.
 * Supports explicit authored hero tables (text column + optional visual column)
 * as well as auto-blocked picture/img + h1 hero sections.
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'hero-grid';

  const copyCol = document.createElement('div');
  copyCol.className = 'hero-copy';

  const mediaCol = document.createElement('div');
  mediaCol.className = 'hero-media';

  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      const visual = cell.querySelector('picture') || cell.querySelector('img');
      const hasHeading = cell.querySelector('h1, h2, h3');
      if (visual && !hasHeading && cell.children.length <= 2) {
        appendEagerVisual(mediaCol, visual);
      } else {
        while (cell.firstElementChild) {
          const child = cell.firstElementChild;
          const childVisual = child.matches('picture, img')
            ? child
            : child.querySelector('picture, img');
          if (childVisual && !child.querySelector('h1, h2, h3, a') && child.textContent.trim() === '') {
            appendEagerVisual(mediaCol, childVisual);
            if (child !== childVisual) child.remove();
          } else {
            copyCol.append(child);
          }
        }
      }
    });
  });

  // Group adjacent CTA buttons inside a single flex actions row
  const buttonContainers = [...copyCol.querySelectorAll('p.button-container')];
  if (buttonContainers.length > 0) {
    const actions = document.createElement('div');
    actions.className = 'hero-actions';
    buttonContainers[0].before(actions);
    buttonContainers.forEach((btnWrap) => {
      const link = btnWrap.querySelector('a');
      if (link) actions.append(link);
      btnWrap.remove();
    });
  }

  grid.append(copyCol);
  if (mediaCol.children.length > 0) {
    grid.append(mediaCol);
  } else {
    grid.classList.add('hero-single');
  }

  block.textContent = '';
  block.append(grid);
}
