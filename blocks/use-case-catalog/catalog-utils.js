/**
 * Pure helper utilities for EDS Sheet-driven Use-Case Catalog.
 * Separated from DOM logic for deterministic Node unit testing.
 */

export function normalizeSheetPayload(payload) {
  if (!payload || !Array.isArray(payload.data)) return [];
  return payload.data
    .filter((row) => row && typeof row === 'object' && row.title)
    .map((row) => ({
      id: String(row.id || row.title).trim(),
      title: String(row.title).trim(),
      category: String(row.category || 'General').trim(),
      authoringSurface: String(row.authoringSurface || 'Document Authoring').trim(),
      impactMetric: String(row.impactMetric || '100 Lighthouse').trim(),
      summary: String(row.summary || '').trim(),
      blocks: String(row.blocks || '')
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean),
      path: String(row.path || '/use-cases').trim(),
    }));
}

export function extractCategories(items) {
  if (!Array.isArray(items)) return ['All'];
  const unique = [...new Set(items.map((item) => item.category).filter(Boolean))].sort();
  return ['All', ...unique];
}

export function filterUseCases(items, { category = 'All', query = '' } = {}) {
  if (!Array.isArray(items)) return [];
  const normalizedQuery = String(query || '').trim().toLowerCase();
  return items.filter((item) => {
    const categoryMatches = !category || category === 'All' || item.category === category;
    if (!categoryMatches) return false;
    if (!normalizedQuery) return true;
    const haystack = [
      item.title,
      item.category,
      item.authoringSurface,
      item.impactMetric,
      item.summary,
      ...(item.blocks || []),
    ].join(' ').toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
