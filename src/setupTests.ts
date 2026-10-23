import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

// Polyfill TextEncoder/TextDecoder if missing in JSDOM
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
