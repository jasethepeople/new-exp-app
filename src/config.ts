import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ServiceConfig {
  name: string;
  repository: string;
  path: string;
  enabled: boolean;
  url?: string;
  healthPath?: string;
}

export interface AppConfig {
  host: string;
  port: number;
  gatewayUrl?: string;
  aetherUrl?: string;
  graphRagUrl?: string;
  agentMeshUrl?: string;
  moltForgeUrl?: string;
  contextSynthUrl?: string;
  swarmPaasUrl?: string;
  swarmPaasApiKey?: string;
  aetherDocumentId: string;
  services: ServiceConfig[];
}

function optionalUrl(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value.replace(/\/$/, '') : undefined;
}

export function loadConfig(root = process.cwd()): AppConfig {
  const vendor = resolve(root, 'vendor');
  const gatewayUrl = optionalUrl('INTEGRATION_GATEWAY_URL');
  const aetherUrl = optionalUrl('AETHERSTATE_URL');
  const graphRagUrl = optionalUrl('GRAPHRAG_URL');
  const agentMeshUrl = optionalUrl('AGENT_MESH_URL');
  const moltForgeUrl = optionalUrl('MOLT_FORGE_URL');
  const contextSynthUrl = optionalUrl('CONTEXT_SYNTH_URL');
  const swarmPaasUrl = optionalUrl('SWARM_PAAS_URL');
  const swarmPaasApiKey = process.env.SWARM_PAAS_API_KEY?.trim() || undefined;
  return {
    host: process.env.HOST?.trim() || '127.0.0.1',
    port: Number.parseInt(process.env.PORT || '3001', 10),
    ...(gatewayUrl ? { gatewayUrl } : {}),
    ...(aetherUrl ? { aetherUrl } : {}),
    ...(graphRagUrl ? { graphRagUrl } : {}),
    ...(agentMeshUrl ? { agentMeshUrl } : {}),
    ...(moltForgeUrl ? { moltForgeUrl } : {}),
    ...(contextSynthUrl ? { contextSynthUrl } : {}),
    ...(swarmPaasUrl ? { swarmPaasUrl } : {}),
    ...(swarmPaasApiKey ? { swarmPaasApiKey } : {}),
    aetherDocumentId: process.env.AETHER_DOCUMENT_ID?.trim() || 'jason-default',
    services: [
      { name: 'jason-os', repository: 'jasethepeople/jason-os', path: resolve(vendor, 'jason-os'), enabled: existsSync(resolve(vendor, 'jason-os')) },
      { name: 'lispmind', repository: 'jasethepeople/lispmind', path: resolve(vendor, 'lispmind'), enabled: existsSync(resolve(vendor, 'lispmind')) },
      { name: 'aetherstate-hardened', repository: 'jasethepeople/AetherState_v2-hardened', path: resolve(vendor, 'aetherstate-hardened'), enabled: Boolean(aetherUrl) && existsSync(resolve(vendor, 'aetherstate-hardened')), ...(aetherUrl ? { url: aetherUrl } : {}) },
      { name: 'integration-gateway', repository: 'jasethepeople/integration-gateway', path: resolve(vendor, 'integration-gateway'), enabled: Boolean(gatewayUrl) && existsSync(resolve(vendor, 'integration-gateway')), ...(gatewayUrl ? { url: gatewayUrl } : {}) },
      { name: 'omni-intel-graphrag', repository: 'jasethepeople/omni-intel-graphrag', path: resolve(vendor, 'omni-intel-graphrag'), enabled: Boolean(graphRagUrl) && existsSync(resolve(vendor, 'omni-intel-graphrag')), healthPath: '/health', ...(graphRagUrl ? { url: graphRagUrl } : {}) },
      { name: 'local-agent-mesh', repository: 'jasethepeople/Local-Agent-Mesh2', path: resolve(vendor, 'local-agent-mesh'), enabled: Boolean(agentMeshUrl) && existsSync(resolve(vendor, 'local-agent-mesh')), healthPath: '/api/healthz', ...(agentMeshUrl ? { url: agentMeshUrl } : {}) },
      { name: 'molt-forge', repository: 'jasethepeople/molt-forge', path: resolve(vendor, 'molt-forge'), enabled: Boolean(moltForgeUrl) && existsSync(resolve(vendor, 'molt-forge')), healthPath: '/', ...(moltForgeUrl ? { url: moltForgeUrl } : {}) },
      { name: 'context-synthesizer', repository: 'jasethepeople/Context-Synthesizer', path: resolve(vendor, 'context-synthesizer'), enabled: Boolean(contextSynthUrl) && existsSync(resolve(vendor, 'context-synthesizer')), healthPath: '/api/healthz', ...(contextSynthUrl ? { url: contextSynthUrl } : {}) },
      { name: 'swarm-paas', repository: 'jasethepeople/swarm-paas', path: resolve(vendor, 'swarm-paas'), enabled: Boolean(swarmPaasUrl && swarmPaasApiKey) && existsSync(resolve(vendor, 'swarm-paas')), healthPath: '/', ...(swarmPaasUrl ? { url: swarmPaasUrl } : {}) },
      { name: 'molt-modules', repository: 'jasethepeople/molt-modules', path: resolve(vendor, 'molt-modules'), enabled: existsSync(resolve(vendor, 'molt-modules')) },
      { name: 'molt-genesis', repository: 'jasethepeople/molt-genesis', path: resolve(vendor, 'molt-genesis'), enabled: existsSync(resolve(vendor, 'molt-genesis')) }
    ]
  };
}
