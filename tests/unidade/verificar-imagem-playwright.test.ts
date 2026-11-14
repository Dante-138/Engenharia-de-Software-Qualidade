import { describe, expect, test } from 'vitest';
import { problemaDaImagem, versaoDaImagem } from '../../tools/verificar-imagem-playwright.ts';

const DIGEST = 'a'.repeat(64);
const workflow = (imagem: string) => `jobs:\n  navegador:\n    container:\n      image: ${imagem}\n`;

describe('imagem do Playwright no CI', () => {
  test('lê a versão da imagem fixada por digest', () => {
    expect(versaoDaImagem(workflow(`mcr.microsoft.com/playwright:v1.65.0-noble@sha256:${DIGEST}`))).toBe('1.65.0');
  });

  test('aceita imagem e pacote na mesma versão', () => {
    expect(
      problemaDaImagem(workflow(`mcr.microsoft.com/playwright:v1.65.0-noble@sha256:${DIGEST}`), '1.65.0'),
    ).toBeNull();
  });

  test('reprova imagem sem digest', () => {
    expect(problemaDaImagem(workflow('mcr.microsoft.com/playwright:v1.65.0-noble'), '1.65.0')).toContain('@sha256');
  });

  test('reprova versão diferente e diz como corrigir', () => {
    const problema = problemaDaImagem(
      workflow(`mcr.microsoft.com/playwright:v1.65.0-noble@sha256:${DIGEST}`),
      '1.66.0',
    );
    expect(problema).toContain('a imagem do CI é a 1.65.0 e o @playwright/test instalado é o 1.66.0');
    expect(problema).toContain('mcr.microsoft.com/playwright:v1.66.0-noble');
  });
});
