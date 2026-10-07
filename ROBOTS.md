# Robôs da fábrica

> Gerado por `node scripts/gerar-catalogo.ts`. Status possíveis: IDEIA · PESQUISA · PLANEJADO · DESENVOLVIMENTO · TESTE · PRONTO · COMERCIAL · DESCONTINUADO.
> **PRONTO** = checklist técnico e documental completo e testes passando (verificado por `npm test`). **COMERCIAL** exige, além disso, piloto com credenciais reais da Meta e cliente pagante — veja as pendências de cada robô.

| Robô | Segmento | Problema | Status | Potencial | Pontuação | Pasta |
|---|---|---|---|---|---|---|
| **AgendaZap** | Barbearias, Salões de beleza, Estúdios | Agenda feita à mão no WhatsApp gera conflito de horário, mensagens sem resposta fora do expediente e faltas sem aviso (horário vazio = dinheiro perdido). | PRONTO | Alto | 78.8 | [`robots/robot-001-agendazap`](robots/robot-001-agendazap) |
| **CobraZap** | Academias, Escolas e cursos, Prestadores de serviço com mensalidade | Atraso pequeno vira inadimplência quando ninguém acompanha: o follow-up é esquecido ou constrange quem cobra. | PRONTO | Alto | 75.8 | [`robots/robot-002-cobrazap`](robots/robot-002-cobrazap) |
| **PedidoZap** | Pizzarias, Lanchonetes e hamburguerias, Restaurantes e marmitarias | Pedido por WhatsApp manual é lento (cliente pergunta cardápio, disponibilidade, taxa…), gera erro de anotação e prende um atendente. | PRONTO | Alto | 73.0 | [`robots/robot-003-pedidozap`](robots/robot-003-pedidozap) |

## Próximos da fila (oportunidades selecionadas, ainda sem robô)

| Oportunidade | Segmento | Pontuação | Evidência | Status |
|---|---|---|---|---|
| #21 Pré-orçamento para prestadores de serviço | Eletricistas, pedreiros, dedetizadoras, serviços residenciais | 69.2 | média | SELECIONADA → PLANEJADO |
| #5 Qualificação de leads para imobiliárias e corretores | Imobiliárias e corretores autônomos | 68.4 | média | SELECIONADA → PLANEJADO |

Ranking completo (22 oportunidades, com fontes): [market-research/opportunities.md](market-research/opportunities.md).

## Componentes compartilhados
Todos os robôs usam a camada [`shared/`](shared): webhook assinado, cliente da Cloud API, janela de 24 h, banco multiempresa, IA restrita ao cadastro, motor de conversa (opt-out, atendente humano), painel, Pix e validação de configuração.

## Pendências por robô antes de COMERCIAL
### AgendaZap
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 empresa (hoje as integrações foram verificadas contra o formato documentado da API e por simulação, não em produção).
- Modelo `lembrete_agendamento` aprovado pela Meta e testado de ponta a ponta.
- Medir faltas antes/depois no piloto antes de usar qualquer número em propaganda.
- Revisão/pentest de segurança independente e contrato de suporte/hospedagem definido.
- Cadastro de serviços e profissionais por formulário (hoje é JSON validado) para clientes sem apoio técnico.

### CobraZap
- Piloto com número real da WhatsApp Business Platform e o modelo `cobranca_aviso` aprovado (a Meta pode recusar ou cobrar como marketing).
- Revisão dos textos padrão, horários e política por um advogado (CDC art. 42, LGPD) antes de oferecer a clientes.
- Baixa automática de pagamentos (webhook de PSP/Open Finance ou conciliação de extrato) — hoje é manual.
- Juros/multa e emissão de boleto, se o público-alvo exigir.
- Revisão/pentest de segurança independente; contrato de suporte/hospedagem.

### PedidoZap
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 restaurante (hoje validado por simulação e pelo formato documentado da API).
- Modelo `pedido_status` aprovado pela Meta e testado.
- Editor de cardápio por formulário e **adicionais** (borda, extras) — o que mais restaurantes pedem.
- Baixa automática de Pix (PSP) e impressão térmica, se o público exigir.
- Validar com 5 restaurantes o ganho real frente ao marketplace que usam (a evidência atual vem de relatos de fórum).
- Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
