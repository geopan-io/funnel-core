const Exchange = require('../Exchange')('okex');
const map = require('./map');

module.exports = class OKEX extends Exchange {
  constructor({ uri = 'wss://real.okex.com:10440/websocket/okexapi', ...options }) {
    super({
      uri,
      map,
      ...options,
    });
  }

  // websocket.send("{'event':'addChannel','channel':'ok_sub_spot_X_ticker'}");
  // ① value of X is: ltc_btc eth_btc etc_btc bch_btc btc_usdt eth_usdt ltc_usdt
  // etc_usdt bch_usdt etc_eth bt1_btc bt2_btc btg_btc qtum_btc hsr_btc neo_btc
  // gas_btc qtum_usdt hsr_usdt neo_usdt gas_usdt

  listen(symbol) {
    const pair = this.marketId(symbol);
    this.channel = `ok_sub_spot_${pair.toLowerCase()}_ticker`;
    this.sub = JSON.stringify({
      event: 'addChannel',
      channel: this.channel,
    });
    super.listen(symbol);
    this.ws.on('message', async ({ data: json }) => {
      const [response] = JSON.parse(json);
      const { channel, data } = response;
      if (channel === this.channel) {
        await this.process(data);
      }
    });
  }
};
