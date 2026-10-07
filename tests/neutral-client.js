const { ClientFactory } = require('@a2a-js/sdk/client');

async function run() {
  const agentUrl = process.env.AGENT_URL || 'http://localhost:4001';
  console.log(`Discovering agent at ${agentUrl}...`);
  
  const factory = new ClientFactory();
  const client = await factory.createFromUrl(agentUrl, undefined, {
    serviceParameters: { Authorization: 'Bearer mesh-secret-token' }
  });

  const card = client.agentCard;
  console.log('Discovered Card:', card.name);

  console.log('Sending task for completion...');
  const stream1 = client.sendMessageStream({
    message: { messageId: require('crypto').randomUUID(), text: 'analyze-telemetry' }
  }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });

  let completedTask1 = false;
  
  const t1 = setTimeout(() => { if (!completedTask1) { console.error("Timeout on Task 1"); process.exit(1); } }, 10000);
  
  for await (const status of stream1) {
    if (status.payload?.$case === 'task') {
       console.log(`Task 1 state:`, status.payload.value.status?.state);
       if (status.payload.value.status?.state === 2) { // TASK_STATE_COMPLETED
           console.log("Task 1 explicitly completed.");
           completedTask1 = true;
           clearTimeout(t1);
           break;
       }
    }
  }

  if (!completedTask1) throw new Error("Stream 1 ended without explicit completed status.");

  console.log('Sending task for cancellation...');
  const reqId = require('crypto').randomUUID();
  const stream2 = client.sendMessageStream({
    message: { messageId: reqId, text: 'analyze-telemetry' }
  }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });

  let taskId2 = null;
  let cancelledTask2 = false;
  let failedCancellation = false;

  const t2 = setTimeout(() => { if (!cancelledTask2) { console.error("Timeout on Task 2"); process.exit(1); } }, 10000);

  for await (const status of stream2) {
    if (status.payload?.$case === 'task') {
       taskId2 = status.payload.value.id;
       console.log(`Task 2 created: ${taskId2}, state: ${status.payload.value.status?.state}`);
       
       if (!cancelledTask2 && taskId2) {
          console.log(`Cancelling task ${taskId2}...`);
          client.cancelTask({ taskId: taskId2, contextId: reqId }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } }).catch(e => console.error(e));
       }

       if (status.payload.value.status?.state === 4) { // TASK_STATE_CANCELED
           console.log("Task 2 explicitly canceled.");
           cancelledTask2 = true;
           clearTimeout(t2);
           break;
       } else if (status.payload.value.status?.state === 2) { // TASK_STATE_COMPLETED
           failedCancellation = true;
           break;
       }
    }
  }

  if (failedCancellation) throw new Error("Canceled task subsequently reported completed status.");
  if (!cancelledTask2) throw new Error("Stream 2 ended without explicit canceled status.");
}

run().then(() => {
  console.log("✅ Neutral client execution passed!");
  process.exit(0);
}).catch(err => {
  console.error("❌ Neutral client execution failed:", err);
  process.exit(1);
});
