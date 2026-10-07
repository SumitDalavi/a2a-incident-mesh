const { ClientFactory } = require('@a2a-js/sdk/client');
const { TaskState } = require('@a2a-js/sdk');

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
       console.log(`Task 1 state:`, state, JSON.stringify(status.payload));
       if (state === TaskState.TASK_STATE_COMPLETED) {
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



  // 1. Initialize task using sendMessageStream with returnImmediately
  const initStream = client.sendMessageStream({
    message: { messageId: reqId, text: 'analyze-telemetry' },
    configuration: { returnImmediately: true }
  }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });

  const firstResult = await initStream.next();
  if (firstResult.done) throw new Error("No initial task returned");
  
  const taskId2 = firstResult.value.payload?.value?.id || firstResult.value.payload?.value?.taskId;
  if (!taskId2) throw new Error("Could not extract taskId from initial stream chunk");
  
  console.log(`Task 2 initialized with taskId: ${taskId2}`);

  // 2. Wait a moment to ensure it's in working state inside the agent loop
  await new Promise(r => setTimeout(r, 1000));

  // 3. Cancel the task
  console.log(`Cancelling task ${taskId2}...`);
  await client.cancelTask({ id: taskId2 }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });

  let cancelledTask2 = false;
  let failedCancellation = false;

  // 4. Poll getTask to observe the CANCELED state
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    const taskResponse = await client.getTask({ id: taskId2 }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });
    const state = taskResponse.task?.status?.state ?? taskResponse.status?.state;
    console.log(`Polled Task 2 state: ${state}`);
    
    if (state === TaskState.TASK_STATE_CANCELED) {
      console.log("Task 2 explicitly canceled.");
      cancelledTask2 = true;
      break;
    } else if (state === TaskState.TASK_STATE_COMPLETED) {
      failedCancellation = true;
      break;
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
