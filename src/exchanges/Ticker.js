// TODO: ticker model
const Joi = require('joi');

module.exports = {
  market: Joi.string().required(),
  pair: Joi.string().required(),
  symbol: Joi.string().required(),
  price: Joi.number().required(),
  daily: Joi.number(),
  dailyPerc: Joi.number(),
  low: Joi.number(),
  high: Joi.number(),
  volume: Joi.number(),
  time: Joi.date().timestamp(),
  date: Joi.date().default(Date, 'current date'),
};
