# A2A Incident Mesh

[![CI Pipeline](https://github.com/SumitDalavi/a2a-incident-mesh/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SumitDalavi/a2a-incident-mesh/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/SumitDalavi/a2a-incident-mesh?color=0969da&label=release&logo=github)](https://github.com/SumitDalavi/a2a-incident-mesh/releases)
[![Release Workflow](https://github.com/SumitDalavi/a2a-incident-mesh/actions/workflows/release.yml/badge.svg)](https://github.com/SumitDalavi/a2a-incident-mesh/actions/workflows/release.yml)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%202.3-blueviolet?logo=spdx)](https://github.com/SumitDalavi/a2a-incident-mesh/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Maturity:** Fully functional E2E Portfolio Project  
> Distributed via GitHub Container Registry (`ghcr.io/sumitdalavi/a2a-incident-mesh:v0.2.0`) and tagged GitHub Releases with Anchore SPDX 2.3 SBOM and SHA-256 digest attestation.

---

## The Problem
Modern distributed systems and AI agents require robust operational scaffolding. Simple CRUD apps or mock loops fail when subjected to real-world edge cases, asynchronous boundaries, and security constraints.

## The Solution
Three separately deployed agent services (different processes, ideally different frameworks) coordinate an incident via **Agent2Agent (A2A)**, not in-process function calls. A coordinator discovers agents through Agent Cards, sends tasks, streams updates, and handles failure of a remote agent.

---

## Key Capabilities & Architectural Highlights
- **Autonomous Delegation**: Central Incident Coordinator Agent delegating typed subtasks to specialized SRE and Security agents.
- **A2A Protocol Discovery**: Dynamic capability negotiation via official `/.well-known/agent-card.json` specifications.
- **Deadlock Avoidance**: Coordinator-only polling preventing infinite peer-to-peer agent message storms.
- **Full OCI Distribution**: Published to GitHub Container Registry (GHCR).

## 💻 Tech Stack
- **Container Registry:** `ghcr.io/sumitdalavi/a2a-incident-mesh:v0.2.0`
- **Security & Attestation:** Anchore SPDX 2.3 SBOM, SHA-256 Checksums
- **License:** MIT Open Source

---

## 📚 Documentation Index
- [Architecture Specification](docs/ARCHITECTURE.md) — System diagram, component contracts, and container distribution architecture.
- [Production Runbook](docs/RUNBOOK.md) — Operational runbook, live execution commands, and verification recipes.
- [Demo Walkthrough](docs/DEMO_SCRIPT.md) — Step-by-step interactive demonstration scenario.
- [Changelog](CHANGELOG.md) — Full version history following Keep a Changelog and SemVer.

---

## 🚀 Quickstart & Installation

### Option 1: Run with Docker Container (GHCR)
```bash
docker pull ghcr.io/sumitdalavi/a2a-incident-mesh:v0.2.0
docker run -d -p 3000:3000 -p 3001:3001 -p 3002:3002 ghcr.io/sumitdalavi/a2a-incident-mesh:v0.2.0
```

### Option 2: Run Multi-Agent Mesh Locally
```bash
npm install
npm run start:all
```

### Option 3: Local Developer Setup
```bash
# 1. Clone the repository
git clone https://github.com/SumitDalavi/a2a-incident-mesh.git
cd a2a-incident-mesh

# 2. Build and start
make setup
make dev
```

---

## 🎮 Usage & Demo
See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the interactive walkthrough and verification steps.

## Why this is not just "multi-agent"

> **Note on Simulated Capabilities:** The underlying SRE and Security tasks performed by the agents (e.g., telemetry queries, CVE scanning) are strictly **interoperability fixtures** designed to demonstrate the A2A protocol and coordination layer. They do not perform real-world CVE scanning or live production telemetry analysis in this demo.
Each agent is its own network service with its own Agent Card, tools, and failure behavior. The coordinator knows only what the cards advertise.

---

## ✅ Verification

### Operational Verification
| Check | Command | Expected |
|---|---|---|
| Build | `make setup` | Dependencies install successfully |
| Run | `make dev` | Services start without crashing |
| Test | `make test` | Behavioral test suite passes |

### Cryptographic & Supply Chain Verification
To verify the authentic origin, integrity, and software composition of release artifacts:
```bash
# 1. Download Release Bundle & Checksums
gh release download v0.2.0 --repo SumitDalavi/a2a-incident-mesh --pattern "*.tar.gz" --pattern "checksums.txt"

# 2. Verify SHA-256 Digest
sha256sum -c checksums.txt

# 3. Inspect SPDX 2.3 Software Bill of Materials
gh release download v0.2.0 --repo SumitDalavi/a2a-incident-mesh --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .spdxVersion
```

---

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

---

## October 2026 Update: Behavioral Testing & Runtime Stabilization

**Implementation Notes:**
Aligned agents with A2A SDK v1.0, implemented ClientFactory, corrected AgentEvent payloads, and built a behavioral streaming neutral-client for execution history validation.

* Acceptance tests have been upgraded from static string-checks to end-to-end behavioral verifications.
* API boundaries and execution layers (Docker, WebSockets, Temporal, etc.) are now explicitly exercised in tests.

## Maturity Claims
- **Implemented (Tested):** Task cancellation, event stream polling, proxy API routing, SDK interop.
- **Mocked:** The SRE telemetry and Security CVE checks are interoperability fixtures, not actual deep analysis.
- **Deferred:** Complete RBAC mesh policies.

---

## 👨‍💻 Author
**Sumit Dalavi** — Senior DevSecOps / Platform Engineer  
[GitHub](https://github.com/SumitDalavi) | [LinkedIn](https://in.linkedin.com/in/sumit-dalavi-762838129)

*Built with a focus on robust patterns, not toy demos.*
