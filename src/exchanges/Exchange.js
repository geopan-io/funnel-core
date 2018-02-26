const Model = require('./Model');
const Joi = require('joi');
const schema = require('./ticker');
const pino = require('pino');
const { Client } = require('faye-websocket');
const _ = require('lodash');
const ccxt = require('ccxt');

module.exports = name =>
  class Exchange extends ccxt[name] {
    constructor({ uri, ...options }) {
      super();
      this.urls.ws = uri;
      this.sub = options.sub;
      this.socket = options.socket;
      this.datastore = options.datastore;
      this.model = new Model(options.map, this.name);
      this.logger = options.logger || pino();
    }

    mapping(data) {
      const result = this.model.convert(data);
      if (!result.symbol) {
        result.symbol = this.marketsById[result.pair].symbol;
      }
      if (!result.pair) {
        result.pair = this.marketId(result.symbol);
      }
      return result;
    }

    listen(symbol, uri) {
      this.ws = new Client(uri || this.urls.ws);
      this.channels = {};

      this.ws.on('close', () => {
        this.logger.info(`${this.name} channel for symbol ${symbol} close`);
        this.listen(symbol, uri);
      });

      this.ws.on('error', (err) => {
        this.logger.error(err);
        throw err;
      });

      this.ws.on('open', () => {
        this.logger.info(`${this.name} channel for symbol ${symbol} open`);
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
      const { error, value } = Joi.validate(tick, schema);
      if (error) this.logger.error(error);
      const message = JSON.stringify(value);
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
      await this.datastore.save({
        key,
        data: value,
      });
      this.logger.trace(value);
    }
  };
