const request = require('supertest');
const app = require('../../server/index');

describe('Employees API Integration', () => {
  // Positive cases
  it('GET /employees should return paginated employees', async () => {
    const res = await request(app).get('/employees?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('employees');
    expect(Array.isArray(res.body.employees)).toBe(true);
  });

  it('POST /employees should create a new employee', async () => {
    const newEmployee = { name: 'John', code: 'F100', profession: 'Runner', assigned: false };
    const res = await request(app).post('/employees').send({ user: newEmployee });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newEmployee);
  });

  it('PUT /employees/:id should update employee', async () => {
    const employee = { id: 10, name: 'Fred Van Vleet', code: 'F100', profession: 'Runner', assigned: true };
    const res = await request(app).put('/employees/10').send({ user: employee });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(employee);
  });

  // Negative cases
  it('GET /employees with invalid pagination should return 400', async () => {
    const res = await request(app).get('/employees?page=-1');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid pagination parameters/);
  });

  it('GET /employees/view/:id for non-existent employee should return 404', async () => {
    const res = await request(app).get('/employees/view/9999');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Employee not found/);
  });

  it('POST /employees with missing fields should return 400', async () => {
    const res = await request(app).post('/employees').send({ user: {} });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/validation/i);
  });

  it('PUT /employees/:id for non-existent employee should return 404', async () => {
    const res = await request(app).put('/employees/9999').send({ user: { name: 'Updated' } });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Employee not found/);
  });

  it('DELETE /employees/:id for non-existent employee should return 404', async () => {
    const res = await request(app).delete('/employees/9999');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Employee not found/);
  });
});