const express = require('express');
const cors = require('cors');
const { DefaultRequestHandler, InMemoryTaskStore, AgentEvent } = require('@a2a-js/sdk/server');
const { restHandler, agentCardHandler } = require('@a2a-js/sdk/server/express');
const { TaskState } = require('@a2a-js/sdk');

const agentCard = {
  name: 'SRE-Agent',
  version: '1.0.0',
  description: 'Specializes in telemetry analysis and system recovery.',
  supportedInterfaces: [
    { protocolVersion: "1.0", protocolBinding: "HTTP+JSON", url: "http://localhost:4001" }
  ],
  skills: [
    { name: 'analyze-telemetry', description: 'Analyze telemetry' },
    { name: 'restart-service', description: 'Restart service' },
    { name: 'query-logs', description: 'Query logs' }
  ]
};

const taskStore = new InMemoryTaskStore();
const cancelFlags = new Map();
const contextIds = new Map();

const executor = {
  async execute(requestContext, eventBus) {
    console.log("eventBus methods:", Object.keys(eventBus));
    const taskId = requestContext.taskId || 'sre-task-' + Date.now();
    const type = requestContext.task?.type || requestContext.message?.text || 'analyze-telemetry';
    const cId = requestContext.contextId || require('crypto').randomUUID();
    contextIds.set(taskId, cId);
    contextIds.set(cId, taskId); // Reverse mapping
    
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
      "Querying Prometheus for error rates...",
      "Found 80% error spike on Checkout service.",
      "Correlating with Tempo traces...",
      "Traces indicate cascade failure from Payments.",
      "Analysis complete. Recommendation: Reset Payments service."
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 1000));
      if (cancelFlags.get(taskId)) {
        console.log(`Task ${taskId} execution loop halted due to cancellation.`);
        return;
      }
      eventBus.publish(AgentEvent.statusUpdate({
        taskId,
        contextId: cId,
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
        contextId: cId,
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
  
  async cancelTask(taskIdInput, eventBus) {
    let id = typeof taskIdInput === 'object' ? taskIdInput.taskId : taskIdInput;
    let cId = typeof taskIdInput === 'object' ? taskIdInput.contextId : '';
    
    // If the input string was actually a contextId, find the real taskId
    if (!cId && id && contextIds.get(id) && contextIds.get(contextIds.get(id)) === id) {
       // id is a real taskId, cId is contextIds.get(id)
       cId = contextIds.get(id);
    } else if (!cId && id) {
       // id might be a contextId
       const possibleTaskId = contextIds.get(id);
       if (possibleTaskId) {
         cId = id;
         id = possibleTaskId;
       }
    }
    cancelFlags.set(id, true);
    
    // We must manually update the taskStore so DefaultRequestHandler doesn't overwrite it to COMPLETED
    try {
      const task = await taskStore.load(id, { headers: new Headers() });
      if (task) {
         task.status = { state: 5 /* TASK_STATE_CANCELED */ };
         await taskStore.save(task, { headers: new Headers() });
      }
    } catch(e) {
      console.error("Could not update taskStore on cancel", e);
    }

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
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

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
