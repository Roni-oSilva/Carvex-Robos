# Histórico de versões — LeadZap

## 1.0.0 — primeira versão completa
- Fluxos de conversa, painel de administração, banco de dados multiempresa e testes automatizados.
- Integração com a WhatsApp Business Platform (Cloud API): recebimento por webhook com validação de assinatura, envio de texto, botões, listas e modelos (templates), regra da janela de 24 horas.
- IA opcional restrita ao conhecimento cadastrado (nunca inventa; números fora da base são rejeitados).
- Opt-out (PARAR), exclusão de dados do titular (LGPD) e retenção configurável.

### Antes de vender em escala (pendências conhecidas)
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 imobiliária (hoje validado por simulação e pelo formato documentado da API).
- Modelo `lead_visita` aprovado pela Meta e testado.
- Aviso ao corretor por WhatsApp (modelo `lead_novo`) e agenda por corretor — o que mais pedem imobiliárias com equipe.
- Importação do catálogo (planilha/feed de portal) e editor por formulário.
- Validar com 3 imobiliárias se a regra de temperatura reflete a prioridade real da equipe.
- Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
