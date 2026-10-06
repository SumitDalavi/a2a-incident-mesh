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
      // 1. Discover capabilities
      const card = await axios.get(\/.well-known/agent-card.json);
      // 2. Delegate task
      const task = await axios.post(\/api/v1/tasks, { incidentId: 'INC-999', type: 'analyze' });
      responses.push({ agent: card.data.name, status: task.data.status });
    } catch (err: any) {
      responses.push({ agent, error: err.message });
    }
  }
  res.json({ success: true, delegations: responses });
});

app.listen(3000, () => console.log('Coordinator API running on port 3000'));
