const { Client } = require('@a2a-js/sdk/client');

async function run() {
  const agentUrl = process.env.AGENT_URL || 'http://localhost:4001';
  console.log(`Discovering agent at ${agentUrl}...`);
  
  const client = new Client({
    url: agentUrl,
    auth: { type: 'bearer', token: 'mesh-secret-token' }
  });

  const card = await client.discover();
  console.log('Discovered Card:', card.name);

  console.log('Sending task...');
  const task = await client.createTask({
    type: 'analyze-telemetry',
    parameters: { service: 'checkout' }
  });

  console.log(`Task created with ID: ${task.id}`);
  
  let streamCount = 0;
  const stream = client.streamTaskStatus(task.id);
  
  stream.on('data', async (status) => {
    console.log(`[Stream] State: ${status.state}, Desc: ${status.description}`);
    streamCount++;
    if (streamCount === 2) {
      console.log('Canceling task halfway...');
      await client.cancelTask(task.id);
    }
  });

  stream.on('end', () => {
    console.log('Stream ended.');
  });
}

run().catch(console.error);
