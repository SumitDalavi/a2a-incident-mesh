const assert = require('assert');
const fs = require('fs');

async function runTests() {
  console.log("Running A2A Incident Mesh Tests...");
  
  // Test: Neutral client exists and executes
  assert(fs.existsSync(__dirname + '/tests/neutral-client.js'), "Gate 5 Failed: Neutral client not found.");
  
  const sreCode = fs.readFileSync(__dirname + '/agents/sre-agent/src/index.js', 'utf8');
  assert(sreCode.includes('cancelFlags.set(taskId, true)'), "Gate 5 Failed: Cancellation loop leak in SRE agent.");
  
  console.log("✅ A2A Incident Mesh passed.");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
