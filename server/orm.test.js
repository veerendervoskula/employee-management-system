jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('knex');
jest.mock('bookshelf');

const knex = require('knex');
const bookshelf = require('bookshelf');
const path = require('path');

describe('ORM Setup', () => {
  beforeEach(() => {
    process.env.DB_PATH = '/mock/path/to/db.sqlite';
    jest.resetModules(); // Clear require cache
    knex.mockClear();
    bookshelf.mockClear();

  });

  it('should configure knex with correct settings', () => {
    require('./orm'); // Import after mocks

    expect(knex).toHaveBeenCalledWith({
      client: 'sqlite',
      connection: { filename: '/mock/path/to/db.sqlite' },
      useNullAsDefault: true
    });
  });

  it('should initialize bookshelf with knex instance', () => {
    const mockKnexInstance = {};
    knex.mockReturnValue(mockKnexInstance);

    require('./orm');

    expect(bookshelf).toHaveBeenCalledWith(mockKnexInstance);
  });

  it('should export the ORM instance', () => {
    jest.resetModules(); // Clear require cache
    delete process.env.DB_PATH;

    const mockBookshelfInstance = { Model: jest.fn() };
    const mockKnexInstance = {};

    // Set up mocks before importing the module
    knex.mockReturnValue(mockKnexInstance);
    bookshelf.mockReturnValue(mockBookshelfInstance);

    // Import after mocks are set
    const ORM = require('./orm');

    // Validate export
    expect(ORM).toEqual(mockBookshelfInstance);
  });

  const path = require('path');
  const knex = require('knex');
  const bookshelf = require('bookshelf');

  jest.mock('knex');
  jest.mock('bookshelf');

  describe('ORM Setup', () => {
    beforeEach(() => {
      jest.resetModules(); // Clear require cache
      knex.mockClear();
      bookshelf.mockClear();
    });

    it('should fallback to default db path when DB_PATH is not set', () => {
      delete process.env.DB_PATH;

      const mockKnexInstance = {};
      const mockBookshelfInstance = {};

      knex.mockReturnValue(mockKnexInstance);
      bookshelf.mockReturnValue(mockBookshelfInstance);

      const expectedPath = path.join(__dirname, 'data', 'db.sqlite');

      const ORM = require('./orm');

      expect(knex).toHaveBeenCalledWith({
        client: 'sqlite',
        connection: { filename: expectedPath },
        useNullAsDefault: true
      });

      expect(bookshelf).toHaveBeenCalledWith(mockKnexInstance);
      expect(ORM).toBe(mockBookshelfInstance);
    });
  });

});