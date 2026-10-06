import express from 'express';
const app = express();
app.use(express.json());

app.get('/.well-known/agent-card.json', (req, res) => {
  res.json({ name: 'Security Agent', capabilities: ['check-cves', 'revoke-tokens'] });
});

app.post('/api/v1/tasks', (req, res) => {
  console.log([Security Agent] Received task for \);
  res.json({ status: 'Task accepted: Scanning for CVEs...' });
});

app.listen(4002, () => console.log('Security Agent on 4002'));
