/*
 * Prova de que os sanitizers estão ligados: este programa tem um bug de
 * propósito (escreve um byte depois do fim do buffer). Com ASan ativo ele
 * precisa morrer com "heap-buffer-overflow". O alvo "prova" do Makefile reprova
 * se ele terminar normalmente: assim, se alguém tirar -fsanitize das flags, o
 * CI percebe na hora.
 *
 * Nunca entra na suíte de testes normal.
 */
#include <stdint.h>
#include <stdlib.h>

#include "fila.h"

int main(void)
{
    uint8_t *buffer = malloc(4U);
    fila_t fila;
    if (buffer == NULL || !fila_iniciar(&fila, buffer, 4U)) {
        return EXIT_FAILURE;
    }
    fila.capacidade = 5U; /* corrompe a fila: diz que cabem 5 em 4 bytes */
    for (uint8_t i = 0U; i < 5U; i++) {
        (void)fila_inserir(&fila, i); /* o quinto byte cai fora do buffer */
    }
    free(buffer);
    return EXIT_SUCCESS;
}
