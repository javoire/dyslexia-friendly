export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: [],
  globals: {
    chrome: {},
  },
};
