# 7. Proteção da main

Script: [`tools/configurar-repo.sh`](../tools/configurar-repo.sh).

## O que fica ligado

| Configuração                                          | Por quê                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| PR obrigatório                                        | nada entra na `main` por push direto, nem do dono          |
| Checks exigidos: `Gate`, `Navegador`, `Mutacao`       | merge só com o CI verde                                    |
| Branch atualizado com a `main` (`strict`)             | o CI testou o código como ele vai ficar depois do merge    |
| Histórico linear                                      | sem commit de merge; cada PR vira um commit                |
| Conversas resolvidas                                  | comentário de revisão não fica para trás                   |
| Sem force push e sem apagar a `main`                  | o histórico publicado não muda                             |
| Vale para administradores                             | o dono não tem atalho; o atalho é o que quebra numa pressa |
| Merge só por squash, com o título do PR               | um commit por PR, com mensagem que passou no portão        |
| Branch apagado depois do merge                        | não sobra branch velho para alguém empilhar em cima        |
| Token dos workflows só leitura, Actions não aprova PR | workflow comprometido não altera o repositório             |

## Como aplicar

Depois do primeiro push da `main`, com o `gh` logado numa conta admin do repositório:

```bash
bash tools/configurar-repo.sh dono/repositorio
```

O script é idempotente: rodar de novo reaplica tudo. Quando renomear ou criar um job
exigido, atualize a lista `CHECKS` no script e rode outra vez.

## Plano gratuito do GitHub

No plano gratuito, proteção de branch, push protection de segredos e CodeQL só funcionam
em repositório **público**. Repositório privado precisa de plano pago para ter o portão
completo. Por isso o template assume repositório público, e por isso nada privado entra
nele (nem dado pessoal, nem dado de empresa, nem segredo).

## Quem dá o merge

O humano. O agente abre o PR, o revisor (outro agente ou sessão) comenta, o humano lê o
resumo, testa o que o PR manda testar e mescla. Merge automático fica desligado
(`allow_auto_merge=false`). Ver guia 10.
