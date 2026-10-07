# Fluxos de conversa — AgendaZap

As conversas reais (geradas pelo robô, não escritas à mão) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md). Aqui, o mapa dos estados.

## Mapa

```
inicio ──(agendar)──► ag_servico ──► [ag_prof] ──► ag_dia ──► ag_hora ──► ag_confirmar ──► (agendado) ──► inicio
   │                                                │ (dia lotado)
   │                                                └──► ag_espera_oferta ──► (entra na lista) ──► inicio
   ├──(meus horários)──► meus ──► meu_item ──┬──► (confirmar)
   │                                          ├──► (remarcar) ──► ag_dia ... ag_confirmar (cancela o antigo ao confirmar o novo)
   │                                          └──► cancelar_conf ──► (cancelado) ──► inicio
   ├──(dúvida)──► FAQ/IA ──(achou)──► resposta
   │                      └─(não achou)──► MODO HUMANO ("Não tenho essa informação...")
   └──(atendente / erro interno)──► MODO HUMANO
```

## Fluxo normal (agendar)
| Passo | Robô | Cliente |
|---|---|---|
| 1 | Menu: Agendar / Meus horários / Atendente | “Oi, quero marcar” |
| 2 | Lista de serviços (nome, duração, preço) | Escolhe o serviço |
| 3 | Lista de profissionais (+ “Sem preferência”), pulada se só um faz o serviço | Escolhe |
| 4 | Dias com vaga (até 10) | Escolhe ou digita “amanhã”, “15/10” |
| 5 | Horários livres (9 por página + “Mais horários”) | Escolhe ou digita “10h30” |
| 6 | Resumo + Confirmar / Outro horário / Cancelar | Confirma |
| 7 | Confirmação com endereço, regra de cancelamento e aviso de lembretes | — |

## Fluxo de lembrete
1. No horário programado, o robô envia o lembrete (botões se a janela de 24 h estiver aberta; modelo se não).
2. A conversa fica marcada com “aguardando resposta ao lembrete”.
3. **1 / Confirmo** → status *confirmado*. **2 / Cancelar** → cancela (se dentro do prazo) e avisa a lista de espera. **3 / Remarcar** → fluxo de remarcação.
4. Um segundo lembrete para quem já confirmou é apenas informativo.

## Fluxo de dúvida
Pergunta → busca no `faq` → (opcional) IA restrita ao cadastro → se não achar: “Não tenho essa informação no momento. Vou encaminhar você para um atendente.” e passa para modo humano (fora do expediente, acrescenta a mensagem de “fora do horário”).

## Fluxo de erro
- **Horário ocupado no meio tempo:** “esse horário acabou de ser ocupado” + novas opções.
- **Entrada que não entende (áudio/foto):** pede texto/botões e oferece MENU ou ATENDENTE.
- **Cancelar/remarcar fora do prazo:** explica o prazo e chama uma pessoa.
- **Erro interno:** pede desculpas, chama atendente e registra o motivo.

## Fluxo de transferência para humano
Gatilhos: palavra *atendente/humano*, botão “Falar com atendente”, pergunta sem resposta, alteração fora do prazo, erro interno. No modo humano o robô **não responde**; a equipe responde pelo painel. Volta ao robô por botão ou após 12 h sem atividade.
