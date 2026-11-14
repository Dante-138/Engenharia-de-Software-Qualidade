/*
 * Fila circular de bytes, sem alocação dinâmica: quem chama fornece o buffer.
 * Exemplo de módulo de firmware separado do hardware, para testar no PC com
 * sanitizers ligados.
 */
#ifndef FILA_H
#define FILA_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

typedef struct {
    uint8_t *dados;
    size_t capacidade;
    size_t inicio;
    size_t tamanho;
} fila_t;

/* Prepara a fila sobre um buffer de "capacidade" bytes. Falha com buffer nulo ou capacidade 0. */
bool fila_iniciar(fila_t *fila, uint8_t *buffer, size_t capacidade);

/* Insere um byte no fim. Devolve false se a fila está cheia. */
bool fila_inserir(fila_t *fila, uint8_t byte);

/* Retira o byte do início. Devolve false se a fila está vazia. */
bool fila_retirar(fila_t *fila, uint8_t *byte);

size_t fila_tamanho(const fila_t *fila);

#endif
