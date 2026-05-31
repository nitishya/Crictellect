import '@testing-library/jest-dom';

// ── ResizeObserver polyfill for jsdom ────────────────────────────────────────
// Recharts uses ResizeObserver internally; jsdom doesn't implement it.
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Polyfill for jsdom
global.ResizeObserver = ResizeObserverPolyfill as unknown as typeof ResizeObserver;

// Return non-zero dimensions so recharts can calculate chart sizes
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: () => ({ width: 800, height: 400, top: 0, left: 0, bottom: 400, right: 800, x: 0, y: 0 }),
});
