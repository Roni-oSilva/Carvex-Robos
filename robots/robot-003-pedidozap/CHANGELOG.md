# Histórico de versões — PedidoZap

## 1.0.0 — primeira versão completa
- Fluxos de conversa, painel de administração, banco de dados multiempresa e testes automatizados.
- Integração com a WhatsApp Business Platform (Cloud API): recebimento por webhook com validação de assinatura, envio de texto, botões, listas e modelos (templates), regra da janela de 24 horas.
- IA opcional restrita ao conhecimento cadastrado (nunca inventa; números fora da base são rejeitados).
- Opt-out (PARAR), exclusão de dados do titular (LGPD) e retenção configurável.

### Antes de vender em escala (pendências conhecidas)
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 restaurante (hoje validado por simulação e pelo formato documentado da API).
- Modelo `pedido_status` aprovado pela Meta e testado.
- Editor de cardápio por formulário e **adicionais** (borda, extras) — o que mais restaurantes pedem.
- Baixa automática de Pix (PSP) e impressão térmica, se o público exigir.
- Validar com 5 restaurantes o ganho real frente ao marketplace que usam (a evidência atual vem de relatos de fórum).
- Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
