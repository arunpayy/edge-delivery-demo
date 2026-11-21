import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Loads and decorates the footer fragment.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  if (fragment) {
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  } else {
    const fallback = document.createElement('p');
    fallback.textContent = 'AEM Edge Delivery Services Showcase';
    footer.append(fallback);
  }

  block.append(footer);
}
