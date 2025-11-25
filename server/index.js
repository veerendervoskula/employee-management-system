require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require('body-parser');
const seeds = require('seeds-random');
const employees = require('./routes/employee');
const rateLimiter = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 8080;

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(seeds());
app.use(bodyParser.urlencoded({ extended: true }));
// Sanitize incoming request bodies to mitigate stored XSS and other injection attacks
app.use(require('./middleware/sanitizer'));


// Apply rate limiter to all API routes
app.use('/api', rateLimiter);
app.use('/api/employees', employees);
// 404 handler for unmatched routes
app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});
// Global error handler
app.use(errorHandler)

app.listen(PORT, () => console.log(`Job Dispatch API running on port ${PORT}!`));
