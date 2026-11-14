# 10. Trabalhar com agentes de IA

O portão confere regra. Este guia é sobre como organizar o trabalho para que o portão
receba código bom, e para que o humano decida sem precisar ler cada linha.

## Papéis

| Papel         | Quem                    | Faz                                                                      | Não faz                         |
| ------------- | ----------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| Dono          | o humano                | decide o que fazer, aprova o escopo, testa o que o PR manda, dá o merge  | escrever ou ler todo o código   |
| Implementador | uma sessão de agente    | cria o branch, escreve código e teste, roda o `npm run check`, abre o PR | aprovar o próprio PR, dar merge |
| Revisor       | outra sessão de agente  | lê o diff com o checklist (guia 12), roda os testes, comenta no PR       | editar o código do PR           |
| Subagentes    | ajudantes de uma sessão | pesquisar, ler, rodar teste, conferir                                    | editar arquivo                  |

## Regras

1. **Quem implementa não aprova.** A sessão que escreveu o código tem o mesmo ponto cego
   que escreveu o erro. A revisão é de outra sessão, com contexto limpo, que recebe o diff
   e o pedido original, não a explicação do implementador.
2. **Um editor por vez.** Só uma sessão edita os arquivos de um repositório num dado
   momento. Subagentes só leem e testam. Dois agentes editando o mesmo arquivo produzem
   conflito silencioso: um sobrescreve o outro.
3. **Um PR pequeno por mudança**, sempre contra a `main` (guia 6). Mudança grande vira uma
   sequência de PRs, um depois do merge do outro.
4. **O humano dá o merge.** Merge automático desligado. O agente pode dizer "pronto para
   merge"; o clique é do dono.
5. **Prova, não promessa.** "Testei" só vale com a saída do comando. O PR diz o que foi
   rodado e o resultado. Teste que não foi rodado é declarado como não rodado.
6. **Escopo do pedido.** O agente faz o que foi pedido. O que encontrar fora do escopo vira
   uma linha no PR ou uma issue, não uma mudança escondida no mesmo diff.

## Revisão por agente: como pedir

O revisor recebe:

- o link do PR;
- o pedido original, com as palavras do dono entre aspas;
- o checklist do guia 12;
- a instrução de rodar os testes e conferir o PR no app, não só ler.

E devolve um comentário no PR com: o que confere, o que precisa mudar (com arquivo e linha)
e o que não verificou. Comentário escrito como de revisor, sem assinatura de ferramenta.

## Escolher o modelo pelo peso da tarefa

- Tarefa pequena e bem definida (ajuste de texto, teste a mais, renomear): modelo mais
  rápido.
- Tarefa de arquitetura, migração de formato de dado, depuração difícil, revisão: modelo
  mais forte.
- Quando uma sessão rápida começa a errar ou a girar em volta do mesmo problema, troque
  para o modelo mais forte em vez de insistir.

## Contexto que o agente não tem

O agente não sabe o que o dono decidiu em outra conversa. O que precisa sobreviver entre
sessões fica escrito: no README, numa issue, no PR, ou nas notas de projeto que o agente
lê no início. Decisão que só existe na memória de uma conversa vai se perder.

## Quando o humano não lê o código

Funciona se três coisas forem verdade:

1. o portão é rígido e prova que está ligado (guias 1 a 9);
2. a revisão é de outra sessão, com checklist;
3. cada PR diz em linguagem simples o que mudou e como testar no app, e o dono testa.

Se uma das três falhar, o risco volta. Por isso o portão não tem exceção e o merge não é
automático.
