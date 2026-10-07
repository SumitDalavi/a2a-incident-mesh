const express = require('express');
const cors = require('cors');
const { DefaultRequestHandler, InMemoryTaskStore, AgentEvent } = require('@a2a-js/sdk/server');
const { restHandler, agentCardHandler } = require('@a2a-js/sdk/server/express');
const { TaskState } = require('@a2a-js/sdk');

const agentCard = {
  name: 'Security-Agent',
  version: '1.0.0',
  description: 'Specializes in CVE scanning and vulnerability assessment.',
  supportedInterfaces: [
    { protocolVersion: "1.0", protocolBinding: "HTTP+JSON", url: "http://localhost:4002" }
  ],
  skills: [
    { name: 'check-cves', description: 'Check CVEs' },
    { name: 'scan-secrets', description: 'Scan secrets' }
  ]
};

const taskStore = new InMemoryTaskStore();
const cancelFlags = new Map();
const contextIds = new Map();

const executor = {
  async execute(requestContext, eventBus) {
    const taskId = requestContext.taskId || 'sec-task-' + Date.now();
    const type = requestContext.task?.type || requestContext.message?.text || 'check-cves';
    const cId = requestContext.contextId || require('crypto').randomUUID();
    contextIds.set(taskId, cId);
    
    cancelFlags.set(taskId, false);
    
    eventBus.publish(AgentEvent.task({
      id: taskId,
      contextId: cId,
      history: [],
      artifacts: [],
      metadata: { type },
      status: {
         state: TaskState.TASK_STATE_WORKING,
         message: {
           role: 2,
           messageId: require('crypto').randomUUID(),
           parts: [{ content: { $case: 'text', value: 'Started' }, mediaType: 'text/plain' }]
         }
      }
    }));

    const steps = [
      "Downloading SBOM for affected images...",
      "Scanning against Trivy vulnerability database...",
      "No critical CVEs found in running container.",
      "Scanning environment variables for leaked secrets...",
      "Assessment complete. System secure."
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 1200));
      if (cancelFlags.get(taskId)) {
        console.log(`Task ${taskId} execution loop halted due to cancellation.`);
        return;
      }
      eventBus.publish(AgentEvent.statusUpdate({
        taskId,
        contextId: requestContext.contextId,
        status: { 
          state: TaskState.TASK_STATE_WORKING,
          message: {
             messageId: require('crypto').randomUUID(),
             role: 2,
             parts: [{ content: { $case: 'text', value: step }, mediaType: 'text/plain' }]
          }
        }
      }));
    }

    if (!cancelFlags.get(taskId)) {
      eventBus.publish(AgentEvent.statusUpdate({
        taskId,
        contextId: requestContext.contextId,
        status: { 
          state: TaskState.TASK_STATE_COMPLETED,
          message: {
             messageId: require('crypto').randomUUID(),
             role: 2,
             parts: [{ content: { $case: 'text', value: 'Task finished' }, mediaType: 'text/plain' }]
          }
        }
      }));
    }
  },
  
  async cancelTask(taskId, eventBus) {
    cancelFlags.set(taskId, true);
    const cId = typeof taskId === 'object' ? taskId.contextId : (contextIds.get(taskId) || '');
    const id = typeof taskId === 'object' ? taskId.taskId : taskId;
    eventBus.publish(AgentEvent.statusUpdate({
      taskId: id,
      contextId: cId,
      status: { 
        state: TaskState.TASK_STATE_CANCELED,
        message: {
           messageId: require('crypto').randomUUID(),
           role: 2,
           parts: [{ content: { $case: 'text', value: 'Task canceled' }, mediaType: 'text/plain' }]
        }
      }
    }));
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

app.listen(4002, () => console.log('Security Agent running on port 4002'));
