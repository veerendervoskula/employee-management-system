const request = require('supertest');
const express = require('express');
const swaggerRouter = require('./swagger');

describe('Swagger Middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use('/docs', swaggerRouter);
  });

  it('should serve Swagger UI at /docs and contain API title', async () => {
    const response = await request(app).get('/docs');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Swagger UI');
    expect(response.text).toContain('Employee Management System API');
  });
});