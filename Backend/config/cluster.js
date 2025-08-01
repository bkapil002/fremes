const cluster = require('cluster');
const os = require('os');

function setupCluster(callback) {
  const numCPUs = os.cpus().length;
  const workerCount = process.env.WORKER_COUNT || numCPUs;

  if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);
    console.log(`Spawning ${workerCount} workers...`);

    // Fork workers based on the specified count
    for (let i = 0; i < workerCount; i++) {
      cluster.fork();
    }

    // Restart workers on failure
    cluster.on('exit', (worker, code, signal) => {
      console.error(
        `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`
      );
      cluster.fork();
    });

    // Log when a worker is online
    cluster.on('online', (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });
  } else {
    // Worker logic
    console.log(`Worker ${process.pid} started`);
    callback();

    // Graceful shutdown for workers
    process.on('SIGINT', () => {
      console.log(`Worker ${process.pid} shutting down...`);
      process.exit(0);
    });
  }
}

module.exports = setupCluster;
