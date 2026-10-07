# Manual do cliente — PedidoZap
*Para o dono e a equipe da empresa que usa o robô.*

## O que o robô faz por você
- O cliente escreve “oi” e escolhe **Fazer pedido** (ou **Ver cardápio** para ler tudo).
- Escolhe categoria → item → tamanho/opção → quantidade → observação (“sem cebola”).
- Pode adicionar mais itens; o carrinho mostra o subtotal em tempo real.
- Escolhe **entrega** (bairro e endereço; o robô aplica a taxa do bairro e o pedido mínimo) ou **retirada**.
- Escolhe pagamento: **Pix** (recebe o copia-e-cola com o valor), **dinheiro** (informa troco) ou **cartão na entrega**.
- Confere o resumo e confirma. O pedido aparece no **quadro de pedidos** do painel como “Novo”.
- A equipe avança as etapas com um clique; o cliente recebe um aviso a cada mudança.
- Fora do horário, o robô mostra o cardápio e o horário de abertura, mas não fecha pedido.

## Sua rotina no painel
1. No começo do expediente, abra **Cardápio** e marque como esgotado o que não tem.
2. Deixe o **Quadro de pedidos** aberto na cozinha/balcão (atualiza sozinho). Quando entrar um pedido *Novo*, clique **Aceito →**.
3. Avance as etapas: **Em preparo → Saiu para entrega** (ou **Pronto p/ retirada**) **→ Entregue**. O cliente é avisado em cada uma.
4. Confira os pagamentos por Pix no seu banco e clique em **Marcar pago**.
5. Toque em **Imprimir** para a comanda; olhe **Conversas** para quem pediu atendente.
6. No fim do dia, veja o **Início**: pedidos, vendas, ticket médio e mais vendidos.

Endereço do painel: **`https://SEU-ENDERECO/admin`** — entre com a chave de acesso que a implantação te entregou (guarde em local seguro e não compartilhe com quem não trabalha na empresa).

## Páginas do painel
| Página | Para que serve |
|---|---|
| Início | Resumo dos números |
| Pedidos | Quadro de pedidos em andamento; avançar etapa, marcar pago, cancelar; `/pedidos/<id>` = comanda para imprimir |
| Cardapio | Marcar itens como esgotados / voltar a vender |
| Historico | Últimos 100 pedidos |
| Conversas | Ver o que foi conversado, assumir o atendimento e responder |
| Clientes | Lista de clientes; excluir dados de quem pedir (LGPD) |
| Configurações | Mudar textos, horários e preços |

## Regras de ouro
- Aceite rápido: o cliente só recebe a confirmação quando você clica em *Aceito*.
- Marque esgotado **antes** de o cliente pedir.
- Pedido já em preparo não é cancelado pelo robô: se o cliente pedir, a conversa vai para uma pessoa decidir.
- Entrega em dinheiro: confira o troco antes de sair (o pedido mostra o valor informado).
- **Conversa "aguardando atendente"?** Responda o quanto antes — o cliente já pediu uma pessoa.
- **Regra do WhatsApp:** você só pode escrever livremente até **24 horas depois da última mensagem do cliente**. Depois disso, só mensagens de modelo aprovado (o robô cuida disso quando configurado).
- **Cliente escreveu PARAR?** O robô não envia mais avisos automáticos a essa pessoa. Respeite: não tente contornar.
- **Nunca** envie a chave do painel por WhatsApp ou e-mail.

## Precisa de ajuda?
Fale com o responsável pela sua implantação: **{{NOME_DO_SUPORTE}} — {{CONTATO_DO_SUPORTE}}** (preencha antes de entregar ao cliente).
