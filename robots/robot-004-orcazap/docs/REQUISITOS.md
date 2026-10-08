# Requisitos — OrcaZap

## Requisitos de ambiente
- Node.js ≥ 22.18; 256 MB de RAM e 1 GB de disco bastam para uma empresa pequena.
- Domínio com HTTPS válido e porta de entrada para o webhook.
- Conta Meta Business + número na WhatsApp Business Platform; modelos de mensagem aprovados (veja INSTALACAO.md).
- (Opcional) Chave de API de IA.

## Requisitos funcionais

| ID | Requisito | Situação |
|---|---|---|
| RF-01 | Pedido de orçamento guiado (serviço, descrição, local, período) | ✅ Implementado |
| RF-02 | Recebimento e validação de fotos, com armazenamento privado | ✅ Implementado |
| RF-03 | Quadro de orçamentos com fotos e dados do cliente | ✅ Implementado |
| RF-04 | Proposta com valor, prazo, observação e validade enviada pelo WhatsApp | ✅ Implementado |
| RF-05 | Aceite, recusa (com motivo) e dúvida pelo cliente | ✅ Implementado |
| RF-06 | Lembrete único e vencimento automático | ✅ Implementado |
| RF-07 | Indicadores: taxa de aceite, tempo até a proposta, valor aceito | ✅ Implementado |
| RF-08 | Exclusão LGPD com remoção dos arquivos de foto; limpeza por retenção | ✅ Implementado |
| RF-09 | Agendamento da visita técnica integrado | ⬜ Não implementado |
| RF-10 | Perguntas específicas por tipo de serviço (ex.: metragem da parede) | 🟡 Parcial |
| RF-11 | Geração de PDF da proposta e assinatura | ⬜ Não implementado |

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
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 prestador (hoje validado por simulação e pelo formato documentado da API, incluindo o download de mídia).
- Modelo `orcamento_proposta` aprovado pela Meta e testado.
- Perguntas por tipo de serviço (metragem, material, andar) — o que mais ajuda a orçar sem visita.
- Validar com 5 prestadores se a taxa de resposta/fechamento melhora (a evidência atual vem de conteúdo de fornecedores).
- Revisão/pentest de segurança independente (upload de arquivos); contrato de suporte/hospedagem.
