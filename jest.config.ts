export default {
  displayName: 'cometa-api-v2',
  preset: './jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage/cometa-api-v2',
  testMatch: [
    '<rootDir>/e2e/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/e2e/src/**/*(*.)@(spec|test).[jt]s?(x)',
  ],
  globalSetup: '<rootDir>/e2e/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/e2e/src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/e2e/src/support/test-setup.ts'],
};
