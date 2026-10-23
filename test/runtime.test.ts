import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';
import { executeGateway, getAetherDocument } from '../src/adapters.js';

test('defaults to a local Jason OS shell with optional services disabled', () => {
  const config = loadConfig('/tmp/nonexistent-jason-app');
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.port, 3001);
  assert.equal(config.gatewayUrl, undefined);
  assert.equal(config.aetherUrl, undefined);
});

test('gateway execution fails closed when no gateway URL is configured', async () => {
  const result = await executeGateway(loadConfig('/tmp/nonexistent-jason-app'), { target: 'native/echo' });
  assert.equal(result.status, 503);
});

test('AetherState access requires both configuration and bearer authorization', async () => {
  const result = await getAetherDocument(loadConfig('/tmp/nonexistent-jason-app'), 'jason-default');
  assert.equal(result.status, 503);
});
