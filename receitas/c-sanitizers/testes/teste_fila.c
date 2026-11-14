/*
 * Testes da fila, compilados para o PC com AddressSanitizer e
 * UndefinedBehaviorSanitizer. Qualquer acesso fora do buffer, uso depois de
 * liberar, vazamento ou comportamento indefinido derruba o executável com
 * relatório, e o make reprova.
 */
#include <stdio.h>
#include <stdlib.h>

#include "fila.h"

static int falhas = 0;

#define CONFERIR(condicao)                                                  \
    do {                                                                    \
        if (!(condicao)) {                                                  \
            fprintf(stderr, "%s:%d: falhou: %s\n", __FILE__, __LINE__, #condicao); \
            falhas++;                                                       \
        }                                                                   \
    } while (0)

static void teste_iniciar_recusa_parametro_invalido(void)
{
    fila_t fila;
    uint8_t buffer[4];
    CONFERIR(!fila_iniciar(NULL, buffer, sizeof buffer));
    CONFERIR(!fila_iniciar(&fila, NULL, sizeof buffer));
    CONFERIR(!fila_iniciar(&fila, buffer, 0U));
    CONFERIR(fila_iniciar(&fila, buffer, sizeof buffer));
}

static void teste_ordem_e_limites(void)
{
    fila_t fila;
    uint8_t buffer[3];
    uint8_t byte = 0U;
    CONFERIR(fila_iniciar(&fila, buffer, sizeof buffer));

    CONFERIR(!fila_retirar(&fila, &byte));
    CONFERIR(fila_inserir(&fila, 1U));
    CONFERIR(fila_inserir(&fila, 2U));
    CONFERIR(fila_inserir(&fila, 3U));
    CONFERIR(!fila_inserir(&fila, 4U));
    CONFERIR(fila_tamanho(&fila) == 3U);

    CONFERIR(fila_retirar(&fila, &byte) && byte == 1U);
    CONFERIR(fila_inserir(&fila, 4U)); /* dá a volta no buffer */
    CONFERIR(fila_retirar(&fila, &byte) && byte == 2U);
    CONFERIR(fila_retirar(&fila, &byte) && byte == 3U);
    CONFERIR(fila_retirar(&fila, &byte) && byte == 4U);
    CONFERIR(fila_tamanho(&fila) == 0U);
}

static void teste_muitas_voltas(void)
{
    /* Buffer no heap: o ASan vigia as bordas dele byte a byte. */
    const size_t capacidade = 7U;
    uint8_t *buffer = malloc(capacidade);
    fila_t fila;
    uint8_t byte = 0U;
    CONFERIR(buffer != NULL);
    CONFERIR(fila_iniciar(&fila, buffer, capacidade));
    for (unsigned i = 0U; i < 1000U; i++) {
        CONFERIR(fila_inserir(&fila, (uint8_t)i));
        CONFERIR(fila_retirar(&fila, &byte) && byte == (uint8_t)i);
    }
    free(buffer);
}

int main(void)
{
    teste_iniciar_recusa_parametro_invalido();
    teste_ordem_e_limites();
    teste_muitas_voltas();
    if (falhas != 0) {
        fprintf(stderr, "%d verificação(ões) falharam\n", falhas);
        return EXIT_FAILURE;
    }
    puts("fila: todos os testes passaram");
    return EXIT_SUCCESS;
}
