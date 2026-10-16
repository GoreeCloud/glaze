'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const {createPreviewServer} = require('../scripts/glaze_v171_preview_server.cjs');

test('preview server permits assets but rejects malformed and unsafe requests', async t => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'glaze-preview-'));
  const root = path.join(sandbox, 'repo');
  fs.mkdirSync(path.join(root, 'assets'), {recursive: true});
  fs.writeFileSync(path.join(root, 'assets', 'preview.css'), 'body{color:green}');
  fs.writeFileSync(path.join(root, 'VERSION'), 'not a preview asset');
  fs.writeFileSync(path.join(sandbox, 'outside.css'), 'private data');
  fs.symlinkSync(path.join(sandbox, 'outside.css'), path.join(root, 'assets', 'escape.css'));
  fs.symlinkSync(path.join(root, 'assets', 'preview.css'), path.join(root, 'assets', 'internal.css'));
  t.after(() => fs.rmSync(sandbox, {recursive: true, force: true}));

  const server = createPreviewServer(root);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const request = (url, method = 'GET') => new Promise((resolve, reject) => {
    const req = http.request({hostname: '127.0.0.1', port: server.address().port, path: url, method}, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString('utf8')}));
      response.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });

  const valid = await request('/assets/preview.css');
  assert.equal(valid.status, 200);
  assert.equal(valid.body, 'body{color:green}');
  assert.equal(valid.headers['x-content-type-options'], 'nosniff');
  assert.match(valid.headers['content-type'], /text\/css/);
  assert.equal((await request('/assets/internal.css')).status, 200);
  const head = await request('/assets/preview.css', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  for (const target of ['/VERSION', '/.git/config', '/assets/%2e%2e/VERSION', '/assets/escape.css']) {
    assert.equal((await request(target)).status, 403, target);
  }
  assert.equal((await request('/assets/absent.css')).status, 404);
  assert.equal((await request('/assets/%ZZ.css')).status, 400);
  assert.equal((await request('/assets/preview.css', 'POST')).status, 405);
  assert.equal((await request('/assets/preview.css')).status, 200, 'server stays available after rejected requests');
});

test('all browser audits use the shared local preview server', () => {
  const names = ['scenes_browser', 'typography', 'axe', 'performance', 'privacy_security'];
  for (const name of names) {
    const source=fs.readFileSync(path.join(__dirname,'..','scripts','qa_glaze_v171_'+name+'.cjs'),'utf8');
    assert.ok(source.includes("require('./glaze_v171_preview_server.cjs')"), name);
    assert.ok(source.includes('createPreviewServer(root)'), name);
  }
});
