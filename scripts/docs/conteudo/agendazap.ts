import type { RobotDoc } from "../tipos.ts";

export const agendazap: RobotDoc = {
  id: "robot-001-agendazap",
  nome: "AgendaZap",
  slogan: "Seu atendente de agenda no WhatsApp: marca, confirma, remarca e preenche as vagas — 24 horas por dia.",
  versao: "1.0.0",
  status: "PRONTO",
  segmentos: ["Barbearias", "Salões de beleza", "Estúdios", "Clínicas e consultórios", "Pet shops (banho e tosa)", "Autoescolas (aulas)"],
  publico: "Donos e recepcionistas de negócios que vendem **horário marcado** com 1 a 10 profissionais e hoje agendam no WhatsApp “na mão”: barbearias, salões, estúdios, clínicas e consultórios pequenos, pet shops.",
  problema: "Agenda feita à mão no WhatsApp gera conflito de horário, mensagens sem resposta fora do expediente e **faltas sem aviso** (horário vazio = dinheiro perdido). Fontes do setor citam taxas de não comparecimento na casa de dois dígitos sem lembretes — números de fornecedores, não verificados de forma independente; **meça a sua taxa antes e depois**.",
  resumo: "O **AgendaZap** é um assistente de agenda que funciona dentro do WhatsApp oficial da empresa. O cliente escolhe serviço, profissional, dia e hora por botões ou digitando; o robô confere a agenda em tempo real, confirma, **lembra antes do horário pedindo confirmação**, permite **remarcar e cancelar** dentro da regra da casa e, quando um horário abre, **avisa quem estava na lista de espera**. A equipe acompanha tudo em um painel simples e assume a conversa quando quiser.",
  oportunidades: [1, 2, 16, 19],
  potencial: "Alto",
  como_funciona: [
    "O cliente escreve “oi” ou “quero marcar” no WhatsApp da empresa.",
    "O robô mostra os serviços, os profissionais e só os **dias e horários realmente livres** (respeitando expediente, folgas, duração do serviço e antecedência mínima).",
    "O cliente confirma e o horário é reservado na hora — duas pessoas nunca ficam com o mesmo horário.",
    "Antes do horário (por padrão 24 h e 2 h), o robô manda um lembrete pedindo confirmação: **Confirmo / Remarcar / Cancelar**.",
    "Se alguém cancela, quem estava na **lista de espera** daquele dia é avisado e o primeiro que responder QUERO fica com a vaga.",
    "Dúvidas (endereço, preços, formas de pagamento) são respondidas a partir do cadastro da empresa. O que o robô não souber, ele **não inventa**: chama uma pessoa.",
    "A equipe vê a agenda do dia, marca quem compareceu ou faltou e acompanha os números no painel.",
  ],
  funcionalidades: [
    { titulo: "Agendamento por conversa", descricao: "Serviço → profissional (ou “sem preferência”) → dia → hora → confirmação, por botões/listas ou texto livre (“amanhã”, “15/10”, “10h30”)." },
    { titulo: "Agenda sem conflito", descricao: "Reserva atômica no banco: se dois clientes escolhem o mesmo horário, só um garante e o outro recebe novas opções." },
    { titulo: "Regras da casa", descricao: "Expediente por profissional, folgas, duração por serviço, intervalo da agenda, antecedência mínima e prazo para cancelar." },
    { titulo: "Lembretes com confirmação", descricao: "Até 4 lembretes por horário (padrão 24 h e 2 h). Dentro da janela de 24 h do WhatsApp vão com botões; fora dela, por modelo aprovado." },
    { titulo: "Remarcar e cancelar", descricao: "O horário antigo só é cancelado quando o novo é confirmado. Alterações fora do prazo vão para uma pessoa." },
    { titulo: "Lista de espera", descricao: "Dia lotado? O cliente entra na fila e é avisado quando abre uma vaga (primeiro a responder leva)." },
    { titulo: "Dúvidas sem inventar", descricao: "Perguntas e respostas cadastradas + IA opcional restrita ao cadastro. Fora da base: transfere para atendente." },
    { titulo: "Painel da equipe", descricao: "Agenda do dia, presença/falta, agendamento manual, lista de espera, conversas e números dos últimos 30 dias." },
    { titulo: "Privacidade (LGPD)", descricao: "PARAR/REATIVAR, exclusão de dados do cliente, retenção automática do histórico, mínimo de dados." },
  ],
  limites: [
    "Não cobra nem recebe pagamento (sem sinal ou pré-pagamento).",
    "Não sincroniza com Google Agenda ou outros sistemas — a agenda do robô é a fonte da verdade (horários marcados fora dele precisam ser lançados pelo painel).",
    "Não cancela automaticamente quem não confirmou (isso é decisão do dono; hoje o painel mostra “sem confirmar”).",
    "Um agendamento por vez (não combina vários serviços em sequência automaticamente — use um serviço “combo”, como Corte + Barba).",
    "Lembretes fora da janela de 24 h só saem com **modelo aprovado pela Meta**; sem modelo, não são enviados.",
    "Não garante redução de faltas: o resultado depende do negócio. O painel permite medir.",
  ],
  diferenciais: [
    "Roda no **seu** servidor e no **seu** número: sem comissão por agendamento e sem depender de plataforma de terceiros para os dados.",
    "Preço fixo, sem cobrança por profissional ou por mensagem do robô.",
    "Pensado para a regra real do WhatsApp (janela de 24 h, modelos, opt-out) — não faz envio em massa nem usa métodos não oficiais.",
    "Anti-invenção: a IA (opcional) só responde com o que a empresa cadastrou.",
    "Documentação de LGPD e segurança incluída; testes automatizados dos fluxos.",
  ],
  config_campos: [
    { campo: "empresa.nome", descricao: "Nome que o robô usa ao se apresentar", exemplo: "\"Barbearia do Zé\"" },
    { campo: "empresa.endereco / telefone / horario_texto / pagamento", descricao: "Informações usadas nas respostas e nos lembretes", exemplo: "\"Rua das Flores, 120\"" },
    { campo: "empresa.horario", descricao: "Horário de atendimento humano por dia da semana (0=domingo … 6=sábado). Usado só para avisar “fora do horário” quando o cliente pede atendente.", exemplo: "{ \"1\": { \"abre\": \"09:00\", \"fecha\": \"19:00\" } }" },
    { campo: "servicos[].id", descricao: "Código do serviço (minúsculas, sem espaço). Não mude depois de usado.", exemplo: "\"corte\"" },
    { campo: "servicos[].nome / duracao_min / preco", descricao: "Nome mostrado, duração em minutos e preço em reais (número com ponto)", exemplo: "\"Corte masculino\", 30, 45" },
    { campo: "servicos[].profissionais", descricao: "(opcional) Quem faz este serviço. Se omitir, todos fazem.", exemplo: "[\"marcos\"]" },
    { campo: "profissionais[].id / nome", descricao: "Código e nome do profissional", exemplo: "\"joao\", \"João\"" },
    { campo: "profissionais[].horario", descricao: "Expediente por dia da semana. Dia ausente = não trabalha.", exemplo: "{ \"1\": { \"abre\": \"09:00\", \"fecha\": \"18:00\" } }" },
    { campo: "profissionais[].folgas", descricao: "Datas sem atendimento (AAAA-MM-DD)", exemplo: "[\"2026-12-25\"]" },
    { campo: "agenda.intervalo_min", descricao: "De quantos em quantos minutos os horários são oferecidos", exemplo: "30" },
    { campo: "agenda.antecedencia_horas", descricao: "Antecedência mínima para marcar (evita “marcar para daqui a 10 minutos”)", exemplo: "2" },
    { campo: "agenda.dias_max", descricao: "Até quantos dias à frente o cliente pode agendar", exemplo: "30" },
    { campo: "agenda.cancelar_ate_horas", descricao: "Prazo para cancelar/remarcar sozinho pelo robô. Depois disso, vai para uma pessoa.", exemplo: "2" },
    { campo: "lembretes.ativo / horas_antes", descricao: "Liga os lembretes e define quantas horas antes (até 4 valores)", exemplo: "true, [24, 2]" },
    { campo: "lembretes.template_nome / template_idioma", descricao: "Nome do modelo aprovado na Meta para lembretes fora da janela de 24 h. Vazio = só envia dentro da janela.", exemplo: "\"lembrete_agendamento\", \"pt_BR\"" },
    { campo: "lista_espera.ativo / avisar_ate", descricao: "Liga a lista de espera e quantas pessoas são avisadas por vaga", exemplo: "true, 3" },
    { campo: "faq[]", descricao: "Perguntas e respostas da empresa; palavras_chave ajudam a achar a pergunta certa", exemplo: "{ \"pergunta\": \"Onde fica?\", \"resposta\": \"...\" }" },
    { campo: "mensagens.boas_vindas / handoff / fora_horario / politica_cancelamento", descricao: "Textos personalizados (opcionais)", exemplo: "\"Olá! 💈 ...\"" },
  ],
  templates: [{
    nome: "lembrete_agendamento", categoria: "UTILITY (utilidade)", parametros: ["primeiro nome do cliente", "serviço", "data e hora (ex.: 08/10 às 10:00)", "nome da empresa"],
    corpo: "Olá {{1}}! Lembrete: {{2}} em {{3}} na {{4}}. Responda 1 para confirmar, 2 para cancelar ou 3 para remarcar.",
    quando: "Usado quando o cliente não escreve há mais de 24 horas (a maioria dos lembretes de 24 h e 2 h).",
  }],
  dados: [
    { dado: "Serviço, profissional, data/hora do agendamento", finalidade: "Prestar o serviço contratado e enviar lembretes", base_legal: "Execução de contrato" },
    { dado: "Presença (compareceu/faltou/cancelou)", finalidade: "Gestão da agenda e indicadores da empresa", base_legal: "Legítimo interesse" },
    { dado: "Lista de espera (serviço e dia desejados)", finalidade: "Avisar quando houver vaga", base_legal: "Consentimento (o cliente pede para entrar)" },
    { dado: "Autorização de lembretes (agendamentos feitos pela equipe)", finalidade: "Só enviar lembretes a quem autorizou", base_legal: "Consentimento" },
  ],
  tabelas: [
    { nome: "appointments", descricao: "Agendamentos (serviço, profissional, início/fim em UTC, preço, situação, origem). Guarda cópia do nome/preço para o histórico não mudar quando o cadastro muda." },
    { nome: "reminders", descricao: "Lembretes programados por agendamento (horário, enviado em, resultado, próxima tentativa)." },
    { nome: "waitlist", descricao: "Lista de espera (cliente, serviço, dia, situação)." },
  ],
  arquivos: [
    { caminho: "src/index.ts", descricao: "Ponto de entrada (`node src/index.ts`)" },
    { caminho: "src/robot.ts", descricao: "Define o robô: fluxo, tarefas agendadas, páginas do painel" },
    { caminho: "src/settings.ts", descricao: "Esquema e validação da configuração; base de conhecimento" },
    { caminho: "src/flow.ts", descricao: "Máquina de estados da conversa (agendar, meus horários, lembretes, lista de espera, dúvidas)" },
    { caminho: "src/slots.ts", descricao: "Cálculo de horários livres (fuso, folgas, duração, conflitos)" },
    { caminho: "src/store.ts", descricao: "Acesso ao banco: reserva atômica, cancelamento, lista de espera, lembretes" },
    { caminho: "src/reminders.ts", descricao: "Envio dos lembretes vencidos (respeita janela de 24 h, templates e opt-out)" },
    { caminho: "src/admin.ts", descricao: "Páginas do painel: agenda, novo agendamento, lista de espera, resumo" },
    { caminho: "src/migrations.ts", descricao: "Tabelas do robô" },
    { caminho: "tests/agenda.test.ts", descricao: "Testes automatizados dos fluxos" },
  ],
  painel: [
    { pagina: "agenda", para_que: "Agenda do dia; marcar compareceu/faltou/cancelar; criar agendamento manual (`/agenda/novo`)" },
    { pagina: "espera", para_que: "Lista de espera por dia e serviço" },
  ],
  manual: {
    cadastrar_info: "Painel > **Configurações** (ou arquivo `config/empresa.json`): preencha `empresa` (nome, endereço, telefone, horário, formas de pagamento). Esses dados aparecem nas confirmações, nos lembretes e nas respostas de dúvidas. Cadastre também as perguntas frequentes em `faq` — quanto mais perguntas reais dos seus clientes, menos o robô precisa chamar uma pessoa.",
    alterar_servicos: "Em **Configurações**, edite a lista `servicos` (nome, duração em minutos e preço) e `profissionais` (nome e expediente por dia da semana). Para **bloquear um dia** (folga, feriado), acrescente a data em `folgas` do profissional. Para um serviço que só um profissional faz, use `profissionais` dentro do serviço. Não mude o `id` de serviços/profissionais que já têm agendamentos.",
    alterar_precos: "Em **Configurações**, altere o campo `preco` (em reais, número com ponto: `45.5`). Agendamentos já feitos **mantêm o preço da época**; os novos usam o preço atualizado.",
    mensagens: "Em **Configurações**, no bloco `mensagens`: `boas_vindas` (primeira mensagem), `handoff` (quando chama atendente), `fora_horario` (quando pedem atendente e a empresa está fechada) e `politica_cancelamento` (aparece na confirmação). Os lembretes fora da janela de 24 h usam o texto do **modelo aprovado na Meta**, que só se altera lá.",
    problemas: [
      { sintoma: "Cliente não vê o horário que eu esperava", causa: "Fora do expediente do profissional, folga, antecedência mínima ou serviço não feito por ele", solucao: "Confira `profissionais[].horario`, `folgas` e `agenda.antecedencia_horas`." },
      { sintoma: "Lembrete não chegou", causa: "Cliente fora da janela de 24 h e sem modelo aprovado, ou fez PARAR", solucao: "Cadastre `lembretes.template_nome` (INSTALACAO, passo 8). Veja se o cliente fez PARAR em Clientes." },
      { sintoma: "Horário marcado fora do robô aparece livre", causa: "O robô só conhece o que está na agenda dele", solucao: "Lance o horário em Agenda > Novo agendamento." },
    ],
  },
  cliente: {
    rotina: [
      "Abra **Agenda** e confira os horários de hoje.",
      "Quando o cliente terminar, toque em **Compareceu** — ou **Faltou**. Isso alimenta os números do painel.",
      "Olhe **Conversas**: se houver alguém *aguardando atendente*, responda.",
      "Se alguém ligar ou aparecer pessoalmente para marcar, use **+ Novo agendamento** para o robô não oferecer o mesmo horário.",
      "Semanalmente, veja o **Início** (faltas, valor atendido, vagas reocupadas pela lista de espera).",
    ],
    regras_de_ouro: [
      "Marque *Compareceu/Faltou* todo dia: sem isso o painel não consegue mostrar a taxa de comparecimento.",
      "Folga ou feriado? Cadastre em `folgas` (Configurações) **antes**, ou o robô oferecerá o dia.",
      "No agendamento manual, só marque “o cliente autorizou lembretes” se ele realmente autorizou.",
    ],
  },
  fluxos: `# Fluxos de conversa — AgendaZap

As conversas reais (geradas pelo robô, não escritas à mão) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md). Aqui, o mapa dos estados.

## Mapa

\`\`\`
inicio ──(agendar)──► ag_servico ──► [ag_prof] ──► ag_dia ──► ag_hora ──► ag_confirmar ──► (agendado) ──► inicio
   │                                                │ (dia lotado)
   │                                                └──► ag_espera_oferta ──► (entra na lista) ──► inicio
   ├──(meus horários)──► meus ──► meu_item ──┬──► (confirmar)
   │                                          ├──► (remarcar) ──► ag_dia ... ag_confirmar (cancela o antigo ao confirmar o novo)
   │                                          └──► cancelar_conf ──► (cancelado) ──► inicio
   ├──(dúvida)──► FAQ/IA ──(achou)──► resposta
   │                      └─(não achou)──► MODO HUMANO ("Não tenho essa informação...")
   └──(atendente / erro interno)──► MODO HUMANO
\`\`\`

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
Pergunta → busca no \`faq\` → (opcional) IA restrita ao cadastro → se não achar: “Não tenho essa informação no momento. Vou encaminhar você para um atendente.” e passa para modo humano (fora do expediente, acrescenta a mensagem de “fora do horário”).

## Fluxo de erro
- **Horário ocupado no meio tempo:** “esse horário acabou de ser ocupado” + novas opções.
- **Entrada que não entende (áudio/foto):** pede texto/botões e oferece MENU ou ATENDENTE.
- **Cancelar/remarcar fora do prazo:** explica o prazo e chama uma pessoa.
- **Erro interno:** pede desculpas, chama atendente e registra o motivo.

## Fluxo de transferência para humano
Gatilhos: palavra *atendente/humano*, botão “Falar com atendente”, pergunta sem resposta, alteração fora do prazo, erro interno. No modo humano o robô **não responde**; a equipe responde pelo painel. Volta ao robô por botão ou após 12 h sem atividade.
`,
  requisitos: [
    { id: "RF-01", texto: "Agendar serviço escolhendo profissional, dia e hora", status: "Implementado" },
    { id: "RF-02", texto: "Nunca permitir dois agendamentos sobrepostos para o mesmo profissional", status: "Implementado" },
    { id: "RF-03", texto: "Respeitar expediente, folgas, duração, antecedência e limite de dias", status: "Implementado" },
    { id: "RF-04", texto: "Cancelar, confirmar e remarcar pelo WhatsApp (remarcação sem perder o horário antigo)", status: "Implementado" },
    { id: "RF-05", texto: "Lembretes configuráveis com confirmação (botões/modelo)", status: "Implementado" },
    { id: "RF-06", texto: "Lista de espera com aviso automático e “primeiro a responder”", status: "Implementado" },
    { id: "RF-07", texto: "Responder dúvidas com base no cadastro, sem inventar", status: "Implementado" },
    { id: "RF-08", texto: "Transferência para humano e retomada automática", status: "Implementado" },
    { id: "RF-09", texto: "Painel: agenda, presença/falta, agendamento manual, indicadores", status: "Implementado" },
    { id: "RF-10", texto: "Cancelamento automático de quem não confirma", status: "Não implementado" },
    { id: "RF-11", texto: "Sincronização com Google Agenda / sistemas externos", status: "Não implementado" },
    { id: "RF-12", texto: "Sinal/pagamento antecipado do agendamento", status: "Não implementado" },
    { id: "RF-13", texto: "Cadastro de serviços/profissionais por formulário (hoje: edição validada de JSON)", status: "Parcial" },
  ],
  pendencias: [
    "Piloto com número real da WhatsApp Business Platform em pelo menos 1 empresa (hoje as integrações foram verificadas contra o formato documentado da API e por simulação, não em produção).",
    "Modelo `lembrete_agendamento` aprovado pela Meta e testado de ponta a ponta.",
    "Medir faltas antes/depois no piloto antes de usar qualquer número em propaganda.",
    "Revisão/pentest de segurança independente e contrato de suporte/hospedagem definido.",
    "Cadastro de serviços e profissionais por formulário (hoje é JSON validado) para clientes sem apoio técnico.",
  ],
  precos: {
    venda_unica: 1490, mensalidade: 129, implantacao: 490, personalizacao_hora: 150,
    racional: [],
  },
  sales: {
    pagina: `# AgendaZap — o atendente de agenda que não dorme

### Pare de perder horário (e cliente) no WhatsApp.

Seu cliente chama às 22h pedindo um horário. Você está dormindo. De manhã, ele já marcou na concorrência — ou marcou com você e **esqueceu de ir**, e a cadeira ficou vazia.

O **AgendaZap** cuida disso por você, no **seu** WhatsApp:

- ✅ **Marca sozinho**, 24 horas por dia, só nos horários realmente livres.
- ✅ **Lembra o cliente** antes do horário e pede confirmação (confirmar, remarcar ou cancelar com um toque).
- ✅ **Preenche vagas**: quando alguém cancela, avisa quem estava na lista de espera.
- ✅ **Tira dúvidas** (endereço, preços, pagamento) com as informações que você cadastrou — **e não inventa nada**. Se não souber, chama uma pessoa.
- ✅ **Você assume quando quiser**: um clique e a conversa é sua.

## Como funciona
1. Cliente: “Oi, quero cortar o cabelo amanhã”.
2. O robô mostra os horários livres do profissional escolhido.
3. Um toque e está marcado. Chega o lembrete. Confirmou? Ótimo. Cancelou? A vaga volta para a fila.

## O que você ganha
- **Menos horário vazio:** lembrete com confirmação e lista de espera atacam as duas causas mais comuns.
- **Menos tempo no celular:** o básico (marcar, remarcar, cancelar, “onde fica?”) o robô resolve.
- **Mais controle:** painel com a agenda do dia, presença/falta e o valor atendido nos últimos 30 dias.
- **Seus dados são seus:** roda no seu servidor, sem comissão por agendamento.

## Para quem é
Barbearias, salões, estúdios, clínicas e consultórios pequenos, pet shops — qualquer negócio que vive de **horário marcado**.

## Feito do jeito certo
Usa a **API oficial do WhatsApp**: nada de “robô pirata” que bloqueia seu número. Respeita a regra das 24 horas, o pedido de “PARAR” do cliente e a LGPD.

## Seja honesto com você mesmo
O AgendaZap não faz milagre: ele reduz as causas mais comuns de horário vazio, mas **o resultado depende do seu negócio**. Por isso o painel mostra o comparecimento — meça antes e depois.

## Quanto custa
Veja [PRECIFICACAO.md](PRECIFICACAO.md). Implantação, uso mensal e versão de compra única.

**👉 Quer ver funcionando com os dados da sua barbearia/clínica? Peça uma demonstração de 15 minutos.**
`,
    pitch: `# Pitch — AgendaZap

## Em 15 segundos
“Eu coloco no WhatsApp da sua barbearia um assistente que marca horário sozinho, lembra o cliente e avisa a lista de espera quando alguém cancela — e você assume a conversa a qualquer momento.”

## Em 1 minuto
“Hoje seu cliente pede horário no WhatsApp e você responde quando dá. Fora do expediente a mensagem fica esperando, e quem marcou muitas vezes esquece. Cada horário vazio é dinheiro que não volta.
O AgendaZap atende 24 horas: mostra só horários livres, confirma na hora, manda lembrete pedindo confirmação e, se alguém cancela, avisa quem estava na fila. Tudo pelo número oficial da sua empresa, com painel simples para a equipe.
Não prometo número mágico: o painel mede o comparecimento e você vê o resultado no seu negócio.”

## Em 3 minutos (roteiro de conversa)
1. **Pergunta de abertura:** “Quantos clientes faltam sem avisar por semana? E quantas mensagens ficam sem resposta à noite?” (deixe o cliente falar o número dele).
2. **Conta rápida:** “Se cada falta custa o preço de um atendimento (R$ ___), e o robô evitar 3 faltas por mês, ele já se pagou.” (use o ticket médio dele; é só uma conta, não uma promessa.)
3. **Demonstração:** abra o \`demo/CONVERSAS.md\` ou o painel de demonstração (veja DEMO-SCRIPT.md).
4. **Segurança:** “Usa o WhatsApp oficial. Se o robô não souber algo, ele não inventa: chama você.”
5. **Fechamento:** “Posso configurar com os seus serviços e horários e você testa com seu próprio número antes de pagar a implantação completa.” (ofereça um piloto curto, conforme sua política.)

## Mensagem para primeiro contato (WhatsApp/Instagram)
> Oi, [Nome]! Vi que a [Barbearia] recebe pedidos de horário pelo WhatsApp. Eu monto um assistente que marca, confirma e lembra os clientes automaticamente (e avisa a fila de espera quando alguém cancela). Posso te mostrar em 10 minutos com os serviços da sua barbearia? Sem compromisso.

## Pergunte antes de vender (qualificação)
- Quantos profissionais e quantos horários por dia?
- Como marcam hoje? Quem responde as mensagens?
- Já mediram faltas? Qual o ticket médio?
- Quem decide e quem vai usar o painel?
`,
    features: `# Funcionalidades e benefícios — AgendaZap

| Funcionalidade | Benefício para o dono |
|---|---|
| Agendamento 24 h por conversa | Não perde cliente que chama à noite/fim de semana |
| Só horários realmente livres (expediente, folgas, duração, antecedência) | Acaba o “ah, esse horário já estava ocupado” |
| Reserva sem conflito | Nunca marca dois clientes no mesmo horário |
| Lembretes 24 h / 2 h com Confirmo-Remarcar-Cancelar | Menos esquecimento; você sabe quem vem |
| Lista de espera automática | Cancelamento vira nova venda, não vaga perdida |
| Remarcar sem perder o horário antigo | Cliente não fica sem horário por engano |
| Prazo para cancelar (configurável) | Protege sua agenda de cancelamentos de última hora |
| Dúvidas respondidas pelo cadastro (IA opcional, sem inventar) | Menos mensagens repetidas; sem informação errada |
| Transferência para atendente em 1 toque | O cliente nunca fica preso no robô |
| Painel: agenda do dia, presença/falta, agendamento manual | Controle sem planilha |
| Indicadores dos últimos 30 dias | Você mede o resultado |
| PARAR / exclusão de dados / retenção | Tranquilidade com a LGPD |
| API oficial do WhatsApp | Seu número protegido |
| Roda no seu servidor, preço fixo | Sem comissão por agendamento |

## Detalhes técnicos que o cliente não vê, mas importam
Testes automatizados dos fluxos, assinatura do webhook validada, isolamento entre empresas, registro de eventos e logs sem dados sensíveis.
`,
    objecoes: `# Objeções — AgendaZap (e como responder com honestidade)

**1. “Já uso um app de agenda (Trinks, etc.).”**
Ótimo — o AgendaZap não substitui controle financeiro, comissão ou estoque. Ele cuida do **WhatsApp**: atende o pedido de horário e lembra o cliente. Atenção: hoje ele **não sincroniza** com outros apps, então os horários precisam ficar numa agenda só (a dele) ou ser lançados manualmente. Se o app que você usa já faz lembrete e atendimento por WhatsApp para a sua necessidade, talvez nem precise de mim — vale comparar.

**2. “Meus clientes não gostam de robô.”**
O robô se apresenta como assistente e a qualquer momento o cliente digita *atendente* ou toca em “Falar com atendente”. Para marcar horário, a maioria prefere resposta imediata a esperar.

**3. “É caro.”**
Faça a conta com o ticket médio *dele*: mensalidade ÷ preço do atendimento = quantas faltas evitadas pagam o robô (ex.: R$ 129 ÷ R$ 45 ≈ 3 por mês). Não prometa que ele evitará; mostre como medir (painel).

**4. “E se o robô errar?”**
Ele segue regras e o cadastro que você fez; não inventa respostas. Se não souber, chama uma pessoa. Nos primeiros dias vale acompanhar as conversas no painel e ajustar textos.

**5. “Tenho medo de o WhatsApp banir meu número.”**
O AgendaZap usa a **API oficial** (WhatsApp Business Platform), com opt-out e regras de janela e modelos respeitados. Não faz disparo em massa. (Nenhum sistema pode prometer risco zero, mas a abordagem oficial é a recomendada pela Meta.)

**6. “Não entendo de tecnologia.”**
A implantação inclui a configuração e o treinamento da equipe; o manual é para leigos e o painel é simples. Você muda horários e preços pelo próprio painel.

**7. “E os dados dos meus clientes?”**
Ficam no **seu** servidor. O sistema tem opt-out, exclusão de dados e apagamento automático do histórico. A documentação de LGPD está incluída (não substitui seu advogado).

**8. “Preciso de um número novo?”**
A API oficial exige que o número seja registrado na plataforma. Há caminhos para quem já usa o aplicativo no número; veja a documentação da Meta na implantação.

**9. “E se a internet/servidor cair?”**
O WhatsApp reenvia mensagens por um tempo; lembretes podem atrasar. Hospedagem estável + reinício automático resolvem a maioria dos casos. Combine o nível de suporte no contrato.

**10. “Posso testar antes?”**
Sim: demonstração com dados fictícios na hora e, se combinado, um piloto curto com os serviços reais e seu número de teste.
`,
    faq: `# Perguntas frequentes — AgendaZap

**O que preciso para começar?** Um número de WhatsApp para a plataforma oficial, conta Meta Business, um servidor com HTTPS e os dados dos serviços/profissionais.

**Funciona com vários profissionais?** Sim, cada um com seu expediente e folgas; serviços podem ser exclusivos de alguns.

**O cliente pode escolher “qualquer um”?** Sim: “Sem preferência” oferece o primeiro horário livre de qualquer profissional.

**O robô marca horário no passado ou de última hora?** Não. Há antecedência mínima configurável.

**Como evita marcar dois clientes no mesmo horário?** A reserva é feita dentro de uma transação no banco; se o horário foi tomado, o cliente recebe novas opções.

**Quanto tempo antes posso cancelar?** Você define (padrão 2 h). Depois disso, o robô chama uma pessoa.

**Os lembretes custam?** Dentro de 24 h após a última mensagem do cliente, normalmente não. Fora dela, o WhatsApp exige modelo aprovado e a Meta cobra por mensagem de modelo. Consulte a tabela atual da Meta.

**O cliente pode parar de receber lembretes?** Sim, respondendo PARAR; o robô respeita imediatamente.

**Posso lançar agendamentos que fiz por telefone?** Sim, em Agenda > Novo agendamento.

**Dá para ver quem faltou?** Sim: marque “Faltou” na agenda e o painel mostra o total e o comparecimento.

**Integra com Google Agenda?** Ainda não.

**Aceita pagamento/sinal?** Não nesta versão.

**Posso mudar preços e horários sozinho?** Sim, em Configurações (o sistema valida antes de salvar).

**Quantas empresas posso atender com uma instalação?** Várias: o sistema é multiempresa (cada uma com número, dados e painel isolados). Use o script de cadastro de empresas.

**A IA é obrigatória?** Não. Sem IA ele responde pelo cadastro de perguntas e respostas.
`,
    demo: `# Roteiro de demonstração — AgendaZap (15 minutos)

## Antes
1. Rode o painel fictício: \`node robots/robot-001-agendazap/demo/servidor-demo.ts\` e abra http://localhost:3100/admin (chave \`demo-demo-demo-1234\`).
2. Deixe aberto \`demo/CONVERSAS.md\` (conversas reais do robô). Se tiver um número de teste na Meta, deixe o robô conectado para mostrar ao vivo.
3. Descubra o ticket médio e o nº de profissionais do prospect.

## Roteiro
**1. (2 min) A dor.** “Me conta como marcam horário hoje.” Anote números dele (faltas por semana, mensagens sem resposta).

**2. (4 min) O cliente marcando.** Mostre a conversa 1 de CONVERSAS.md: “oi” → serviço → profissional → dia → hora → confirmar. Destaque: *só horários livres*, *um toque*.

**3. (2 min) O lembrete.** Conversa 5: lembrete 24 h antes + “Confirmo”. “Quem não confirma aparece como *sem confirmar* no painel — você liga só para esses.”

**4. (2 min) Lista de espera.** Conversa 6: dia lotado → fila → alguém cancela → aviso → “QUERO”. “Cancelamento virou venda.”

**5. (2 min) Segurança e humano.** Conversa 2 e 4: o robô não inventa e passa para uma pessoa quando precisa.

**6. (2 min) O painel.** Agenda do dia, *Compareceu/Faltou*, novo agendamento manual, indicadores.

**7. (1 min) Combinar o próximo passo.** Proposta (PRECIFICACAO.md): implantação + mensalidade, piloto, prazo. Pergunte: “O que falta para decidir?”

## Cuidados na demonstração
- Diga que os dados são fictícios.
- Não prometa percentual de redução de faltas.
- Se perguntarem algo que o robô não faz (Google Agenda, pagamento), responda com sinceridade — veja OBJECTIONS.md.
`,
    precificacao: `# Precificação sugerida — AgendaZap

> **São sugestões para você validar no mercado**, não tabela oficial nem promessa de resultado. Os números dos concorrentes abaixo vêm de fontes de datas e confiabilidade variadas; **peça propostas atualizadas antes de usar**.

## Sugestão

| Modelo | Valor sugerido | O que inclui |
|---|---|---|
| **Implantação** | R$ 490 (única) | Configuração do número na Meta, cadastro de serviços/profissionais/FAQ, modelo de lembrete, treinamento de 1 h |
| **Mensalidade** (suporte + hospedagem) | R$ 129/mês | Servidor, backup, atualizações, suporte por mensagem em horário comercial. Custos da Meta e da IA à parte (ou repassados) |
| **Venda única** (cliente hospeda) | R$ 1.490 | Pacote do robô + implantação básica. Suporte e atualizações como contrato separado |
| **Personalização** | R$ 150/hora | Mudanças no fluxo, textos especiais, integrações (ex.: Google Agenda) |

## Como cheguei a esses números
1. **Conta de retorno (aritmética, não promessa):** com mensalidade de R$ 129 e atendimento de R$ 45, o robô se paga se evitar ~3 horários vazios por mês. Use o ticket médio *do cliente*.
2. **Referências de mercado (a validar):** o Tecnoblog citou planos de agenda a partir de R$ 39,99/mês (matéria antiga) e o Capterra lista “a partir de R$ 81” para a Trinks (data incerta). Ou seja, **software de agenda genérico é barato** — meu preço só se sustenta pelo que é diferente: atendimento por WhatsApp, lembrete com confirmação e lista de espera, sem comissão. Se o cliente só quer agenda, não force.
3. **Seu custo:** hospedagem pequena + suporte. A mensalidade cobre servidor, backup e ~1 h/mês de suporte por cliente. Faça a sua conta.
4. **Custos da Meta:** respostas na janela de 24 h costumam ser gratuitas; modelos fora dela são cobrados por mensagem (uma plataforma cita ~US$ 0,008 por mensagem de utilidade no Brasil — **confira a tabela oficial**). Ex.: 300 lembretes por modelo/mês ≈ US$ 2,4 pelo valor citado (converta pela cotação do dia).
5. **IA (opcional):** custo por uso do provedor; com FAQ bem cadastrado o consumo é baixo. Consulte o preço atual.

## Como apresentar
- Comece pela mensalidade e pelo piloto de 30 dias; ofereça a venda única a quem prefere hospedar sozinho.
- Desconto progressivo para 2+ unidades (ex.: 20% na 2ª) é uma decisão sua.
- Evite prometer percentual de redução de faltas.

## Validar antes de fixar
- [ ] Cotar 3 concorrentes (agenda com WhatsApp) na sua região.
- [ ] Perguntar a 5 donos o quanto pagariam (sem sugerir o valor).
- [ ] Calcular seu custo real por cliente (hospedagem + suporte).
`,
  },
};
