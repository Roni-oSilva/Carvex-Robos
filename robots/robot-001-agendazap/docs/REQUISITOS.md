# Requisitos — AgendaZap

## Requisitos de ambiente
- Node.js ≥ 22.18; 256 MB de RAM e 1 GB de disco bastam para uma empresa pequena.
- Domínio com HTTPS válido e porta de entrada para o webhook.
- Conta Meta Business + número na WhatsApp Business Platform; modelos de mensagem aprovados (veja INSTALACAO.md).
- (Opcional) Chave de API de IA.

## Requisitos funcionais

| ID | Requisito | Situação |
|---|---|---|
| RF-01 | Agendar serviço escolhendo profissional, dia e hora | ✅ Implementado |
| RF-02 | Nunca permitir dois agendamentos sobrepostos para o mesmo profissional | ✅ Implementado |
| RF-03 | Respeitar expediente, folgas, duração, antecedência e limite de dias | ✅ Implementado |
| RF-04 | Cancelar, confirmar e remarcar pelo WhatsApp (remarcação sem perder o horário antigo) | ✅ Implementado |
| RF-05 | Lembretes configuráveis com confirmação (botões/modelo) | ✅ Implementado |
| RF-06 | Lista de espera com aviso automático e “primeiro a responder” | ✅ Implementado |
| RF-07 | Responder dúvidas com base no cadastro, sem inventar | ✅ Implementado |
| RF-08 | Transferência para humano e retomada automática | ✅ Implementado |
| RF-09 | Painel: agenda, presença/falta, agendamento manual, indicadores | ✅ Implementado |
| RF-10 | Cancelamento automático de quem não confirma | ⬜ Não implementado |
| RF-11 | Sincronização com Google Agenda / sistemas externos | ⬜ Não implementado |
| RF-12 | Sinal/pagamento antecipado do agendamento | ⬜ Não implementado |
| RF-13 | Cadastro de serviços/profissionais por formulário (hoje: edição validada de JSON) | 🟡 Parcial |

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
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 empresa (hoje as integrações foram verificadas contra o formato documentado da API e por simulação, não em produção).
- Modelo `lembrete_agendamento` aprovado pela Meta e testado de ponta a ponta.
- Medir faltas antes/depois no piloto antes de usar qualquer número em propaganda.
- Revisão/pentest de segurança independente e contrato de suporte/hospedagem definido.
- Cadastro de serviços e profissionais por formulário (hoje é JSON validado) para clientes sem apoio técnico.
