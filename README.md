# Jason OS Integration Shell

This repository is the connection point for the Jason ecosystem. It tracks the source projects as Git submodules and provides a small, immediately runnable TypeScript shell around them.

## Connected repositories

- `vendor/jason-os` — primary privacy-first Jason OS workspace.
- `vendor/aetherstate-hardened` — hardened AetherState fork with RS256 document authorization and locked-down metrics.
- `vendor/integration-gateway` — modular HTTP integration gateway.
- `vendor/lispmind` — LispMind source, kept opt-in because it exposes a broad MCP surface and optional kernel/firmware tooling.

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
npm start
```

- `POST /api/v1/execute` forwards to the integration gateway only when `INTEGRATION_GATEWAY_URL` is set.
- `GET /api/aether/docs/:docId` forwards only with both `AETHERSTATE_URL` and a Bearer token. The hardened service remains the authority for RS256 verification and document-level access.
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
