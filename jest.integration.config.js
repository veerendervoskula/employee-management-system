// jest.integration.config.js
module.exports = {
  displayName: 'integration-tests',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testRegex: '(/tests/(integration)/.*|(\\.|/)(test|spec))\\.js$',
  transform: {}, // No Babel needed since you're using CommonJS
  moduleFileExtensions: ['js', 'json'],
  coverageDirectory: 'coverage'
};