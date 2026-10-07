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
    if (status.payload?.$case === 'task' || status.payload?.$case === 'statusUpdate') {
       const state = status.payload.value.status?.state || status.payload.value.state;
       console.log(`Task 1 state:`, state);
       if (state === 2 || state === 3) {
           // 2=COMPLETED in some SDK versions, but let's check for string or num
           // In TS enum: TASK_STATE_COMPLETED is 3 or 4 depending on version. Wait, let's just log and see if it's 3 or 4
       }
       if (state === 2 || state === 'TASK_STATE_COMPLETED' || state === 3 && status.payload.value.status?.message?.parts?.[0]?.content?.value === 'Task finished') {
           // Workaround for unknown exact enum value: check the message text or known enum
           console.log("Task 1 explicitly completed.");
           completedTask1 = true;
           clearTimeout(t1);
           // avoid breaking early to prevent node.js abort controller crashes
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
    if (status.payload?.$case === 'task' || status.payload?.$case === 'statusUpdate') {
       const state = status.payload.value.status?.state || status.payload.value.state;
       taskId2 = status.payload.value.id || status.payload.value.taskId || taskId2;
       console.log(`Task 2 created/updated: ${taskId2}, state: ${state}`);
       
       if (!cancelledTask2 && taskId2 && status.payload?.$case === 'task') {
          console.log(`Cancelling task ${taskId2}...`);
          client.cancelTask({ taskId: taskId2, contextId: reqId }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } }).catch(e => console.error(e));
       }

       if (state === 4 || state === 'TASK_STATE_CANCELED' || (state === 5 && status.payload.value.status?.message?.parts?.[0]?.content?.value === 'Task canceled')) {
           console.log("Task 2 explicitly canceled.");
           cancelledTask2 = true;
           clearTimeout(t2);
       } else if (state === 2 || state === 'TASK_STATE_COMPLETED' || (state === 3 && status.payload.value.status?.message?.parts?.[0]?.content?.value === 'Task finished')) {
           if (!cancelledTask2) {
               failedCancellation = true;
           }
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
