# a2a-incident-mesh

> **Maturity:** Fully functional E2E Portfolio Project
> Independent SRE, security, and release agents that discover each other's capabilities, delegate work over the A2A protocol, and keep working when a remote agent disappears.

## The Problem
Modern distributed systems and AI agents require robust operational scaffolding. Simple CRUD apps or mock loops fail when subjected to real-world edge cases, asynchronous boundaries, and security constraints.

## The Solution
Three separately deployed agent services (different processes, ideally different frameworks) coordinate an incident via **Agent2Agent (A2A)**, not in-process function calls. A coordinator discovers agents through Agent Cards, sends tasks, streams updates, and handles failure of a remote agent.

## 💻 Tech Stack
- **Core Technology**: TypeScript, Node.js, Docker
- **Architecture**: Microservices, Event-Driven

## 📚 Documentation
- [Architecture](docs/ARCHITECTURE.md) — System diagram and component details
- [Runbook](docs/RUNBOOK.md) — Setup, commands, and expected outputs
- [Demo](docs/DEMO_SCRIPT.md) — Walkthrough scenario

## 🚀 Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/SumitDalavi/a2a-incident-mesh.git
cd a2a-incident-mesh

# 2. Build and start
make setup
make dev
```

## 💻 Usage & Demo
See the [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the interactive walkthrough and verification steps.

## ✅ Verification

| Check | Command | Expected |
|-------|---------|----------|
| Build | `make setup` | Dependencies install successfully |
| Run | `make dev` | Services start without crashing |

## Capability Status
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
> **Note on Simulated Capabilities:** The underlying SRE and Security tasks performed by the agents (e.g., telemetry queries, CVE scanning) are strictly **interoperability fixtures** designed to demonstrate the A2A protocol and coordination layer. They do not perform real-world CVE scanning or live production telemetry analysis in this demo.
Each agent is its own network service with its own Agent Card, tools, and failure behavior. The coordinator knows only what the cards advertise.

## 👨‍💻 Author
**Sumit Dalavi** — Senior DevSecOps / Platform Engineer
[GitHub](https://github.com/SumitDalavi) | [LinkedIn](https://in.linkedin.com/in/sumit-dalavi-762838129)

---
*Built with a focus on robust patterns, not toy demos.*


## October 2026 Update: Behavioral Testing & Runtime Stabilization

**Implementation Notes:**
Aligned agents with A2A SDK v1.0, implemented ClientFactory, corrected AgentEvent payloads, and built a behavioral streaming neutral-client for execution history validation.

* Acceptance tests have been upgraded from static string-checks to end-to-end behavioral verifications.
* API boundaries and execution layers (Docker, WebSockets, Temporal, etc.) are now explicitly exercised in tests.

## Maturity Claims
- **Implemented (Tested):** Task cancellation, event stream polling, proxy API routing, SDK interop.
- **Mocked:** The SRE telemetry and Security CVE checks are interoperability fixtures, not actual deep analysis.
- **Deferred:** Complete RBAC mesh policies.