const router = require("express").Router();
exports.router = router;
const { callAsync } = require("../helpers");
const employeeService = require("../services/employeeService");
const { ApiError, NotFoundError } = require("../middleware/errorHandler");
const { validateRequest, formatJoiErrors} = require("../middleware/schemaValidator");
const logger = require("../logger");
const paginationSchema = require("../../src/utils/schema/paginationSchema");
const employeeSchema = require("../../src/utils/schema/employeeSchema");

// List users with pagination
router.get(
  "/",
  callAsync(async (req, res) => {
    // Validate pagination params
    // Controller based validation
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      throw new ApiError(400, "Invalid pagination parameters", formatJoiErrors(error));
    }

    const data = await employeeService.getPaginatedEmployees(value.page, value.limit);
    if (data.employees.length === 0 && data.pagination.total > 0) {
      logger.error('Failed to fetch Employees', result);
      throw new NotFoundError("Page not found");
    }
    return res.json(data);
  })
);

// Get user by id
router.get(
  "/view/:id",
  callAsync(async (req, res) => {
    const result = await employeeService.getEmployeeById(req.params.id);
    if (!result) {
      logger.error(`Failed to fetch Employee with id ${req.params.id}`, result);
      throw new NotFoundError("Employee not found");
    }
    return res.json(result.toJSON());
  })
);

// Create new user
router.post(
  "/",
  validateRequest(employeeSchema),
  callAsync(async (req, res) => {
    const result = await employeeService.createEmployee(req.body);

    logger.info('Employee created successfully', result);
    return res.status(201).json({ message: 'Employee created successfully' });
  })
);

// Update user by id
router.put(
  "/:id",
  validateRequest(employeeSchema),
  callAsync(async (req, res) => {

    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid or missing employee ID' });
    }

    const result = await employeeService.updateEmployee(id, req.body);
    logger.info('Employee updated', result);
    return res.json({ message: `Employee ${req.body.name} updated successfully` });
  })
);

// Delete user by id
router.delete(
  "/:id",
  callAsync(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid or missing employee ID' });
    }
    const result = await employeeService.deleteEmployee(req.params.id);
    return res.json({ message: `Employee "${result._previousAttributes.name}" successfully deleted` });
  })
);

module.exports = router;
