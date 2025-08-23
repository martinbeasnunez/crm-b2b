/**
 * Simple Jest tests for whatsapp-integration.js
 * We will load the module in a JSDOM-like environment and mock fetch.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load the source file as script into a DOM
const source = fs.readFileSync(path.resolve(__dirname, '../js/whatsapp-integration.js'), 'utf8');

describe('WhatsAppIntegration (basic)', () => {
  let dom;
  let window;
  let fetchMock;

  beforeEach(() => {
    dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: 'outside-only' });
    window = dom.window;
    global.window = window;
    global.document = window.document;

  // minimal fetch mock (set BEFORE evaluating source so code uses it on load)
  fetchMock = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: false, qr: 'data:image/png;base64,TEST' }) }));
  global.fetch = fetchMock;
  // ensure fetch is available on window (JSDOM)
  window.fetch = fetchMock;

  // expose WA_SERVER_URL
  window.WA_SERVER_URL = 'http://localhost:3001';

  // evaluate the source in this window context
  // use window.eval to ensure the script runs synchronously in JSDOM
  window.eval(source);
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.fetch;
  });

  test('should create whatsapp global in browser', () => {
    expect(window.whatsapp).toBeDefined();
    expect(typeof window.whatsapp.checkStatus).toBe('function');
  });

  test('checkStatus should call fetch and return data', async () => {
    const status = await window.whatsapp.checkStatus();
    expect(fetchMock).toHaveBeenCalled();
    expect(status).toHaveProperty('qr');
  });

});
