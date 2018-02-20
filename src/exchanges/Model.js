module.exports = class Model {
  constructor(map, name) {
    this.map = map;
    this.market = name;
  }
  convert(data) {
    const result = { ...this.map, market: this.market };
    Object.entries(this.map).forEach(([k, v]) => {
      result[k] = data[v];
    });
    return result;
  }
};
