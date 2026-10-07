const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Bearer mesh-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const agentCard = {
  name: 'Security-Agent',
  version: '1.0.0',
  description: 'Specializes in CVE scanning and vulnerability assessment.',
  capabilities: ['check-cves', 'scan-secrets'],
  endpoints: {
    tasks: '/api/v1/tasks'
  }
};

app.get('/.well-known/agent-card.json', (req, res) => {
  res.json(agentCard);
});

const tasks = {};

app.post('/api/v1/tasks', checkAuth, (req, res) => {
  const { incidentId, type, payload } = req.body;
  const taskId = 'sec-task-' + Date.now();
  
  if (!agentCard.capabilities.includes(type)) {
    return res.status(400).json({ error: 'Unsupported capability' });
  }

  tasks[taskId] = { status: 'ACCEPTED', type, payload, logs: [] };
  
  setTimeout(() => processTask(taskId), 100);
  res.json({ taskId, status: 'ACCEPTED' });
});

function processTask(taskId) {
  const task = tasks[taskId];
  task.status = 'IN_PROGRESS';
  
  const steps = [
    "Downloading SBOM for affected images...",
    "Scanning against Trivy vulnerability database...",
    "No critical CVEs found in running container.",
    "Scanning environment variables for leaked secrets...",
    "Assessment complete. System secure."
  ];

  let step = 0;
  const interval = setInterval(() => {
    if (step < steps.length) {
      task.logs.push(steps[step]);
      step++;
    } else {
      clearInterval(interval);
      task.status = 'COMPLETED';
    }
  }, 1200);
}

app.get('/api/v1/tasks/:id/stream', checkAuth, (req, res) => {
  const taskId = req.params.id;
  const task = tasks[taskId];
  if (!task) return res.status(404).json({ error: 'Not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let lastLogIndex = 0;
  const interval = setInterval(() => {
    while (lastLogIndex < task.logs.length) {
      res.write(`data: ${JSON.stringify({ status: task.status, log: task.logs[lastLogIndex] })}\n\n`);
      lastLogIndex++;
    }
    if (task.status === 'COMPLETED' || task.status === 'FAILED') {
      res.write(`data: ${JSON.stringify({ status: task.status, log: 'Task finished' })}\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, 500);

  req.on('close', () => clearInterval(interval));
});

app.listen(4002, () => console.log('Security Agent running on port 4002'));
