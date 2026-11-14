// Portão das mensagens de commit. Sem dependências: roda direto no Node 22.18+,
// que entende TypeScript sem etapa de build.
//
// Uso: node tools/verificar-commits.ts <base>
//   <base>  ponto de partida da comparação, por exemplo origin/main.
//           Confere os commits de <base>..HEAD. Se <base> ainda não existe
//           (repositório novo, antes do primeiro push), confere todos.
//
// Variáveis de ambiente opcionais (o CI preenche):
//   TITULO_PR        título do pull request. Com squash merge é ele que vira o
//                    commit na main, então passa pela mesma regra.
//   DESTINO_DO_PR    branch de destino do pull request. Tem que ser a main:
//                    PR empilhado (destino em outro branch) escapa da proteção.
//
// Regras:
// 1. Assunto no padrão Conventional Commits: tipo(escopo opcional): descrição
// 2. Assunto com no máximo 72 caracteres e sem ponto final
// 3. Nenhuma linha de coautoria ou de "gerado por" na mensagem

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const TIPOS = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];
export const TAMANHO_MAXIMO = 72;
export const BRANCH_PRINCIPAL = 'main';

const ASSUNTO = new RegExp(`^(${TIPOS.join('|')})(\\([a-z0-9-]+\\))?!?: \\S.*$`);
// \u{1F916} é o emoji de robô que algumas ferramentas põem na assinatura.
const AUTORIA_DE_TERCEIRO = /^\s*(co-authored-by:|signed-off-by:|generated (with|by)\b)|\u{1F916}/imu;

/** Problemas de um assunto de commit (lista vazia quando está certo). */
export function problemasDoAssunto(assunto: string): string[] {
  const problemas: string[] = [];
  if (!ASSUNTO.test(assunto)) {
    problemas.push(`fora do padrão "tipo(escopo): descrição" (tipos: ${TIPOS.join(', ')})`);
  }
  if (assunto.length > TAMANHO_MAXIMO) {
    problemas.push(`tem ${assunto.length} caracteres (máximo ${TAMANHO_MAXIMO})`);
  }
  if (assunto.endsWith('.')) problemas.push('termina com ponto final');
  return problemas;
}

/** Problemas da mensagem inteira (assunto + corpo). */
export function problemasDaMensagem(mensagem: string): string[] {
  const assunto = mensagem.split('\n', 1)[0] ?? '';
  const problemas = problemasDoAssunto(assunto.trim());
  if (AUTORIA_DE_TERCEIRO.test(mensagem)) problemas.push('contém linha de coautoria ou de "gerado por"');
  return problemas;
}

/** Problema do destino do PR, ou null quando vai para a main. */
export function problemaDoDestino(destino: string): string | null {
  return destino === BRANCH_PRINCIPAL
    ? null
    : `o PR aponta para "${destino}"; todo PR vai direto para a ${BRANCH_PRINCIPAL} (pilha de PRs escapa da proteção)`;
}

interface Item {
  rotulo: string;
  problemas: string[];
}

function git(argumentos: string[]): string {
  return execFileSync('git', argumentos, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function baseExiste(base: string): boolean {
  try {
    git(['rev-parse', '--verify', '--quiet', `${base}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function commitsDesde(base: string): Item[] {
  if (!baseExiste('HEAD')) return []; // repositório sem nenhum commit ainda
  const intervalo = baseExiste(base) ? `${base}..HEAD` : 'HEAD';
  // %x00 separa os commits; %x01 separa o hash da mensagem.
  const saida = git(['log', '--no-merges', '--format=%h%x01%B%x00', intervalo]);
  return saida
    .split('\0')
    .map((bloco) => bloco.trim())
    .filter(Boolean)
    .map((bloco) => {
      const [hash = '', mensagem = ''] = bloco.split('\x01');
      return { rotulo: `${hash} ${mensagem.split('\n', 1)[0] ?? ''}`, problemas: problemasDaMensagem(mensagem.trim()) };
    });
}

function principal(base: string | undefined): number {
  if (!base) {
    console.error('Uso: node tools/verificar-commits.ts <base>   (exemplo: origin/main)');
    return 2;
  }

  const itens = commitsDesde(base);
  const titulo = process.env['TITULO_PR'];
  if (titulo) itens.push({ rotulo: `título do PR: ${titulo}`, problemas: problemasDoAssunto(titulo.trim()) });
  const destino = process.env['DESTINO_DO_PR'];
  const problemaDestino = destino ? problemaDoDestino(destino) : null;
  if (problemaDestino) itens.push({ rotulo: 'destino do PR', problemas: [problemaDestino] });

  const reprovados = itens.filter((item) => item.problemas.length > 0);
  for (const item of reprovados) {
    console.error(`REPROVADO  ${item.rotulo}`);
    for (const problema of item.problemas) console.error(`           - ${problema}`);
  }
  console.log(`${itens.length} item(ns) conferido(s), ${reprovados.length} reprovado(s).`);
  return reprovados.length > 0 ? 1 : 0;
}

// Executado direto pela linha de comando (e não importado por um teste).
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = principal(process.argv[2]);
}
