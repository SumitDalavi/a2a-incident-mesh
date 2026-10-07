const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const AGENT_URLS = ['http://localhost:4001', 'http://localhost:4002'];
const agentRegistry = [];

async function discoverAgents() {
  agentRegistry.length = 0;
  for (const url of AGENT_URLS) {
    try {
      const res = await axios.get(`${url}/.well-known/agent-card.json`, { timeout: 2000 });
      const card = res.data;
      const capabilities = card.capabilities && card.capabilities.skills 
        ? card.capabilities.skills.map(s => s.name) 
        : [];
      agentRegistry.push({ url, card, capabilities });
      console.log(`Discovered ${card.name} at ${url}`);
    } catch (err) {
      console.warn(`Failed to discover agent at ${url}`);
    }
  }
}
discoverAgents();

app.post('/api/dispatch', async (req, res) => {
  const { incidentId, tasks } = req.body;
  
  if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: 'tasks array required' });

  const delegations = [];
  
  for (const taskType of tasks) {
    const capableAgent = agentRegistry.find(a => a.capabilities.includes(taskType));
    
    if (capableAgent) {
      try {
        const payload = {
          message: {
            messageId: require('crypto').randomUUID(),
            text: taskType,
            conversationId: incidentId,
            sender: { id: "coordinator", role: "USER" }
          }
        };
        const taskRes = await axios.post(`${capableAgent.url}/message:send`, payload, {
          headers: { 
            'Authorization': 'Bearer mesh-secret-token',
            'Content-Type': 'application/a2a+json',
            'A2A-Version': '1.0'
          }
        });
        
        const task = taskRes.data.task || taskRes.data;
        
        delegations.push({
          taskType,
          agentName: capableAgent.card.name,
          agentUrl: capableAgent.url,
          taskId: task.id,
          status: task.state || 'ACCEPTED'
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

app.get('/api/stream/:agentUrl/:taskId', async (req, res) => {
  const { agentUrl, taskId } = req.params;
  const decodedUrl = decodeURIComponent(agentUrl);
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const streamRes = await axios.get(`${decodedUrl}/tasks/${taskId}:subscribe`, {
      responseType: 'stream',
      headers: { 
        'Authorization': 'Bearer mesh-secret-token',
        'A2A-Version': '1.0'
      }
    });
    
    streamRes.data.pipe(res);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'Failed to connect to agent stream' })}\n\n`);
    res.end();
  }
});

app.listen(3000, () => console.log('Coordinator API running on port 3000'));
