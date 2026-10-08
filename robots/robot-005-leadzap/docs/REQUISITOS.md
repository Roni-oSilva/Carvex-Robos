# Requisitos — LeadZap

## Requisitos de ambiente
- Node.js ≥ 22.18; 256 MB de RAM e 1 GB de disco bastam para uma empresa pequena.
- Domínio com HTTPS válido e porta de entrada para o webhook.
- Conta Meta Business + número na WhatsApp Business Platform; modelos de mensagem aprovados (veja INSTALACAO.md).
- (Opcional) Chave de API de IA.

## Requisitos funcionais

| ID | Requisito | Situação |
|---|---|---|
| RF-01 | Qualificação: finalidade, tipo, bairro, faixa de valor, quartos e prazo | ✅ Implementado |
| RF-02 | Exibição de imóveis compatíveis apenas do catálogo cadastrado | ✅ Implementado |
| RF-03 | Classificação do lead (quente/morno/frio) por regra transparente | ✅ Implementado |
| RF-04 | Roteamento ao corretor por bairro e carga | ✅ Implementado |
| RF-05 | Agendamento de visita com horários livres por imóvel | ✅ Implementado |
| RF-06 | Lembrete e confirmação/remarcação/cancelamento de visita | ✅ Implementado |
| RF-07 | Acompanhamento único do lead e situação "sem resposta" | ✅ Implementado |
| RF-08 | Painel de leads, visitas, imóveis e indicadores | ✅ Implementado |
| RF-09 | Aviso ao corretor por WhatsApp quando chega um lead quente | ⬜ Não implementado |
| RF-10 | Integração com portais/CRM imobiliário e importação de catálogo | ⬜ Não implementado |
| RF-11 | Agenda individual por corretor | ⬜ Não implementado |
| RF-12 | Editor de catálogo por formulário (hoje: JSON validado + botão de disponibilidade) | 🟡 Parcial |

## Requisitos não funcionais

| ID | Requisito | Situação |
|---|---|---|
| RNF-01 | Nenhum segredo no código ou no Git | ✅ Implementado |
| RNF-02 | Webhook autenticado por assinatura | ✅ Implementado |
| RNF-03 | Respeito à janela de 24 h e às regras de templates | ✅ Implementado |
| RNF-04 | Multiempresa (tenant_id em todas as tabelas, painel isolado) | ✅ Implementado |
| RNF-05 | Instalação sem dependências externas de runtime | ✅ Implementado |
| RNF-06 | LGPD: opt-out, exclusão, retenção, minimização | ✅ Implementado |
| RNF-07 | Testes automatizados dos fluxos principais | ✅ Implementado |
| RNF-08 | Escala horizontal (vários processos) | ⬜ Não implementado (fila e limites em memória; SQLite) |
| RNF-09 | Criptografia do banco em repouso | ⬜ Não implementado (use disco criptografado) |
| RNF-10 | Autenticação em dois fatores no painel | ⬜ Não implementado |

## Pendências antes de marcar como COMERCIAL
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 imobiliária (hoje validado por simulação e pelo formato documentado da API).
- Modelo `lead_visita` aprovado pela Meta e testado.
- Aviso ao corretor por WhatsApp (modelo `lead_novo`) e agenda por corretor — o que mais pedem imobiliárias com equipe.
- Importação do catálogo (planilha/feed de portal) e editor por formulário.
- Validar com 3 imobiliárias se a regra de temperatura reflete a prioridade real da equipe.
- Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
