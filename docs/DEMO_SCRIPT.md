# Demo Script

> **Note on Simulated Capabilities:** The underlying SRE and Security tasks performed by the agents (e.g., telemetry queries, CVE scanning) are strictly **interoperability fixtures** designed to demonstrate the A2A protocol and coordination layer. They do not perform real-world CVE scanning or live production telemetry analysis in this demo.

1. **Start the Stack**: Run `make dev` in the root. This starts the Coordinator (3000), SRE Agent (4001), and Security Agent (4002).
2. **Open UI**: Open `ui/public/index.html` in your browser.
3. **Dispatch Incident**: Click "Simulate Incident (Dispatch Tasks)".
4. **Observe Negotiation**: The Coordinator will query the agent cards, determine the SRE agent handles telemetry and the Security agent handles CVEs, and dispatch the tasks simultaneously.
5. **Live Streaming**: Watch the terminal output in the UI as both agents stream their progressive reasoning steps (SSE) back to the Coordinator in real-time until they reach `COMPLETED`.
6. **Cancellation & Proxy Polling**: If a task is canceled, the Coordinator proxy explicitly signals the agent context to terminate, halting all downstream execution and streaming immediately.
