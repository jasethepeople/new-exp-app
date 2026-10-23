# Validation report

Validated on 2026-10-23 from the tracked repository revisions.

| Component | Result | Notes |
|---|---|---|
| Destination integration shell | PASS | `npm run check`, `npm test`, live `GET /health`, live `GET /api/status`, and fail-closed gateway proxy verified. |
| `AetherState_v2-hardened` | PASS | `npm run typecheck`; Jest: 5 suites, 29 tests passed. |
| `jason-os` upstream workspace | BLOCKED upstream | Root `tsconfig.json` sets `rootDir: ./src` while the workspace sources are under `packages/*`; root `pnpm typecheck` reports TS6059 for the packages. |
| `integration-gateway` | PARTIAL | `tsc --noEmit` passes. Its tests run but 12 assertions fail because the checked-in repository has no `registry/` tree even though its README/tests expect the generated component mirror. |
| `lispmind` | NOT auto-started | Source is tracked, but it exposes a broad MCP surface and optional kernel/firmware tooling. It remains opt-in pending an explicit runtime/policy decision. |

The destination shell intentionally does not hide or rewrite upstream defects. It starts independently with no external services, and optional forwarding only activates when explicit service URLs and, for AetherState document access, a Bearer token are supplied.
