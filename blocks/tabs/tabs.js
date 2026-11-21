import { toClassName } from '../../scripts/aem.js';

function activateTab(tablist, panels, targetIndex) {
  const buttons = [...tablist.querySelectorAll('[role="tab"]')];
  buttons.forEach((btn, idx) => {
    const selected = idx === targetIndex;
    btn.setAttribute('aria-selected', selected ? 'true' : 'false');
    btn.tabIndex = selected ? 0 : -1;
  });
  panels.forEach((panel, idx) => {
    panel.hidden = idx !== targetIndex;
  });
}

export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.children.length >= 2);
  if (rows.length === 0) return;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const panelsContainer = document.createElement('div');
  panelsContainer.className = 'tabs-panels';

  const panels = [];
  const blockUid = toClassName(block.dataset.tabsId || `tabs-${Math.random().toString(36).slice(2, 7)}`);

  rows.forEach((row, index) => {
    const labelCell = row.children[0];
    const contentCell = row.children[1];
    const labelText = labelCell.textContent.trim() || `Tab ${index + 1}`;
    const slug = `${blockUid}-${toClassName(labelText)}-${index}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-tab';
    button.id = `tab-${slug}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.setAttribute('aria-controls', `tabpanel-${slug}`);
    button.tabIndex = index === 0 ? 0 : -1;
    button.textContent = labelText;

    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = `tabpanel-${slug}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.hidden = index !== 0;
    while (contentCell.firstChild) {
      panel.append(contentCell.firstChild);
    }

    button.addEventListener('click', () => {
      activateTab(tablist, panels, index);
    });

    button.addEventListener('keydown', (e) => {
      let nextIndex = null;
      if (e.key === 'ArrowRight') nextIndex = (index + 1) % rows.length;
      if (e.key === 'ArrowLeft') nextIndex = (index - 1 + rows.length) % rows.length;
      if (e.key === 'Home') nextIndex = 0;
      if (e.key === 'End') nextIndex = rows.length - 1;
      if (nextIndex !== null) {
        e.preventDefault();
        activateTab(tablist, panels, nextIndex);
        tablist.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
      }
    });

    tablist.append(button);
    panels.push(panel);
    panelsContainer.append(panel);
  });

  block.textContent = '';
  block.append(tablist, panelsContainer);
}
