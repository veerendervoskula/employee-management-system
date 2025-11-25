const request = require('supertest');
const express = require('express');
const router = require('./employee');
const employeeService = require('../services/employeeService');

jest.mock('../services/employeeService', () => ({
  getPaginatedEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
  createEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn()
}));

jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/employees', router);
const mockEmployee = {
  "name": "Veer",
  "code": "F100",
  "profession": "Drywall Installer",
  "color": "#FF6600",
  "city": "Toronto",
  "branch": "Abacus",
  "assigned": false
}


describe('Employee Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /employees', () => {
    it('should return paginated employees', async () => {
      const mockData = { employees: [{ id: 1, name: 'John' }], pagination: { total: 1 } };
      employeeService.getPaginatedEmployees.mockResolvedValue(mockData);

      const res = await request(app).get('/employees?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockData);
    });

    it('should return 400 for invalid pagination params', async () => {
      const res = await request(app).get('/employees?page=-1');
      expect(res.status).toBe(400);
      expect(res.text).toContain('Invalid pagination parameters');
    });
  });

  describe('GET /employees/view/:id', () => {
    it('should return employee by ID', async () => {
      const mockEmployee = { id: 1, name: 'John', toJSON: () => ({ id: 1, name: 'John' }) };
      employeeService.getEmployeeById.mockResolvedValue(mockEmployee);

      const res = await request(app).get('/employees/view/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: 'John' });
    });

    it('should return 404 if employee not found', async () => {
      employeeService.getEmployeeById.mockResolvedValue(null);

      const res = await request(app).get('/employees/view/999');
      expect(res.status).toBe(404);
      expect(res.text).toContain('Employee not found');
    });
  });

  describe('POST /employees', () => {
    it('should create employee', async () => {
      employeeService.createEmployee.mockResolvedValue({user:mockEmployee});

      const res = await request(app).post('/employees').send({user:mockEmployee});
      expect(res.status).toBe(201);
      expect(res.body.user).toEqual(mockEmployee);
    });
  });

  describe('PUT /employees/:id', () => {
    it('should update employee', async () => {
      employeeService.updateEmployee.mockResolvedValue({user:mockEmployee});

      const res = await request(app).put('/employees/1').send({user:mockEmployee});
      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(mockEmployee);
    });
  });

  describe('DELETE /employees/:id', () => {
    it('should delete employee', async () => {
      const mockEmployeeToDelete = {...mockEmployee, _previousAttributes: { name: 'John' } };
      employeeService.deleteEmployee.mockResolvedValue(mockEmployeeToDelete);

      const res = await request(app).delete('/employees/1');
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Employee "John" successfully deleted/);
    });
  });
});