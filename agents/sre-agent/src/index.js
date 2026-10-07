const express = require('express');
const cors = require('cors');
const { DefaultRequestHandler, InMemoryTaskStore } = require('@a2a-js/sdk/server');
const { restHandler, agentCardHandler } = require('@a2a-js/sdk/server/express');
const { TaskState } = require('@a2a-js/sdk');

const agentCard = {
  name: 'SRE-Agent',
  version: '1.0.0',
  description: 'Specializes in telemetry analysis and system recovery.',
  supportedInterfaces: [
    { protocolVersion: "1.0", protocolBinding: "HTTP+JSON", url: "http://localhost:4001" }
  ],
  capabilities: {
    skills: [
      { name: 'analyze-telemetry', description: 'Analyze telemetry' },
      { name: 'restart-service', description: 'Restart service' },
      { name: 'query-logs', description: 'Query logs' }
    ]
  }
};

const taskStore = new InMemoryTaskStore();

const executor = {
  async execute(requestContext, eventBus) {
    const taskId = requestContext.taskId || 'sre-task-' + Date.now();
    const type = requestContext.task?.type || requestContext.message?.text || 'analyze-telemetry';
    
    eventBus.publishTask({
      id: taskId,
      state: TaskState.TASK_STATE_WORKING,
      metadata: { type }
    });

    const steps = [
      "Querying Prometheus for error rates...",
      "Found 80% error spike on Checkout service.",
      "Correlating with Tempo traces...",
      "Traces indicate cascade failure from Payments.",
      "Analysis complete. Recommendation: Reset Payments service."
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 1000));
      eventBus.publishTaskStatus({
        taskId,
        state: TaskState.TASK_STATE_WORKING,
        description: step
      });
    }

    eventBus.publishTaskStatus({
      taskId,
      state: TaskState.TASK_STATE_COMPLETED,
      description: 'Task finished'
    });
  },
  
  async cancelTask(taskId, eventBus) {
    eventBus.publishTaskStatus({
      taskId,
      state: TaskState.TASK_STATE_CANCELED,
      description: 'Task canceled'
    });
  }
};

const handler = new DefaultRequestHandler(
  agentCard,
  taskStore,
  executor
);

const app = express();
app.use(express.json({ type: ['application/json', 'application/a2a+json'] }));
app.use(cors());

app.use((req, res, next) => {
  if (req.path === '/.well-known/agent-card.json') return next();
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Bearer mesh-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.use('/.well-known/agent-card.json', agentCardHandler({ agentCardProvider: handler }));
app.use(restHandler({ 
  requestHandler: handler,
  userBuilder: (req) => { return { id: 'coordinator', role: 1 }; } 
}));

app.listen(4001, () => console.log('SRE Agent running on port 4001'));
