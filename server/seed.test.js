jest.mock('./orm', () => {
  const schemaMock = {
    dropTableIfExists: jest.fn().mockReturnThis(),
    createTable: jest.fn().mockReturnThis(),
    then: jest.fn()
  };
  return {
    knex: { schema: schemaMock },
    Model: { extend: jest.fn() }
  };
});

jest.mock('./models/employee', () => ({
  collection: jest.fn()
}));

jest.mock('./data/employees.json', () => [{ name: 'John Doe', code: 'E123' }], { virtual: true });

const QB = require('./orm').knex;
const User = require('./models/employee');

describe('Improved Seed Script', () => {
  beforeEach(() => {
    jest.resetModules();
    QB.schema.dropTableIfExists.mockClear();
    QB.schema.createTable.mockClear();
    QB.schema.then.mockClear();
    User.collection.mockClear();
  });

  it('should create employees table and seed data successfully', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockInvokeThen = jest.fn().mockResolvedValue(['Saved!']);
    User.collection.mockReturnValue({ invokeThen: mockInvokeThen });

    require('./seed'); // Import script after mocks

    expect(QB.schema.then).toHaveBeenCalled();
    const callback = QB.schema.then.mock.calls[0][0];
    await callback();

    expect(QB.schema.dropTableIfExists).toHaveBeenCalledWith('employees');
    expect(QB.schema.createTable).toHaveBeenCalled();
    expect(User.collection).toHaveBeenCalledWith([{ name: 'John Doe', code: 'E123' }]);
    expect(mockInvokeThen).toHaveBeenCalledWith('save');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Employees table created successfully.'));
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('should handle errors and exit with code 1', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockInvokeThen = jest.fn().mockRejectedValue(new Error('Save failed'));
    User.collection.mockReturnValue({ invokeThen: mockInvokeThen });

    require('./seed');

    const callback = QB.schema.then.mock.calls[0][0];
    try {
      await callback();
    } catch (e) {
      process.exit(1);
    }

    expect(User.collection).toHaveBeenCalled();
    expect(mockInvokeThen).toHaveBeenCalledWith('save');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ Error seeding database:'));
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});