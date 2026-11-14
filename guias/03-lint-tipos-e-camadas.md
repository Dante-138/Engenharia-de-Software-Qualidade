# 3. Lint, tipos e camadas

Arquivos: [`eslint.config.js`](../eslint.config.js), [`tsconfig.json`](../tsconfig.json),
[`tsconfig.nucleo.json`](../tsconfig.nucleo.json),
[`tools/verificar-escapes.ts`](../tools/verificar-escapes.ts).

## Zero aviso, zero exceção

- `eslint . --max-warnings 0`: aviso conta como erro. Aviso que ninguém corrige vira ruído,
  e o ruído esconde o aviso que importa.
- `noInlineConfig: true`: comentário `eslint-disable` não funciona. Para mudar uma regra,
  muda o arquivo de configuração, e isso aparece no diff.
- `reportUnusedDisableDirectives: 'error'`: não sobra diretiva morta.
- `typescript-eslint` no conjunto `strictTypeChecked`: o lint usa os tipos para achar
  promessa sem `await`, comparação sempre verdadeira, `any` escapando e afins.

## Rotas de fuga que o lint não vê

Algumas ferramentas aceitam comentário que as desliga. O `tools/verificar-escapes.ts` roda
junto do lint e reprova:

| Achado                                      | Desliga          |
| ------------------------------------------- | ---------------- |
| `Stryker disable`                           | teste de mutação |
| `c8 ignore`, `v8 ignore`, `istanbul ignore` | cobertura        |
| `prettier-ignore`                           | formatação       |
| `test.only`, `.skip`, `.todo`, `.fixme`     | teste            |

`@ts-ignore` e `@ts-nocheck` já são barrados pela regra `ban-ts-comment` do
`typescript-eslint`.

## Camadas impostas por ferramenta

O exemplo tem duas camadas: `src/nucleo` (lógica pura) e `src` (interface). A regra é que
o núcleo não sabe que existe navegador. Isso é imposto duas vezes:

1. **Lint:** no núcleo, `no-restricted-globals` barra `window`, `document`,
   `localStorage`, `fetch`, `setTimeout`; `no-restricted-imports` barra importar de fora
   da pasta; `no-console` é erro.
2. **Compilador:** `tsconfig.nucleo.json` compila só o núcleo com `lib: ["ES2024"]` e sem
   tipos do Node ou do DOM. Usar `document` ali é erro de compilação.

Por que vale o trabalho: lógica pura é a parte que dá para testar a 100%, com mutação e
propriedade. Separar cedo mantém a parte crítica testável. Num firmware, é a mesma ideia
com outro nome: lógica de aplicação de um lado, HAL e drivers do outro (guia 5).

Na interface, o lint barra HTML em texto (`innerHTML`, `insertAdjacentHTML`,
`document.write`): o DOM é montado com `createElement` e `textContent`, o que fecha a
porta para injeção de script. Combina com a CSP com Trusted Types do build (guia 8).

## Tipos estritos

Além de `strict`, o `tsconfig.json` liga:

- `noUncheckedIndexedAccess`: `lista[0]` pode ser `undefined`, e o código tem que tratar.
- `exactOptionalPropertyTypes`: propriedade opcional não aceita `undefined` explícito.
- `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnused*`.
- `erasableSyntaxOnly`: só sintaxe que o Node consegue apagar sem compilar (sem `enum`,
  sem `namespace`). Assim os scripts de `tools/` rodam direto com `node arquivo.ts`.

## Formatação

Prettier sem discussão de estilo: o formato é o que ele produzir. `npm run format` arruma,
`npm run format:check` confere no CI. Junto com `.editorconfig` e `.gitattributes`
(`eol=lf`), o diff mostra só mudança de verdade, inclusive entre Windows e Linux.

## Limites de tamanho

`complexity: 15`, `max-depth: 3`, `max-params: 4`, `max-lines-per-function: 60`. Função
que passa disso é candidata a dividir. Para agente de IA o limite é especialmente útil:
ele tende a crescer a mesma função em vez de criar outra.
