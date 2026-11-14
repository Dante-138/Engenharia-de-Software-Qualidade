// Lint rígido: o código inteiro passa sem avisos (--max-warnings 0) e sem
// comentários de exceção (noInlineConfig). Quem escreve o código, humano ou
// agente, não tem como desligar uma regra no meio do arquivo: para mudar uma
// regra, muda este arquivo, e isso aparece no diff do PR.
//
// Além dos erros comuns, o lint impõe a estrutura do projeto:
//
//   src/nucleo/   lógica pura: sem DOM, sem armazenamento, sem console, sem
//                 importar nada de fora do núcleo
//   src/          interface: sem HTML em texto, sem console.log

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const HTML_EM_TEXTO = [
  {
    selector: 'MemberExpression[property.name=/^(innerHTML|outerHTML)$/]',
    message: 'Monte o DOM com createElement e textContent; HTML em texto é proibido.',
  },
  {
    selector:
      'CallExpression[callee.property.name=/^(insertAdjacentHTML|write|writeln|createContextualFragment|parseFromString)$/]',
    message: 'Monte o DOM com createElement e textContent; HTML em texto é proibido.',
  },
];

const GLOBAIS_DE_FORA_DO_NUCLEO = [
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'fetch',
  'setTimeout',
  'setInterval',
].map((name) => ({ name, message: 'O núcleo é lógica pura: recebe tudo por parâmetro.' }));

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      'reports/',
      'test-results/',
      'playwright-report/',
      '.stryker-tmp/',
    ],
  },

  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: globals.node,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Erros prováveis
      'array-callback-return': ['error', { checkForEach: true }],
      'no-constructor-return': 'error',
      'no-promise-executor-return': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      'require-atomic-updates': 'error',

      // Código que esconde erro
      'default-case-last': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-implicit-coercion': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-param-reassign': 'error',
      'no-return-assign': ['error', 'always'],
      'no-script-url': 'error',
      'no-sequences': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      radix: 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_', caughtErrors: 'all' }],

      // Tamanho: função grande demais vira candidata a dividir
      complexity: ['error', 15],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
    },
  },

  // Arquivos .js e .mjs de configuração e ferramentas: sem checagem de tipo.
  {
    files: ['**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  // ------------------------------------------------------ interface (navegador)
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': ['error', ...HTML_EM_TEXTO],
    },
  },

  // ---------------------------------------------------- núcleo (lógica pura)
  {
    files: ['src/nucleo/**/*.ts'],
    languageOptions: { globals: {} },
    rules: {
      'no-console': 'error',
      'no-restricted-globals': ['error', ...GLOBAIS_DE_FORA_DO_NUCLEO],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../*'], message: 'O núcleo não importa nada de fora dele.' }] },
      ],
    },
  },

  // ------------------------------------------------------------------ testes
  {
    files: ['tests/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
);
