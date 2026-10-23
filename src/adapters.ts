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
    sourcePresent: service.enabled,
    ...(service.url ? { probe: await probe(`${service.url}/health`) } : { probe: { ok: false, detail: 'not configured; opt-in URL required' } })
  })));
  return {
    ok: true,
    runtime: 'jason-os-exp-app',
    policy: { autoStart: ['jason-os-exp-app'], optInOnly: ['aetherstate-hardened', 'integration-gateway', 'lispmind'] },
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
