const _ = require('lodash');
const Exchange = require('../Exchange')('bitfinex');
const map = require('./map');

const parseTicker = (data) => {
  const fields = [
    'bid',
    'bide_size',
    'ask',
    'ask_size',
    'daily_change',
    'daily_change_perc',
    'last_price',
    'volume',
    'high',
    'low',
  ];

  if (data.length !== fields.length) {
    throw new Error('wrong message');
  }

  const result = {};

  fields.forEach((f, i) => {
    result[f] = data[i];
  });

  return result;
};

module.exports = class Bitfinex extends Exchange {
  constructor({ uri = 'wss://api.bitfinex.com/ws/2', ...options }) {
    super({
      uri,
      map,
      ...options,
    });
  }
  listen(symbol) {
    this.sub = JSON.stringify({
      event: 'subscribe',
      channel: 'ticker',
      // symbol: `t${this.pair}`,
      symbol: this.marketId(symbol),
    });
    super.listen(symbol);
    this.channels = {};

    this.ws.on('message', async ({ data }) => {
      const time = new Date().getTime();
      const json = JSON.parse(data);
      if (!_.isArray(json)) {
        const { chanId } = json;
        if (chanId) this.channels[chanId] = json;
      } else {
        const channel = this.channels[json[0]];
        if (json[1] !== 'hb') {
          await this.process({
            ...channel, time, ...parseTicker(json[1]), symbol,
          });
        }
      }
    });
  }
};
