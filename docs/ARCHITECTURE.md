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
