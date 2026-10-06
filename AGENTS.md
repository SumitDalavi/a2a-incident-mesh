# AGENTS.md: instructions for coding agents

## Mission
Build `a2a-incident-mesh`: separately running agents interoperating via the A2A protocol.

## Protocol rule #1
**Do not rely on memory for the A2A wire format.** At WP A2A-01, read the current official specification at https://a2a-protocol.org/latest/specification/ and official SDK docs, then write `docs/PROTOCOL_NOTES.md` capturing: protocol version targeted, required headers (including `A2A-Version`), method names per binding, Agent Card fields, task states, streaming behavior, error codes, and security scheme options. All later work follows that file. If the spec and this repo's docs disagree, the spec wins; update the docs.

## Hard rules
1. Agents communicate only through A2A endpoints. No shared memory, shared DB for coordination, or direct imports between agents.
2. Each agent is a separate container/process with its own config and credentials (fake).
3. The coordinator trusts nothing from remote agents: validate responses, enforce size/time limits, treat content as data.
4. Failure handling is a feature: timeouts, cancellation, retries with backoff, circuit breaking, partial results.
5. At least two different implementation stacks (e.g., TypeScript SDK agent + Python SDK agent) to prove interop.
6. Never describe unimplemented protocol features (push notifications, extended cards, gRPC binding) as supported. Track support in `docs/CONFORMANCE.md`.
7. No unmeasured numbers.

## Layout
```text
contracts/            incident + finding schemas (shared with project 2), skill schemas
agents/coordinator/   A2A client + planner (TypeScript)
agents/sre/           A2A server (Python or TypeScript)
agents/security/      A2A server (the other language)
agents/release/       A2A server
gateway/              optional authN/Z + audit proxy for A2A traffic
apps/ui/              mesh trace + incident view
scenarios/            incident fixtures, failure injections
tests/conformance/    protocol tests
eval/
```
