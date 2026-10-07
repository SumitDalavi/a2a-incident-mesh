import express from 'express';
import cors from 'cors';
import { ClientFactory } from '@a2a-js/sdk/client';

const app = express();
app.use(cors());
app.use(express.json());

// Dynamic Agent Registry
const agentRegistry = new Map<string, { url: string, card: any }>();

app.post('/api/agents/register', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Bearer mesh-secret-token') {
    return res.status(401).json({ error: 'Unauthorized to register agents' });
  }
  
  if (!url.startsWith('http://localhost:')) {
    return res.status(400).json({ error: 'Invalid agent URL destination' });
  }
  
  try {
    const factory = new ClientFactory();
    const client = await factory.createFromUrl(url, undefined, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });
    const card = client.agentCard;
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
          const factory = new ClientFactory();
          const client = await factory.createFromUrl(url, undefined, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });
          const taskStream = client.sendMessageStream({ message: { messageId: require('crypto').randomUUID(), text: taskReq } }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });
          
          let taskId = 'unknown';
          for await (const event of taskStream) {
             if (event.payload?.$case === 'task') {
                 taskId = event.payload.value.id;
                 break;
             }
          }
          delegations.push({ taskReq, agent: agent.card.name, taskId, status: 'dispatched' });
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
