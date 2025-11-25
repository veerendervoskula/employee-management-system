const { callAsync, sendError } = require('./helpers');
const logger = require('./logger');

jest.mock('./logger'); // Mock Winston logger

describe('callAsync', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should call the async function successfully', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const middleware = callAsync(fn);

    await middleware(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch errors and call next with error', (done) => {
    const error = new Error('Test error');
    const fn = jest.fn().mockRejectedValue(error);
    const middleware = callAsync(fn);

    middleware(req, res, (err) => {
      expect(err).toBe(error);
      done();
    });
  });
});

describe('sendError', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };
    logger.error.mockClear();
  });

  it('should send error response with default values', () => {
    sendError(res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    expect(logger.error).toHaveBeenCalledWith('Internal Server Error', expect.any(Object));
  });

  it('should send error response with custom values and headers', () => {
    const headers = { 'X-Custom-Header': 'test' };
    sendError(res, 400, 'Bad Request', { field: 'name' }, headers);

    expect(res.setHeader).toHaveBeenCalledWith('X-Custom-Header', 'test');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Bad Request',
      details: { field: 'name' }
    });
    expect(logger.error).toHaveBeenCalledWith('Bad Request', expect.any(Object));
  });
});