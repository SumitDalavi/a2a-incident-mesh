# A2A Incident Mesh

[![CI Pipeline](https://github.com/SumitDalavi/a2a-incident-mesh/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SumitDalavi/a2a-incident-mesh/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/SumitDalavi/a2a-incident-mesh?color=0969da&label=release&logo=github)](https://github.com/SumitDalavi/a2a-incident-mesh/releases)
[![Release Workflow](https://github.com/SumitDalavi/a2a-incident-mesh/actions/workflows/release.yml/badge.svg)](https://github.com/SumitDalavi/a2a-incident-mesh/actions/workflows/release.yml)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%202.3-blueviolet?logo=spdx)](https://github.com/SumitDalavi/a2a-incident-mesh/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Agent-to-Agent communication mesh enabling collaborative multi-agent incident response with structured message contracts, coordinator polling, and distributed deadlock avoidance.

---

## Key Capabilities & Architectural Highlights
- **Central**: Incident Coordinator Agent delegating typed subtasks to specialized SRE and Security agents
- **Dynamic**: capability negotiation via official `/.well-known/agent-card.json` specifications
- **Coordinator-only**: polling preventing infinite peer-to-peer agent message storms and deadlocks
- **Full**: OCI container distribution via GitHub Container Registry (GHCR)

## Technology Stack
- **Languages & Frameworks:** TypeScript, Node.js 22, @a2a-js/sdk, Typed JSON-RPC, Docker
- **Container Registry:** `ghcr.io/sumitdalavi/a2a-incident-mesh:v0.2.0`
- **License:** MIT Open Source

---

## Documentation Index
- [Architecture Specification](docs/ARCHITECTURE.md) — Detailed system diagrams, state machines, and design contracts.
- [Production Runbook](docs/RUNBOOK.md) — Deployment instructions, configuration options, and operations.
- [Demo Script & Walkthrough](docs/DEMO_SCRIPT.md) — Step-by-step verification scenario.
- [Changelog](CHANGELOG.md) — Full release notes and version history.

---

## Quickstart & Installation

### Option 1: Run with Docker Container (GHCR)
```bash
docker pull ghcr.io/sumitdalavi/a2a-incident-mesh:v0.2.0
npm run start:all
```

### Option 3: Local Developer Setup
```bash
git clone https://github.com/SumitDalavi/a2a-incident-mesh.git
cd a2a-incident-mesh
make setup
make test
```

---

## Release & Security Verification

This repository adheres to the Portfolio Release Standard with verifiable supply-chain security attestations:

- **Distribution Archive:** `a2a-incident-mesh-v0.2.0.tar.gz`
- **SHA-256 Digest:** `0184125ab6e1fbd6727444c3b9ed7b7faff69fdb3e4f22619629ceba55ca76eb`
- **Software Bill of Materials (SBOM):** Anchore SPDX 2.3 JSON specification (`sbom.spdx.json`).

### Verification Commands
```bash
# 1. Download Release Bundle & Checksums
gh release download v0.2.0 --repo SumitDalavi/a2a-incident-mesh --pattern "*.tar.gz" --pattern "checksums.txt"

# 2. Verify Cryptographic Integrity
sha256sum -c checksums.txt

# 3. Inspect SPDX SBOM
gh release download v0.2.0 --repo SumitDalavi/a2a-incident-mesh --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .spdxVersion
```

---

## License
MIT License. Copyright (c) 2026 Sumit Dalavi.
