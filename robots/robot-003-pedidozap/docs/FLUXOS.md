# Fluxos de conversa — PedidoZap

As conversas reais (geradas pelo robô) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md).

## Mapa de estados

```
inicio ─(fazer pedido)─► categoria ─► item ─► [variacao] ─► qtd ─► obs ─► carrinho ──(adicionar mais)──► categoria
   │                                                                        │
   │                                                                        └─(finalizar)─► tipo ─► [bairro] ─► [nome] ─► [endereco] ─► pagamento ─► [troco] ─► confirmar ─► PEDIDO CRIADO ─► inicio
   ├─(ver cardápio)─► texto do cardápio (só itens disponíveis)
   ├─(meu pedido)────► situação do último pedido
   ├─("cancelar pedido")─► cancela se "novo"; senão chama atendente
   ├─(dúvida)─► FAQ (inclui taxas/bairros) ─► se não souber: MODO HUMANO
   └─(atendente / erro)─► MODO HUMANO
```

`[ ]` = etapa pulada quando não se aplica (item sem variação; retirada não pede bairro/endereço; nome já conhecido; pagamento que não é dinheiro não pede troco).

## Fluxo normal
Menu → categoria → item → tamanho → quantidade → observação → (adicionar mais) → finalizar → entrega/retirada → bairro → endereço → pagamento → resumo → **Confirmar** → número do pedido + Pix (se escolhido) → avisos de status.

## Regras aplicadas no servidor
- Preço, disponibilidade e taxa vêm sempre do cadastro **no momento de confirmar**; itens indisponíveis saem do carrinho com aviso.
- Pedido mínimo vale só para entrega; abaixo dele o robô oferece adicionar itens ou retirar.
- Fechado: não cria pedido (nem no meio do fluxo, se a loja fechar).
- Quantidade 1–20; observação limpa de caracteres de controle e símbolos < >; endereço mínimo de 8 caracteres.
- Troco deve ser ≥ total.

## Fluxo de dúvida
FAQ → resposta (inclui taxas e bairros) → “Posso ajudar em mais alguma coisa?”. Sem resposta → “Não tenho essa informação no momento. Vou encaminhar você para um atendente.”

## Fluxo de erro
Quantidade inválida · bairro fora da área (lista os atendidos e oferece retirada) · pedido mínimo · loja fechada · item que esgotou · mídia sem sentido · erro interno (pede desculpas e chama atendente).

## Transferência para humano
Palavra *atendente*, pergunta sem resposta, cancelamento de pedido já em andamento, cardápio sem itens, erro interno. No modo humano o robô se cala; volta ao ser devolvido ou após 12 h.

## Ciclo do pedido (painel)
`novo → aceito → preparando → saiu (entrega) | pronto (retirada) → entregue` · `cancelado` a qualquer momento antes de encerrar. Cada mudança avisa o cliente.
