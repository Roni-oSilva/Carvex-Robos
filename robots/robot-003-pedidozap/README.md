# PedidoZap — Seu cardápio, carrinho e quadro de pedidos dentro do WhatsApp — sem comissão por pedido.

**Status:** PRONTO · **Versão:** 1.0.0 · **Potencial comercial:** Alto
**Segmentos:** Pizzarias, Lanchonetes e hamburguerias, Restaurantes e marmitarias, Açaí e sorveterias, Padarias com delivery

O **PedidoZap** transforma o WhatsApp do restaurante em um **canal de pedidos guiado**: o cliente vê o cardápio por categorias, escolhe tamanho e quantidade, escreve observações, informa bairro e endereço, escolhe a forma de pagamento e confirma. O robô **calcula tudo no servidor** (preço do cardápio atual, taxa por bairro, pedido mínimo), gera o **Pix copia-e-cola** com o valor exato e entrega o pedido pronto num **quadro** para a cozinha. A cada etapa (aceito, preparando, saiu, pronto, entregue) o cliente é avisado automaticamente.

## Para quem é
Restaurantes, lanchonetes e deliveries com **entrega própria ou retirada** que já recebem pedidos pelo WhatsApp “na mão” (foto do cardápio, anotação em papel) e querem **vender direto**, com menos erro e menos dependência de marketplaces.

## Funcionalidades
- **Cardápio por categorias** — Itens com descrição, tamanhos/variações e preço; marque **esgotado** em um clique e o item some do robô na hora.
- **Carrinho com observações** — Quantidade (1–20) e observação livre por item, sanitizada.
- **Entrega ou retirada** — Taxa e tempo por bairro, pedido mínimo para entrega, tempo de retirada.
- **Preço confiável** — Preços e disponibilidade são recalculados do cardápio atual na hora de confirmar — nada vem do cliente.
- **Pix copia-e-cola** — Código válido com a sua chave e o total do pedido; baixa manual no painel.
- **Dinheiro com troco / cartão na entrega** — Valida que o troco cobre o total.
- **Quadro de pedidos** — Colunas Novo → Aceito → Em preparo → Saiu/Pronto; marcar pago; cancelar; imprimir comanda.
- **Avisos de status** — Cliente é avisado a cada etapa (texto dentro de 24 h; modelo aprovado fora disso).
- **Meu pedido / cancelar** — Cliente acompanha o último pedido e cancela sozinho enquanto estiver “Novo”.
- **Horário de funcionamento** — Não fecha pedido com a loja fechada; fecha no meio do pedido? Avisa.
- **Resumo do dia** — Pedidos, vendas, ticket médio, tempo até entregar, mais vendidos (7 dias).
- **Dúvidas e atendente** — FAQ cadastrado + taxa/bairros automáticos; fora da base, chama uma pessoa.

## O que ele não faz
- **Não recebe pagamento online sozinho**: o Pix é estático e a marcação de “pago” é manual.
- Sem adicionais/complementos com múltipla escolha (ex.: borda recheada + extras) nem combos com escolhas internas — use itens separados ou variações.
- Sem frete por distância/CEP/mapa: a taxa é por bairro cadastrado.
- Sem impressão térmica automática nem integração com ERP, iFood ou entregadores (há página de impressão da comanda).
- Sem agendamento de pedido para depois, cupons, fidelidade ou endereço salvo do cliente.
- Edição de cardápio completa (criar itens, mudar preços) é por Configurações (JSON validado); só “esgotado” tem botão.
- Fora da janela de 24 h, os avisos de status só saem com **modelo aprovado pela Meta**.

## Começar em 5 minutos (sem WhatsApp)
```bash
# na raiz da fábrica
node robots/robot-003-pedidozap/demo/servidor-demo.ts   # painel com dados fictícios em http://localhost:3100/admin (chave: demo-demo-demo-1234)
node robots/robot-003-pedidozap/demo/simulate.ts         # regenera demo/CONVERSAS.md com conversas reais do robô
npm test                                      # testes do robô e da camada compartilhada
```

## Documentação
| Documento | Para quem |
|---|---|
| [MANUAL.md](MANUAL.md) | Quem opera o robô (não programador) |
| [INSTALACAO.md](INSTALACAO.md) | Quem instala |
| [CONFIGURACAO.md](CONFIGURACAO.md) | Quem personaliza para uma empresa |
| [docs/CLIENT-MANUAL.md](docs/CLIENT-MANUAL.md) | Entregar ao cliente final |
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | Desenvolvedores |
| [docs/FLUXOS.md](docs/FLUXOS.md) | Fluxos de conversa |
| [docs/REQUISITOS.md](docs/REQUISITOS.md) | Requisitos e pendências |
| [docs/SEGURANCA.md](docs/SEGURANCA.md) · [docs/LGPD.md](docs/LGPD.md) | Segurança e privacidade |
| [demo/CONVERSAS.md](demo/CONVERSAS.md) | Conversas de demonstração (geradas pelo robô real) |
| [sales/](sales/) | Material de venda |

## Estrutura
```
robots/robot-003-pedidozap/
├── src/            código do robô
├── tests/          testes automatizados
├── config/         empresa.exemplo.json (copie para empresa.json)
├── demo/           conversas, painel fictício e roteiro de simulação
├── docs/           manual técnico, do cliente, fluxos, LGPD, segurança, requisitos
├── sales/          página de vendas, pitch, objeções, FAQ, roteiro de demonstração, preços
└── .env.example
```

## Antes de chamar de COMERCIAL
- [ ] Piloto com número real da WhatsApp Business Platform em pelo menos 1 restaurante (hoje validado por simulação e pelo formato documentado da API).
- [ ] Modelo `pedido_status` aprovado pela Meta e testado.
- [ ] Editor de cardápio por formulário e **adicionais** (borda, extras) — o que mais restaurantes pedem.
- [ ] Baixa automática de Pix (PSP) e impressão térmica, se o público exigir.
- [ ] Validar com 5 restaurantes o ganho real frente ao marketplace que usam (a evidência atual vem de relatos de fórum).
- [ ] Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
