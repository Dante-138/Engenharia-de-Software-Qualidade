# 2. CI no GitHub Actions

Arquivo: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Estrutura

Três jobs no `ci.yml`, todos exigidos pela proteção da `main` (o quarto check exigido é o
`Texto do PR`, do `pr.yml`):

| Job         | Roda                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `Gate`      | dependency review, actionlint, zizmor, versões, lint, formato, tipos, unidade, build, artefato |
| `Navegador` | Playwright no container oficial: fluxo, console, axe, regressão visual                         |
| `Mutacao`   | Stryker no núcleo                                                                              |

`Navegador` e `Mutacao` dependem do `Gate` (`needs: gate`): se o básico falhou, não gasta
minuto com o resto.

## Decisões, uma por uma

**Actions fixadas por hash.** `uses: actions/checkout@3d3c42e...  # v7.0.1`. Uma tag pode
ser movida para outro commit por quem controla o repositório da action (ou por quem
invadiu esse repositório). O hash não muda. O comentário com a versão é para humano ler e
para o Dependabot saber o que atualizar.

**Token só leitura.** `permissions: contents: read` no topo. Job que precisa escrever pede
no próprio job (o CodeQL pede `security-events: write`, a release pede `contents: write`).
Um script comprometido no CI não consegue empurrar código com o token.

**`persist-credentials: false`.** O checkout, por padrão, deixa o token gravado no
`.git/config` para os passos seguintes. Nenhum passo aqui precisa dele.

**`npm ci --ignore-scripts`.** `npm ci` instala exatamente o `package-lock.json` (falha se
ele estiver fora de sincronia). `--ignore-scripts` impede que qualquer dependência rode
código na instalação, que é o vetor mais comum de pacote malicioso.

**`fetch-depth: 0` no `pr.yml`.** O portão de commits compara o branch com a `main` e
precisa do histórico.

**`concurrency` com `cancel-in-progress`.** Push novo no mesmo PR cancela a execução
anterior. Economiza minuto e evita resultado velho.

**`timeout-minutes` em todo job.** Teste travado não fica 6 horas consumindo minuto.

**Nome do job é contrato.** A proteção da `main` exige os checks pelo nome (`Texto do PR`, `Gate`,
`Navegador`, `Mutacao`). Renomear o job sem atualizar a proteção deixa todo PR esperando
um check que nunca vai chegar. O script `tools/configurar-repo.sh` tem a lista.

**Container do Playwright fixado por digest e na versão do pacote.** O `Navegador` roda em
`mcr.microsoft.com/playwright:v<versão>-noble@sha256:<digest>`. Navegador e pacote fora de
versão é erro clássico, e o Dependabot atualiza só o pacote; por isso o `Gate` roda
`npm run versoes`, que reprova o descompasso e diz como atualizar a imagem. A linha do
`ci.yml` é a fonte única: o `npm run test:navegador:docker` lê a imagem dali.

**Artefato por PR.** O build testado vai como artefato (`build-<commit>`), 14 dias. Quem
revisa baixa e abre exatamente o que passou nos testes. Num app Android, é aqui que entra
o APK de depuração do PR.

**Relatório só na falha.** O `Navegador` e o `Mutacao` guardam o relatório quando falham.
Na regressão visual, o relatório traz a imagem nova e a diferença.

**`dependency-review`, `actionlint` e `zizmor` no Gate.** Ver guia 8.

## Workflows separados

| Arquivo         | Para quê                                                                                |
| --------------- | --------------------------------------------------------------------------------------- |
| `pr.yml`        | texto e destino do PR, também quando o PR é editado (check `Texto do PR`, exigido)      |
| `codeql.yml`    | análise de segurança (JS/TS, os próprios workflows e C) no PR, na `main` e toda segunda |
| `release.yml`   | versão, CHANGELOG, tag, release e atestação de proveniência (guia 9)                    |
| `scorecard.yml` | nota do OpenSSF Scorecard, na `main` e toda segunda (guia 8)                            |
| `receita-c.yml` | testes de C com sanitizers, só quando a receita muda                                    |

## Rodar no PC o que o CI roda

```bash
npm run check                    # commits, lint, formato, tipos, unidade, build
npm run test:navegador           # navegador sem a regressão visual (Chromium local)
npm run test:navegador:docker    # navegador completo, no mesmo container do CI
npm run test:mutacao             # Stryker
npm run lint:actions             # actionlint e zizmor (Docker)
npm run versoes                  # imagem do Playwright x pacote
```

Os dois comandos com Docker precisam do Docker Desktop aberto.

## Para adaptar a outra linguagem

O formato é o mesmo: job `Gate` rápido e exigido, jobs lentos com `needs`, ferramentas
fixadas por versão ou hash, token mínimo, instalação sem scripts, artefato do build. Em
firmware, o `Gate` compila o alvo e roda os testes de host com sanitizers (guia 5), e o
artefato é o binário com a versão no nome.
