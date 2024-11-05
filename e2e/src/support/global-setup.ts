/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;
import {app} from "../../../src/app";
import Container from "typedi";
import {PrismaService} from "../../../src/config/dataBase";
import {host, port} from "../../../src/vars";


module.exports = async function () {
  console.log('\nSetting up...\n');

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
  // starts the server
  globalThis.__SERVER__ = app.listen(+port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });

// Handle database disconnection when the application is shutting down
  process.on('SIGINT', async () => {
    Container.get(PrismaService).$disconnect();
    process.exit(0);
  });
};
