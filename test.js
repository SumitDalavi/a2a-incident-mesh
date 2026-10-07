const { spawn } = require('child_process');

async function runTests() {
  console.log("Starting A2A Mesh stack...");
  const sreProcess = spawn('node', ['agents/sre-agent/src/index.js'], { shell: true, stdio: 'inherit' });
  const secProcess = spawn('node', ['agents/sec-agent/src/index.js'], { shell: true });
  const coordProcess = spawn('npx', ['ts-node', 'coordinator/src/index.ts'], { shell: true });

  // Give services 3 seconds to spin up
  await new Promise(r => setTimeout(r, 3000));
  console.log("Running Behavioral Tests for A2A Incident Mesh...");

  const neutralClient = spawn('node', ['tests/neutral-client.js'], { stdio: 'inherit', shell: true });
  
  neutralClient.on('exit', (code) => {
     sreProcess.kill();
     secProcess.kill();
     coordProcess.kill();
     if (code !== 0) {
        console.error(`❌ Test Failed: Neutral client exited with code ${code}`);
        process.exit(1);
     } else {
        console.log("✅ A2A Incident Mesh passed behavioral tests.");
        process.exit(0);
     }
  });
}

runTests();
