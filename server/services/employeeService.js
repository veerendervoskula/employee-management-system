const Employee = require("../models/employee");
const { NotFoundError, ApiError } = require("../middleware/errorHandler");

/**
 * Get paginated list of employees
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Paginated employees with metadata
 * @throws {Error} Database errors are propagated
 */
const getPaginatedEmployees = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const total = await Employee.count();

  // Don't query if page is beyond total
  const totalPages = Math.ceil(total / limit);
  if (page > totalPages && total > 0) {
    throw new NotFoundError("Page not found");
  }

  const result = await Employee.query(qb => {
    qb.limit(limit).offset(offset);
  }).fetchAll();

  return {
    employees: result.models,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  };
};

/**
 * Get an employee by their ID or name
 * @param {number|string} id - Employee ID or Employee Name
 * @param {string} name - Employee Name
 * @returns {Promise<Object>} Employee model instance or null
 * @throws {Error} Database errors are propagated
 */
const getEmployee = async ({ id, name }) => {
  return await Employee.query(qb => {
    if (id) qb.where('id', '=', id);
    if (name) qb.orWhere('name', '=', name);
    qb.limit(1);
  }).fetch();
};

/**
 * Create a new employee
 * @param {Object} user - Employee data
 * @returns {Promise<Object>} Created employee model
 * @throws {ApiError} If user already exists
 * @throws {Error} Other database errors
 */
const createEmployee = async (user) => {
  const existingEmployee = await getEmployee({ name: user?.name });
  if (existingEmployee) {
    throw new ApiError(409, `Employee with name "${user.name}" already exists!`);
  }
  const employee = new Employee(user);
  return await employee.save();
};

/**
 * Update an existing employee
 * @param {number|string} id - Employee ID
 * @param {Object} user - Updated employee data
 * @returns {Promise<Object>} Updated employee model or null if not found
 * @throws {NotFoundError} If user not found
 * @throws {Error} Other database errors
 */
const updateEmployee = async (id, user) => {
  const employee = await getEmployee({ id });
  if (!employee) {
    throw new NotFoundError(`Employee with ${id} not found`);
  }
  return await employee.set(user).save();
};

/**
 * Delete an employee by ID
 * @param {number|string} id - Employee ID
 * @returns {Promise<Object>} Deleted employee model or null if not found
 * @throws {Error} Database errors are propagated
 */
const deleteEmployee = async (id) => {
  const employee = await getEmployee({ id });
  if (!employee) {
    throw new NotFoundError(`Employee with ${id} not found`);
  }
  return await employee.destroy();
};

module.exports = {
  getPaginatedEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
