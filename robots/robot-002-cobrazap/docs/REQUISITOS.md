# Requisitos — CobraZap

## Requisitos de ambiente
- Node.js ≥ 22.18; 256 MB de RAM e 1 GB de disco bastam para uma empresa pequena.
- Domínio com HTTPS válido e porta de entrada para o webhook.
- Conta Meta Business + número na WhatsApp Business Platform; modelos de mensagem aprovados (veja INSTALACAO.md).
- (Opcional) Chave de API de IA.

## Requisitos funcionais

| ID | Requisito | Situação |
|---|---|---|
| RF-01 | Régua configurável relativa ao vencimento | ✅ Implementado |
| RF-02 | Confirmar titularidade antes de revelar dívida | ✅ Implementado |
| RF-03 | Janela de envio, limite semanal e intervalo mínimo | ✅ Implementado |
| RF-04 | Recusar textos com ameaça/menção a órgãos de restrição na configuração | ✅ Implementado |
| RF-05 | Mensagem única consolidada e sem rajada de passos antigos | ✅ Implementado |
| RF-06 | Pix copia-e-cola válido por cobrança | ✅ Implementado |
| RF-07 | “Já paguei”, comprovante, conferência e baixa | ✅ Implementado |
| RF-08 | Negociação com regras do dono e geração de parcelas | ✅ Implementado |
| RF-09 | Importação por planilha colada e baixa em lote por referência | ✅ Implementado |
| RF-10 | Opt-out, número errado, exclusão LGPD | ✅ Implementado |
| RF-11 | Baixa automática de pagamentos (PSP/extrato) | ⬜ Não implementado |
| RF-12 | Cálculo de juros e multa | ⬜ Não implementado |
| RF-13 | Emissão de boleto / link de pagamento próprio | ⬜ Não implementado |
| RF-14 | Integração com ERP/sistema financeiro | ⬜ Não implementado |

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
- Piloto com número real da WhatsApp Business Platform e o modelo `cobranca_aviso` aprovado (a Meta pode recusar ou cobrar como marketing).
- Revisão dos textos padrão, horários e política por um advogado (CDC art. 42, LGPD) antes de oferecer a clientes.
- Baixa automática de pagamentos (webhook de PSP/Open Finance ou conciliação de extrato) — hoje é manual.
- Juros/multa e emissão de boleto, se o público-alvo exigir.
- Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
