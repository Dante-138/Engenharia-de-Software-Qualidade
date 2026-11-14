# 9. Releases, versão e artefatos

Arquivos: [`.github/workflows/release.yml`](../.github/workflows/release.yml),
[`release-please-config.json`](../release-please-config.json),
[`vite.config.ts`](../vite.config.ts).

## Versão e commit visíveis no app

O build grava a versão do `package.json` e o commit curto (`v0.1.0 (a1b2c3d)`), e o app
mostra isso na tela. Parece detalhe e resolve muita coisa:

- quem testa diz exatamente qual build está aberto;
- relato de defeito vem com a versão (o modelo de issue pede);
- num celular com vários builds instalados, não tem dúvida de qual é qual.

No CI, o commit vem da variável `COMMIT` (o commit do PR, não o merge temporário que o
GitHub monta). No PC, do `git rev-parse`. O teste de navegador confere o formato, e a
regressão visual mascara esse trecho.

## Artefato por PR

Todo PR gera o artefato `build-<commit>` com o build testado (guia 2). Num app Android, é o
lugar do APK de depuração do PR, de preferência com outro identificador de pacote (por
exemplo, sufixo `.pr`) e dados de demonstração, para instalar lado a lado com o app de uso
real sem misturar dado.

## Releases automáticas com release-please

A cada merge na `main`, o release-please lê os commits desde a última versão e mantém um
PR `chore: release x.y.z` com:

- a versão nova no `package.json` (`feat` sobe a menor, `fix` a de correção, `!` a maior);
- o `CHANGELOG.md` com as seções Novidades, Correções, Desempenho, Reversões e
  Documentação (o resto fica oculto).

Quando esse PR é mesclado, ele cria a tag `vx.y.z` e a release, e o workflow anexa o
build. Ninguém edita versão nem CHANGELOG à mão.

### O token de release

Com o `GITHUB_TOKEN` padrão, o GitHub evita laço de workflow: o CI do PR que ele abre fica
parado esperando alguém aprovar a execução à mão ("Approve workflows to run"), e a tag e a
release que ele cria não disparam workflow nenhum. Na prática, todo PR de release viraria
um clique manual, e nada que dependa da tag rodaria. Fonte: seção "Triggering a workflow
from a workflow" em
<https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow>
(conferida em 14/11/2026). A exceção do PR com execução aguardando aprovação está nessa
página; não foi observada neste repositório, que ainda não tem o `RELEASE_TOKEN`.

Solução: um token fino (fine-grained) só para este repositório, guardado como secret
`RELEASE_TOKEN`:

1. GitHub, Settings, Developer settings, Fine-grained tokens, Generate new token.
2. Repository access: só este repositório.
3. Permissions: Contents (leitura e escrita) e Pull requests (leitura e escrita).
4. Validade curta, com lembrete para renovar.
5. No repositório: Settings, Secrets and variables, Actions, New repository secret,
   nome `RELEASE_TOKEN`.

Sem o secret, o workflow só registra um aviso e termina verde: o projeto funciona, só sem
release automática.

## Atestação de proveniência

O pacote da release sai com uma atestação assinada de que veio deste workflow e deste
commit (guia 8, seção SLSA). Conferir antes de usar um pacote baixado:

```bash
gh attestation verify app-v1.2.3.tar.gz --repo dono/repositorio
```

## Firmware

A mesma ideia vale para binário de firmware: versão gravada no binário e reportada pelo
dispositivo, artefato do CI com a versão no nome, CHANGELOG gerado dos commits, e binário
de produção saindo só do CI (nunca da máquina de quem desenvolve).
