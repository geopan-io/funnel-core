const { expect } = require('chai');
const Model = require('./Model');

describe('Model', () => {
  it('should construct a model', () => {
    const model = new Model({ p: 'price' }, 'test');
    expect(model).to.be.an.instanceof(Model);
  });
  it('should convert the data according to map');
});
