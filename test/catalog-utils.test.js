import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSheetPayload,
  extractCategories,
  filterUseCases,
} from '../blocks/use-case-catalog/catalog-utils.js';

const SAMPLE_SHEET = {
  total: 3,
  offset: 0,
  limit: 3,
  data: [
    {
      id: 'campaign',
      title: 'Campaign Microsites',
      category: 'Document Authoring',
      authoringSurface: 'Google Docs',
      impactMetric: '10x Faster',
      summary: 'Publish marketing landing pages quickly.',
      blocks: 'hero, cards, fragment',
      path: '/use-cases#campaign-velocity',
    },
    {
      id: 'commerce',
      title: 'Commerce Storefront',
      category: 'Commerce',
      authoringSurface: 'Docs + Drop-ins',
      impactMetric: '< 1s LCP',
      summary: 'High-speed product pages for Adobe Commerce.',
      blocks: 'hero, use-case-catalog',
      path: '/use-cases#commerce-storefront',
    },
    {
      // malformed entry missing title should be ignored cleanly
      id: 'broken',
      category: 'Invalid',
    },
  ],
  ':type': 'sheet',
};

test('normalizeSheetPayload parses valid rows and drops malformed rows', () => {
  const items = normalizeSheetPayload(SAMPLE_SHEET);
  assert.equal(items.length, 2);
  assert.deepEqual(items[0].blocks, ['hero', 'cards', 'fragment']);
  assert.equal(items[1].category, 'Commerce');
  assert.deepEqual(normalizeSheetPayload(null), []);
  assert.deepEqual(normalizeSheetPayload({ data: 'not-an-array' }), []);
});

test('extractCategories returns deduplicated sorted categories prefixed with All', () => {
  const items = normalizeSheetPayload(SAMPLE_SHEET);
  assert.deepEqual(extractCategories(items), ['All', 'Commerce', 'Document Authoring']);
  assert.deepEqual(extractCategories(null), ['All']);
});

test('filterUseCases filters by category and case-insensitive search query', () => {
  const items = normalizeSheetPayload(SAMPLE_SHEET);
  assert.equal(filterUseCases(items, { category: 'All', query: '' }).length, 2);
  assert.equal(filterUseCases(items, { category: 'Commerce' }).length, 1);
  assert.equal(filterUseCases(items, { query: 'fragment' }).length, 1);
  assert.equal(filterUseCases(items, { query: 'ADOBE COMMERCE' }).length, 1);
  assert.equal(filterUseCases(items, { category: 'Commerce', query: 'marketing' }).length, 0);
});
