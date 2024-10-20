import 'reflect-metadata';
import { app } from './app';
import Container from 'typedi';
import { host, port } from './vars';
import { PrismaService } from './config/dataBase';


// starts the server
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// Handle database disconnection when the application is shutting down
process.on('SIGINT', async () => {
  Container.get(PrismaService).$disconnect();
  process.exit(0);
});
