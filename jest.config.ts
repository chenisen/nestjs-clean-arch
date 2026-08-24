module.exports = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testRegex: '.*\\..*spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
};
