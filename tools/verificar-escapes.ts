// Procura "rotas de fuga" no código: comentários e chamadas que desligam um
// portão sem mudar a configuração dele. O lint já proíbe eslint-disable
// (noInlineConfig) e @ts-ignore (ban-ts-comment); aqui ficam as que o lint não vê.
//
// Uso: node tools/verificar-escapes.ts [pastas...]   (padrão: src tests tools)

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PROIBIDOS: readonly { padrao: RegExp; motivo: string }[] = [
  { padrao: /Stryker\s+(disable|restore)/, motivo: 'desliga o teste de mutação' },
  { padrao: /(c8|v8|istanbul)\s+ignore/, motivo: 'esconde código da cobertura' },
  { padrao: /prettier-ignore/, motivo: 'desliga a formatação' },
  // Pega também o test.describe.only( do Playwright, pelo trecho "describe.only(".
  { padrao: /\b(test|it|describe)\.(only|skip|todo|fixme)\s*\(/, motivo: 'pula ou isola teste' },
];

const EXTENSOES = /\.(ts|tsx|js|mjs|cjs)$/;
const ESTE_ARQUIVO = 'verificar-escapes';

/** Ocorrências proibidas em um texto, com o número da linha (base 1). */
export function acharEscapes(texto: string): { linha: number; motivo: string; trecho: string }[] {
  return texto.split('\n').flatMap((conteudo, indice) =>
    PROIBIDOS.filter(({ padrao }) => padrao.test(conteudo)).map(({ motivo }) => ({
      linha: indice + 1,
      motivo,
      trecho: conteudo.trim(),
    })),
  );
}

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return EXTENSOES.test(nome) && !nome.includes(ESTE_ARQUIVO) ? [caminho] : [];
  });
}

function principal(pastas: string[]): number {
  const achados = pastas
    .flatMap(arquivos)
    .flatMap((arquivo) => acharEscapes(readFileSync(arquivo, 'utf8')).map((achado) => ({ arquivo, ...achado })));
  for (const { arquivo, linha, motivo, trecho } of achados) {
    console.error(`${arquivo}:${linha}  ${motivo}: ${trecho}`);
  }
  console.log(`Rotas de fuga: ${achados.length}.`);
  return achados.length > 0 ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const pastas = process.argv.slice(2);
  process.exitCode = principal(pastas.length > 0 ? pastas : ['src', 'tests', 'tools']);
}
