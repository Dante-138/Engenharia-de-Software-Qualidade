// Audita os workflows do GitHub Actions com duas ferramentas, em container:
//
//   actionlint  sintaxe, expressões, tipos dos inputs e, pelo shellcheck que vem
//               na imagem, os scripts dos blocos "run"
//   zizmor      segurança: injeção de template, permissões demais, action ou
//               imagem sem hash, credencial persistida, envenenamento de cache,
//               gatilhos perigosos (pull_request_target, workflow_run)
//
// Roda igual no CI e no PC; no PC precisa do Docker Desktop aberto.
// Imagens fixadas por digest: o mesmo binário sempre. --offline: o zizmor não
// consulta a API do GitHub (não precisa de token e o resultado não varia).

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ACTIONLINT = 'rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667';
const ZIZMOR =
  'ghcr.io/zizmorcore/zizmor:1.32.0@sha256:3014cc8f68f663935f69b3c3e0e41f5ce102b268d97db13db0f62208747f860d';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const volume = ['run', '--rm', '-v', `${raiz}:/repo`, '-w', '/repo'];

function rodar(nome, argumentos) {
  console.log(`== ${nome}`);
  const resultado = spawnSync('docker', [...volume, ...argumentos], { stdio: 'inherit' });
  return resultado.status ?? 1;
}

const falhas = [rodar('actionlint', [ACTIONLINT, '-color']), rodar('zizmor', [ZIZMOR, '--offline', '.'])].filter(
  (status) => status !== 0,
).length;

process.exitCode = falhas > 0 ? 1 : 0;
