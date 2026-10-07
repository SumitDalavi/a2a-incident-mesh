# a2a-incident-mesh

> Independent SRE, security, and release agents that discover each other's capabilities, delegate work over the A2A protocol, and keep working when a remote agent disappears.

Three separately deployed agent services (different processes, ideally different frameworks) coordinate an incident via **Agent2Agent (A2A)**, not in-process function calls. A coordinator discovers agents through Agent Cards, sends tasks, streams updates, and handles failure of a remote agent.

**Status: Fully functional E2E Portfolio Project.**

## Capability status

| Capability | Status |
|---|---|
| Agent Cards served at `/.well-known/agent-card.json` | Implemented |
| SRE agent (telemetry analysis) as A2A server | Implemented |
| Security agent (vuln/secret/exposure assessment) as A2A server | Implemented |
| Release agent (deploy history, rollback options) as A2A server | Implemented |
| Coordinator as A2A client with discovery + delegation | Implemented |
| Streaming task updates | Implemented |
| Remote-agent failure handling (timeout, retry, fallback, partial result) | Implemented |
| Cross-framework interop (two different implementations) | Implemented |
| Auth between agents | Implemented |
| Protocol conformance tests | Implemented |
| Mesh trace view in UI | Implemented |

## Why this is not just "multi-agent"
Each agent is its own network service with its own Agent Card, tools, and failure behavior. The coordinator knows only what the cards advertise.

## Docs
[Architecture](docs/ARCHITECTURE.md) | [Demo](docs/DEMO_SCRIPT.md)

