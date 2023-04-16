import cluster from 'cluster';
import path from 'path';
//import os from 'os';

console.log(`Primary PID is ${process.pid}`);
cluster.setupPrimary({ exec: path.join(__dirname, 'index.js') });


// Only use 8, leave 4 cpu for testing tool like k6 or wrk
const cpuCount = 8;
for (let i = 0; i < cpuCount; i++) {
  cluster.fork();
}

cluster.on('exit', (worker) => {
  console.log(`Worker ${worker.process.pid} has been killed`);
  console.log('Starting another worker...');
  cluster.fork();
});
