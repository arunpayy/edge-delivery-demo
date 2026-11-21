export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row, index) => {
    const label = row.children[0];
    const body = row.children[1];
    if (!label || !body) return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    body.className = 'accordion-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-item';
    if (index === 0) details.open = true;
    details.append(summary, body);
    row.replaceWith(details);
  });
}
