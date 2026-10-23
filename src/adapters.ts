import { existsSync } from 'node:fs';
import type { AppConfig } from './config.js';

export interface ProbeResult { ok: boolean; status?: number; detail?: string }

async function probe(url: string): Promise<ProbeResult> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return { ok: response.ok, status: response.status, detail: response.ok ? 'reachable' : `HTTP ${response.status}` };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : 'unreachable' };
  }
}

export async function getServiceStatus(config: AppConfig) {
  const external = await Promise.all(config.services.map(async (service) => ({
    name: service.name,
    repository: service.repository,
    sourcePresent: existsSync(service.path),
    configured: Boolean(service.url),
    ...(service.url ? { probe: await probe(`${service.url}${service.healthPath || '/health'}`) } : { probe: { ok: false, detail: 'not configured; opt-in URL required' } })
  })));
  return {
    ok: true,
    runtime: 'jason-os-exp-app',
    policy: { autoStart: ['jason-os-exp-app'], optInOnly: ['aetherstate-hardened', 'integration-gateway', 'omni-intel-graphrag', 'local-agent-mesh', 'molt-forge', 'lispmind'], toolOnly: ['molt-modules', 'molt-genesis'] },
    services: external
  };
}

export async function executeGateway(config: AppConfig, body: unknown, authorization?: string) {
  if (!config.gatewayUrl) return { status: 503, body: { ok: false, error: 'INTEGRATION_GATEWAY_URL is not configured' } };
  try {
    const response = await fetch(`${config.gatewayUrl}/api/v1/execute`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(authorization ? { authorization } : {}) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000)
    });
    return { status: response.status, body: await response.json() };
  } catch (error) {
    return { status: 502, body: { ok: false, error: error instanceof Error ? error.message : 'gateway unavailable' } };
  }
}

export async function getAetherDocument(config: AppConfig, docId: string, authorization?: string) {
  if (!config.aetherUrl) return { status: 503, body: { ok: false, error: 'AETHERSTATE_URL is not configured' } };
  if (!authorization) return { status: 401, body: { ok: false, error: 'Bearer authorization is required' } };
  try {
    const response = await fetch(`${config.aetherUrl}/docs/${encodeURIComponent(docId)}`, {
      headers: { authorization }, signal: AbortSignal.timeout(5_000)
    });
    return { status: response.status, body: await response.json() };
  } catch (error) {
    return { status: 502, body: { ok: false, error: error instanceof Error ? error.message : 'AetherState unavailable' } };
  }
}

async function postJson(url: string, body: unknown, authorization?: string, timeout = 10_000, extraHeaders: Record<string, string> = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...extraHeaders, ...(authorization ? { authorization } : {}) },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeout)
  });
  return { status: response.status, body: await response.json() };
}

export async function queryGraphRag(config: AppConfig, body: unknown, authorization?: string) {
  if (!config.graphRagUrl) return { status: 503, body: { ok: false, error: 'GRAPHRAG_URL is not configured' } };
  try {
    return await postJson(`${config.graphRagUrl}/api/v1/query`, body, authorization);
  } catch (error) {
    return { status: 502, body: { ok: false, error: error instanceof Error ? error.message : 'GraphRAG unavailable' } };
  }
}

export async function createAgentMeshRun(config: AppConfig, body: unknown, authorization?: string) {
  if (!config.agentMeshUrl) return { status: 503, body: { ok: false, error: 'AGENT_MESH_URL is not configured' } };
  try {
    return await postJson(`${config.agentMeshUrl}/api/mesh/runs`, body, authorization);
  } catch (error) {
    return { status: 502, body: { ok: false, error: error instanceof Error ? error.message : 'Local Agent Mesh unavailable' } };
  }
}

export async function createMoltForgeJob(config: AppConfig, body: unknown, authorization?: string) {
  if (!config.moltForgeUrl) return { status: 503, body: { ok: false, error: 'MOLT_FORGE_URL is not configured' } };
  try {
    return await postJson(`${config.moltForgeUrl}/api/jobs`, body, authorization);
  } catch (error) {
    return { status: 502, body: { ok: false, error: error instanceof Error ? error.message : 'MOLT Forge unavailable' } };
  }
}

export async function queryContextSynthesizer(config: AppConfig, body: unknown, authorization?: string) {
  if (!config.contextSynthUrl) return { status: 503, body: { ok: false, error: 'CONTEXT_SYNTH_URL is not configured' } };
  try {
    return await postJson(`${config.contextSynthUrl}/api/delta/query`, body, authorization);
  } catch (error) {
    return { status: 502, body: { ok: false, error: error instanceof Error ? error.message : 'Context Synthesizer unavailable' } };
  }
}

export async function callSwarmPaaSMcp(config: AppConfig, body: unknown) {
  if (!config.swarmPaasUrl || !config.swarmPaasApiKey) return { status: 503, body: { ok: false, error: 'SWARM_PAAS_URL and SWARM_PAAS_API_KEY are required' } };
  try {
    return await postJson(`${config.swarmPaasUrl}/api/mcp`, body, undefined, 20_000, { 'x-builder-api-key': config.swarmPaasApiKey });
  } catch (error) {
    return { status: 502, body: { ok: false, error: error instanceof Error ? error.message : 'Swarm PaaS unavailable' } };
  }
}
