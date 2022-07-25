/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src/'],
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
  setupFiles: ['<rootDir>/src/test/globalTestSetup.ts'],
  testPathIgnorePatterns: ['.*/__tests__/.*\\.util\\.ts'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
};
