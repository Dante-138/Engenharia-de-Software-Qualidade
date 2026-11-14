# 8. Segurança da cadeia de suprimentos

Cadeia de suprimentos é tudo o que entra no projeto sem ser escrito nele: pacotes do npm,
actions do GitHub, imagens Docker, o próprio CI. É por onde a maioria dos ataques chega.

## Dependências

**Lockfile e `npm ci`.** O `package-lock.json` fixa a versão exata de cada pacote, com
hash. O CI usa `npm ci`, que instala exatamente o lockfile e falha se ele estiver fora de
sincronia com o `package.json`.

**`--ignore-scripts`.** Pacote malicioso costuma agir no `postinstall`. Instalando sem
scripts, nenhum código de dependência roda na instalação.

**Versões exatas no `package.json`.** O template lista `"vite": "8.3.7"`, sem `^`. Quem
muda versão é o Dependabot, em PR próprio, pelo CI.

**`npm audit` desde o primeiro dia.** Caso real deste repositório: a instalação inicial já
veio com duas falhas moderadas em dependências indiretas (`minimatch`, puxado pelo
typescript-eslint e pelo Stryker, e `qs`, puxado pelo Stryker). As versões diretas eram as
mais novas; a correção foi forçar a versão corrigida das indiretas com `overrides` no
`package.json`, conferir que os testes continuavam verdes e documentar. O
`dependency-review` do CI reprovaria o primeiro PR se isso tivesse passado.

**Dependency review.** No PR, a action compara as dependências antes e depois e reprova se
o PR trouxer pacote com vulnerabilidade conhecida (`fail-on-severity: low`).

**Dependabot.** Arquivo [`.github/dependabot.yml`](../.github/dependabot.yml):

- PR semanal, agrupado por ecossistema (npm e actions), o que mantém o título curto para o
  portão de commits e testa as atualizações juntas;
- `cooldown` de 7 dias: só propõe versão publicada há pelo menos uma semana. Pacote
  comprometido costuma ser descoberto e retirado nos primeiros dias;
- alertas e correções de segurança ligados pelo `configurar-repo.sh`.

## Lockfile entre Windows e Linux

Caso real deste repositório: o `package-lock.json` gerado no Windows não tinha duas
dependências opcionais (`@emnapi/core` e `@emnapi/runtime`, puxadas pelo pacote
WebAssembly do Rolldown, o empacotador do Vite). No Windows, `npm ci` passava; no container Linux, reprovava
com "package.json e package-lock.json fora de sincronia".

Correção: regenerar o lockfile dentro de um container Linux
(`npm install --package-lock-only`) e conferir `npm ci` nos dois sistemas. Regra: depois
de mexer em dependência no Windows, rode `npm ci` no container antes de abrir o PR, ou
deixe o CI pegar.

## Actions e imagens

- **Actions por hash de commit**, com a versão em comentário (guia 2).
- **Imagens Docker por digest** quando a versão não é controlada por outro arquivo:
  `gcc:14@sha256:...` na receita de C, `rhysd/actionlint:1.7.12@sha256:...` no lint dos
  workflows. A exceção é o container do Playwright, que segue a versão do pacote no
  lockfile.
- **actionlint** confere sintaxe, expressões e permissões dos workflows, e roda o
  shellcheck nos blocos `run`. Workflow errado costuma falhar só no momento em que é
  disparado; o actionlint pega antes.
- **CodeQL** analisa o código, os workflows e o C (`codeql.yml`), no PR, na `main` e toda
  segunda, para pegar regra nova mesmo sem commit.

## Segredos

- **Secret scanning com push protection:** o GitHub recusa o push que contém chave de API,
  token ou senha reconhecível. Ligado pelo `configurar-repo.sh`.
- **`.gitignore` defensivo:** `.env`, `*.pem`, `*.key`, `*.jks`, `*.keystore`, `*.p12`.
- **Segredo só em secret do repositório**, nunca em arquivo, log ou print. Em repositório
  público, print de PR só com dado de demonstração.
- Chave de assinatura (de app, de firmware, de OTA) fica fora do repositório, com cópia de
  segurança: perder a chave obriga a reinstalar o app e perder dado.
- **Código do PR não roda com secret.** Num PR, o workflow roda o código do próprio PR.
  Se um passo recebe um secret e executa um script que o PR pode alterar, o PR pode mandar
  o secret para fora. Por isso o `pr.yml`, que recebe o `TERMOS_PROIBIDOS`, roda o
  verificador da `main` (`git show origin/main:tools/verificar-commits.ts`), já revisado.
  A mudança no verificador vale nesse check depois do merge; antes disso, os testes de
  unidade do Gate conferem a versão do PR.

## No próprio app (web)

O build injeta uma Content Security Policy rígida (`vite.config.ts`):

- `default-src 'none'` e só `'self'` para script, estilo, imagem e conexão;
- `require-trusted-types-for 'script'` e `trusted-types 'none'`: atribuir texto a um
  destino de script (`innerHTML` com `<script>`, `eval` e afins) é bloqueado pelo
  navegador.

Como os testes de navegador rodam contra o build e reprovam erro de console, qualquer
violação da política aparece como teste vermelho.
