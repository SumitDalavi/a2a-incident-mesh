import express from 'express';
const app = express();
app.use(express.json());

app.get('/.well-known/agent-card.json', (req, res) => {
  res.json({ name: 'SRE Agent', capabilities: ['analyze-telemetry', 'restart-services'] });
});

app.post('/api/v1/tasks', (req, res) => {
  console.log([SRE Agent] Received task for \);
  res.json({ status: 'Task accepted: Analyzing telemetry...' });
});

app.listen(4001, () => console.log('SRE Agent on 4001'));
