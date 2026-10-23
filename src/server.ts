import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { loadConfig } from './config.js';
import { callSwarmPaaSMcp, createAgentMeshRun, createMoltForgeJob, executeGateway, getAetherDocument, getServiceStatus, queryContextSynthesizer, queryGraphRag } from './adapters.js';

const config = loadConfig();

function json(res: ServerResponse, status: number, value: unknown) {
  const data = JSON.stringify(value);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(data) });
  res.end(data);
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'jason-os-exp-app' });
    if (req.method === 'GET' && url.pathname === '/api/status') return json(res, 200, await getServiceStatus(config));
    if (req.method === 'POST' && url.pathname === '/api/v1/execute') {
      const result = await executeGateway(config, await readBody(req), req.headers.authorization);
      return json(res, result.status, result.body);
    }
    if (req.method === 'POST' && url.pathname === '/api/graphrag/query') {
      const result = await queryGraphRag(config, await readBody(req), req.headers.authorization);
      return json(res, result.status, result.body);
    }
    if (req.method === 'POST' && url.pathname === '/api/mesh/runs') {
      const result = await createAgentMeshRun(config, await readBody(req), req.headers.authorization);
      return json(res, result.status, result.body);
    }
    if (req.method === 'POST' && url.pathname === '/api/forge/jobs') {
      const result = await createMoltForgeJob(config, await readBody(req), req.headers.authorization);
      return json(res, result.status, result.body);
    }
    if (req.method === 'POST' && url.pathname === '/api/context/query') {
      const result = await queryContextSynthesizer(config, await readBody(req), req.headers.authorization);
      return json(res, result.status, result.body);
    }
    if (req.method === 'POST' && url.pathname === '/api/swarm/mcp') {
      const result = await callSwarmPaaSMcp(config, await readBody(req));
      return json(res, result.status, result.body);
    }
    const docMatch = url.pathname.match(/^\/api\/aether\/docs\/([^/]+)$/);
    if (req.method === 'GET' && docMatch) {
      const result = await getAetherDocument(config, decodeURIComponent(docMatch[1] || ''), req.headers.authorization);
      return json(res, result.status, result.body);
    }
    return json(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    return json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'Bad request' });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Jason OS integration shell listening at http://${config.host}:${config.port}`);
  console.log('Optional services remain opt-in; see /api/status for connection state.');
});

function shutdown() { server.close(() => process.exit(0)); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
