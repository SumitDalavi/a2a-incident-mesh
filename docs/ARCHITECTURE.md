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
