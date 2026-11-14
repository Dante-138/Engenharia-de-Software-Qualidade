# Receita: C com sanitizers

Módulo de exemplo (fila circular sem alocação dinâmica, no estilo de firmware) testado no
PC com AddressSanitizer, UndefinedBehaviorSanitizer, avisos como erro e cppcheck.
Explicação completa no [guia 5](../../guias/05-sanitizers.md).

## Arquivos

| Arquivo                    | Para quê                                            |
| -------------------------- | --------------------------------------------------- |
| `src/fila.h`, `src/fila.c` | o módulo: C11 puro, sem dependência de hardware     |
| `testes/teste_fila.c`      | testes do módulo                                    |
| `testes/prova_sanitizer.c` | bug proposital que o ASan precisa pegar             |
| `Makefile`                 | flags, alvos `teste`, `prova`, `analise` e `limpar` |

## Rodar

No Linux:

```bash
make teste prova
```

No Windows, no mesmo container do CI (Docker Desktop aberto), a partir desta pasta:

```bash
docker run --rm -v "$PWD:/receita" -w /receita gcc:14 make teste prova
```

No Git Bash, prefixe com `MSYS_NO_PATHCONV=1`.

Saída esperada:

```text
fila: todos os testes passaram
ok: o AddressSanitizer pegou o bug proposital
```

## Levar para um projeto de firmware

1. Copie o `Makefile` para a pasta de testes de host do projeto.
2. Troque `SRC` pelos módulos de lógica (os que não incluem o SDK do fabricante).
3. Escreva um `testes/teste_<modulo>.c` por módulo.
4. Copie o job de `.github/workflows/receita-c.yml`, ajustando `working-directory`.
5. Mantenha o alvo `prova`: é ele que garante que os sanitizers continuam ligados.
