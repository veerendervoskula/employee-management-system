const request = require('supertest');
const express = require('express');
require('../middleware/payLoadSchemaValidator');
const { errorHandler, ApiError } = require('../middleware/errorHandler');
const Joi = require('joi');

describe('Error Handler Middleware', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
    });

    it('should handle ApiError correctly', async () => {
        app.get('/error', (req, res, next) => next(new ApiError(400, 'Bad Request')));
        app.use(errorHandler);
        const response = await request(app).get('/error');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it('should convert Joi error to ValidationError', async () => {
        app.get('/joi-error', (req, res, next) => {
            const schema = Joi.object({ name: Joi.string().required() });
            const { error } = schema.validate({});
            next(error);
        });
        app.use(errorHandler);
        const response = await request(app).get('/joi-error');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
    });
});