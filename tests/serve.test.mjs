import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequestHandler } from '../scripts/serve.mjs';

async function request(url, { preview = false, method = 'GET', headers = {} } = {}) {
  const result = { status: 0, headers: {}, body: undefined };
  await createRequestHandler({ preview })({ url, method, headers }, {
    writeHead(status, headers) { result.status = status; result.headers = headers; },
    end(body) { result.body = body; },
  });
  return result;
}

test('development serves the page with local reload and the correct contact', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  assert.match(response.headers['Content-Type'], /text\/html/);
  assert.match(response.body.toString(), /new EventSource/);
  assert.match(response.body.toString(), /wa\.me\/5551996257816/);
});

test('production serves the built page without development injection', async () => {
  const response = await request('/', { preview: true });
  assert.equal(response.status, 200);
  assert.doesNotMatch(response.body.toString(), /new EventSource/);
});

test('all page assets and in-page anchors resolve in development and production', async () => {
  for (const preview of [false, true]) {
    const { body, status } = await request('/', { preview });
    assert.equal(status, 200);
    const html = body.toString();
    const urls = new Set([...html.matchAll(/(?:src|href|poster)="\.\/([^"?#]+)"/g)].map((match) => `/${match[1]}`));
    assert.ok(urls.size >= 10);
    for (const url of urls) {
      const response = await request(url, { preview });
      assert.equal(response.status, 200, `${preview ? 'production' : 'development'}: ${url}`);
      assert.ok(response.body.length > 0, url);
    }
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
    for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(anchor), `Missing target ${anchor}`);
  }
});

test('private files, traversal attempts and unknown URLs cannot be served', async () => {
  for (const url of ['/originals/thiago-original.png', '/package.json', '/.git/config', '/src/%2e%2e/package.json', '/images/%00.webp', '/images/%2e%2e/%2e%2e/package.json', '/missing-page', '/images/missing.webp']) {
    assert.equal((await request(url)).status, 404, url);
  }
});

test('malformed URL is rejected and non-read methods are not supported', async () => {
  assert.equal((await request('/%ZZ')).status, 400);
  assert.equal((await request('/', { method: 'POST' })).status, 405);
});

test('HEAD returns the image headers and no body', async () => {
  const response = await request('/images/thiago-crono.webp', { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.equal(response.headers['Content-Type'], 'image/webp');
  assert.ok(response.headers['Content-Length'] > 0);
  assert.equal(response.body, undefined);
});

test('videos support seeking with byte ranges in development and production', async () => {
  for (const preview of [false, true]) {
    const whole = await request('/video/criacao-digital-scroll.mp4', { preview });
    assert.equal(whole.status, 200);
    assert.equal(whole.headers['Content-Type'], 'video/mp4');
    assert.equal(whole.headers['Accept-Ranges'], 'bytes');
    const size = whole.body.length;
    for (const [range, start, end] of [['bytes=0-1', 0, 1], ['bytes=20-39', 20, 39], ['bytes=-10', size - 10, size - 1], [`bytes=${size - 5}-`, size - 5, size - 1]]) {
      const part = await request('/video/criacao-digital-scroll.mp4', { preview, headers: { range } });
      assert.equal(part.status, 206);
      assert.equal(part.headers['Content-Range'], `bytes ${start}-${end}/${size}`);
      assert.deepEqual(part.body, whole.body.subarray(start, end + 1));
    }
    const head = await request('/video/projetos-scroll.mp4', { preview, method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(head.headers['Accept-Ranges'], 'bytes');
    assert.equal(head.body, undefined);
  }
});

test('invalid and unsatisfiable video ranges are rejected', async () => {
  for (const range of ['bytes=999999999-', 'bytes=9-2', 'bytes=-0', 'bytes=-', 'bytes=0-1,4-5', 'bytes=no']) {
    const response = await request('/video/criacao-digital-scroll.mp4', { headers: { range } });
    assert.equal(response.status, 416, range);
    assert.match(response.headers['Content-Range'], /^bytes \*\/\d+$/);
  }
});
