import { createOptimizedPicture } from '../../scripts/aem.js';

function isSvgSource(src) {
  return src && src.toLowerCase().split('?')[0].endsWith('.svg');
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const hasVisual = div.querySelector('picture, img');
      if (hasVisual && div.children.length === 1 && div.textContent.trim() === '') {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    if (!isSvgSource(img.src)) {
      img.closest('picture')
        .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    }
  });

  block.textContent = '';
  block.append(ul);
}
