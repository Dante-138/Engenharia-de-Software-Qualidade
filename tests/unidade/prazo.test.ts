import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { descreverPrazo, diasEntre, lerData, somarDias, type DataIso } from '../../src/nucleo/prazo.ts';

function data(texto: string): DataIso {
  const lida = lerData(texto);
  if (!lida) throw new Error(`data de teste inválida: ${texto}`);
  return lida;
}

describe('lerData', () => {
  test('aceita data real', () => {
    expect(lerData('2026-11-14')).toBe('2026-11-14');
    expect(lerData('2028-02-29')).toBe('2028-02-29');
  });

  test.each([
    '',
    '2026-1-14',
    '14/11/2026',
    '2026-11-14T00:00',
    'abcd-ef-gh',
    'x2026-11-14',
    '2026-11-14 ',
    '0050-01-01',
  ])('recusa formato errado: %j', (texto) => {
    expect(lerData(texto)).toBeNull();
  });

  test.each(['2026-02-29', '2026-13-01', '2026-00-10', '2026-04-31', '2026-11-00'])(
    'recusa data que não existe: %s',
    (texto) => {
      expect(lerData(texto)).toBeNull();
    },
  );
});

describe('diasEntre e somarDias', () => {
  test('conta dias atravessando mês e ano', () => {
    expect(diasEntre(data('2026-12-30'), data('2027-01-02'))).toBe(3);
    expect(diasEntre(data('2027-01-02'), data('2026-12-30'))).toBe(-3);
    expect(somarDias(data('2028-02-28'), 1)).toBe('2028-02-29');
    expect(somarDias(data('2026-03-01'), -1)).toBe('2026-02-28');
  });
});

describe('descreverPrazo', () => {
  const hoje = data('2026-11-14');

  test.each([
    ['2026-11-14', 'Vence hoje'],
    ['2026-11-15', 'Vence amanhã'],
    ['2026-11-16', 'Faltam 2 dias'],
    ['2026-11-13', 'Venceu ontem'],
    ['2026-11-12', 'Venceu há 2 dias'],
  ])('prazo %s: %s', (prazo, esperado) => {
    expect(descreverPrazo(hoje, data(prazo))).toBe(esperado);
  });
});

// Testes por propriedade: em vez de alguns exemplos escolhidos a dedo, o
// fast-check gera centenas de datas e confere regras que valem para todas.
describe('propriedades', () => {
  const umaData = fc
    .date({ min: new Date('1970-01-01T00:00:00Z'), max: new Date('2199-12-31T00:00:00Z'), noInvalidDate: true })
    .map((d) => data(d.toISOString().slice(0, 10)));
  const deslocamento = fc.integer({ min: -20_000, max: 20_000 });

  test('somar n dias e medir a distância devolve n', () => {
    fc.assert(
      fc.property(umaData, deslocamento, (inicio, n) => {
        expect(diasEntre(inicio, somarDias(inicio, n))).toBe(n);
      }),
    );
  });

  // Comparar com -diasEntre(b, a) falharia em a = b: 0 e -0 são diferentes
  // para o toBe. O fast-check achou esse caso na primeira execução.
  test('a distância é antissimétrica', () => {
    fc.assert(
      fc.property(umaData, umaData, (a, b) => {
        expect(diasEntre(a, b) + diasEntre(b, a)).toBe(0);
      }),
    );
  });

  test('toda data gerada por somarDias é lida de volta', () => {
    fc.assert(
      fc.property(umaData, deslocamento, (inicio, n) => {
        const resultado = somarDias(inicio, n);
        expect(lerData(resultado)).toBe(resultado);
      }),
    );
  });

  test('a descrição nunca sai vazia e só diz "Faltam" para o futuro', () => {
    fc.assert(
      fc.property(umaData, umaData, (hoje, prazo) => {
        const texto = descreverPrazo(hoje, prazo);
        expect(texto.length).toBeGreaterThan(0);
        expect(texto.startsWith('Faltam')).toBe(diasEntre(hoje, prazo) > 1);
      }),
    );
  });
});
