# Roteiro de demonstração — LeadZap (15 minutos)

## Antes
1. `node robots/robot-005-leadzap/demo/servidor-demo.ts` → http://localhost:3100/admin (chave `demo-demo-demo-1234`), já com leads, uma visita e imóveis.
2. Abra `demo/CONVERSAS.md`.
3. Descubra: origem dos leads, tempo de resposta, nº de corretores, visitas que não acontecem.

## Roteiro
**1. (2 min) A dor.** "O que acontece quando chega lead fora do horário? E quando o corretor está em visita?"

**2. (4 min) A conversa do cliente.** Conversa 1: alugar → apartamento → bairro → faixa → quartos → prazo → imóvel → visita.

**3. (3 min) O painel.** **Leads** (quentes primeiro, corretor atribuído), abra um lead e mostre o resumo; **Visitas** e **Imóveis** (marcar indisponível).

**4. (2 min) Lembrete e confirmação.** Mostre o lembrete e o "Confirmo" (conversa 1b).

**5. (2 min) Limites e segurança.** Conversa 3 (bairro fora da área, perfil sem imóvel) e 4 (corretor). Diga: "o robô só fala do cadastro".

**6. (2 min) Números e próximo passo.** Início (leads, quentes, comparecimento, perdas). Proposta (PRECIFICACAO.md): implantação + 1 semana de piloto.

## Cuidados
- Diga que os dados são fictícios.
- Seja claro sobre limites (sem portal/CRM, sem aviso ao corretor, sem fotos).
- Não prometa aumento de vendas.
