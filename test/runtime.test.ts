import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';
import { callSwarmPaaSMcp, createAgentMeshRun, createMoltForgeJob, executeGateway, getAetherDocument, queryContextSynthesizer, queryGraphRag } from '../src/adapters.js';

test('defaults to a local Jason OS shell with optional services disabled', () => {
  const config = loadConfig('/tmp/nonexistent-jason-app');
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.port, 3001);
  assert.equal(config.gatewayUrl, undefined);
  assert.equal(config.aetherUrl, undefined);
  assert.equal(config.graphRagUrl, undefined);
  assert.equal(config.agentMeshUrl, undefined);
  assert.equal(config.moltForgeUrl, undefined);
  assert.equal(config.contextSynthUrl, undefined);
  assert.equal(config.swarmPaasUrl, undefined);
});

test('gateway execution fails closed when no gateway URL is configured', async () => {
  const result = await executeGateway(loadConfig('/tmp/nonexistent-jason-app'), { target: 'native/echo' });
  assert.equal(result.status, 503);
});

test('AetherState access requires both configuration and bearer authorization', async () => {
  const result = await getAetherDocument(loadConfig('/tmp/nonexistent-jason-app'), 'jason-default');
  assert.equal(result.status, 503);
});

test('new optional services fail closed when not configured', async () => {
  const config = loadConfig('/tmp/nonexistent-jason-app');
  assert.equal((await queryGraphRag(config, { query: 'status' })).status, 503);
  assert.equal((await createAgentMeshRun(config, { objective: 'status' })).status, 503);
  assert.equal((await createMoltForgeJob(config, { repo_url: 'https://github.com/example/repo' })).status, 503);
  assert.equal((await queryContextSynthesizer(config, { query: 'status' })).status, 503);
  assert.equal((await callSwarmPaaSMcp(config, { jsonrpc: '2.0', id: 1, method: 'initialize' })).status, 503);
});
