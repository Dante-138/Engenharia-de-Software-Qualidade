# Receita: testes de C no PC com sanitizers e avisos tratados como erro.
#
#   make teste    compila com ASan + UBSan e roda os testes
#   make prova    confere que o sanitizer está ligado (o bug proposital tem que ser pego)
#   make analise  roda o cppcheck (análise estática), se estiver instalado
#   make limpar   apaga a pasta build/
#
# No Windows, rode dentro do container (ver README.md desta pasta).

CC      ?= gcc
BUILD   := build
SRC     := src/fila.c

AVISOS  := -Wall -Wextra -Werror -Wpedantic -Wshadow -Wconversion -Wsign-conversion \
           -Wcast-qual -Wformat=2 -Wnull-dereference -Wdouble-promotion -Wstrict-prototypes
SANIT   := -fsanitize=address,undefined -fno-sanitize-recover=all -fno-omit-frame-pointer
CFLAGS  := -std=c11 -g -O1 $(AVISOS) $(SANIT) -Isrc

# Falha na primeira violação, com pilha completa, e confere vazamentos.
export ASAN_OPTIONS  := abort_on_error=1:detect_leaks=1:strict_string_checks=1:detect_stack_use_after_return=1
export UBSAN_OPTIONS := print_stacktrace=1:halt_on_error=1

.PHONY: teste prova analise limpar

teste: $(BUILD)/teste_fila
	./$(BUILD)/teste_fila

prova: $(BUILD)/prova_sanitizer
	@if ./$(BUILD)/prova_sanitizer 2> $(BUILD)/prova.log; then \
		echo "ERRO: o bug proposital passou; os sanitizers estão desligados"; exit 1; \
	elif grep -q "heap-buffer-overflow" $(BUILD)/prova.log; then \
		echo "ok: o AddressSanitizer pegou o bug proposital"; \
	else \
		cat $(BUILD)/prova.log; echo "ERRO: falhou, mas não pelo motivo esperado"; exit 1; \
	fi

analise:
	cppcheck --enable=warning,style,performance,portability --error-exitcode=1 -q src

$(BUILD)/%: testes/%.c $(SRC) src/fila.h | $(BUILD)
	$(CC) $(CFLAGS) $< $(SRC) -o $@

$(BUILD):
	mkdir -p $(BUILD)

limpar:
	rm -rf $(BUILD)
