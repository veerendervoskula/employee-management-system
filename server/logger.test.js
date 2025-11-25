const logger = require('./logger');
const { transports } = require('winston');

describe('Logger Configuration', () => {
  it('should have correct log level based on NODE_ENV', () => {
    const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    expect(logger.level).toBe(level);
  });

  it('should include Console and File transports', () => {
    const transportTypes = logger.transports.map(t => t.constructor.name);
    expect(transportTypes).toContain('Console');
    expect(transportTypes).toContain('File');
  });

  it('should format log messages with timestamp and level', () => {
    const info = { timestamp: '2025-11-11T22:00:00Z', level: 'info', message: 'Test message' };
    const formatted = `${info.timestamp} [${info.level}]: ${info.message}`;
    expect(formatted).toContain('[info]');
    expect(formatted).toContain('Test message');
  });
});