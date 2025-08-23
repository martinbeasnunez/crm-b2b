// Polyfills required by jsdom/whatwg-url
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Optional: ensure fetch exists in global (tests mock fetch where needed)
if (typeof global.fetch === 'undefined') {
  try {
    global.fetch = require('node-fetch');
  } catch (e) {
    // node-fetch might not be installed; tests provide mocks where needed
  }
}
