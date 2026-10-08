# Guia de configuração — LeadZap

Toda a personalização fica em **um arquivo de texto** (`robots/robot-005-leadzap/config/empresa.json`) e, depois de instalado, também no painel (**Configurações**). **Nada de dados da empresa está dentro do código**: o mesmo robô serve para empresas diferentes só trocando esse arquivo.

## Regras do formato (JSON)
- Textos ficam entre aspas duplas: `"assim"`. Números ficam **sem** aspas: `45.5` (use ponto, não vírgula).
- Entre um item e outro vai uma vírgula, **menos no último**.
- Se esquecer uma vírgula, o painel avisa o erro e **não salva**.
- IDs (`"id"`) usam só letras minúsculas, números, `-` e `_`, sem espaços nem acentos, e **não devem mudar depois** de usados.

## Campos

| Campo | O que é | Exemplo |
|---|---|---|
| `empresa.*` | Nome, endereço, telefone, horário e condições (texto) | "Casa Certa Imóveis" |
| `tipos[]` | Tipos de imóvel (até 10). `id` sem acento/espaço, `nome` até 24 caracteres. | { "id": "apartamento", "nome": "Apartamento" } |
| `bairros` | Regiões atendidas. Até 10 aparecem como lista; mais que isso, o cliente digita. Vazio = aceita qualquer bairro. | ["Centro", "Vila Nova"] |
| `faixas.comprar / faixas.alugar` | Até 3 faixas de valor cada. `nome` até 20 caracteres (limite do botão). `min` e `max` em reais. | { "nome": "Até R$ 300 mil", "min": 0, "max": 300000 } |
| `imoveis[]` | Catálogo: `id`, `finalidade` (comprar/alugar), `tipo` (um dos `tipos`), `titulo`, `bairro`, `preco`, `quartos`, `descricao`, `link` (https) e `disponivel`. | { "id": "ap-centro-2q", "finalidade": "alugar", "preco": 2100 } |
| `corretores[]` | Corretores e os bairros que atendem. Lista de bairros vazia = atende qualquer um (plantão). | { "id": "marcos", "nome": "Marcos", "bairros": ["Centro"] } |
| `visitas.*` | `ativo`, `dias_semana` (0=domingo), `horarios` (HH:MM), `janela_dias`, `antecedencia_horas`, `lembrete_horas`. | { "horarios": ["09:00", "14:00"], "lembrete_horas": 24 } |
| `followup.horas / sem_resposta_dias` | Horas sem resposta até o acompanhamento único; dias até virar "sem resposta". | 48, 7 |
| `template.nome / idioma` | Modelo aprovado na Meta para lembretes e acompanhamentos fora da janela de 24 h | "lead_visita", "pt_BR" |
| `faq[] e mensagens.*` | Perguntas/respostas e textos opcionais (boas_vindas, handoff) | "Auxiliamos na simulação..." |

## Variáveis de ambiente (.env) × configuração da empresa
- **.env**: segredos e dados técnicos (tokens, senha do painel, porta). Fica no servidor, nunca no painel.
- **empresa.json / painel**: nome, endereço, horários, preços, mensagens — o que o dono da empresa muda no dia a dia.

## Exemplo completo
Veja `config/empresa.exemplo.json` (dados fictícios, já validados pelos testes automáticos).
