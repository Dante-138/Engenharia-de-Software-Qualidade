# 12. Checklist de revisão

Para a sessão revisora (guia 10). O portão já conferiu formato, tipos, cobertura e
mutação; a revisão confere o que máquina não confere.

## Escopo

- [ ] O PR faz o que o pedido pediu, nas palavras do dono, e nada além.
- [ ] Um assunto só. Mudança sem relação vira outro PR.
- [ ] Aponta para a `main`.

## Comportamento

- [ ] Rodei os testes e abri o app (ou baixei o artefato do PR). Funciona como o PR diz.
- [ ] Casos de borda: vazio, um item, muitos itens, data no limite (virada de mês, ano
      bissexto, fuso), texto longo, entrada inválida.
- [ ] Dado salvo antes da mudança continua abrindo (migração testada, se o formato mudou).
- [ ] Mensagem de erro diz o que fazer, não só o que deu errado.

## Testes

- [ ] Teste novo cobre o comportamento novo e falharia sem a mudança.
- [ ] O teste confere o resultado, não só que "rodou sem erro".
- [ ] Nada de `only`, `skip`, espera fixa (`sleep`) ou dependência do dia de hoje.

## Código

- [ ] Lógica nova no núcleo quando é lógica pura; a interface só liga as peças.
- [ ] Nome diz o que a coisa é. Comentário diz por quê, não o quê.
- [ ] Sem código morto, sem duplicação que um helper existente resolveria.
- [ ] Nenhuma regra afrouxada na configuração (lint, tsconfig, cobertura, mutação) sem
      justificativa no PR.

## Segurança e dados

- [ ] Sem segredo, token, senha, dado pessoal ou dado real em código, teste, print ou
      texto do PR.
- [ ] Sem HTML montado a partir de texto; sem `eval`.
- [ ] Dependência nova: precisa mesmo? É mantida? A licença serve?

## O PR

- [ ] Título passa no portão (Conventional Commits, até 72 caracteres).
- [ ] Seção "Como testar" executável por quem não leu o código.
- [ ] Prints só com dados de demonstração.

## Como devolver

Comentário no PR com três blocos: **confere**, **precisa mudar** (arquivo, linha e o que
fazer) e **não verifiquei**. Sem rodeio e sem elogio genérico.
