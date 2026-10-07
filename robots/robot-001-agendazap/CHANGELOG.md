# Histórico de versões — AgendaZap

## 1.0.0 — primeira versão completa
- Fluxos de conversa, painel de administração, banco de dados multiempresa e testes automatizados.
- Integração com a WhatsApp Business Platform (Cloud API): recebimento por webhook com validação de assinatura, envio de texto, botões, listas e modelos (templates), regra da janela de 24 horas.
- IA opcional restrita ao conhecimento cadastrado (nunca inventa; números fora da base são rejeitados).
- Opt-out (PARAR), exclusão de dados do titular (LGPD) e retenção configurável.

### Antes de vender em escala (pendências conhecidas)
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 empresa (hoje as integrações foram verificadas contra o formato documentado da API e por simulação, não em produção).
- Modelo `lembrete_agendamento` aprovado pela Meta e testado de ponta a ponta.
- Medir faltas antes/depois no piloto antes de usar qualquer número em propaganda.
- Revisão/pentest de segurança independente e contrato de suporte/hospedagem definido.
- Cadastro de serviços e profissionais por formulário (hoje é JSON validado) para clientes sem apoio técnico.
