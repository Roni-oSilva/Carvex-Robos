# Requisitos — PedidoZap

## Requisitos de ambiente
- Node.js ≥ 22.18; 256 MB de RAM e 1 GB de disco bastam para uma empresa pequena.
- Domínio com HTTPS válido e porta de entrada para o webhook.
- Conta Meta Business + número na WhatsApp Business Platform; modelos de mensagem aprovados (veja INSTALACAO.md).
- (Opcional) Chave de API de IA.

## Requisitos funcionais

| ID | Requisito | Situação |
|---|---|---|
| RF-01 | Cardápio por categorias com variações e disponibilidade | ✅ Implementado |
| RF-02 | Carrinho com quantidade e observação | ✅ Implementado |
| RF-03 | Entrega com taxa/tempo por bairro, pedido mínimo, retirada | ✅ Implementado |
| RF-04 | Cálculo de totais no servidor a partir do cardápio atual | ✅ Implementado |
| RF-05 | Pagamento: Pix copia-e-cola, dinheiro com troco, cartão na entrega | ✅ Implementado |
| RF-06 | Numeração sequencial por empresa e criação atômica do pedido | ✅ Implementado |
| RF-07 | Quadro de pedidos, comanda para impressão, histórico, indicadores | ✅ Implementado |
| RF-08 | Avisos de status ao cliente (texto/modelo) | ✅ Implementado |
| RF-09 | Horário de funcionamento | ✅ Implementado |
| RF-10 | “Meu pedido” e cancelamento enquanto “novo” | ✅ Implementado |
| RF-11 | Adicionais / combos com múltipla escolha | ⬜ Não implementado |
| RF-12 | Frete por distância/CEP; endereços salvos | ⬜ Não implementado |
| RF-13 | Pagamento online com baixa automática | ⬜ Não implementado |
| RF-14 | Impressão térmica automática; integração com ERP/marketplaces | ⬜ Não implementado |
| RF-15 | Editor de cardápio por formulário (hoje: JSON validado + botão de esgotado) | 🟡 Parcial |

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
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 restaurante (hoje validado por simulação e pelo formato documentado da API).
- Modelo `pedido_status` aprovado pela Meta e testado.
- Editor de cardápio por formulário e **adicionais** (borda, extras) — o que mais restaurantes pedem.
- Baixa automática de Pix (PSP) e impressão térmica, se o público exigir.
- Validar com 5 restaurantes o ganho real frente ao marketplace que usam (a evidência atual vem de relatos de fórum).
- Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
