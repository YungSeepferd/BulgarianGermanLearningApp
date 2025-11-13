export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'assets/js/**/*.js',
    '!assets/js/modules/vendor/**',
    '!**/*.min.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testPathIgnorePatterns: ['/node_modules/', '/public/', '/tools/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  verbose: true,
  collectCoverage: false
};
