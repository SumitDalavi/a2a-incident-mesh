# Architecture: A2A Incident Mesh (MSH)

## Overview
The A2A Incident Mesh is a distributed system where multiple specialized, autonomous agents negotiate capabilities and share workloads during incident response.

## Components
1. **Central Coordinator**:
   - Acts as the mesh router.
   - Dynamically discovers agents by pulling their `/.well-known/agent-card.json`.
   - Delegates tasks based on the required capability (e.g., `analyze-telemetry` vs `check-cves`).
   - Proxies SSE streams from agents back to the UI.
2. **Specialized Agents**:
   - `SRE-Agent`: Specialized in metrics and traces.
   - `Security-Agent`: Specialized in CVEs and secrets.
   - Both use Bearer token auth and expose Server-Sent Events (SSE) for real-time task status.
3. **Topology UI**:
   - Visualizes the mesh node graph.
   - Subscribes to multiple concurrent SSE streams when a multi-task incident is dispatched.


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
