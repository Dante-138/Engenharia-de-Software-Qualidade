import { describe, expect, test } from 'vitest';
import { acharEscapes } from '../../tools/verificar-escapes.ts';

describe('rotas de fuga', () => {
  test.each([
    ['// Stryker disable next-line all', 'desliga o teste de mutação'],
    ['/* c8 ignore next */', 'esconde código da cobertura'],
    ['/* v8 ignore start */', 'esconde código da cobertura'],
    ['// prettier-ignore', 'desliga a formatação'],
    ["test.only('x', () => {})", 'pula ou isola teste'],
    ["describe.skip('x', () => {})", 'pula ou isola teste'],
    ["test.describe.only('x', () => {})", 'pula ou isola teste'],
  ])('acha %j', (linha, motivo) => {
    expect(acharEscapes(`const a = 1;\n${linha}\n`)).toEqual([{ linha: 2, motivo, trecho: linha }]);
  });

  test('não acusa código comum', () => {
    expect(acharEscapes("test('only the date', () => {});\nconst skip = 1;\n")).toEqual([]);
  });
});
