import express from 'express';
const app = express();
app.use(express.json());

app.get('/.well-known/agent-card.json', (req, res) => {
  res.json({ name: 'SRE Agent', version: '1.0.0', protocols: ['A2A/1.0'] });
});

app.post('/api/v1/tasks', (req, res) => {
  console.log('SRE Agent received task:', req.body);
  res.json({ status: 'accepted', taskId: 'task-sre-1' });
});

app.listen(4001, () => console.log('SRE Agent listening on port 4001'));
