# 11. Briefs para agentes

Brief é o texto que uma sessão recebe para começar uma tarefa. O agente só sabe o que está
no brief e no repositório. Brief vago produz trabalho fora do alvo, com confiança.

## As quatro partes que não podem faltar

1. **Escopo explícito.** O que fazer, em quais arquivos ou áreas. Verbos concretos:
   "adicionar", "corrigir", "remover", não "melhorar".
2. **Fora do escopo.** O que não fazer, mesmo que pareça boa ideia. É a parte que mais
   evita retrabalho: agente tende a "aproveitar e arrumar" coisas em volta.
3. **Critério de pronto.** Como saber que acabou, de forma verificável: "o teste X passa",
   "o CI está verde", "o PR está aberto contra a main com a seção Como testar".
4. **Palavras do dono entre aspas.** O pedido original, literal. A paráfrase do
   intermediário perde nuance; a citação deixa o agente interpretar a fonte.

## Também ajuda

- **O que já foi descartado e por quê.** Evita que o agente proponha de novo.
- **Restrições do projeto.** Idioma do código e dos commits, quem dá o merge, o que nunca
  entra no repositório (dado pessoal, segredo, nome de empresa).
- **Onde ler antes.** Arquivos, guias, issues. Apontar é melhor que copiar o conteúdo.
- **O que devolver.** Formato do relatório final: link do PR primeiro, depois o que foi
  feito e o que ficou sem verificar.

## Modelo

```markdown
## Tarefa

<uma frase com o resultado esperado>

Pedido do dono: "<palavras dele, literais>"

## Escopo

- <o que fazer, com arquivos ou áreas>

## Fora do escopo

- <o que não fazer>

## Restrições

- PR pequeno, contra a main, Conventional Commits em inglês, sem coautoria
- Rodar `npm run check` antes do push
- <regras específicas do projeto>

## Ler antes

- <arquivos, guias, issues>

## Pronto quando

- [ ] <critério verificável>
- [ ] CI verde
- [ ] PR com "O que muda", "Por que" e "Como testar"

## Devolver

Link do PR primeiro. Depois: o que foi feito, o que foi testado (com o comando), o que
não foi verificado.
```

## Exemplo ruim e exemplo bom

Ruim:

> Melhora a tela de prazos e vê se tem algum bug.

Bom:

> **Tarefa:** mostrar "Vence em 1 semana" quando faltarem exatamente 7 dias.
>
> Pedido do dono: "quando falta uma semana eu quero ver isso escrito assim, uma semana"
>
> **Escopo:** `src/nucleo/prazo.ts` (função `descreverPrazo`) e o teste dela.
>
> **Fora do escopo:** layout, outros textos, outras faixas de dias.
>
> **Pronto quando:** teste de unidade novo para 7 dias, mutação em 100%, CI verde, PR
> aberto contra a main.
