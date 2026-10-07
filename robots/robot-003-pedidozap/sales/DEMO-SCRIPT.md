# Roteiro de demonstração — PedidoZap (15 minutos)

## Antes
1. `node robots/robot-003-pedidozap/demo/servidor-demo.ts` → http://localhost:3100/admin (chave `demo-demo-demo-1234`), já com pedidos em andamento.
2. Abra `demo/CONVERSAS.md`.
3. Descubra: pedidos/dia, bairros e taxas, comissão do marketplace (pelo contrato dele), pagamento mais usado.

## Roteiro
**1. (2 min) A dor.** “Como um pedido entra hoje? Quanto tempo cada um toma?”

**2. (4 min) O pedido do cliente.** Conversa 1: oi → pizza → tamanho → observação → bebida → entrega → bairro → endereço → Pix → confirmar. Destaque: *resumo com total*, *Pix com valor exato*.

**3. (3 min) A cozinha.** Painel > **Pedidos**: colunas, clique em **Aceito →**, **Em preparo →**, **Saiu**; mostre os avisos ao cliente (final da conversa 1). **Imprimir** a comanda.

**4. (2 min) Cardápio e regras.** Marque um item como esgotado e peça de novo no robô para mostrar que sumiu. Mostre pedido mínimo e bairro fora da área (conversa 3).

**5. (2 min) Segurança e humano.** Conversa 2 e 4: dúvida só pelo cadastro; atendente quando quiser.

**6. (2 min) Números e próximo passo.** Início (vendas, ticket, mais vendidos). Proposta (PRECIFICACAO.md): implantação com cardápio montado + 1 semana de piloto.

## Cuidados
- Diga que os dados são fictícios.
- Seja claro sobre limites (adicionais, Pix manual, frete por bairro).
- Nunca invente a comissão do marketplace dele.
