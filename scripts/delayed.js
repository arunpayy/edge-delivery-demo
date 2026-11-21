// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection (Phase 3 — Delayed)
sampleRUM('cwv');

if (window.edsShowcaseTimings) {
  window.edsShowcaseTimings.delayedStart = Math.round(performance.now());
}
window.dispatchEvent(new CustomEvent('eds:phase-updated', { detail: { phase: 'delayed' } }));
