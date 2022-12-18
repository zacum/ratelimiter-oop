'use strict';
const express = require('express');
const { RateLimiterMiddleware } = require('./src/middleware/rateLimiterMiddleware.js');
const app = express();

const rateLimiterMiddleware = new RateLimiterMiddleware({
  TIME_FRAME_IN_S: 10,
  RPS_LIMIT: 2
});
app.use(rateLimiterMiddleware.rateLimiter);


app.listen(process.env.PORT || 8000, () => { });

module.exports = app;
