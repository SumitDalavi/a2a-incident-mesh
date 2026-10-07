import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());

const AGENTS = ['http://localhost:4001', 'http://localhost:4002'];

app.post('/api/dispatch', async (req, res) => {
  const responses = [];
  for (const agent of AGENTS) {
    try {
      const card = await axios.get(\/.well-known/agent-card.json);
      // MSH-03: Negotiation
      if (card.data.capabilities.includes('analyze-telemetry') || card.data.capabilities.includes('check-cves')) {
        const task = await axios.post(\/api/v1/tasks, { incidentId: 'INC-999', type: 'analyze' });
        responses.push({ agent: card.data.name, status: task.data.status });
      } else {
        responses.push({ agent: card.data.name, status: 'Ignored: No matching capabilities' });
      }
    } catch (err: any) {
      responses.push({ agent, error: err.message });
    }
  }
  res.json({ success: true, delegations: responses });
});

app.listen(3000, () => console.log('Coordinator API running on port 3000'));
