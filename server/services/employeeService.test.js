const employeeService = require('../services/employeeService');
const Employee = require('../models/employee');
const { NotFoundError } = require('../middleware/errorHandler');

jest.mock('../models/employee');

describe('Employee Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaginatedEmployees', () => {
    it('should return paginated employees', async () => {
      Employee.count.mockResolvedValue(20);
      Employee.query.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ models: ['emp1', 'emp2'] }) });

      const result = await employeeService.getPaginatedEmployees(1, 10);

      expect(result.employees).toEqual(['emp1', 'emp2']);
      expect(result.pagination.total).toBe(20);
    });

    it('should throw NotFoundError if page exceeds totalPages', async () => {
      Employee.count.mockResolvedValue(5);
      await expect(employeeService.getPaginatedEmployees(10, 10)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getEmployeeById', () => {
    it('should return employee by ID', async () => {
      Employee.where.mockReturnValue({ fetch: jest.fn().mockResolvedValue('emp') });
      const result = await employeeService.getEmployeeById(1);
      expect(result).toBe('emp');
    });
  });

  describe('createEmployee', () => {
    it('should create a new employee', async () => {
      const saveMock = jest.fn().mockResolvedValue('newEmp');
      Employee.mockImplementation(() => ({ save: saveMock }));

      const result = await employeeService.createEmployee({ name: 'John' });
      expect(result).toBe('newEmp');
    });
  });

  describe('updateEmployee', () => {
    it('should update employee if found', async () => {
      const setMock = jest.fn().mockReturnValue({ save: jest.fn().mockResolvedValue('updatedEmp') });
      Employee.where.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ set: setMock }) });

      const result = await employeeService.updateEmployee(1, { name: 'Jane' });
      expect(result).toBe('updatedEmp');
    });

    it('should return null if employee not found', async () => {
      Employee.where.mockReturnValue({ fetch: jest.fn().mockResolvedValue(null) });
      const result = await employeeService.updateEmployee(1, { name: 'Jane' });
      expect(result).toBeNull();
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee if found', async () => {
      const destroyMock = jest.fn().mockResolvedValue('deletedEmp');
      Employee.where.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ destroy: destroyMock }) });

      const result = await employeeService.deleteEmployee(1);
      expect(result).toBe('deletedEmp');
    });

    it('should return null if employee not found', async () => {
      Employee.where.mockReturnValue({ fetch: jest.fn().mockResolvedValue(null) });
      const result = await employeeService.deleteEmployee(1);
      expect(result).toBeNull();
    });
  });
});
