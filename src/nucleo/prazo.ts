// Núcleo de exemplo: lógica pura de prazos.
//
// Tudo aqui é função pura: entra dado, sai dado. Sem DOM, sem armazenamento,
// sem relógio (a data de hoje chega por parâmetro). O lint e o tsconfig do
// núcleo garantem isso, e é por isso que dá para exigir 100% de cobertura e
// rodar teste de mutação e de propriedade aqui.

const MS_POR_DIA = 86_400_000;

/** Data no formato AAAA-MM-DD, já validada por {@link lerData}. */
export type DataIso = string & { readonly __dataIso: unique symbol };

/**
 * Converte texto em DataIso. Devolve null quando o texto não é uma data real.
 *
 * A validação é uma volta completa: monta a data e confere se ela, escrita de
 * novo em AAAA-MM-DD, é igual ao texto. Assim "2026-02-30", "2026-1-5" e
 * "x2026-11-14" caem pela mesma regra, sem uma checagem para cada caso.
 */
export function lerData(texto: string): DataIso | null {
  const [ano = Number.NaN, mes = Number.NaN, dia = Number.NaN] = texto.split('-').map(Number);
  const instante = Date.UTC(ano, mes - 1, dia);
  if (Number.isNaN(instante)) return null;
  return new Date(instante).toISOString().slice(0, 10) === texto ? (texto as DataIso) : null;
}

function emDias(data: DataIso): number {
  return Date.parse(`${data}T00:00:00Z`) / MS_POR_DIA;
}

/** Dias de "de" até "ate". Positivo quando "ate" vem depois. */
export function diasEntre(de: DataIso, ate: DataIso): number {
  return emDias(ate) - emDias(de);
}

/** Soma (ou subtrai) dias a uma data. */
export function somarDias(data: DataIso, dias: number): DataIso {
  return new Date((emDias(data) + dias) * MS_POR_DIA).toISOString().slice(0, 10) as DataIso;
}

/**
 * Texto curto que diz quanto falta para o prazo, ou há quanto tempo ele venceu.
 *
 * Cada faixa é testada uma vez só, em ordem: sem condição redundante, o teste
 * de mutação consegue matar toda troca de operador.
 */
export function descreverPrazo(hoje: DataIso, prazo: DataIso): string {
  const dias = diasEntre(hoje, prazo);
  if (dias > 1) return `Faltam ${dias} dias`;
  if (dias === 1) return 'Vence amanhã';
  if (dias === 0) return 'Vence hoje';
  if (dias === -1) return 'Venceu ontem';
  return `Venceu há ${-dias} dias`;
}
