# 5. Sanitizers

Receita pronta: [`receitas/c-sanitizers`](../receitas/c-sanitizers).

## O que é

Sanitizer é instrumentação que o compilador põe no executável para vigiar, enquanto o
programa roda, erros que o C e o C++ deixam passar em silêncio. Sem ele, escrever um byte
depois do fim do buffer pode não dar sintoma nenhum no teste e corromper memória no campo.
Com ele, o programa morre na hora, com o arquivo, a linha e a pilha.

| Sanitizer                          | Flag                           | Pega                                                                                        |
| ---------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------- |
| AddressSanitizer (ASan)            | `-fsanitize=address`           | acesso fora do buffer (heap, pilha, global), uso depois do `free`, `free` duplo             |
| LeakSanitizer (LSan)               | vem com o ASan no Linux        | memória alocada e nunca liberada                                                            |
| UndefinedBehaviorSanitizer (UBSan) | `-fsanitize=undefined`         | estouro de inteiro com sinal, deslocamento inválido, ponteiro desalinhado, divisão por zero |
| ThreadSanitizer (TSan)             | `-fsanitize=thread`            | condição de corrida entre threads                                                           |
| MemorySanitizer (MSan)             | `-fsanitize=memory` (só clang) | leitura de memória não inicializada                                                         |

ASan e UBSan rodam juntos. TSan e MSan precisam de build separado (não combinam com ASan).

## Flags da receita

```make
AVISOS := -Wall -Wextra -Werror -Wpedantic -Wshadow -Wconversion -Wsign-conversion ...
SANIT  := -fsanitize=address,undefined -fno-sanitize-recover=all -fno-omit-frame-pointer
CFLAGS := -std=c11 -g -O1 $(AVISOS) $(SANIT)

ASAN_OPTIONS  := abort_on_error=1:detect_leaks=1:strict_string_checks=1:detect_stack_use_after_return=1
UBSAN_OPTIONS := print_stacktrace=1:halt_on_error=1
```

- `-fno-sanitize-recover=all` e `halt_on_error=1`: o UBSan, por padrão, só imprime e segue.
  No CI, comportamento indefinido tem que reprovar.
- `-g -O1 -fno-omit-frame-pointer`: pilha legível no relatório, sem ficar lento demais.
- `-Werror` com `-Wconversion` e `-Wsign-conversion`: em firmware, conversão implícita de
  `size_t` para `uint8_t` é fonte clássica de bug.

## O sanitizer prova que está ligado

`make prova` compila um programa com um estouro de buffer proposital e reprova se ele
**não** morrer com `heap-buffer-overflow`. Se alguém tirar `-fsanitize` das flags para "o
build passar", o CI percebe na hora. É o mesmo princípio de qualquer portão: verificação
que nunca falha pode estar desligada.

## Firmware: testar no PC o que roda no microcontrolador

ASan precisa de memória sombra e de um sistema operacional por baixo; na prática, não roda
dentro de um microcontrolador pequeno. A saída é arquitetura:

1. **Separe a lógica do hardware.** Fila, parser de protocolo, máquina de estados, cálculo,
   formato de pacote: tudo isso é C puro e não precisa de registrador. Fica num módulo sem
   `#include` do SDK do fabricante.
2. **Hardware atrás de interface.** O acesso a GPIO, UART, rádio e relógio fica atrás de
   funções que o teste substitui por versões falsas.
3. **Compile a lógica para o PC** com sanitizers e rode os testes de host no CI, a cada PR.
4. **O alvo real** compila no mesmo CI, com `-Werror`, e os testes de bancada continuam
   existindo para o que depende de hardware.

Os SDKs comuns têm caminho para isso: o Zephyr tem o alvo `native_sim`, que roda a
aplicação como processo do Linux e aceita ASan e UBSan pela configuração; o ESP-IDF tem um
alvo `linux` para testes de host. Confira na documentação da versão que o projeto usa:
o suporte e o nome das opções mudam entre versões.

Complementos que valem no CI de firmware:

- **Análise estática:** `cppcheck` (está na receita, `make analise`) ou `clang-tidy`.
- **Fuzzing:** o mesmo teste de host vira alvo de fuzzing (libFuzzer, com
  `-fsanitize=fuzzer,address`) para parser de dado que vem de fora: pacote de rádio,
  comando serial, payload de rede.
- **Valgrind:** alternativa sem recompilar, mais lenta; útil para binário de terceiro.

## Rodar a receita

No Linux, ou no Windows dentro do container (o mesmo do CI):

```bash
docker run --rm -v "C:/caminho/do/repo/receitas/c-sanitizers:/receita" -w /receita gcc:14 make teste prova
```

No Git Bash, prefixe com `MSYS_NO_PATHCONV=1` para o caminho do volume não ser convertido.

## E na web?

JavaScript não tem acesso direto à memória, mas a ideia de "falhar alto no primeiro sinal
de problema" vale igual. Os equivalentes neste template:

| Sanitizer em C                  | Equivalente na web                                                        |
| ------------------------------- | ------------------------------------------------------------------------- |
| ASan derruba no acesso inválido | fixture do Playwright reprova qualquer erro de console ou exceção         |
| UBSan com `halt_on_error`       | TypeScript estrito, `noUncheckedIndexedAccess`                            |
| `-Werror`                       | `eslint --max-warnings 0` sem `eslint-disable`                            |
| proteção de memória             | CSP com Trusted Types: script injetado é bloqueado e vira erro de console |
