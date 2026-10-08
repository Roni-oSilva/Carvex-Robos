# Fluxos de conversa — LeadZap

As conversas reais (geradas pelo robô) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md).

## Mapa de estados

```
inicio ─(comprar/alugar)─► tipo ─► bairro ─► faixa ─► quartos ─► prazo ─► [nome] ─► LEAD CRIADO ─► imoveis ─► detalhe ─(agendar)─► vdia ─► vhora ─► VISITA
   │                                                                          │ (sem imóvel compatível: lead registrado, corretor retorna)
   ├─(minha visita)─► confirmo | remarcar ─► vdia | cancelar
   ├─(dúvida)─► FAQ ─► se não souber: MODO HUMANO
   └─(corretor / erro)─► MODO HUMANO
```

## Regra de temperatura (transparente)

| Critério | Pontos |
|---|---|
| Prazo: até 30 dias | +4 |
| Prazo: 1 a 3 meses | +2 |
| Prazo: só pesquisando | 0 |
| Existe imóvel compatível no cadastro | +2 |
| Informou mínimo de quartos | +1 |
| Demonstrou interesse em um imóvel | +1 |
| Agendou visita | +2 |

**Quente** ≥ 5 · **Morno** 2 a 4 · **Frio** < 2. A temperatura só sobe (nunca esfria sozinha). É uma regra de organização da fila, não previsão de venda.

## Roteamento ao corretor
1. Corretores que atendem o bairro do lead (se algum tiver o bairro na lista).
2. Senão, os de plantão (lista de bairros vazia).
3. Entre eles, o que tem **menos leads em aberto**; empate pelo `id`.
4. Sem corretores cadastrados: lead fica "sem corretor" e aparece no filtro correspondente.

## Regras aplicadas no servidor
- Imóveis exibidos = cadastrados, `disponivel`, mesma finalidade/tipo/bairro, preço dentro da faixa e quartos ≥ o mínimo.
- Horário de visita: dia da semana permitido, antecedência mínima, e **nenhuma visita ativa** do mesmo imóvel no mesmo horário. Reconferido ao confirmar.
- Uma visita ativa por pessoa: marcar outra cancela a anterior.
- Resposta a lembrete (Confirmo/Remarcar/Cancelar) só vale para o **dono** da visita e antes do horário.
- Lembrete de visita: **1 vez**, dentro da janela configurada. Acompanhamento do lead: **1 vez**, e nunca para quem tem visita marcada, pediu para parar ou está em atendimento humano.
- Cliente que volta a falar tira o lead de "sem resposta".

## Fluxo de dúvida
FAQ → resposta. Sem resposta → "Não tenho essa informação no momento. Vou encaminhar você para um atendente."

## Fluxo de erro
Bairro fora da área · perfil sem imóvel cadastrado (lead registrado) · horário que acabou de ser reservado · visita já passada · resposta a visita de outro cliente · mídia não suportada · erro interno (pede desculpas e chama atendente).

## Transferência para humano
Botão/palavra *corretor* ou *atendente*, "Falar com corretor" no imóvel, pergunta sem resposta, sem horários livres, erro interno. No modo humano o robô se cala; volta ao ser devolvido ou após 12 h.
