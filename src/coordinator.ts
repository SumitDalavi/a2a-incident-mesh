import axios from 'axios';

async function runCoordinator() {
  console.log('Coordinator discovering agents...');
  
  // Dummy SSRF-safe discovery block
  const agents = ['http://localhost:4001', 'http://localhost:4002'];
  
  for (const agent of agents) {
    try {
      const res = await axios.get(\/.well-known/agent-card.json);
      console.log(Discovered agent: \);
      // Send task
      await axios.post(\/api/v1/tasks, { task: 'analyze-telemetry', incidentId: 'INC-123' });
    } catch (err: any) {
      console.error(Failed to reach agent \: \);
    }
  }
}
runCoordinator();
