# Conversas de demonstração — PedidoZap

> Gerado automaticamente por `node demo/simulate.ts`: respostas **reais** do robô com dados fictícios (Pizzaria Bella Massa). Nada foi enviado ao WhatsApp.
> 🔘 = botão  ·  ▫️ = item de lista  ·  Hoje (fictício) = quarta-feira, 20h (loja aberta).

### 1. Fluxo normal — pedido de entrega pago com Pix

**CLIENTE:** “Oi, boa noite”

**ROBÔ:** Olá! 😋 Bem-vindo à Pizzaria Bella Massa! Como posso ajudar?
> 🔘 Fazer pedido
> 🔘 Ver cardápio
> 🔘 Meu pedido

**CLIENTE:** *toca em* “Fazer pedido”

**ROBÔ:** O que você quer pedir?
> ▫️ Pizzas — 3 opções
> ▫️ Bebidas — 2 opções
> ▫️ Sobremesas — 1 opção

**CLIENTE:** *toca em* “Pizzas”

**ROBÔ:** *Pizzas* — escolha o item (digite VOLTAR para ver as categorias):
> ▫️ Pizza Calabresa — a partir de R$ 42,00 · Calabresa, cebola e azeitona
> ▫️ Pizza Mussarela — a partir de R$ 38,00 · Mussarela e orégano
> ▫️ Frango com Catupiry — a partir de R$ 46,00 · Frango desfiado e catupiry

**CLIENTE:** *toca em* “Pizza Calabresa”

**ROBÔ:** *Pizza Calabresa* — qual opção?
> ▫️ Média (6 fatias) — R$ 42,00
> ▫️ Grande (8 fatias) — R$ 52,00

**CLIENTE:** *toca em* “Grande (8 fatias)”

**ROBÔ:** Quantas unidades? (toque ou digite um número)
> 🔘 1
> 🔘 2
> 🔘 3

**CLIENTE:** *toca em* “2”

**ROBÔ:** Alguma observação? (ex.: sem cebola, bem passado). Escreva ou toque em “Sem observação”.
> 🔘 Sem observação

**CLIENTE:** “sem cebola, por favor”

**ROBÔ:** Adicionado! ✅

**ROBÔ:** 🧺 *Seu pedido até agora*
2x Pizza Calabresa (Grande (8 fatias)) — R$ 104,00
   _obs: sem cebola, por favor_

Subtotal: R$ 104,00
> 🔘 Adicionar mais
> 🔘 Finalizar pedido
> 🔘 Esvaziar

**CLIENTE:** *toca em* “Adicionar mais”

**ROBÔ:** Você tem 2 item(ns) no carrinho. O que você quer pedir?
> ▫️ Pizzas — 3 opções
> ▫️ Bebidas — 2 opções
> ▫️ Sobremesas — 1 opção

**CLIENTE:** *toca em* “Bebidas”

**ROBÔ:** *Bebidas* — escolha o item (digite VOLTAR para ver as categorias):
> ▫️ Coca-Cola 2L — R$ 12,00
> ▫️ Guaraná lata — R$ 6,00 · 350 ml

**CLIENTE:** *toca em* “Coca-Cola 2L”

**ROBÔ:** Quantas unidades? (toque ou digite um número)
> 🔘 1
> 🔘 2
> 🔘 3

**CLIENTE:** *toca em* “1”

**ROBÔ:** Alguma observação? (ex.: sem cebola, bem passado). Escreva ou toque em “Sem observação”.
> 🔘 Sem observação

**CLIENTE:** *toca em* “Sem observação”

**ROBÔ:** Adicionado! ✅

**ROBÔ:** 🧺 *Seu pedido até agora*
2x Pizza Calabresa (Grande (8 fatias)) — R$ 104,00
   _obs: sem cebola, por favor_
1x Coca-Cola 2L — R$ 12,00

Subtotal: R$ 116,00
> 🔘 Adicionar mais
> 🔘 Finalizar pedido
> 🔘 Esvaziar

**CLIENTE:** *toca em* “Finalizar pedido”

**ROBÔ:** 🧺 *Seu pedido até agora*
2x Pizza Calabresa (Grande (8 fatias)) — R$ 104,00
   _obs: sem cebola, por favor_
1x Coca-Cola 2L — R$ 12,00

Subtotal: R$ 116,00

É para entrega ou retirada?
> 🔘 Entrega 🛵
> 🔘 Retirada 🛍️

**CLIENTE:** *toca em* “Entrega 🛵”

**ROBÔ:** Qual o seu bairro?
> ▫️ Centro — Taxa R$ 5,00 · ~40 min
> ▫️ Jardim América — Taxa R$ 7,00 · ~50 min
> ▫️ Vila Nova — Taxa R$ 8,00 · ~55 min

**CLIENTE:** *toca em* “Centro”

**ROBÔ:** Qual o endereço de entrega? (rua, número e complemento/ponto de referência)

**CLIENTE:** “Rua das Palmeiras, 123, apto 4”

**ROBÔ:** Como você prefere pagar?
> 🔘 Pix
> 🔘 Dinheiro
> 🔘 Cartão na entrega

**CLIENTE:** *toca em* “Pix”

**ROBÔ:** 📋 *Confira seu pedido*
2x Pizza Calabresa (Grande (8 fatias)) — R$ 104,00
   _obs: sem cebola, por favor_
1x Coca-Cola 2L — R$ 12,00

Subtotal: R$ 116,00
Entrega (Centro): R$ 5,00
*Total: R$ 121,00*

🛵 Entrega em: Rua das Palmeiras, 123, apto 4 — Centro
👤 Ana Paula
💳 Pix
⏱️ Previsão: ~40 min
> 🔘 Confirmar ✅
> 🔘 Alterar pedido
> 🔘 Cancelar

**CLIENTE:** *toca em* “Confirmar ✅”

**ROBÔ:** Pedido *#1* recebido! 🎉

Recebemos o seu pedido #1. Já já confirmamos! 🙌
Total: R$ 121,00. Vou te avisando por aqui a cada etapa.

**ROBÔ:** Para pagar por Pix, copie o código abaixo e cole no app do seu banco (Pix > Pix Copia e Cola). Nossa equipe confirma o pagamento:

**ROBÔ:** 00020126330014br.gov.bcb.pix0111119999900005204000053039865406121.005802BR5920Bella Massa Pizzaria6009Sao Paulo62060502P16304186F


_No painel, a pizzaria clica nos botões do pedido. O cliente é avisado sozinho a cada etapa:_

**ROBÔ (aviso automático):** Seu pedido #1 foi aceito ✅ Previsão de entrega: cerca de 40 min.

**ROBÔ (aviso automático):** Seu pedido #1 está sendo preparado 👨‍🍳

**ROBÔ (aviso automático):** Seu pedido #1 saiu para entrega 🛵 Fique de olho no portão!

**ROBÔ (aviso automático):** Pedido #1 concluído. Bom apetite! 😋 Obrigado por pedir na Pizzaria Bella Massa.

### 2. Fluxo de dúvida — só responde o que está cadastrado

**CLIENTE:** “Vocês entregam no Jardim América? Qual a taxa?”

**ROBÔ:** Não tenho essa informação no momento. Vou encaminhar você para um atendente.

**CLIENTE:** “Onde fica a pizzaria?”

**CLIENTE:** “Vocês têm opção sem glúten?”


### 3. Fluxo de erro — pedido mínimo, bairro fora da área e quantidade inválida

**CLIENTE:** *toca em* “Fazer pedido”

**ROBÔ:** O que você quer pedir?
> ▫️ Pizzas — 3 opções
> ▫️ Bebidas — 2 opções
> ▫️ Sobremesas — 1 opção

**CLIENTE:** *toca em* “Bebidas”

**ROBÔ:** *Bebidas* — escolha o item (digite VOLTAR para ver as categorias):
> ▫️ Coca-Cola 2L — R$ 12,00
> ▫️ Guaraná lata — R$ 6,00 · 350 ml

**CLIENTE:** *toca em* “Guaraná lata”

**ROBÔ:** Quantas unidades? (toque ou digite um número)
> 🔘 1
> 🔘 2
> 🔘 3

**CLIENTE:** “50”

**ROBÔ:** Digite uma quantidade de 1 a 20.

**CLIENTE:** *toca em* “1”

**ROBÔ:** Alguma observação? (ex.: sem cebola, bem passado). Escreva ou toque em “Sem observação”.
> 🔘 Sem observação

**CLIENTE:** *toca em* “Sem observação”

**ROBÔ:** Adicionado! ✅

**ROBÔ:** 🧺 *Seu pedido até agora*
1x Guaraná lata — R$ 6,00

Subtotal: R$ 6,00
> 🔘 Adicionar mais
> 🔘 Finalizar pedido
> 🔘 Esvaziar

**CLIENTE:** *toca em* “Finalizar pedido”

**ROBÔ:** 🧺 *Seu pedido até agora*
1x Guaraná lata — R$ 6,00

Subtotal: R$ 6,00

É para entrega ou retirada?
> 🔘 Entrega 🛵
> 🔘 Retirada 🛍️

**CLIENTE:** *toca em* “Entrega 🛵”

**ROBÔ:** O pedido mínimo para entrega é R$ 30,00 (seu subtotal: R$ 6,00). Quer adicionar mais itens ou retirar no local?
> 🔘 Adicionar mais
> 🔘 Retirada 🛍️


### 3b. Bairro fora da área de entrega

**CLIENTE:** *toca em* “Fazer pedido”

**ROBÔ:** O que você quer pedir?
> ▫️ Pizzas — 3 opções
> ▫️ Bebidas — 2 opções
> ▫️ Sobremesas — 1 opção

**CLIENTE:** *toca em* “Brownie”

**ROBÔ:** *Sobremesas* — escolha o item (digite VOLTAR para ver as categorias):
> ▫️ Brownie com sorvete — R$ 18,00 · Brownie quente com sorvete de creme

**CLIENTE:** *toca em* “Brownie com sorvete”

**ROBÔ:** Quantas unidades? (toque ou digite um número)
> 🔘 1
> 🔘 2
> 🔘 3

**CLIENTE:** *toca em* “2”

**ROBÔ:** Alguma observação? (ex.: sem cebola, bem passado). Escreva ou toque em “Sem observação”.
> 🔘 Sem observação

**CLIENTE:** *toca em* “Sem observação”

**ROBÔ:** Adicionado! ✅

**ROBÔ:** 🧺 *Seu pedido até agora*
2x Brownie com sorvete — R$ 36,00

Subtotal: R$ 36,00
> 🔘 Adicionar mais
> 🔘 Finalizar pedido
> 🔘 Esvaziar

**CLIENTE:** *toca em* “Finalizar pedido”

**ROBÔ:** 🧺 *Seu pedido até agora*
2x Brownie com sorvete — R$ 36,00

Subtotal: R$ 36,00

É para entrega ou retirada?
> 🔘 Entrega 🛵
> 🔘 Retirada 🛍️

**CLIENTE:** *toca em* “Entrega 🛵”

**ROBÔ:** Qual o seu bairro?
> ▫️ Centro — Taxa R$ 5,00 · ~40 min
> ▫️ Jardim América — Taxa R$ 7,00 · ~50 min
> ▫️ Vila Nova — Taxa R$ 8,00 · ~55 min

**CLIENTE:** “Bairro Distante”

**ROBÔ:** Não encontrei esse bairro na nossa área de entrega. 😕 Atendemos: Centro, Jardim América, Vila Nova. Você também pode retirar no local — digite RETIRADA.


### 3c. Loja fechada (segunda, 12h)

**CLIENTE:** *toca em* “Fazer pedido”

**ROBÔ:** No momento estamos fechados. 😴 Nosso horário: Terça a domingo, das 18h às 23h30. Você pode ver o cardápio e voltar quando abrirmos!


### 4. Transferência para atendente humano

**CLIENTE:** “Quero falar com um atendente”

**ROBÔ:** Certo! Já chamei um atendente. Ele responde assim que possível, por aqui mesmo. 🙂

**CLIENTE:** “Alô?”


_O robô fica em silêncio e a conversa aparece no painel (“Conversas”) como aguardando atendente. Se ninguém assumir em 12h, o robô volta a atender._
