const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Dynamic agent registry (in a real system, agents would register themselves via POST)
const AGENT_URLS = ['http://localhost:4001', 'http://localhost:4002'];
const agentRegistry = [];

async function discoverAgents() {
  agentRegistry.length = 0; // clear
  for (const url of AGENT_URLS) {
    try {
      const res = await axios.get(`${url}/.well-known/agent-card.json`, { timeout: 2000 });
      agentRegistry.push({ url, card: res.data });
      console.log(`Discovered ${res.data.name} at ${url}`);
    } catch (err) {
      console.warn(`Failed to discover agent at ${url}`);
    }
  }
}
discoverAgents(); // run on startup

// MSH-05: Coordinator API
app.post('/api/dispatch', async (req, res) => {
  const { incidentId, tasks } = req.body; // array of task types e.g. ['analyze-telemetry', 'check-cves']
  
  if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: 'tasks array required' });

  const delegations = [];
  
  for (const taskType of tasks) {
    // Capability negotiation: find an agent that can do this
    const capableAgent = agentRegistry.find(a => a.card.capabilities.includes(taskType));
    
    if (capableAgent) {
      try {
        const taskRes = await axios.post(`${capableAgent.url}/api/v1/tasks`, {
          incidentId, type: taskType, payload: {}
        }, {
          headers: { 'Authorization': 'Bearer mesh-secret-token' }
        });
        
        delegations.push({
          taskType,
          agentName: capableAgent.card.name,
          agentUrl: capableAgent.url,
          taskId: taskRes.data.taskId,
          status: taskRes.data.status
        });
      } catch (err) {
        delegations.push({ taskType, agentName: capableAgent.card.name, status: 'FAILED', error: err.message });
      }
    } else {
      delegations.push({ taskType, status: 'UNASSIGNED', error: 'No capable agent found' });
    }
  }
  
  res.json({ success: true, delegations });
});

app.get('/api/agents', (req, res) => {
  res.json(agentRegistry);
});

// SSE Proxy
app.get('/api/stream/:agentUrl/:taskId', async (req, res) => {
  const { agentUrl, taskId } = req.params;
  const decodedUrl = decodeURIComponent(agentUrl);
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const streamRes = await axios.get(`${decodedUrl}/api/v1/tasks/${taskId}/stream`, {
      responseType: 'stream',
      headers: { 'Authorization': 'Bearer mesh-secret-token' }
    });
    
    streamRes.data.pipe(res);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'Failed to connect to agent stream' })}\n\n`);
    res.end();
  }
});

app.listen(3000, () => console.log('Coordinator API running on port 3000'));
