const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Auth middleware
const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Bearer mesh-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const agentCard = {
  name: 'SRE-Agent',
  version: '1.0.0',
  description: 'Specializes in telemetry analysis and system recovery.',
  capabilities: ['analyze-telemetry', 'restart-service', 'query-logs'],
  endpoints: {
    tasks: '/api/v1/tasks'
  }
};

app.get('/.well-known/agent-card.json', (req, res) => {
  res.json(agentCard);
});

// In-memory task tracking
const tasks = {};

app.post('/api/v1/tasks', checkAuth, (req, res) => {
  const { incidentId, type, payload } = req.body;
  const taskId = 'sre-task-' + Date.now();
  
  if (!agentCard.capabilities.includes(type)) {
    return res.status(400).json({ error: 'Unsupported capability' });
  }

  tasks[taskId] = { status: 'ACCEPTED', type, payload, logs: [] };
  
  // Start async work
  setTimeout(() => processTask(taskId), 100);

  res.json({ taskId, status: 'ACCEPTED' });
});

function processTask(taskId) {
  const task = tasks[taskId];
  task.status = 'IN_PROGRESS';
  
  const steps = [
    "Querying Prometheus for error rates...",
    "Found 80% error spike on Checkout service.",
    "Correlating with Tempo traces...",
    "Traces indicate cascade failure from Payments.",
    "Analysis complete. Recommendation: Reset Payments service."
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
  }, 1000);
}

// SSE endpoint
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

app.listen(4001, () => console.log('SRE Agent running on port 4001'));
