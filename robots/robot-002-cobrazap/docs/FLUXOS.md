# Fluxos de conversa — CobraZap

As conversas reais (geradas pelo robô) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md).

## Régua (iniciativa do robô)
```
cada minuto (TICK_SECONDS) ─► dentro da janela de envio? ─não─► nada
        │ sim
        ▼
 para cada pessoa com cobrança ABERTA (não pausada, sem opt-out, sem "número errado"):
   limite semanal atingido ou intervalo mínimo não cumprido? ─sim─► pula
   há passo da régua vencido e ainda não enviado? ─não─► pula
   titularidade exigida e não confirmada?
        ├─ já perguntou há < 7 dias ─► espera
        └─ senão ─► envia "você é o(a) titular?" [Sim, sou eu | Número errado]
   senão ─► monta UMA mensagem (resumo de todas as pendências devidas) + botões [Pagar com Pix | Já paguei | Negociar]
            passos antigos acumulados viram "pulado"; só o mais recente é dito
   envio: dentro de 24h = texto com botões; fora = modelo aprovado; sem modelo = adia 30 min
```

## Conversa do cliente
```
qualquer mensagem
   ├─ sem nenhuma cobrança ─► "não encontrei pendências" (ou FAQ)
   ├─ titularidade pendente ─► pergunta; "sim" = confirma e mostra resumo; "errado" = remove o número (opt-out)
   ├─ PIX / pagar ─► (escolhe a cobrança, se várias) ─► mensagem + código copia-e-cola
   ├─ PAGUEI ─► (escolhe) ─► cobrança em CONFERÊNCIA (régua pausa); foto/PDF = "comprovante recebido"
   ├─ NEGOCIAR ─► (escolhe) ─► lista [à vista c/ desconto | 2x | 3x ... | outra proposta] ─► proposta registrada, cobrança pausada
   ├─ quanto devo ─► resumo
   └─ dúvida ─► FAQ/IA ─► se não souber: atendente
```

## Fluxo normal
Régua (-3 dias) → pergunta de titularidade → “Sim, sou eu” → resumo → “Pagar com Pix” → código → “paguei” → Conferência → **Recebi** → paga.

## Fluxo de dúvida
FAQ cadastrado → resposta. Fora da base → “Não tenho essa informação no momento. Vou encaminhar você para um atendente.” (modo humano).

## Fluxo de erro
Número errado (para tudo e registra) · áudio/mídia sem sentido · comprovante sem “paguei” prévio (orienta) · cliente sem cobrança · Pix não configurado (chama atendente).

## Transferência para humano
Palavra *atendente*, “outra proposta” na negociação, parcela mínima sem opção automática, falta de Pix/link, pergunta sem resposta, erro interno. No modo humano o robô se cala e a **régua não envia avisos automáticos** a essa pessoa; se ninguém devolver a conversa ao robô, a régua volta sozinha depois de 12 h (configurável por HANDOFF_RESUME_HOURS). Se a negociação com a pessoa for longa, use Cobranças > **Pausar 7 dias**.

## Acordo (painel)
Proposta → **Acordos** → escolher 1º vencimento → **Aceitar**: a cobrança original vira “acordo”, são criadas as parcelas (uma por mês, última ajusta os centavos) e o cliente é avisado.
