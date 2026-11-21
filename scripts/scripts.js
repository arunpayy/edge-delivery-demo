import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './aem.js';

const LCP_BLOCKS = ['hero'];

window.edsShowcaseTimings = {
  eagerStart: Math.round(performance.now()),
  eagerEnd: null,
  lazyEnd: null,
  delayedStart: null,
};

/**
 * Builds hero block and prepends to main in a new section when an image
 * precedes the first h1 outside an explicit hero block.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  if (main.querySelector('.hero')) return;
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Loads fonts.css and records a session storage hint.
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // ignore storage errors in restricted contexts
  }
}

/**
 * Builds all synthetic auto-blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Phase 1 (Eager): Loads everything needed to get to LCP.
 * @param {Element} doc The document element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
  window.edsShowcaseTimings.eagerEnd = Math.round(performance.now());
  window.dispatchEvent(new CustomEvent('eds:phase-updated', { detail: { phase: 'eager' } }));

  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // ignore storage errors
  }
}

/**
 * Phase 2 (Lazy): Loads below-the-fold blocks, header, footer, and post-LCP styles.
 * @param {Element} doc The document element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  if (main) {
    await loadBlocks(main);
  }

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  const header = doc.querySelector('header');
  const footer = doc.querySelector('footer');
  if (header) await loadHeader(header);
  if (footer) await loadFooter(footer);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  window.edsShowcaseTimings.lazyEnd = Math.round(performance.now());
  window.dispatchEvent(new CustomEvent('eds:phase-updated', { detail: { phase: 'lazy' } }));

  sampleRUM('lazy');
  if (main) {
    sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
    sampleRUM.observe(main.querySelectorAll('picture > img'));
  }
}

/**
 * Phase 3 (Delayed): Defers analytics, RUM CWV, and non-essential enhancements.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
