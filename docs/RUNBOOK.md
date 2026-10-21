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


## Phase 5.1 Update: Task Cancellation & State Synchronization
- **State Synchronization**: Fixed critical race conditions in SDK state synchronization where cancelled tasks were subsequently reported as completed.
- **Terminal State Propagation**: Implemented accurate `TASK_STATE_CANCELED` terminal state propagation via direct TaskStore manipulation to prevent executor overwrites.
- **Test Fidelity**: Converted flaky stream-based cancellation tests into deterministic polling mechanisms for rigorous terminal state verification.

## Phase 6: Deep Routing & Proxy Isolation (Final Validation)
- **Isolated API Polling**: Closed the API contract gap by ensuring UI task polling routes exclusively through the central Coordinator proxy (`/api/tasks/:agent/:taskId`), rather than directly striking individual agents and breaking the mesh boundary.
- **Strict Context Routing**: Refactored the ambiguous bidirectional ID map into explicit `taskIdToContextId` and `contextIdToTaskId` data structures within the agents. This ensures cancellations accurately target and terminate the correct underlying execution contexts without bleeding state or leaking resources.


## Production Operations & Release Runbook (v0.2.0 Update)

### 1. Production Container Invocation (GHCR)
```bash
# Pull production image:
docker pull ghcr.io/sumitdalavi/a2a-incident-mesh:v0.2.0

# Run mesh coordinator and agent workers:
docker run -d \
  --name a2a-incident-mesh \
  -p 3000:3000 -p 3001:3001 -p 3002:3002 \
  ghcr.io/sumitdalavi/a2a-incident-mesh:v0.2.0

# Query dynamic agent topology:
curl http://localhost:3000/api/mesh/topology
```

### 2. A2A Protocol Agent Discovery & Task Dispatch
```bash
# Inspect agent capability card:
curl http://localhost:3001/.well-known/agent-card.json

# Dispatch structured collaborative task to mesh:
curl -X POST http://localhost:3000/api/mesh/dispatch \
  -H "Content-Type: application/json" \
  -d '{
    "incidentId": "INC-8821",
    "subtasks": [
      {"target": "sre-agent", "action": "analyze_cpu_throttling", "service": "payment-api"},
      {"target": "sec-agent", "action": "inspect_egress_traffic", "namespace": "prod"}
    ]
  }'
```

### 3. Release Integrity & Verification Runbook
To verify the authentic origin and file integrity of release packages:
```bash
# Download distribution package and checksums:
gh release download v0.2.0 --repo SumitDalavi/a2a-incident-mesh --pattern "*.tar.gz" --pattern "checksums.txt"

# Assert cryptographic match:
sha256sum -c checksums.txt

# Inspect SPDX 2.3 Software Bill of Materials:
gh release download v0.2.0 --repo SumitDalavi/a2a-incident-mesh --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .packages[0].name
```

### 4. Operational Failure Modes & Troubleshooting
- **Port Collisions:** If the host port is in use, remap using `-p <ALTERNATIVE_PORT>:<CONTAINER_PORT>`.
- **Docker Daemon Permissions:** For tools requiring container orchestrator control (`agent-sandbox-platform`), ensure `/var/run/docker.sock` has read/write permissions for the runner user.
- **GHCR Pull Authentication:** If pulling from GHCR encounters rate limits or private scope:
  ```bash
  echo "$GITHUB_TOKEN" | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin
  ```
