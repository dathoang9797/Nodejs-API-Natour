require('dotenv').config();
require('./database');
const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(3000, () => {
  console.log(`App running on port ${3000}`);
});
