module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'utils/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 10000
};
