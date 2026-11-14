#include "fila.h"

bool fila_iniciar(fila_t *fila, uint8_t *buffer, size_t capacidade)
{
    if (fila == NULL || buffer == NULL || capacidade == 0U) {
        return false;
    }
    fila->dados = buffer;
    fila->capacidade = capacidade;
    fila->inicio = 0U;
    fila->tamanho = 0U;
    return true;
}

bool fila_inserir(fila_t *fila, uint8_t byte)
{
    if (fila->tamanho == fila->capacidade) {
        return false;
    }
    size_t fim = (fila->inicio + fila->tamanho) % fila->capacidade;
    fila->dados[fim] = byte;
    fila->tamanho++;
    return true;
}

bool fila_retirar(fila_t *fila, uint8_t *byte)
{
    if (fila->tamanho == 0U) {
        return false;
    }
    *byte = fila->dados[fila->inicio];
    fila->inicio = (fila->inicio + 1U) % fila->capacidade;
    fila->tamanho--;
    return true;
}

size_t fila_tamanho(const fila_t *fila)
{
    return fila->tamanho;
}
