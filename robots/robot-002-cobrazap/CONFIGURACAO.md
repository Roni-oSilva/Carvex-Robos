# Guia de configuração — CobraZap

Toda a personalização fica em **um arquivo de texto** (`robots/robot-002-cobrazap/config/empresa.json`) e, depois de instalado, também no painel (**Configurações**). **Nada de dados da empresa está dentro do código**: o mesmo robô serve para empresas diferentes só trocando esse arquivo.

## Regras do formato (JSON)
- Textos ficam entre aspas duplas: `"assim"`. Números ficam **sem** aspas: `45.5` (use ponto, não vírgula).
- Entre um item e outro vai uma vírgula, **menos no último**.
- Se esquecer uma vírgula, o painel avisa o erro e **não salva**.
- IDs (`"id"`) usam só letras minúsculas, números, `-` e `_`, sem espaços nem acentos, e **não devem mudar depois** de usados.

## Campos

| Campo | O que é | Exemplo |
|---|---|---|
| `empresa.*` | Nome, endereço, telefone, horário e formas de pagamento (aparecem nas mensagens e respostas) | "Academia Corpo em Movimento" |
| `pix.chave / beneficiario / cidade` | Dados do Pix copia-e-cola. Beneficiário até 25 e cidade até 15 caracteres, sem acento. | "financeiro@empresa.com.br", "Corpo em Movimento", "Sao Paulo" |
| `regua[].id / dias` | Passos da régua. `dias` negativo = antes do vencimento; 0 = no dia; positivo = depois | { "id": "atraso-3", "dias": 3 } |
| `regua[].mensagem` | (opcional) Texto próprio do passo. Variáveis: `{{nome}} {{empresa}} {{descricao}} {{valor}} {{vencimento}} {{dias_atraso}}`. Termos de ameaça são recusados. | "{{descricao}} ({{valor}}) está em aberto..." |
| `envio.inicio / fim` | Janela diária de envio. Limites rígidos: 07:00 a 21:00 | "08:00", "20:00" |
| `envio.dias_semana` | Dias permitidos (0=domingo … 6=sábado) | [1,2,3,4,5,6] |
| `envio.max_por_semana / intervalo_horas` | Máximo de mensagens por pessoa em 7 dias e intervalo mínimo entre elas | 3, 48 |
| `exigir_confirmacao_titular` | Pergunta “você é o titular?” antes de falar de dívida | true |
| `negociacao.ativo / max_parcelas / parcela_minima / desconto_a_vista_percentual / validade_dias` | Regras do acordo automático. `parcela_minima` em reais; `validade_dias` = quanto tempo a cobrança fica pausada aguardando a equipe | true, 3, 50, 5, 7 |
| `template.nome / idioma` | Modelo aprovado na Meta usado fora da janela de 24 h. Vazio = só envia dentro da janela. | "cobranca_aviso", "pt_BR" |
| `faq[]` | Perguntas e respostas (também não aceitam termos de ameaça) | { "pergunta": "Posso trancar o plano?", "resposta": "..." } |
| `mensagens.handoff` | (opcional) Texto ao chamar atendente | "Já chamei uma pessoa..." |

## Variáveis de ambiente (.env) × configuração da empresa
- **.env**: segredos e dados técnicos (tokens, senha do painel, porta). Fica no servidor, nunca no painel.
- **empresa.json / painel**: nome, endereço, horários, preços, mensagens — o que o dono da empresa muda no dia a dia.

## Exemplo completo
Veja `config/empresa.exemplo.json` (dados fictícios, já validados pelos testes automáticos).
