const Exchange = require('../Exchange')('huobi');
const map = require('./map');
const pako = require('pako');

module.exports = class Huobi extends Exchange {
  constructor({ uri = 'wss://api.huobi.pro/ws', ...options }) {
    super({
      uri,
      map,
      ...options,
    });
  }
  listen(symbol) {
    const pair = this.marketId(symbol);
    this.sub = JSON.stringify({
      sub: `market.${pair.toLowerCase()}.kline.1min`,
      id: `${pair.toLowerCase()}`,
    });
    super.listen(symbol);
    this.ws.on('message', ({ data }) => {
      const text = pako.inflate(data, {
        to: 'string',
      });
      const msg = JSON.parse(text);
      if (msg.ping) {
        this.ws.send(JSON.stringify({
          pong: msg.ping,
        }));
      } else if (msg.tick) {
        // console.log(msg);
      }
    });
  }
};
