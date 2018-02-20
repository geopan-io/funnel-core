const Exchange = require('../Exchange')('binance');
const map = require('./map');

module.exports = class Binance extends Exchange {
  constructor({ uri = 'wss://stream.binance.com:9443/ws/', ...options }) {
    super({
      uri,
      map,
      ...options,
    });
  }

  listen(symbol) {
    const pair = this.marketId(symbol);
    const uri = `${this.urls.ws}${pair}@ticker`;
    super.listen(symbol, uri);
    this.ws.on('message', async ({ data }) => this.process(JSON.parse(data)));
  }
};
