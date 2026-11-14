# 1. Por que um portão de qualidade

## A ideia em uma frase

Quando quem decide o produto não lê o código, a confiança sai da leitura e vai para o
portão: um conjunto de verificações automáticas que todo código precisa passar antes de
entrar na `main`, escrito por humano ou por agente.

## O problema que ele resolve

Agente de IA escreve rápido e com segurança aparente. Ele também:

- esquece um caso de borda e escreve o teste que confirma o próprio erro;
- desliga uma regra de lint "só nesta linha" para o build passar;
- deixa `console.log`, `test.only` ou um `any` no meio do código;
- empilha mudanças sem relação no mesmo PR;
- diz que testou quando só rodou parte dos testes.

Revisão humana linha a linha pegaria parte disso, mas não escala e não é o que se quer.
O portão pega tudo isso sempre, do mesmo jeito, sem cansar.

## As camadas

Cada camada pega uma classe de erro diferente. Nenhuma substitui a outra.

| Camada                              | Pega                                                           | Onde está no template                   |
| ----------------------------------- | -------------------------------------------------------------- | --------------------------------------- |
| Formatação                          | diff poluído por estilo                                        | Prettier, `npm run format:check`        |
| Lint sem aviso e sem exceção        | erro comum, código que esconde erro, quebra de camada          | `eslint.config.js`                      |
| Rotas de fuga                       | `test.only`, `Stryker disable`, `c8 ignore`, `prettier-ignore` | `tools/verificar-escapes.ts`            |
| Tipos estritos                      | dado do formato errado, `undefined` esquecido                  | `tsconfig.json`, `tsconfig.nucleo.json` |
| Teste de unidade com 100% do núcleo | lógica sem teste                                               | `vitest.config.ts`                      |
| Teste por propriedade               | caso de borda que ninguém pensou                               | `fast-check` em `tests/unidade`         |
| Teste de mutação                    | teste que passa por qualquer código                            | `stryker.config.mjs`                    |
| Teste no navegador                  | fluxo quebrado, erro só no console, violação de CSP            | `tests/navegador`                       |
| Acessibilidade                      | contraste, rótulo, foco                                        | `@axe-core/playwright`                  |
| Regressão visual                    | mudança de layout sem querer                                   | `toHaveScreenshot` no container         |
| Sanitizers (C/C++)                  | memória fora do buffer, comportamento indefinido, vazamento    | `receitas/c-sanitizers`                 |
| Portão de commits                   | histórico ilegível, coautoria indevida, PR empilhado           | `tools/verificar-commits.ts`            |
| Cadeia de suprimentos               | dependência vulnerável, action adulterada, segredo vazado      | guia 8                                  |
| Proteção da `main`                  | merge sem CI verde, force push, atalho do admin                | guia 7                                  |

## Três princípios que valem para qualquer projeto

1. **Sem exceção no meio do código.** Se uma regra está errada, muda a configuração, e a
   mudança aparece no diff do PR para alguém decidir. Comentário que desliga regra é
   proibido (o lint usa `noInlineConfig`, e o `verificar-escapes` pega o resto).
2. **Rápido no PC, completo no CI.** O `npm run check` (e o `pre-push`) roda em segundos o
   que mais pega erro. O CI roda tudo, inclusive o que é lento ou precisa de container.
   O CI é a fonte da verdade: passar no PC não basta.
3. **O portão prova que está ligado.** Verificação que nunca falha pode estar desligada.
   Por isso a receita de C tem um bug proposital que o sanitizer precisa pegar, e o guia de
   testes mostra como conferir que a fixture do navegador reprova erro de console.

## O que o portão não faz

- Não decide se a funcionalidade é a certa. Isso é do humano, no pedido e no teste do PR.
- Não substitui a revisão por outro agente (guia 10): o portão confere regra, a revisão
  confere intenção.
- Não garante segurança sozinho. Ele reduz a superfície; o resto é escolha de arquitetura.
