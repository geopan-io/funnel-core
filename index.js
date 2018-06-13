const express = require('express');
const pino = require('pino');
const io = require('socket.io');

const logger = pino({
  name: 'funnel-core',
  safe: true,
  level: process.env.LOG_LEVEL || 'debug',
  prettyPrint: true,
});

const exchanges = require('./src');

const PORT = process.env.PORT || '8080';

const app = express();
const server = require('http').Server(app);

app.get('/', (req, res) => res.send(`Funnel Core listening on port ${PORT}`));

const socket = io(server);

// handle incoming connections from clients
socket.on('connection', (s) => {
  s.on('room', (room) => {
    logger.info('Connecting room with %j', room);
    s.join(room);
  });
});

const listSymbols = ['ETH/BTC', 'IOTA/BTCSA'];

Object.values(exchanges).forEach(async (Ex) => {
  const exch = new Ex({
    socket,
    // datastore,
    logger,
  });
  try {
    await exch.loadMarkets();
    listSymbols.forEach((s) => {
      if (exch.markets[s]) {
        exch.listen(s);
      }
    });
  } catch (err) {
    logger.error(err);
  }
});

server.listen(PORT, () => {
  logger.info(`funnel-core listening on port ${PORT}`);
});
