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
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/integration/**/*.test.ts'],
  setupFilesAfterEnv: [],
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      testMatch: ['**/__tests__/**/*.test.ts'],
      testEnvironment: 'jest-environment-jsdom',
      transform: {
        '^.+\\.ts$': [
          'ts-jest',
          {
            useESM: true,
          },
        ],
      },
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      globals: {
        chrome: {},
      },
    },
    {
      displayName: 'integration',
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      testMatch: ['**/integration/**/*.test.ts'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.ts$': [
          'ts-jest',
          {
            useESM: true,
          },
        ],
      },
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    },
  ],
};
