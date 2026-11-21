/**
 * Decorates documentation reference tables (e.g., authoring specs, metadata,
 * section styles, configuration sheets) without triggering EDS table-to-block conversion.
 * @param {Element} block The author-table block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    const cells = [...row.children];
    const maxCols = Math.max(...rows.map((r) => r.children.length));

    cells.forEach((cell) => {
      const el = document.createElement(rowIndex === 0 ? 'th' : 'td');
      if (rowIndex === 0) el.scope = 'col';
      if (cells.length === 1 && maxCols > 1) {
        el.colSpan = maxCols;
      }
      while (cell.firstChild) el.append(cell.firstChild);
      tr.append(el);
    });

    if (rowIndex === 0) {
      thead.append(tr);
    } else {
      tbody.append(tr);
    }
  });

  table.append(thead, tbody);
  block.textContent = '';
  block.append(table);
}
