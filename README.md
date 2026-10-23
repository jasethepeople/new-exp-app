# Jason OS Integration Shell

This repository is the connection point for the Jason ecosystem. It tracks the source projects as Git submodules and provides a small, immediately runnable TypeScript shell around them.

## Connected repositories

- `vendor/jason-os` — primary privacy-first Jason OS workspace.
- `vendor/aetherstate-hardened` — hardened AetherState fork with RS256 document authorization and locked-down metrics.
- `vendor/integration-gateway` — modular HTTP integration gateway.
- `vendor/lispmind` — LispMind source, kept opt-in because it exposes a broad MCP surface and optional kernel/firmware tooling.
- `vendor/omni-intel-graphrag` — local code/text/security/media retrieval gateway.
- `vendor/local-agent-mesh` — approval-controlled local agent-run service.
- `vendor/molt-forge` — sandboxed repository investigation and evidence API.
- `vendor/molt-modules` and `vendor/molt-genesis` — signed-event/provenance tooling, tracked as CLI/library-only components.
- `vendor/context-synthesizer` — webhook-backed developer context deltas, graph state, and reverse-query API.
- `vendor/swarm-paas` — authenticated MCP endpoint for agent/app orchestration; requires an explicit Builder API key.

## Run immediately

```bash
git clone --recurse-submodules https://github.com/jasethepeople/new-exp-app.git
cd new-exp-app
npm install
npm start
```

The shell listens on `http://127.0.0.1:3001` by default. Check `GET /health` and `GET /api/status`.

## Optional connections

The shell does not silently start external services or privileged LispMind functionality. Configure a service URL only when that service has been separately started and secured:

```bash
INTEGRATION_GATEWAY_URL=http://127.0.0.1:3000 \
AETHERSTATE_URL=http://127.0.0.1:8080 \
GRAPHRAG_URL=http://127.0.0.1:8080 \
AGENT_MESH_URL=http://127.0.0.1:5000 \
MOLT_FORGE_URL=http://127.0.0.1:5000 \
npm start
```

- `POST /api/v1/execute` forwards to the integration gateway only when `INTEGRATION_GATEWAY_URL` is set.
- `GET /api/aether/docs/:docId` forwards only with both `AETHERSTATE_URL` and a Bearer token. The hardened service remains the authority for RS256 verification and document-level access.
- `POST /api/graphrag/query` forwards to Omni-Intel’s citation-grounded query API when `GRAPHRAG_URL` is set.
- `POST /api/mesh/runs` forwards to Local Agent Mesh’s approval-controlled run API when `AGENT_MESH_URL` is set.
- `POST /api/forge/jobs` forwards to MOLT Forge’s evidence-producing validation API when `MOLT_FORGE_URL` is set.
- `POST /api/context/query` forwards to Context Synthesizer’s reverse-query API when `CONTEXT_SYNTH_URL` is set.
- `POST /api/swarm/mcp` forwards JSON-RPC MCP calls to Swarm PaaS only when both `SWARM_PAAS_URL` and `SWARM_PAAS_API_KEY` are set.
- MOLT Modules and MOLT Genesis are tracked for signed provenance and bounded validation workflows, but are not treated as network services.
- LispMind is source-connected but not auto-started. Start its own MCP transport only after reviewing its policy and runtime requirements.

## Validation

```bash
npm run check
npm test
```

The upstream Jason OS repository currently has a root typecheck defect (`rootDir: ./src` conflicts with its `packages/*` workspace layout). This destination shell does not rewrite or hide that upstream issue; it provides a clean, independently checked integration boundary.

## Architecture

```text
Jason OS packages ─┐
AetherState (RS256) ├─ tracked submodules → Jason OS Integration Shell → optional gateway/Aether endpoints
LispMind (opt-in) ─┘
```
