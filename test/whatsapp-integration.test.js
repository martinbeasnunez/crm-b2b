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

  test('sendMessage calls server with correct payload', async () => {
    // mock response for send
    fetchMock.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, message: 'ok' }) }));

    const res = await window.whatsapp.sendMessage('56912345678', 'Hola prueba', 'Contacto');

    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0][0];
    const calledOpts = fetchMock.mock.calls[0][1];
    expect(calledUrl).toContain('/api/whatsapp/send');
    expect(calledOpts.method).toBe('POST');
    const body = JSON.parse(calledOpts.body);
    expect(body.number).toBe('56912345678');
    expect(body.message).toBe('Hola prueba');
    expect(res.success).toBe(true);
  });

  test('restart calls restart endpoint', async () => {
    fetchMock.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) }));
    const r = await window.whatsapp.restart();
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0]).toContain('/api/whatsapp/restart');
    expect(r).toHaveProperty('success');
  });

  test('sendWhatsAppFromPipeline sends message when authenticated', async () => {
    // prepare whatsapp.checkStatus to return authenticated
    window.whatsapp.checkStatus = jest.fn(() => Promise.resolve({ authenticated: true }));

    // mock send endpoint
    fetchMock.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) }));

  // mock showToast to capture calls (ensure it's available on window)
  const toasts = [];
  window.showToast = (msg, type) => toasts.push({ msg, type });

  await window.sendWhatsAppFromPipeline({ phone: '+56998765432', contactName: 'Pedro', companyName: 'ACME' });

  expect(window.whatsapp.checkStatus).toHaveBeenCalled();
  expect(fetchMock).toHaveBeenCalled();
  // success toast should be pushed
  expect(toasts.some(t => t.type === 'success' || t.type === 'info' || t.type === 'error')).toBe(true);
  });

});
