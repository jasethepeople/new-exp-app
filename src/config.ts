import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ServiceConfig {
  name: string;
  repository: string;
  path: string;
  enabled: boolean;
  url?: string;
}

export interface AppConfig {
  host: string;
  port: number;
  gatewayUrl?: string;
  aetherUrl?: string;
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
  return {
    host: process.env.HOST?.trim() || '127.0.0.1',
    port: Number.parseInt(process.env.PORT || '3001', 10),
    ...(gatewayUrl ? { gatewayUrl } : {}),
    ...(aetherUrl ? { aetherUrl } : {}),
    aetherDocumentId: process.env.AETHER_DOCUMENT_ID?.trim() || 'jason-default',
    services: [
      { name: 'jason-os', repository: 'jasethepeople/jason-os', path: resolve(vendor, 'jason-os'), enabled: existsSync(resolve(vendor, 'jason-os')) },
      { name: 'lispmind', repository: 'jasethepeople/lispmind', path: resolve(vendor, 'lispmind'), enabled: existsSync(resolve(vendor, 'lispmind')) },
      { name: 'aetherstate-hardened', repository: 'jasethepeople/AetherState_v2-hardened', path: resolve(vendor, 'aetherstate-hardened'), enabled: Boolean(aetherUrl) && existsSync(resolve(vendor, 'aetherstate-hardened')), ...(aetherUrl ? { url: aetherUrl } : {}) },
      { name: 'integration-gateway', repository: 'jasethepeople/integration-gateway', path: resolve(vendor, 'integration-gateway'), enabled: Boolean(gatewayUrl) && existsSync(resolve(vendor, 'integration-gateway')), ...(gatewayUrl ? { url: gatewayUrl } : {}) }
    ]
  };
}
