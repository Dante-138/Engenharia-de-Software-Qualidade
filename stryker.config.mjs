// Teste de mutação: o Stryker altera o núcleo de propósito (troca > por >=,
// apaga um if, inverte uma condição) e roda os testes de novo. Se os testes
// continuam passando com o código errado, a mutação "sobreviveu": a cobertura
// passava pela linha, mas nenhum teste conferia o resultado dela.
//
// Abaixo de "break" o comando reprova. No núcleo a meta é 100%: quando um
// mutante sobrevive por ser equivalente (a troca não muda o comportamento), o
// certo é reescrever o código sem a condição redundante, não baixar a meta.

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: ['src/nucleo/**/*.ts'],
  coverageAnalysis: 'perTest',
  reporters: ['clear-text', 'progress', 'html'],
  htmlReporter: { fileName: 'reports/mutacao/index.html' },
  thresholds: { high: 100, low: 100, break: 100 },
  incremental: false,
};
