const Datastore = require('@google-cloud/datastore');
const io = require('socket.io');
const exchanges = require('./src');

// Your Google Cloud Platform project ID
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const datastore = new Datastore({ projectId });

const port = process.env.PORT || '8080';
const socket = io(port);

// handle incoming connections from clients
socket.on('connection', (s) => {
  s.on('room', (room) => {
    s.join(room);
  });
});

const listSymbols = ['ETH/BTC'];

Object.values(exchanges).forEach(async (Ex) => {
  const exch = new Ex({ socket, datastore });
  await exch.loadMarkets();
  listSymbols.forEach(async (s) => {
    if (exch.markets[s]) {
      exch.listen(s);
    }
  });
  // exch.symbols.forEach(s => exch.listen(s));
});
