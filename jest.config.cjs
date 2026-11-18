module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2020',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          ignoreDeprecations: '6.0',
          paths: {
            '@/*': ['./src/*'],
            '@components/*': ['./src/components/*'],
            '@shared/*': ['./src/shared/*'],
          },
          module: 'CommonJS',
          moduleResolution: 'Node',
          jsx: 'react-jsx',
          allowImportingTsExtensions: false,
          isolatedModules: true,
          noEmit: false,
          esModuleInterop: true,
          skipLibCheck: true,
          strict: true,
          types: ['jest', 'node'],
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  clearMocks: true,
  restoreMocks: true,
  maxWorkers: 2,
}
