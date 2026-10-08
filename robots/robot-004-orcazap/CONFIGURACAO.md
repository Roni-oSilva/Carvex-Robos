# Guia de configuração — OrcaZap

Toda a personalização fica em **um arquivo de texto** (`robots/robot-004-orcazap/config/empresa.json`) e, depois de instalado, também no painel (**Configurações**). **Nada de dados da empresa está dentro do código**: o mesmo robô serve para empresas diferentes só trocando esse arquivo.

## Regras do formato (JSON)
- Textos ficam entre aspas duplas: `"assim"`. Números ficam **sem** aspas: `45.5` (use ponto, não vírgula).
- Entre um item e outro vai uma vírgula, **menos no último**.
- Se esquecer uma vírgula, o painel avisa o erro e **não salva**.
- IDs (`"id"`) usam só letras minúsculas, números, `-` e `_`, sem espaços nem acentos, e **não devem mudar depois** de usados.

## Campos

| Campo | O que é | Exemplo |
|---|---|---|
| `empresa.*` | Nome, endereço, telefone, horário (texto) e condições de pagamento (texto) | "Reforma Fácil Serviços" |
| `servicos[].id / nome / exige_visita` | Serviços oferecidos (até 20). `nome` até 24 caracteres. `exige_visita=true` avisa o cliente de que o valor final pode depender de avaliação presencial. | { "id": "pintura", "nome": "Pintura", "exige_visita": true } |
| `atendimento.bairros` | Regiões atendidas. Lista vazia = aceita qualquer bairro (o cliente digita). | ["Centro", "Vila Nova"] |
| `atendimento.max_fotos` | Fotos por pedido (1 a 6) | 4 |
| `atendimento.validade_dias` | Dias de validade da proposta (1 a 90) | 7 |
| `atendimento.followup_horas` | Horas sem resposta até o lembrete único (2 a 240) | 24 |
| `atendimento.pedir_endereco` | Pede o endereço completo além do bairro | true |
| `template.nome / idioma` | Modelo aprovado na Meta para propostas e lembretes fora da janela de 24 h | "orcamento_proposta", "pt_BR" |
| `faq[] e mensagens.*` | Perguntas/respostas e textos opcionais (boas_vindas, handoff) | "Sim, damos garantia..." |

## Variáveis de ambiente (.env) × configuração da empresa
- **.env**: segredos e dados técnicos (tokens, senha do painel, porta). Fica no servidor, nunca no painel.
- **empresa.json / painel**: nome, endereço, horários, preços, mensagens — o que o dono da empresa muda no dia a dia.

## Exemplo completo
Veja `config/empresa.exemplo.json` (dados fictícios, já validados pelos testes automáticos).
