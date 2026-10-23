# Validation report

Validated on 2026-10-23 from the tracked repository revisions.

| Component | Result | Notes |
|---|---|---|
| Destination integration shell | PASS | `npm run check`, `npm test`, live `GET /health`, live `GET /api/status`, and fail-closed gateway proxy verified. |
| `AetherState_v2-hardened` | PASS | `npm run typecheck`; Jest: 5 suites, 29 tests passed. |
| `jason-os` upstream workspace | BLOCKED upstream | Root `tsconfig.json` sets `rootDir: ./src` while the workspace sources are under `packages/*`; root `pnpm typecheck` reports TS6059 for the packages. |
| `integration-gateway` | PARTIAL | `tsc --noEmit` passes. Its tests run but 12 assertions fail because the checked-in repository has no `registry/` tree even though its README/tests expect the generated component mirror. |
| `lispmind` | NOT auto-started | Source is tracked, but it exposes a broad MCP surface and optional kernel/firmware tooling. It remains opt-in pending an explicit runtime/policy decision. |
| `omni-intel-graphrag` | CONNECTED | HTTP query contract verified from source; optional `GRAPHRAG_URL` proxy added. |
| `Local-Agent-Mesh2` | CONNECTED | HTTP health and approval-controlled run routes verified from source; optional `AGENT_MESH_URL` proxy added. |
| `molt-forge` | CONNECTED | Flask job/evidence API verified from source; optional `MOLT_FORGE_URL` proxy added. |
| `molt-modules` / `molt-genesis` | TRACKED TOOLING | Rust signed-event/provenance tools tracked as CLI/library components; no live network listener is claimed. |
| `Context-Synthesizer` | CONNECTED | Express API exposes `/api/healthz`, webhook ingestion, context delta, graph, and reverse-query routes; optional `CONTEXT_SYNTH_URL` proxy added. |
| `swarm-paas` | CONNECTED | Authenticated `/api/mcp` JSON-RPC endpoint exposes app/orchestration tools; optional `SWARM_PAAS_URL` + `SWARM_PAAS_API_KEY` proxy added. |
| `osint-threat-intel-dashboard` | REVIEWED, NOT CONNECTED | Useful intelligence dashboard, but its operational API is admin-authenticated tRPC backed by its own database and scheduled jobs; no clean standalone Jason adapter was present. |
| `orchestrator-2026` | REVIEWED, NOT CONNECTED | README and source identify an early partial scaffold with hardcoded chat/collaboration stubs. |
| `loom-os` | REVIEWED, NOT CONNECTED | Substantial Rust/WASM runtime, but CLI/IPC integration rather than an HTTP service; requires a separate native runtime adapter. |
| `agent-swarm-paas`, `prismforge-builder` | REVIEWED, NOT CONNECTED | Generated app-builder variants with overlapping authenticated registry/MCP surfaces; `swarm-paas` was selected as the most complete canonical candidate to avoid duplicate product shells. |

The destination shell intentionally does not hide or rewrite upstream defects. It starts independently with no external services, and optional forwarding only activates when explicit service URLs and, for AetherState document access, a Bearer token are supplied.
