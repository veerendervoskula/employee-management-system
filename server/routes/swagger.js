const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Management System API',
      version: '1.0.0',
      description: 'A simple Employee Management System API',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
  },
  apis: ['./server/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

const router = express.Router();

router.use('/', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(specs));

module.exports = router;