import express from 'express';
const app = express();
app.use(express.json());

app.get('/.well-known/agent-card.json', (req, res) => {
  res.json({ name: 'Security Agent', version: '1.0.0', protocols: ['A2A/1.0'] });
});

app.post('/api/v1/tasks', (req, res) => {
  console.log('Security Agent received task:', req.body);
  res.json({ status: 'accepted', taskId: 'task-sec-1' });
});

app.listen(4002, () => console.log('Security Agent listening on port 4002'));
