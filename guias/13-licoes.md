# 13. Lições reais

Casos que aconteceram em projetos feitos com agentes, contados de forma genérica. Cada um
virou uma regra do portão ou dos guias.

## PR empilhado escapou da proteção

**O que aconteceu:** uma sequência de PRs foi aberta em pilha, cada um com destino no
branch do anterior. Dois deles foram mesclados nos branches intermediários. O código
chegou à `main` dentro de outro PR, sem ter passado pela proteção como PR próprio.

**Regra que ficou:** todo PR aponta para a `main`; o portão reprova outro destino; mudança
dependente espera o merge da anterior. (Guia 6.)

## Título de commit com 74 caracteres

**O que aconteceu:** a verificação local não conferia mensagens de commit. Um assunto com
74 caracteres passou no PC e reprovou no CI. Como force push é bloqueado, os PRs foram
fechados e abertos de novo.

**Regra que ficou:** o `npm run check` começa pelo portão de commits, e o `pre-push` roda o
`check`. (Guia 6.)

## O plugin de vibração que zumbia

**O que aconteceu:** num app híbrido (web dentro de uma casca Android com Capacitor), a
resposta tátil foi feita com o plugin de háptico do Capacitor. No Android, a vibração
saía longa, parecendo um zumbido, em vez do toque curto esperado.

**Regra que ficou:** para resposta tátil no Android, usar a vibração nativa do sistema
(`performHapticFeedback` da View, com as constantes de toque do Android), que respeita a
configuração do aparelho. Plugin genérico de vibração serve para alerta, não para toque de
interface. Vale como princípio: em casca nativa, comportamento de "sensação" (toque,
rolagem, voltar) se testa no aparelho, não só no navegador do PC.

## Cobertura 100%, mutação 83,78%

**O que aconteceu:** neste repositório, o núcleo de exemplo tinha 100% de cobertura de
linhas e ramos. O Stryker achou 6 mutantes sobreviventes: um teste faltando e condições
redundantes.

**Regra que ficou:** mutação com meta de 100% no núcleo; sobrevivente se resolve com teste
ou com código mais simples, nunca com comentário que desliga. (Guia 4.)

## 0 e -0

**O que aconteceu:** o teste por propriedade reprovou na primeira execução: para duas
datas iguais, a distância era `0` e o teste esperava `-0`. Nenhum exemplo escrito à mão
tinha duas datas iguais.

**Regra que ficou:** teste por propriedade em todo código que transforma ou valida dado.
(Guia 4.)

## Lockfile do Windows quebrou o CI do Linux

**O que aconteceu:** o `package-lock.json` gerado no Windows não tinha dependências
opcionais que o Linux pede. `npm ci` passava no PC e reprovava no container.

**Regra que ficou:** lockfile regenerado e conferido no container Linux quando mexer em
dependência. (Guia 8.)

## Falha de segurança no primeiro `npm install`

**O que aconteceu:** com todas as versões diretas na mais nova, o `npm audit` ainda
acusou duas falhas moderadas em dependências indiretas.

**Regra que ficou:** `npm audit` e `dependency-review` desde o primeiro PR; `overrides` para
forçar a versão corrigida da indireta, com teste. (Guia 8.)

## A CSP pegou um script injetado

**O que aconteceu:** ao provar que a fixture do navegador funcionava, um teste que injetava
um `<script>` na página reprovou com a mensagem do Trusted Types bloqueando a atribuição.

**Regra que ficou:** testes de navegador contra o build com a CSP ligada, reprovando
qualquer erro de console. (Guias 4 e 8.)
