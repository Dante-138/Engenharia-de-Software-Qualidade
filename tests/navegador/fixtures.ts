// Fixture compartilhada pelos testes de navegador: o "sanitizer" da web.
//
// Todo teste falha no fim se a página registrou erro de console, exceção não
// tratada, promessa rejeitada sem catch, violação de CSP ou requisição que
// falhou. Erro que só aparece no console não passa despercebido.

import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ errosDaPagina: string[] }>({
  errosDaPagina: [
    async ({ page }, usar) => {
      const erros: string[] = [];
      page.on('pageerror', (erro) => erros.push(`exceção: ${erro.message}`));
      page.on('console', (mensagem) => {
        if (mensagem.type() === 'error' || mensagem.type() === 'warning') {
          erros.push(`console.${mensagem.type()}: ${mensagem.text()}`);
        }
      });
      page.on('requestfailed', (pedido) => erros.push(`requisição falhou: ${pedido.url()}`));
      page.on('response', (resposta) => {
        if (resposta.status() >= 400) erros.push(`HTTP ${resposta.status()}: ${resposta.url()}`);
      });

      await usar(erros);

      expect(erros, 'a página registrou erros durante o teste').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
