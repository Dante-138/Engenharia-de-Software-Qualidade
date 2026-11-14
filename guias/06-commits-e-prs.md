# 6. Commits e pull requests

Arquivos: [`tools/verificar-commits.ts`](../tools/verificar-commits.ts),
[`.githooks/pre-push`](../.githooks/pre-push),
[`.github/pull_request_template.md`](../.github/pull_request_template.md).

## Regras do portão de commits

1. Assunto em Conventional Commits: `tipo(escopo opcional): descrição`, com os tipos
   `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
   `revert`. Escopo em minúsculas. `!` depois do tipo marca mudança que quebra
   compatibilidade.
2. Assunto com no máximo 72 caracteres e sem ponto final.
3. Nenhuma linha `Co-Authored-By`, `Signed-off-by` ou "Generated with/by", nem o emoji de
   robô que algumas ferramentas põem na assinatura. A autoria do repositório é de quem é
   dono dele.
4. O título do PR passa pela mesma regra: com squash merge, ele vira o commit da `main`.
5. O PR aponta para a `main`. PR com destino em outro branch reprova (ver abaixo).

Por que Conventional Commits: o histórico vira documentação legível, e o release-please
(guia 9) monta a versão e o CHANGELOG a partir dele. `feat` sobe a versão menor, `fix` a de
correção, `!` a maior.

## Um PR pequeno por mudança

- Um assunto por PR. "Corrige o bug X e aproveita para refatorar Y" são dois PRs.
- PR pequeno é revisado de verdade, reverte limpo e mostra no CHANGELOG uma linha que faz
  sentido.
- Cada PR diz como testar (modelo em `.github/pull_request_template.md`).

## Nunca empilhar PR

PR empilhado é um PR cujo destino é o branch de outro PR, não a `main`. Parece prático
para mudanças em sequência. O problema: a proteção vale para a `main`, não para o branch
intermediário. Quando o PR de cima é mesclado no branch do de baixo, ele entra sem portão,
e depois chega à `main` misturado no outro.

Caso real: dois PRs de uma pilha foram mesclados nos branches intermediários, e o código
deles chegou à `main` sem ter passado pela proteção como PR próprio. Desde então:

- todo PR aponta direto para a `main`;
- o portão reprova PR com outro destino (`DESTINO_DO_PR` no CI);
- se uma mudança depende de outra ainda aberta, espera o merge da primeira e faz rebase.

O check vermelho é um aviso forte, não uma trava: num branch sem proteção, o GitHub ainda
deixa mesclar. A trava de verdade é a regra de quem dá o merge (guia 10).

## O portão também roda no PC

O `npm run check` começa pelo portão de commits (`npm run commits`, contra `origin/main`),
e o hook `pre-push` roda o `npm run check` antes de cada push. O hook é ativado pelo
`npm install` (script `prepare`, que aponta o `core.hooksPath` para `.githooks`).

Caso real que motivou isso: um assunto de commit com 74 caracteres passou na verificação
local, que na época não conferia commits, e só reprovou no CI. Com force push bloqueado,
corrigir o assunto custou fechar os PRs e abrir de novo. Erro que o portão pega, o PC tem
que pegar antes do push.

Pular o hook (`git push --no-verify`) só em emergência: o CI confere tudo de novo.

## Mensagens: como escrever

- Assunto no imperativo, em inglês, dizendo o efeito: `fix(nucleo): reject 2026-02-30`,
  não `fix: changes in date file`.
- Corpo, quando precisa, explica o porquê e o que foi descartado.
- Sem número de ticket interno no assunto de repositório público.
