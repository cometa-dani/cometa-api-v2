import axios from 'axios';
import { host, port } from "../../../src/vars";


module.exports = async function () {
  // Configure axios for tests to use.
  axios.defaults.baseURL = `http://${host}:${port}/api/v1`;
};
