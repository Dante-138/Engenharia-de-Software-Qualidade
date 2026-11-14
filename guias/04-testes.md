# 4. Testes

Arquivos: [`tests/unidade`](../tests/unidade), [`tests/navegador`](../tests/navegador),
[`vitest.config.ts`](../vitest.config.ts), [`stryker.config.mjs`](../stryker.config.mjs),
[`playwright.config.ts`](../playwright.config.ts).

## Unidade: 100% do núcleo

`npm test` roda o Vitest com cobertura e reprova abaixo de 100% em linhas, ramos, funções e
instruções, só no núcleo (`src/nucleo`). Na interface, 100% custaria caro e diria pouco;
ela é coberta pelos testes de navegador.

100% de cobertura é piso, não prova. Cobertura diz que a linha rodou, não que alguém
conferiu o resultado. Por isso existem as duas camadas abaixo.

## Propriedade: o caso que ninguém pensou

Teste comum confere exemplos escolhidos a dedo. Teste por propriedade (`fast-check`) gera
centenas de entradas e confere uma regra que vale para todas:

- somar `n` dias e medir a distância devolve `n`;
- a distância de `a` até `b` é o oposto da de `b` até `a`;
- toda data produzida pelo código é lida de volta pelo próprio código.

Caso real deste repositório: na primeira execução, o `fast-check` reprovou a segunda regra.
Para `a = b`, o código devolvia `0` e o teste esperava `-0`, e para o `toBe` os dois são
diferentes. Nenhum exemplo escrito à mão tinha `a = b`.

Onde mais vale: validação de dado salvo, migração de formato, parser, serialização (salvar
e ler de volta tem que dar o mesmo objeto).

## Mutação: o teste realmente pega erro?

O Stryker altera o núcleo de propósito (troca `>` por `>=`, apaga um `if`, inverte uma
condição) e roda os testes de novo. Se os testes continuam verdes com o código errado, o
mutante "sobreviveu".

Caso real deste repositório, com a primeira versão do núcleo:

| Medida                      | Resultado                           |
| --------------------------- | ----------------------------------- |
| Cobertura de linhas e ramos | 100%                                |
| Pontuação de mutação        | 83,78% (31 mortos, 6 sobreviventes) |

Os 6 sobreviventes eram de dois tipos:

1. **Teste faltando.** Tirar o `^` da expressão regular da data não quebrava nada: nenhum
   teste tinha lixo antes da data (`x2026-11-14`).
2. **Condição redundante.** A validação conferia ano, mês e dia separadamente, e cada
   conferência sozinha era coberta pelas outras. Trocar uma delas por `true` não mudava o
   resultado.

A correção não foi baixar a meta: foi simplificar o código (a data é validada por uma volta
completa, escrever e comparar com o texto) e acrescentar o teste. Resultado: 100%, com
menos código. A meta no template é `break: 100` para o núcleo.

Regra para agentes: mutante sobrevivente se resolve com teste novo ou com código mais
simples. Comentário `Stryker disable` é barrado pelo `verificar-escapes`.

## Navegador: o "sanitizer" da web

Os testes de navegador rodam contra o build de produção (`vite preview`), não contra o
servidor de desenvolvimento, porque é o build que vai para o usuário, com a CSP ligada.

A fixture [`tests/navegador/fixtures.ts`](../tests/navegador/fixtures.ts) é automática:
todo teste reprova no fim se a página registrou

- erro ou aviso no console;
- exceção não tratada ou promessa rejeitada sem `catch`;
- requisição que falhou ou resposta HTTP 400 ou mais;
- violação de CSP ou de Trusted Types (aparece como erro de console).

Como provar que a fixture funciona: um teste temporário que injeta um `<script>` na página
reprovou com a mensagem do Trusted Types bloqueando a atribuição. Vale repetir essa prova
quando mexer na fixture.

Outras práticas do exemplo:

- **Relógio congelado** (`page.clock.setFixedTime`): teste que depende de "hoje" não pode
  mudar de resultado de um dia para o outro.
- **Seletores por papel e rótulo** (`getByLabel`, `getByRole`): o teste quebra se o campo
  perder o rótulo, o que também é um problema de acessibilidade.

## Acessibilidade (axe)

`@axe-core/playwright` analisa a página renderizada contra WCAG 2.1 A e AA: contraste,
rótulo de campo, nome de botão, idioma da página, ordem de cabeçalho. Lista de violações
tem que sair vazia.

## Regressão visual

`toHaveScreenshot` compara a tela com uma imagem de referência guardada no repositório
(`tests/navegador/*-snapshots/`), com tolerância zero.

O ponto delicado: fonte e renderização mudam de sistema para sistema. A referência gerada
no Windows nunca bate com o Linux do CI. Por isso:

- o teste visual (marcado `@visual`) só roda dentro do container oficial do Playwright, no
  CI e no PC (`npm run test:navegador:docker`);
- fora do container ele é pulado, e o resto dos testes de navegador roda normal;
- partes que mudam sozinhas ficam mascaradas (o exemplo mascara o rodapé com a versão e o
  commit). A máscara precisa ter tamanho fixo: ela pinta o retângulo do elemento, e um
  elemento que cresce com o texto muda a imagem do mesmo jeito. Caso real: a referência
  gerada antes do primeiro commit mostrava "local" (5 caracteres), o CI mostrava o hash (7),
  e 510 pixels de máscara a mais reprovaram o teste. Mascarar o rodapé inteiro, que tem
  largura fixa, resolveu.

Mudou o visual de propósito? Regrave a referência no container e confira a imagem no PR:

```bash
npm run test:navegador:docker -- --update-snapshots
```

Sem Docker, a imagem nova também sai no artefato `relatorio-navegador-<commit>` do CI.

## Quanto rodar onde

| Comando                                        | No `pre-push`              | No CI                       |
| ---------------------------------------------- | -------------------------- | --------------------------- |
| `npm test` (unidade + propriedade + cobertura) | sim                        | sim                         |
| `npm run test:navegador`                       | não (precisa de navegador) | sim, completo, no container |
| `npm run test:mutacao`                         | não (mais lento)           | sim                         |
