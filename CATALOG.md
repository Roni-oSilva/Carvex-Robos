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

---

## OrcaZap — O cliente manda o problema com fotos e você responde com o orçamento — tudo organizado no WhatsApp.

**Para:** Pintores e reformas, Eletricistas e encanadores, Gesso, forro e marcenaria, Instalação de ar-condicionado, Dedetização e limpeza pós-obra
**Status:** PRONTO · **Versão:** 1.0.0

O **OrcaZap** conduz o cliente por um pedido de orçamento completo: escolhe o serviço, descreve o que precisa, **envia fotos**, informa bairro, endereço e período preferido para visita. A equipe recebe tudo num **quadro de orçamentos** (fotos, descrição, local), digita o valor e o prazo, e o cliente recebe a **proposta no WhatsApp com botões Aceitar, Recusar e Tenho dúvida**. Se ele não responde, o robô faz **um** lembrete e, passada a validade, encerra a proposta. **O robô nunca calcula nem informa preço**: o valor é sempre digitado por uma pessoa.

**O que ele faz**
- Pedido guiado por serviço: Lista de serviços da empresa, descrição obrigatória e período preferido para visita.
- Recebimento de fotos: Até 4 fotos por pedido (1 a 6), com conferência do tipo real do arquivo e limite de 5 MB.
- Regiões atendidas: Bairro validado contra a lista cadastrada; fora da área, o robô explica e oferece atendente.
- Quadro de orçamentos: Colunas Novos, Em análise, Aguardando resposta e Aceitos, com fotos e dados do cliente numa página.
- Proposta pelo WhatsApp: Valor, prazo, observação e validade enviados com botões Aceitar, Recusar e Tenho dúvida.
- Preço só humano: O robô não calcula, estima nem cita valores: quem digita o valor é a equipe.

**O que ele não faz (ainda)**
- **Não calcula preço** (de propósito): sem tabela de preços por m², o robô só coleta e organiza.
- Não faz análise automática das fotos: quem avalia é a equipe.
- Não agenda a visita técnica: registra o período preferido e a equipe combina (agenda integrada é evolução).
- Fotos ficam no disco do servidor (pasta MEDIA_DIR): é preciso incluí-la no backup; vídeos e documentos não são aceitos.

**Investimento sugerido**

| Implantação | Mensalidade | Venda única | Personalização |
|---|---|---|---|
| R$ 490 | R$ 139/mês | R$ 1.790 | R$ 150/hora |

**Material:** [Página de vendas](robots/robot-004-orcazap/sales/SALES-PAGE.md) · [Pitch](robots/robot-004-orcazap/sales/PITCH.md) · [Funcionalidades](robots/robot-004-orcazap/sales/FEATURES.md) · [Objeções](robots/robot-004-orcazap/sales/OBJECTIONS.md) · [FAQ](robots/robot-004-orcazap/sales/FAQ.md) · [Roteiro de demonstração](robots/robot-004-orcazap/sales/DEMO-SCRIPT.md) · [Conversas de exemplo](robots/robot-004-orcazap/demo/CONVERSAS.md)

---

## LeadZap — Responde na hora, mostra os imóveis certos, agenda a visita e entrega o lead pronto ao corretor.

**Para:** Imobiliárias pequenas e médias, Corretores autônomos e equipes, Loteadoras e construtoras pequenas, Administradoras de aluguel
**Status:** PRONTO · **Versão:** 1.0.0

O **LeadZap** atende o interessado na hora: pergunta se quer **comprar ou alugar**, tipo de imóvel, bairro, faixa de valor, quartos e prazo, e mostra **somente imóveis do seu cadastro** que cabem no perfil. Se o cliente gostar, **agenda a visita** em horários livres daquele imóvel, **lembra e pede confirmação** antes. O lead vai para o painel **classificado como quente, morno ou frio** (regra de pontos transparente), **já atribuído ao corretor** do bairro, com todo o resumo. Se o cliente some, o robô faz **um** acompanhamento com opções reais do cadastro, e depois o lead vira "sem resposta" para a equipe decidir.

**O que ele faz**
- Qualificação em poucos toques: Finalidade, tipo, bairro, faixa de valor, quartos e prazo — com botões e listas.
- Imóveis só do seu cadastro: Mostra apenas imóveis disponíveis que cabem no perfil. Nada de imóvel inventado.
- Temperatura transparente: Quente, morno ou frio por pontos fixos (prazo, imóvel compatível, interesse, visita). Você enxerga a regra.
- Roteamento ao corretor: Atribui ao corretor que atende o bairro com menos leads em aberto; você troca no painel quando quiser.
- Agendamento de visita: Horários livres por imóvel, antecedência mínima, sem duas visitas no mesmo horário do mesmo imóvel.
- Lembrete e confirmação: Aviso antes da visita com botões Confirmo, Remarcar e Cancelar visita.

**O que ele não faz (ainda)**
- **Não integra com portais, CRMs nem com a base do MLS**: o catálogo é cadastrado nas Configurações (até 300 imóveis).
- Não envia fotos nem vídeos: envia o **link** que você cadastrar (https).
- Não avalia crédito, não simula financiamento e não negocia valores.
- A visita é por imóvel e horário fixos da configuração; não verifica a agenda pessoal do corretor.

**Investimento sugerido**

| Implantação | Mensalidade | Venda única | Personalização |
|---|---|---|---|
| R$ 690 | R$ 189/mês | R$ 2.290 | R$ 150/hora |

**Material:** [Página de vendas](robots/robot-005-leadzap/sales/SALES-PAGE.md) · [Pitch](robots/robot-005-leadzap/sales/PITCH.md) · [Funcionalidades](robots/robot-005-leadzap/sales/FEATURES.md) · [Objeções](robots/robot-005-leadzap/sales/OBJECTIONS.md) · [FAQ](robots/robot-005-leadzap/sales/FAQ.md) · [Roteiro de demonstração](robots/robot-005-leadzap/sales/DEMO-SCRIPT.md) · [Conversas de exemplo](robots/robot-005-leadzap/demo/CONVERSAS.md)


## Como contratar
1. Demonstração de 15 minutos com dados fictícios (`demo/servidor-demo.ts`).
2. Piloto com o seu número de teste e os seus dados.
3. Implantação (número na Meta, configuração, treinamento) e entrega do painel.
