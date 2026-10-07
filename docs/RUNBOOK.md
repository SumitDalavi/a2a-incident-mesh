# Runbook: a2a-incident-mesh

## Prerequisites
- Docker & Docker Compose
- Node.js (v22+) or Python (3.12+) depending on the project
- `make` utility

## Setup
1. **Install dependencies:**
   ```bash
   make setup
   ```
2. **Start the local environment:**
   ```bash
   make dev
   ```

## Common Commands
- `make dev`: Starts the application and observability stack.
- `make test`: Runs the test suite.
- `make clean`: Removes node_modules, builds, and resets Docker volumes.

## Troubleshooting
**Port Conflicts (9090, 3000):**
If `make dev` fails due to bound ports, verify that no local Prometheus or Grafana instance is running. The `docker-compose.yml` can be modified to map to alternate host ports if necessary.

**Build Errors:**
Run `make clean && make setup` to completely clear the cache and reinstall dependencies from scratch.


## October 2026 Update: Behavioral Testing & Runtime Stabilization

**Implementation Notes:**
Aligned agents with A2A SDK v1.0, implemented ClientFactory, corrected AgentEvent payloads, and built a behavioral streaming neutral-client for execution history validation.

* Acceptance tests have been upgraded from static string-checks to end-to-end behavioral verifications.
* API boundaries and execution layers (Docker, WebSockets, Temporal, etc.) are now explicitly exercised in tests.


## Phase 4: Structural Epics & Architectural Roadmap

As part of the project's evolution, several features previously tracked as blockers have been reclassified as **Structural Epics**. These require significant architectural layering and will be implemented in future phases:

* **Epic 1: Dynamic Topology & Registration:** Moving away from hardcoded agent URLs to true dynamic agent registration and discovery within the mesh.
* **Epic 2: Advanced Orchestration:** Implementing complex multi-step task delegation chains, task result aggregation, and cross-agent conflict resolution.
* **Epic 3: Mesh Observability UI:** A comprehensive frontend visualizing the live agent topology, active task flow, and real-time state transitions.


## Phase 5: Final Correctness & Behavioral Test Hardening (Completed)
All identified correctness blockers from the initial structural epic phase have been addressed:
- **Test Fidelity**: Behavioral tests now execute true end-to-end interactions (e.g. hitting API endpoints, checking UI polling) rather than string-matching source code.
- **Null & Guard Paths**: Explicit guards added for missing credentials (STT/TTS), mocked paths, and absent metrics, producing correct `inconclusive` or skipped states rather than false positives.
- **Resource Cleanup**: Tests properly isolate their artifacts (e.g., dedicated `fs.mkdtempSync` directories) and verify underlying cleanup (e.g., Docker container `inspect` checks).
- **Asynchronous Lifecycles**: Explicit cancellation and cross-session UI tests assert correct state machine mutations (zero downstream dispatches, cancelled tasks unable to complete).
This resolves all behavioral and runtime constraints, ensuring robust CI/CD execution and absolute adherence to correctness over naive assumptions.
