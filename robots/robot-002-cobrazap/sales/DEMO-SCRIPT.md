# Roteiro de demonstração — CobraZap (15 minutos)

## Antes
1. `node robots/robot-002-cobrazap/demo/servidor-demo.ts` → http://localhost:3100/admin (chave `demo-demo-demo-1234`).
2. Abra `demo/CONVERSAS.md`.
3. Descubra: nº de cobranças/mês, valor médio, banco/Pix, quem cobra hoje.

## Roteiro
**1. (2 min) A dor.** “Como cobram hoje? O que acontece com atraso de 3 dias?”

**2. (3 min) A régua.** Conversa 1: o aviso que o robô envia 3 dias antes e *a pergunta de titularidade*. Destaque: “ele não revela valor antes de confirmar a pessoa”.

**3. (2 min) Pagar e avisar.** Pix copia-e-cola, “paguei”, Conferência no painel (**Recebi**).

**4. (2 min) Negociação.** Conversa 5 + tela **Acordos**: aceitar com 1º vencimento → parcelas criadas.

**5. (2 min) Proteções.** Número errado (conversa 3), PARAR, horário/limites (mostrar `envio` na configuração), recusa de termos de ameaça (tente salvar “vamos negativar no SPC” e mostre o erro).

**6. (2 min) O painel.** Início (aberto/vencido/recebido), Cobranças, Importar (cole 2 linhas de uma planilha).

**7. (2 min) Honestidade e próximo passo.** Diga o que *não* faz (baixa automática, juros, boleto). Proponha um piloto com 10–20 cobranças reais.

## Cuidados
- Dados fictícios: avise.
- Nunca prometa percentual de recuperação.
- Sugira que o cliente revise a política de cobrança com o advogado dele.
