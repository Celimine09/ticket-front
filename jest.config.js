module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests', '<rootDir>/src'],
    testMatch: ['**/*.test.js', '**/*.test.jsx'],
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.{js,jsx}',
      '!src/index.js',
      '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/mocks/fileMock.js'
    },
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest'
    },
    moduleDirectories: ['node_modules', 'src']
  };