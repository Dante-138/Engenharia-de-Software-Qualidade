// Roda os testes de navegador dentro do mesmo container que o CI usa, com a
// regressão visual ligada. É o único jeito de gerar ou conferir as imagens de
// referência no PC: fora do container a fonte e a renderização mudam.
//
// Uso:
//   npm run test:navegador:docker                          confere
//   npm run test:navegador:docker -- --update-snapshots    regrava as referências
//
// A imagem é a mesma do CI, lida do .github/workflows/ci.yml (fonte única,
// fixada por digest). node_modules fica num volume do Docker (os binários do
// Linux não podem misturar com os do Windows).
// Precisa do Docker Desktop aberto.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const pacote = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const imagem = /mcr\.microsoft\.com\/playwright:v[\d.]+-noble@sha256:[0-9a-f]{64}/.exec(workflow)?.[0];
if (!imagem) throw new Error('Imagem do Playwright não encontrada no ci.yml');
const volume = `${pacote.name}-node-modules`;
const argumentos = process.argv
  .slice(2)
  .map((a) => `'${a.replaceAll("'", "'\\''")}'`)
  .join(' ');

const resultado = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--ipc=host',
    '-v',
    `${raiz}:/repo`,
    '-v',
    `${volume}:/repo/node_modules`,
    '-w',
    '/repo',
    '-e',
    'NAVEGADOR_CONTAINER=1',
    imagem,
    'bash',
    '-c',
    `npm ci --ignore-scripts --no-audit --no-fund && npx playwright test ${argumentos}`,
  ],
  { stdio: 'inherit' },
);

process.exitCode = resultado.status ?? 1;
