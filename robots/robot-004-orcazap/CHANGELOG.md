# Histórico de versões — OrcaZap

## 1.0.0 — primeira versão completa
- Fluxos de conversa, painel de administração, banco de dados multiempresa e testes automatizados.
- Integração com a WhatsApp Business Platform (Cloud API): recebimento por webhook com validação de assinatura, envio de texto, botões, listas e modelos (templates), regra da janela de 24 horas.
- IA opcional restrita ao conhecimento cadastrado (nunca inventa; números fora da base são rejeitados).
- Opt-out (PARAR), exclusão de dados do titular (LGPD) e retenção configurável.

### Antes de vender em escala (pendências conhecidas)
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 prestador (hoje validado por simulação e pelo formato documentado da API, incluindo o download de mídia).
- Modelo `orcamento_proposta` aprovado pela Meta e testado.
- Perguntas por tipo de serviço (metragem, material, andar) — o que mais ajuda a orçar sem visita.
- Validar com 5 prestadores se a taxa de resposta/fechamento melhora (a evidência atual vem de conteúdo de fornecedores).
- Revisão/pentest de segurança independente (upload de arquivos); contrato de suporte/hospedagem.
