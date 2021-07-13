/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src/'],
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
};
