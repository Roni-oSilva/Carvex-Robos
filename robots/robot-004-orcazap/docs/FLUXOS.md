# Fluxos de conversa — OrcaZap

As conversas reais (geradas pelo robô) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md).

## Mapa de estados

```
inicio ─(pedir orçamento)─► servico ─► descricao ─► fotos ─► bairro ─► [endereco] ─► periodo ─► [nome] ─► confirmar ─► ORÇAMENTO CRIADO ─► inicio
   │                                                                                    └─(cancelar)─► apaga as fotos
   ├─(meu orçamento)─► situação do último pedido (se "enviado": botões Aceitar/Recusar/Dúvida)
   ├─(botão da proposta)─► aceitar | recusar ─► motivo (opcional) | dúvida ─► MODO HUMANO
   ├─(dúvida)─► FAQ ─► se não souber: MODO HUMANO
   └─(atendente / erro)─► MODO HUMANO
```

`[ ]` = etapa pulada quando não se aplica (endereço desligado em `atendimento.pedir_endereco`; nome já conhecido).

## Ciclo do orçamento

`novo → em_analise → enviado → aceito | recusado | expirado` · `cancelado` antes de encerrar.

## Regras aplicadas no servidor
- Foto: tipo conferido pelos bytes (JPEG, PNG ou WebP), até 5 MB, limite por pedido (`max_fotos`), nome de arquivo aleatório, acesso só pelo painel autenticado.
- Várias fotos enviadas ao mesmo tempo: o limite é conferido de novo depois do download.
- Fotos de pedido não concluído são apagadas em 2 dias; ao cancelar na confirmação, na hora.
- A resposta à proposta só vale para o **dono** do orçamento e enquanto a situação for "enviado" e a validade não tiver passado.
- O valor vem **somente** do painel (digitado por uma pessoa). O robô não faz estimativa.
- Lembrete: **1 vez**, depois de `followup_horas`, e nunca para quem está em atendimento humano ou pediu para parar. Ao vencer a validade o orçamento passa a "expirado" e o cliente é avisado 1 vez.
- Fora da janela de 24 h: só modelo aprovado; sem modelo, a mensagem não é enviada (e o painel avisa).

## Fluxo de dúvida
FAQ → resposta. Sem resposta → "Não tenho essa informação no momento. Vou encaminhar você para um atendente."

## Fluxo de erro
Arquivo que não é foto · foto grande demais · falha ao baixar · bairro fora da área · descrição curta demais · proposta vencida · resposta a orçamento de outro cliente · erro interno (pede desculpas e chama atendente).

## Transferência para humano
Palavra *atendente*, "Tenho dúvida" na proposta, pergunta sem resposta, erro interno. No modo humano o robô se cala; volta ao ser devolvido ou após 12 h.
