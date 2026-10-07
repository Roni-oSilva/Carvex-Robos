# Catálogo de robôs de WhatsApp

> Preços são **sugestões** a validar no mercado (veja `sales/PRECIFICACAO.md` de cada robô). Resultados dependem do negócio; nenhum percentual de ganho é prometido.
> Todos usam a **API oficial** do WhatsApp (WhatsApp Business Platform), seguem a regra de janela de 24 h e respeitam PARAR/LGPD.

## AgendaZap — Seu atendente de agenda no WhatsApp: marca, confirma, remarca e preenche as vagas — 24 horas por dia.

**Para:** Barbearias, Salões de beleza, Estúdios, Clínicas e consultórios, Pet shops (banho e tosa), Autoescolas (aulas)
**Status:** PRONTO · **Versão:** 1.0.0

O **AgendaZap** é um assistente de agenda que funciona dentro do WhatsApp oficial da empresa. O cliente escolhe serviço, profissional, dia e hora por botões ou digitando; o robô confere a agenda em tempo real, confirma, **lembra antes do horário pedindo confirmação**, permite **remarcar e cancelar** dentro da regra da casa e, quando um horário abre, **avisa quem estava na lista de espera**. A equipe acompanha tudo em um painel simples e assume a conversa quando quiser.

**O que ele faz**
- Agendamento por conversa: Serviço → profissional (ou “sem preferência”) → dia → hora → confirmação, por botões/listas ou texto livre (“amanhã”, “15/10”, “10h30”).
- Agenda sem conflito: Reserva atômica no banco: se dois clientes escolhem o mesmo horário, só um garante e o outro recebe novas opções.
- Regras da casa: Expediente por profissional, folgas, duração por serviço, intervalo da agenda, antecedência mínima e prazo para cancelar.
- Lembretes com confirmação: Até 4 lembretes por horário (padrão 24 h e 2 h). Dentro da janela de 24 h do WhatsApp vão com botões; fora dela, por modelo aprovado.
- Remarcar e cancelar: O horário antigo só é cancelado quando o novo é confirmado. Alterações fora do prazo vão para uma pessoa.
- Lista de espera: Dia lotado? O cliente entra na fila e é avisado quando abre uma vaga (primeiro a responder leva).

**O que ele não faz (ainda)**
- Não cobra nem recebe pagamento (sem sinal ou pré-pagamento).
- Não sincroniza com Google Agenda ou outros sistemas — a agenda do robô é a fonte da verdade (horários marcados fora dele precisam ser lançados pelo painel).
- Não cancela automaticamente quem não confirmou (isso é decisão do dono; hoje o painel mostra “sem confirmar”).
- Um agendamento por vez (não combina vários serviços em sequência automaticamente — use um serviço “combo”, como Corte + Barba).

**Investimento sugerido**

| Implantação | Mensalidade | Venda única | Personalização |
|---|---|---|---|
| R$ 490 | R$ 129/mês | R$ 1.490 | R$ 150/hora |

**Material:** [Página de vendas](robots/robot-001-agendazap/sales/SALES-PAGE.md) · [Pitch](robots/robot-001-agendazap/sales/PITCH.md) · [Funcionalidades](robots/robot-001-agendazap/sales/FEATURES.md) · [Objeções](robots/robot-001-agendazap/sales/OBJECTIONS.md) · [FAQ](robots/robot-001-agendazap/sales/FAQ.md) · [Roteiro de demonstração](robots/robot-001-agendazap/sales/DEMO-SCRIPT.md) · [Conversas de exemplo](robots/robot-001-agendazap/demo/CONVERSAS.md)

---

## CobraZap — Cobrança educada, no tempo certo e dentro da lei — direto no WhatsApp.

**Para:** Academias, Escolas e cursos, Prestadores de serviço com mensalidade, Pequenos comércios com crediário, Condomínios e associações (mensalidades)
**Status:** PRONTO · **Versão:** 1.0.0

O **CobraZap** roda uma **régua de cobrança** (lembrete antes do vencimento, aviso no dia e acompanhamento depois do atraso) pelo WhatsApp oficial da empresa, com tom educado e **travas legais embutidas**: confirma que está falando com a pessoa certa antes de mencionar dívida, só envia em horário comercial, limita a frequência, nunca ameaça e para quando o cliente pede. O cliente recebe o **Pix copia-e-cola** na hora, avisa “já paguei”, ou **negocia** parcelamento dentro das regras que a empresa definiu; a equipe confere e dá baixa no painel.

**O que ele faz**
- Régua configurável: Passos relativos ao vencimento, com texto padrão educado ou personalizado por passo.
- Confirmação de titularidade: Evita expor dívida a terceiros (número trocado, família). Pode ser desligada, mas vem ligada.
- Travas legais: Janela de envio (padrão 8h–20h, seg–sáb, nunca fora de 7h–21h), máximo por semana, intervalo mínimo, mensagem única consolidada por pessoa, sem termos de ameaça (SPC, protesto, processo…).
- Pix copia-e-cola automático: Código EMV válido (CRC16) com a chave Pix da empresa e o valor; aceita código/link próprios por cobrança.
- “Já paguei” + comprovante: Pausa a cobrança, registra o comprovante recebido e leva à tela de Conferência.
- Negociação guiada: Opções automáticas (à vista com desconto, parcelas com valor mínimo); aceite pela equipe cria as parcelas mensais.

**O que ele não faz (ainda)**
- **Não vê pagamentos sozinho**: o Pix é estático; a baixa é manual (painel, “paguei” + conferência ou lista de referências do extrato).
- Não emite boleto, não calcula juros/multa e não integra com ERP/banco/PSP nesta versão.
- Não negativa, não protesta, não ameaça e não contata terceiros — por desenho.
- Fora da janela de 24 h, só envia com **modelo aprovado pela Meta**; a Meta pode recusar ou reclassificar modelos de cobrança.

**Investimento sugerido**

| Implantação | Mensalidade | Venda única | Personalização |
|---|---|---|---|
| R$ 590 | R$ 149/mês | R$ 1.990 | R$ 150/hora |

**Material:** [Página de vendas](robots/robot-002-cobrazap/sales/SALES-PAGE.md) · [Pitch](robots/robot-002-cobrazap/sales/PITCH.md) · [Funcionalidades](robots/robot-002-cobrazap/sales/FEATURES.md) · [Objeções](robots/robot-002-cobrazap/sales/OBJECTIONS.md) · [FAQ](robots/robot-002-cobrazap/sales/FAQ.md) · [Roteiro de demonstração](robots/robot-002-cobrazap/sales/DEMO-SCRIPT.md) · [Conversas de exemplo](robots/robot-002-cobrazap/demo/CONVERSAS.md)

---

## PedidoZap — Seu cardápio, carrinho e quadro de pedidos dentro do WhatsApp — sem comissão por pedido.

**Para:** Pizzarias, Lanchonetes e hamburguerias, Restaurantes e marmitarias, Açaí e sorveterias, Padarias com delivery
**Status:** PRONTO · **Versão:** 1.0.0

O **PedidoZap** transforma o WhatsApp do restaurante em um **canal de pedidos guiado**: o cliente vê o cardápio por categorias, escolhe tamanho e quantidade, escreve observações, informa bairro e endereço, escolhe a forma de pagamento e confirma. O robô **calcula tudo no servidor** (preço do cardápio atual, taxa por bairro, pedido mínimo), gera o **Pix copia-e-cola** com o valor exato e entrega o pedido pronto num **quadro** para a cozinha. A cada etapa (aceito, preparando, saiu, pronto, entregue) o cliente é avisado automaticamente.

**O que ele faz**
- Cardápio por categorias: Itens com descrição, tamanhos/variações e preço; marque **esgotado** em um clique e o item some do robô na hora.
- Carrinho com observações: Quantidade (1–20) e observação livre por item, sanitizada.
- Entrega ou retirada: Taxa e tempo por bairro, pedido mínimo para entrega, tempo de retirada.
- Preço confiável: Preços e disponibilidade são recalculados do cardápio atual na hora de confirmar — nada vem do cliente.
- Pix copia-e-cola: Código válido com a sua chave e o total do pedido; baixa manual no painel.
- Dinheiro com troco / cartão na entrega: Valida que o troco cobre o total.

**O que ele não faz (ainda)**
- **Não recebe pagamento online sozinho**: o Pix é estático e a marcação de “pago” é manual.
- Sem adicionais/complementos com múltipla escolha (ex.: borda recheada + extras) nem combos com escolhas internas — use itens separados ou variações.
- Sem frete por distância/CEP/mapa: a taxa é por bairro cadastrado.
- Sem impressão térmica automática nem integração com ERP, iFood ou entregadores (há página de impressão da comanda).

**Investimento sugerido**

| Implantação | Mensalidade | Venda única | Personalização |
|---|---|---|---|
| R$ 790 | R$ 179/mês | R$ 2.490 | R$ 150/hora |

**Material:** [Página de vendas](robots/robot-003-pedidozap/sales/SALES-PAGE.md) · [Pitch](robots/robot-003-pedidozap/sales/PITCH.md) · [Funcionalidades](robots/robot-003-pedidozap/sales/FEATURES.md) · [Objeções](robots/robot-003-pedidozap/sales/OBJECTIONS.md) · [FAQ](robots/robot-003-pedidozap/sales/FAQ.md) · [Roteiro de demonstração](robots/robot-003-pedidozap/sales/DEMO-SCRIPT.md) · [Conversas de exemplo](robots/robot-003-pedidozap/demo/CONVERSAS.md)


## Como contratar
1. Demonstração de 15 minutos com dados fictícios (`demo/servidor-demo.ts`).
2. Piloto com o seu número de teste e os seus dados.
3. Implantação (número na Meta, configuração, treinamento) e entrega do painel.
