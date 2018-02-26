const Exchange = require('../Exchange')('gdax');
const map = require('./map');

module.exports = class GDAX extends Exchange {
  constructor({ uri = 'wss://ws-feed.gdax.com', ...options }) {
    super({
      uri,
      map,
      ...options,
    });
  }
  listen(symbol) {
    this.sub = JSON.stringify({
      type: 'subscribe',
      product_ids: [this.marketId(symbol)],
      channels: ['ticker', 'heartbeat'],
    });
    super.listen(symbol);
    this.ws.on('message', async ({ data: json }) => {
      const data = JSON.parse(json);
      if (data.type === 'ticker') {
        await this.process({ ...data, symbol });
      }
    });
  }
};
