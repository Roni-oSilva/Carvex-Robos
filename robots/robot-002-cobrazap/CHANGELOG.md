# Histórico de versões — CobraZap

## 1.0.0 — primeira versão completa
- Fluxos de conversa, painel de administração, banco de dados multiempresa e testes automatizados.
- Integração com a WhatsApp Business Platform (Cloud API): recebimento por webhook com validação de assinatura, envio de texto, botões, listas e modelos (templates), regra da janela de 24 horas.
- IA opcional restrita ao conhecimento cadastrado (nunca inventa; números fora da base são rejeitados).
- Opt-out (PARAR), exclusão de dados do titular (LGPD) e retenção configurável.

### Antes de vender em escala (pendências conhecidas)
- Piloto com número real da WhatsApp Business Platform e o modelo `cobranca_aviso` aprovado (a Meta pode recusar ou cobrar como marketing).
- Revisão dos textos padrão, horários e política por um advogado (CDC art. 42, LGPD) antes de oferecer a clientes.
- Baixa automática de pagamentos (webhook de PSP/Open Finance ou conciliação de extrato) — hoje é manual.
- Juros/multa e emissão de boleto, se o público-alvo exigir.
- Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
