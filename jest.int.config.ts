export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testRegex: '.*\\.int-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
