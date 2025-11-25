const { clientSchema, validateField, validateData } = require('../validation/employeeValidationClient');

describe('Employee Validation (Client)', () => {
  describe('validateField', () => {
    it('should return error for short string', () => {
      const error = validateField('name', 'A', clientSchema);
      expect(error).toContain('at least');
    });

    it('should return error for wrong type', () => {
      const error = validateField('assigned', 'true', clientSchema);
      expect(error).toContain('must be true or false');
    });

    it('should return null for valid field', () => {
      const error = validateField('name', 'John', clientSchema);
      expect(error).toBeNull();
    });
  });

  describe('validateData', () => {
    it('should return null for valid data', () => {
      const data = { name: 'John', code: 'EMP01', color: 'Blue', assigned: true };
      const errors = validateData(data, clientSchema);
      expect(errors).toBeNull();
    });

    it('should return errors for invalid data', () => {
      const data = { name: '', code: 'X', color: '', assigned: 'yes' };
      const errors = validateData(data, clientSchema);
      expect(errors).toHaveProperty('name');
      expect(errors).toHaveProperty('assigned');
    });
  });
});