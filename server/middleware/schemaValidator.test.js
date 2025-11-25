const request = require('supertest');
const express = require('express');
const sanitizer = require('./sanitizer');
const { validateRequest } = require('./payLoadSchemaValidator');
require('./errorHandler');
const Joi = require('joi');
const employeeSchema = require('../../src/validation/employeeValidation');

describe('Payload Schema Validator', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it('should return 400 if user object is missing', async () => {
    app.post('/validate', validateRequest(employeeSchema));
    const response = await request(app).post('/validate').send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid user details');
  });

  it('should return 400 if validation fails', async () => {
    app.post('/validate', validateRequest(employeeSchema));
    const response = await request(app)
      .post('/validate')
      .send({ user: { name: 'A', code: 'X', color: 'Red', assigned: true } });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.details.length).toBeGreaterThan(0);
  });

  it('should call next if validation passes', async () => {
    app.post('/validate', validateRequest(employeeSchema), (req, res) => res.json({ success: true }));
    const response = await request(app)
      .post('/validate')
      .send({ user: { name: 'John', code: 'EMP01', color: 'Blue', assigned: true } });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

});