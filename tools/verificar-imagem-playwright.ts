// Confere que o container do Playwright no CI está fixado por digest e na mesma
// versão do pacote @playwright/test instalado.
//
// Por quê: imagem por tag pode mudar por baixo (o zizmor reprova); imagem por
// digest não muda sozinha, e aí o risco vira o contrário: o Dependabot atualiza
// o pacote, a imagem fica para trás e o navegador do CI deixa de bater com a
// biblioteca. Este portão transforma esse descompasso num erro claro.
//
// Uso: node tools/verificar-imagem-playwright.ts
// Fonte única da imagem: .github/workflows/ci.yml (o tools/navegador-docker.mjs lê de lá).

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const IMAGEM = /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-noble@sha256:[0-9a-f]{64}/;

/** Versão da imagem fixada no workflow, ou null se não houver imagem fixada por digest. */
export function versaoDaImagem(workflow: string): string | null {
  return IMAGEM.exec(workflow)?.[1] ?? null;
}

/** Problema encontrado, ou null quando imagem e pacote batem. */
export function problemaDaImagem(workflow: string, versaoDoPacote: string): string | null {
  const versao = versaoDaImagem(workflow);
  if (versao === null) {
    return 'ci.yml não tem a imagem mcr.microsoft.com/playwright:vX.Y.Z-noble@sha256:<digest>';
  }
  if (versao !== versaoDoPacote) {
    return (
      `a imagem do CI é a ${versao} e o @playwright/test instalado é o ${versaoDoPacote}. ` +
      'Atualize a tag e o digest no ci.yml (o digest sai de "docker buildx imagetools inspect ' +
      `mcr.microsoft.com/playwright:v${versaoDoPacote}-noble") e regrave as referências visuais.`
    );
  }
  return null;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const pacote = JSON.parse(
    readFileSync(new URL('../node_modules/@playwright/test/package.json', import.meta.url), 'utf8'),
  ) as { version: string };
  const problema = problemaDaImagem(workflow, pacote.version);
  if (problema) console.error(`REPROVADO  ${problema}`);
  else console.log(`Imagem do Playwright: ${pacote.version}, fixada por digest.`);
  process.exitCode = problema ? 1 : 0;
}
