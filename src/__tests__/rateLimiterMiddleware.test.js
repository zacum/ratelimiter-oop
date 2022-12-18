'use strict';
const axios = require('axios');

describe('rateLimiterMiddleware tests', () => {
  test('Less than 2 requests per second, response Good! statuscode 200', () => {
    setTimeout(async () => {
      for (let i = 0; i < 2; i++) {
        const res = await axios.get('http://localhost:8000');
        expect(res.status).toBe(200);
        expect(res.data).toMatch('Good!');
      }
    }, 1000);
  });

  test('More than 2 requests per second, response Error statuscode 429', async () => {
    let res_status = [];
    for (let i = 0; i < 2; i++) {
      try {
        const res = await axios.get('http://localhost:8000');
        res_status.push(res.status);
      } catch (error) {
        const { response } = error;
        res_status.push(response.status);
        expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
      }
    }
    expect(res_status).toContain(429);
  });
});
