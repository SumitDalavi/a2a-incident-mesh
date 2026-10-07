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

  console.log('Sending task...');
  const stream = client.sendMessageStream({
    message: { messageId: require('crypto').randomUUID(), text: 'analyze-telemetry' }
  }, { serviceParameters: { Authorization: 'Bearer mesh-secret-token' } });

  let taskId = null;
  let didComplete = false;
  
  setTimeout(() => { if (!didComplete) { console.error("Timeout!"); process.exit(1); } }, 10000);
  
  for await (const status of stream) {
    if (status.payload?.$case === 'task') {
       taskId = status.payload.value.id;
       console.log(`Task created with ID: ${taskId}`);
       
       if (status.payload.value.history && status.payload.value.history.length > 2) {
           console.log("Task completed successfully with history updates.");
           didComplete = true;
           break;
       }
    }
  }

  if (!didComplete) throw new Error("Stream ended without completion.");
}

run().then(() => {
  console.log("✅ Neutral client execution passed!");
  process.exit(0);
}).catch(err => {
  console.error("❌ Neutral client execution failed:", err);
  process.exit(1);
});
