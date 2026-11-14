import { describe, expect, test } from 'vitest';
import {
  problemaDoDestino,
  problemasDaMensagem,
  problemasDoAssunto,
  TAMANHO_MAXIMO,
} from '../../tools/verificar-commits.ts';

describe('portão de commits', () => {
  test.each(['feat: add a deadline field', 'fix(nucleo): reject 2026-02-30', 'refactor!: drop the old format'])(
    'aceita %j',
    (assunto) => {
      expect(problemasDoAssunto(assunto)).toEqual([]);
    },
  );

  test.each([
    ['Add a field', 'fora do padrão'],
    ['feat:missing space', 'fora do padrão'],
    ['feature: wrong type', 'fora do padrão'],
    ['feat(Escopo): uppercase scope', 'fora do padrão'],
    ['fix: ends with a period.', 'ponto final'],
  ])('recusa %j', (assunto, motivo) => {
    expect(problemasDoAssunto(assunto).join(' ')).toContain(motivo);
  });

  // Caso real: um assunto com 74 caracteres passou no check local (que não
  // conferia commits) e só reprovou no CI.
  test('recusa assunto acima do limite e aceita no limite', () => {
    const prefixo = 'feat: ';
    const noLimite = prefixo + 'x'.repeat(TAMANHO_MAXIMO - prefixo.length);
    expect(problemasDoAssunto(noLimite)).toEqual([]);
    expect(problemasDoAssunto(`${noLimite}y`)).toEqual([`tem ${TAMANHO_MAXIMO + 1} caracteres (máximo 72)`]);
  });

  test.each([
    'feat: x\n\nCo-Authored-By: Alguém <a@b.c>',
    'feat: x\n\nGenerated with some tool',
    'feat: x\n\n\u{1F916} assinatura',
    'feat: x\n\nSigned-off-by: Alguém <a@b.c>',
  ])('recusa coautoria ou "gerado por": %j', (mensagem) => {
    expect(problemasDaMensagem(mensagem)).toEqual(['contém linha de coautoria ou de "gerado por"']);
  });

  test('aceita corpo comum', () => {
    expect(problemasDaMensagem('fix: handle leap years\n\nThe old check missed 2028-02-29.')).toEqual([]);
  });

  test('PR só vai para a main', () => {
    expect(problemaDoDestino('main')).toBeNull();
    expect(problemaDoDestino('feat/base')).toContain('pilha de PRs');
  });
});
