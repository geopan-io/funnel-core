const Model = require('./Model');
const { Client } = require('faye-websocket');
const _ = require('lodash');
// const Ticker = require('./Ticker');
const ccxt = require('ccxt');

module.exports = name =>
  class Exchange extends ccxt[name] {
    constructor({ from = 'BTC', to = 'USD', ...options }) {
      super();
      this.from = from;
      this.to = to;
      this.urls.ws = options.uri;
      this.sub = options.sub;
      this.socket = options.socket;
      this.datastore = options.datastore;
      this.model = new Model(options.map, this.name);
    }

    mapping(data) {
      const result = this.model.convert(data);
      result.symbol = this.marketsById[result.pair].symbol;
      return result;
    }

    listen(symbol, uri) {
      this.ws = new Client(uri || this.urls.ws);
      this.channels = {};

      this.ws.on('close', () => {
        // console.info(`${this.name} exchange socket for symbol ${symbol} close`);
        this.listen(symbol, uri);
      });

      this.ws.on('error', (err) => {
        console.error(err.message);
        throw err;
      });

      this.ws.on('open', () => {
        console.info(`${this.name} exchange socket open for symbol ${symbol}`);
        if (!_.isEmpty(this.sub)) {
          this.subscribe();
        }
      });
    }

    subscribe() {
      this.ws.send(this.sub);
    }

    async process(data) {
      // const ticker = new Ticker(this.mapping(data));
      const key = this.datastore.key('Tick');
      const tick = this.mapping(data);
      const message = JSON.stringify(tick);
      const { market, pair } = message;
      if (this.socket) {
        // emit to message to multiple room at once.
        this.socket.emit('tick', message);
        [market, pair].forEach((room) => {
          if (!_.isEmpty(room)) {
            this.socket.in(room).emit('tick', message);
          }
        });
      }
      // console.dir(this.datastore);
      await this.datastore.save({ key, data: tick });
      console.log('save', key);
      // ticker.save();
    }
  };
