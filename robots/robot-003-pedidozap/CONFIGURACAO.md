# Guia de configuração — PedidoZap

Toda a personalização fica em **um arquivo de texto** (`robots/robot-003-pedidozap/config/empresa.json`) e, depois de instalado, também no painel (**Configurações**). **Nada de dados da empresa está dentro do código**: o mesmo robô serve para empresas diferentes só trocando esse arquivo.

## Regras do formato (JSON)
- Textos ficam entre aspas duplas: `"assim"`. Números ficam **sem** aspas: `45.5` (use ponto, não vírgula).
- Entre um item e outro vai uma vírgula, **menos no último**.
- Se esquecer uma vírgula, o painel avisa o erro e **não salva**.
- IDs (`"id"`) usam só letras minúsculas, números, `-` e `_`, sem espaços nem acentos, e **não devem mudar depois** de usados.

## Campos

| Campo | O que é | Exemplo |
|---|---|---|
| `empresa.*` | Nome, endereço, telefone, formas de pagamento (texto) e horário | "Pizzaria Bella Massa" |
| `empresa.horario` | Horário de funcionamento por dia (0=domingo … 6=sábado); dia ausente = fechado. O fechamento deve ser depois da abertura no mesmo dia (ex.: "23:30"). | { "2": { "abre": "18:00", "fecha": "23:30" } } |
| `cardapio[].id / nome` | Categorias (até 10). `nome` até 24 caracteres. | "pizzas", "Pizzas" |
| `cardapio[].itens[].id / nome / descricao` | Item. `id` único em todo o cardápio, sem acento/espaço. | "calabresa", "Pizza Calabresa" |
| `cardapio[].itens[].preco` | Preço em reais (número com ponto). Omitido quando há `variacoes`. | 12.5 |
| `cardapio[].itens[].variacoes[]` | Tamanhos/opções com preço próprio (até 9) | { "id": "grande", "nome": "Grande (8 fatias)", "preco": 52 } |
| `cardapio[].itens[].disponivel` | `false` = esgotado (não aparece). Também alternável no painel > Cardápio. | true |
| `entrega.entrega_ativa / retirada_ativa` | Liga entrega e/ou retirada | true, true |
| `entrega.bairros[]` | Bairros atendidos: `nome`, `taxa` (R$) e `tempo_min` | { "nome": "Centro", "taxa": 5, "tempo_min": 40 } |
| `entrega.pedido_minimo` | Subtotal mínimo para entrega (R$). 0 = sem mínimo | 30 |
| `entrega.tempo_retirada_min` | Previsão informada para retirada | 30 |
| `pagamento.formas` | Formas aceitas: `pix`, `dinheiro`, `cartao_entrega` | ["pix", "dinheiro"] |
| `pagamento.pix.chave / beneficiario / cidade` | Obrigatórios se `pix` estiver nas formas. Sem acento; beneficiário até 25 e cidade até 15 caracteres. | "11999990000", "Bella Massa", "Sao Paulo" |
| `template.nome / idioma` | Modelo aprovado na Meta para avisos de status fora da janela de 24 h | "pedido_status", "pt_BR" |
| `faq[] e mensagens.*` | Perguntas/respostas e textos opcionais (boas_vindas, fora_horario, handoff) | "Olá! 🍕 ..." |

## Variáveis de ambiente (.env) × configuração da empresa
- **.env**: segredos e dados técnicos (tokens, senha do painel, porta). Fica no servidor, nunca no painel.
- **empresa.json / painel**: nome, endereço, horários, preços, mensagens — o que o dono da empresa muda no dia a dia.

## Exemplo completo
Veja `config/empresa.exemplo.json` (dados fictícios, já validados pelos testes automáticos).
