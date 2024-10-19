import 'reflect-metadata';
import { app } from './app';
import { host, port } from './vars';
import { shutdownDb } from './dataBaseConnection';


// starts the server
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// Handle database disconnection when the application is shutting down
process.on('SIGINT', async () => {
  await shutdownDb();
  process.exit(0);
});
