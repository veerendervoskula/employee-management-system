const request = require('supertest');
const express = require('express');
const sanitizer = require('./sanitizer');
require('./payLoadSchemaValidator');
require('./errorHandler');

describe('Sanitizer Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it('should sanitize script tags in req.body', async () => {
    app.post('/test', sanitizer, (req, res) => res.json(req.body));
    const response = await request(app)
      .post('/test')
      .send({ name: '<script>alert("xss")</script>' });
    expect(response.body.name).not.toContain('<');
    expect(response.body.name).toContain('&lt;'); // validator.escape replaces < with &lt;
  });

  it('should not modify non-string values', async () => {
    app.post('/test', sanitizer, (req, res) => res.json(req.body));
    const response = await request(app)
      .post('/test')
      .send({ age: 25 });
    expect(response.body.age).toBe(25);
  });

});