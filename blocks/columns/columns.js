export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  const cols = [...firstRow.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const visual = col.querySelector('picture') || col.querySelector('img');
      if (visual && col.textContent.trim() === '') {
        col.classList.add('columns-img-col');
      }
    });
  });
}
