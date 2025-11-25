const request = require('supertest');
const express = require('express');
const rateLimiter = require('../middleware/rateLimiter');

describe('Rate Limiter Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(rateLimiter);
    app.get('/limited', (req, res) => res.send('OK'));
  });

  it('should allow requests under the limit', async () => {
    const response = await request(app).get('/limited');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });

  it('should block requests over the limit', async () => {
    // Simulate 101 requests to exceed the limit of 100
    for (let i = 0; i < 101; i++) {
      await request(app).get('/limited');
    }

    const response = await request(app).get('/limited');
    expect(response.status).toBe(429);
    expect(response.body.error).toBe('Too many requests, please try again later.');
    expect(response.body.code).toBe(429);
    // Check that standard rate limit headers are present
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(response.headers['ratelimit-remaining']).toBeDefined();
    expect(response.headers['ratelimit-reset']).toBeDefined();
  });
});
