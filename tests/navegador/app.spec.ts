import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures.ts';

// Data fixa: o relógio do navegador é congelado para o teste não depender do dia.
const HOJE = new Date('2026-11-14T12:00:00-03:00');

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(HOJE);
  await page.goto('/');
});

test('mostra quanto falta para o prazo escolhido', async ({ page }) => {
  const campo = page.getByLabel('Prazo');
  const resultado = page.locator('output');

  await expect(resultado).toHaveText('Escolha uma data.');
  await campo.fill('2026-11-20');
  await expect(resultado).toHaveText('Faltam 6 dias');
  await campo.fill('2026-11-13');
  await expect(resultado).toHaveText('Venceu ontem');
});

test('mostra a versão e o commit do build', async ({ page }) => {
  await expect(page.locator('#versao')).toHaveText(/^v\d+\.\d+\.\d+ \(([0-9a-f]{7}|local)\)$/);
});

test('não tem violação de acessibilidade (axe)', async ({ page }) => {
  await page.getByLabel('Prazo').fill('2026-11-20');
  const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(resultado.violations).toEqual([]);
});

test('aparência da tela principal @visual', async ({ page }) => {
  await page.getByLabel('Prazo').fill('2026-11-20');
  await expect(page).toHaveScreenshot('tela-principal.png', {
    // A versão muda a cada commit; fica fora da comparação.
    mask: [page.locator('#versao')],
  });
});
