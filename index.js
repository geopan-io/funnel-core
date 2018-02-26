const pino = require('pino');
const Datastore = require('@google-cloud/datastore');
const io = require('socket.io');
const exchanges = require('./src');

const logger = pino({
  name: 'funnel-core',
  safe: true,
  level: process.env.LOG_LEVEL || 'debug',
  prettyPrint: true,
});

// Your Google Cloud Platform project ID
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const datastore = new Datastore({
  projectId,
});
const port = process.env.PORT || '8080';
const socket = io(port);

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
    datastore,
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
