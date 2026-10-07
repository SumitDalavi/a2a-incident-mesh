import express from 'express';
import cors from 'cors';
import { Client } from '@a2a-js/sdk/client';

const app = express();
app.use(cors());
app.use(express.json());

// Dynamic Agent Registry
const agentRegistry = new Map<string, { url: string, card: any }>();

app.post('/api/agents/register', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  try {
    const client = new Client({ url, auth: { type: 'bearer', token: 'mesh-secret-token' } });
    const card = await client.discover();
    agentRegistry.set(url, { url, card });
    console.log(`Registered agent: ${card.name} at ${url}`);
    res.json({ success: true, agent: card.name });
  } catch (err: any) {
    res.status(500).json({ error: 'Discovery failed', details: err.message });
  }
});

app.get('/api/agents', (req, res) => {
  res.json(Array.from(agentRegistry.values()));
});

app.post('/api/dispatch', async (req, res) => {
  const { tasks } = req.body;
  const delegations = [];
  
  // Task result aggregation & conflict resolution (basic)
  for (const taskReq of tasks || ['analyze-telemetry', 'check-cves']) {
    let handled = false;
    for (const [url, agent] of agentRegistry.entries()) {
      const hasSkill = agent.card.skills?.some((s: any) => s.name === taskReq);
      if (hasSkill) {
        try {
          const client = new Client({ url, auth: { type: 'bearer', token: 'mesh-secret-token' } });
          const task = await client.createTask({ type: taskReq, parameters: {} });
          delegations.push({ taskReq, agent: agent.card.name, taskId: task.id, status: 'dispatched' });
          handled = true;
          break; // Multi-step delegation implies passing the baton, here we dispatch appropriately.
        } catch (err: any) {
          delegations.push({ taskReq, agent: agent.card.name, error: err.message });
        }
      }
    }
    if (!handled) delegations.push({ taskReq, status: 'ignored', reason: 'No matching capabilities found in registry' });
  }
  
  res.json({ success: true, delegations });
});

app.listen(3000, () => console.log('Coordinator API running on port 3000'));
