# Guia de configuração — AgendaZap

Toda a personalização fica em **um arquivo de texto** (`robots/robot-001-agendazap/config/empresa.json`) e, depois de instalado, também no painel (**Configurações**). **Nada de dados da empresa está dentro do código**: o mesmo robô serve para empresas diferentes só trocando esse arquivo.

## Regras do formato (JSON)
- Textos ficam entre aspas duplas: `"assim"`. Números ficam **sem** aspas: `45.5` (use ponto, não vírgula).
- Entre um item e outro vai uma vírgula, **menos no último**.
- Se esquecer uma vírgula, o painel avisa o erro e **não salva**.
- IDs (`"id"`) usam só letras minúsculas, números, `-` e `_`, sem espaços nem acentos, e **não devem mudar depois** de usados.

## Campos

| Campo | O que é | Exemplo |
|---|---|---|
| `empresa.nome` | Nome que o robô usa ao se apresentar | "Barbearia do Zé" |
| `empresa.endereco / telefone / horario_texto / pagamento` | Informações usadas nas respostas e nos lembretes | "Rua das Flores, 120" |
| `empresa.horario` | Horário de atendimento humano por dia da semana (0=domingo … 6=sábado). Usado só para avisar “fora do horário” quando o cliente pede atendente. | { "1": { "abre": "09:00", "fecha": "19:00" } } |
| `servicos[].id` | Código do serviço (minúsculas, sem espaço). Não mude depois de usado. | "corte" |
| `servicos[].nome / duracao_min / preco` | Nome mostrado, duração em minutos e preço em reais (número com ponto) | "Corte masculino", 30, 45 |
| `servicos[].profissionais` | (opcional) Quem faz este serviço. Se omitir, todos fazem. | ["marcos"] |
| `profissionais[].id / nome` | Código e nome do profissional | "joao", "João" |
| `profissionais[].horario` | Expediente por dia da semana. Dia ausente = não trabalha. | { "1": { "abre": "09:00", "fecha": "18:00" } } |
| `profissionais[].folgas` | Datas sem atendimento (AAAA-MM-DD) | ["2026-12-25"] |
| `agenda.intervalo_min` | De quantos em quantos minutos os horários são oferecidos | 30 |
| `agenda.antecedencia_horas` | Antecedência mínima para marcar (evita “marcar para daqui a 10 minutos”) | 2 |
| `agenda.dias_max` | Até quantos dias à frente o cliente pode agendar | 30 |
| `agenda.cancelar_ate_horas` | Prazo para cancelar/remarcar sozinho pelo robô. Depois disso, vai para uma pessoa. | 2 |
| `lembretes.ativo / horas_antes` | Liga os lembretes e define quantas horas antes (até 4 valores) | true, [24, 2] |
| `lembretes.template_nome / template_idioma` | Nome do modelo aprovado na Meta para lembretes fora da janela de 24 h. Vazio = só envia dentro da janela. | "lembrete_agendamento", "pt_BR" |
| `lista_espera.ativo / avisar_ate` | Liga a lista de espera e quantas pessoas são avisadas por vaga | true, 3 |
| `faq[]` | Perguntas e respostas da empresa; palavras_chave ajudam a achar a pergunta certa | { "pergunta": "Onde fica?", "resposta": "..." } |
| `mensagens.boas_vindas / handoff / fora_horario / politica_cancelamento` | Textos personalizados (opcionais) | "Olá! 💈 ..." |

## Variáveis de ambiente (.env) × configuração da empresa
- **.env**: segredos e dados técnicos (tokens, senha do painel, porta). Fica no servidor, nunca no painel.
- **empresa.json / painel**: nome, endereço, horários, preços, mensagens — o que o dono da empresa muda no dia a dia.

## Exemplo completo
Veja `config/empresa.exemplo.json` (dados fictícios, já validados pelos testes automáticos).
