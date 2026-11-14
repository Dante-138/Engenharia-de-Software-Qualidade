import { defineConfig } from 'vitest/config';

// Testes de unidade. O núcleo precisa de 100% de cobertura em linhas, ramos,
// funções e instruções: abaixo disso o "npm test" reprova.
export default defineConfig({
  test: {
    include: ['tests/unidade/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/nucleo/**'],
      reporter: ['text', 'html'],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
