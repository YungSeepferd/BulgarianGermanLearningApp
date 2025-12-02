export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/unit', '<rootDir>/tests/build-flag'],
  testMatch: [
    '**/__tests__/**/*.(js|ts)',
    '**/?(*.)+(spec|test).(js|ts)'
  ],
  collectCoverageFrom: [
    'assets/js/**/*.(js|ts)',
    '!assets/js/modules/vendor/**',
    '!**/*.min.js',
    '!**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  transform: {
    '^.+\\.(js|ts)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true
    }]
  },
  moduleFileExtensions: ['js', 'ts', 'mjs'],
  testPathIgnorePatterns: ['/node_modules/', '/public/', '/tools/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  verbose: true,
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        target: 'es2020',
        module: 'esnext',
        allowSyntheticDefaultImports: true
      }
    }
  }
};
