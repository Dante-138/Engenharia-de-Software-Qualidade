import { defineConfig, devices } from '@playwright/test';

// Testes de navegador contra o build de produção (vite preview), não contra o
// servidor de desenvolvimento: é o build que vai para o usuário, com a CSP ligada.
//
// Regressão visual só roda dentro do container oficial do Playwright (no CI e em
// "npm run test:navegador:docker"): fonte e renderização mudam de um sistema para
// outro, então a imagem de referência só vale no mesmo ambiente que a gerou.
const emContainer = process.env['NAVEGADOR_CONTAINER'] === '1';
const noCi = Boolean(process.env['CI']);

export default defineConfig({
  testDir: 'tests/navegador',
  forbidOnly: noCi,
  retries: 0,
  reporter: noCi ? [['list'], ['html', { open: 'never' }]] : 'list',
  ...(emContainer ? {} : { grepInvert: /@visual/ }),
  snapshotPathTemplate: '{testDir}/{testFileName}-snapshots/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixels: 0 } },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    colorScheme: 'dark',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 500, height: 800 } } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !noCi,
    timeout: 120_000,
  },
});
