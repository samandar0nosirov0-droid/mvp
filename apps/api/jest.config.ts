import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }]
  },
  moduleNameMapper: {
    '^@aidvokat/contracts$': '<rootDir>/../../../packages/contracts/src/index.ts',
    '^@aidvokat/contracts/(.*)$': '<rootDir>/../../../packages/contracts/src/$1'
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage'
};

export default config;
