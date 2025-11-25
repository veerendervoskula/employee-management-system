const request = require('supertest');
const express = require('express');
const loggerMiddleware = require('../middleware/requestLogger');
const logger = require('../logger');

jest.mock('../logger');

describe('Request Logger Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    logger.info.mockClear();
  });

  it('should log request details using logger.info', async () => {
    logger.info.mockImplementation(() => {});
    app.use(loggerMiddleware);
    app.get('/test', (req, res) => res.send('OK'));

    await request(app).get('/test');

    expect(logger.info).toHaveBeenCalled();
    const logMessage = logger.info.mock.calls[0][0];
    expect(logMessage).toMatch(/GET \/test 200 \d+ms/);
  });
});
