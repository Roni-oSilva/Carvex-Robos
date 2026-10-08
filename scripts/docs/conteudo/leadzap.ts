import type { RobotDoc } from "../tipos.ts";

export const leadzap: RobotDoc = {
  id: "robot-005-leadzap",
  nome: "LeadZap",
  slogan: "Responde na hora, mostra os imóveis certos, agenda a visita e entrega o lead pronto ao corretor.",
  versao: "1.0.0",
  status: "PRONTO",
  segmentos: ["Imobiliárias pequenas e médias", "Corretores autônomos e equipes", "Loteadoras e construtoras pequenas", "Administradoras de aluguel"],
  publico: "Imobiliárias e corretores que recebem **interessados pelo WhatsApp** (anúncios, portais, placas) e perdem negócio porque o primeiro contato demora, a qualificação é feita de forma desigual e as visitas marcadas não acontecem.",
  problema: "O lead esfria se ninguém responde logo; as informações básicas (comprar ou alugar, bairro, faixa de valor, prazo) são perguntadas de novo por cada corretor; o histórico fica no celular pessoal; e as visitas marcadas sem confirmação viram falta. Há queixas de consumidores sobre visitas que não aconteceram e conteúdo de fornecedores sobre qualificar por orçamento, localização e prazo. As estatísticas que circulam divergem entre si, então **este material não usa percentuais**; valide com 3 imobiliárias antes de investir.",
  resumo: "O **LeadZap** atende o interessado na hora: pergunta se quer **comprar ou alugar**, tipo de imóvel, bairro, faixa de valor, quartos e prazo, e mostra **somente imóveis do seu cadastro** que cabem no perfil. Se o cliente gostar, **agenda a visita** em horários livres daquele imóvel, **lembra e pede confirmação** antes. O lead vai para o painel **classificado como quente, morno ou frio** (regra de pontos transparente), **já atribuído ao corretor** do bairro, com todo o resumo. Se o cliente some, o robô faz **um** acompanhamento com opções reais do cadastro, e depois o lead vira \"sem resposta\" para a equipe decidir.",
  oportunidades: [5],
  potencial: "Alto",
  como_funciona: [
    "O interessado escreve e toca em **Quero comprar** ou **Quero alugar** (ou **Falar com corretor**).",
    "Escolhe o tipo de imóvel e o bairro (validado contra as regiões que você atende).",
    "Escolhe a faixa de valor, o mínimo de quartos e o prazo (até 30 dias, 1 a 3 meses, só pesquisando).",
    "O robô registra o lead, calcula a temperatura, escolhe o corretor do bairro com menos leads em aberto e mostra até 5 imóveis do cadastro que cabem no perfil.",
    "Ao escolher um imóvel, o cliente vê preço, bairro, quartos, descrição e o link das fotos que você cadastrou.",
    "Pode **agendar visita**: escolhe o dia e o horário entre os livres daquele imóvel (respeitando a antecedência mínima).",
    "Antes da visita (padrão 24 h), recebe o lembrete com **Confirmo, Remarcar ou Cancelar visita**.",
    "Se não responde, recebe um único acompanhamento com imóveis reais do cadastro; após o prazo, o lead vira \"sem resposta\".",
  ],
  funcionalidades: [
    { titulo: "Qualificação em poucos toques", descricao: "Finalidade, tipo, bairro, faixa de valor, quartos e prazo — com botões e listas." },
    { titulo: "Imóveis só do seu cadastro", descricao: "Mostra apenas imóveis disponíveis que cabem no perfil. Nada de imóvel inventado." },
    { titulo: "Temperatura transparente", descricao: "Quente, morno ou frio por pontos fixos (prazo, imóvel compatível, interesse, visita). Você enxerga a regra." },
    { titulo: "Roteamento ao corretor", descricao: "Atribui ao corretor que atende o bairro com menos leads em aberto; você troca no painel quando quiser." },
    { titulo: "Agendamento de visita", descricao: "Horários livres por imóvel, antecedência mínima, sem duas visitas no mesmo horário do mesmo imóvel." },
    { titulo: "Lembrete e confirmação", descricao: "Aviso antes da visita com botões Confirmo, Remarcar e Cancelar visita." },
    { titulo: "Acompanhamento do lead", descricao: "Um follow-up com opções reais do cadastro; depois, \"sem resposta\". Respeita quem pediu para parar e quem está em atendimento humano." },
    { titulo: "Painel de leads", descricao: "Quentes primeiro, filtro por corretor, resumo completo, link direto para o WhatsApp e motivos de perda." },
    { titulo: "Agenda de visitas", descricao: "Próximas visitas com resultado (realizada, faltou, cancelada) para medir comparecimento." },
    { titulo: "Disponibilidade dos imóveis", descricao: "Marque vendido/alugado em um clique e o robô para de oferecer." },
    { titulo: "Dúvidas e corretor", descricao: "FAQ cadastrado; fora da base ou a pedido, chama uma pessoa." },
    { titulo: "LGPD", descricao: "Consentimento por contato iniciado pelo cliente, opt-out, exclusão por cliente e retenção configurável." },
  ],
  limites: [
    "**Não integra com portais, CRMs nem com a base do MLS**: o catálogo é cadastrado nas Configurações (até 300 imóveis).",
    "Não envia fotos nem vídeos: envia o **link** que você cadastrar (https).",
    "Não avalia crédito, não simula financiamento e não negocia valores.",
    "A visita é por imóvel e horário fixos da configuração; não verifica a agenda pessoal do corretor.",
    "O corretor não recebe aviso no WhatsApp por este robô: ele consulta o painel (aviso ao corretor é evolução).",
    "A temperatura é uma regra simples, não previsão de venda.",
    "Fora da janela de 24 h, lembretes e acompanhamentos só saem com **modelo aprovado pela Meta**.",
  ],
  diferenciais: [
    "**Resposta imediata** e coleta padronizada: todo lead chega com o mesmo resumo.",
    "Catálogo **real**: o robô só fala do que você cadastrou.",
    "Visita com **lembrete e confirmação** (ataca a falta).",
    "Funciona **sem CRM**: o painel já organiza leads e visitas.",
    "Regras de temperatura e roteamento **abertas**: você entende e ajusta.",
  ],
  config_campos: [
    { campo: "empresa.*", descricao: "Nome, endereço, telefone, horário e condições (texto)", exemplo: "\"Casa Certa Imóveis\"" },
    { campo: "tipos[]", descricao: "Tipos de imóvel (até 10). `id` sem acento/espaço, `nome` até 24 caracteres.", exemplo: "{ \"id\": \"apartamento\", \"nome\": \"Apartamento\" }" },
    { campo: "bairros", descricao: "Regiões atendidas. Até 10 aparecem como lista; mais que isso, o cliente digita. Vazio = aceita qualquer bairro.", exemplo: "[\"Centro\", \"Vila Nova\"]" },
    { campo: "faixas.comprar / faixas.alugar", descricao: "Até 3 faixas de valor cada. `nome` até 20 caracteres (limite do botão). `min` e `max` em reais.", exemplo: "{ \"nome\": \"Até R$ 300 mil\", \"min\": 0, \"max\": 300000 }" },
    { campo: "imoveis[]", descricao: "Catálogo: `id`, `finalidade` (comprar/alugar), `tipo` (um dos `tipos`), `titulo`, `bairro`, `preco`, `quartos`, `descricao`, `link` (https) e `disponivel`.", exemplo: "{ \"id\": \"ap-centro-2q\", \"finalidade\": \"alugar\", \"preco\": 2100 }" },
    { campo: "corretores[]", descricao: "Corretores e os bairros que atendem. Lista de bairros vazia = atende qualquer um (plantão).", exemplo: "{ \"id\": \"marcos\", \"nome\": \"Marcos\", \"bairros\": [\"Centro\"] }" },
    { campo: "visitas.*", descricao: "`ativo`, `dias_semana` (0=domingo), `horarios` (HH:MM), `janela_dias`, `antecedencia_horas`, `lembrete_horas`.", exemplo: "{ \"horarios\": [\"09:00\", \"14:00\"], \"lembrete_horas\": 24 }" },
    { campo: "followup.horas / sem_resposta_dias", descricao: "Horas sem resposta até o acompanhamento único; dias até virar \"sem resposta\".", exemplo: "48, 7" },
    { campo: "template.nome / idioma", descricao: "Modelo aprovado na Meta para lembretes e acompanhamentos fora da janela de 24 h", exemplo: "\"lead_visita\", \"pt_BR\"" },
    { campo: "faq[] e mensagens.*", descricao: "Perguntas/respostas e textos opcionais (boas_vindas, handoff)", exemplo: "\"Auxiliamos na simulação...\"" },
  ],
  templates: [{
    nome: "lead_visita", categoria: "UTILITY (utilidade)", parametros: ["primeiro nome do cliente", "texto da mensagem (o robô monta)", "nome da imobiliária"],
    corpo: "Olá {{1}}! {{2}} — {{3}}",
    quando: "Usado para o lembrete de visita e para o acompanhamento do lead quando o cliente não escreveu nas últimas 24 horas.",
  }],
  dados: [
    { dado: "Nome e telefone", finalidade: "Atender o interessado e permitir contato do corretor", base_legal: "Execução de contrato (procedimentos preliminares)" },
    { dado: "Preferências do imóvel (finalidade, tipo, bairro, faixa de valor, quartos, prazo)", finalidade: "Mostrar imóveis compatíveis e priorizar o atendimento", base_legal: "Execução de contrato (procedimentos preliminares)" },
    { dado: "Visitas agendadas e resposta aos lembretes", finalidade: "Organizar e confirmar visitas", base_legal: "Execução de contrato (procedimentos preliminares)" },
    { dado: "Situação do lead e motivo de perda (registrado pela equipe)", finalidade: "Gestão comercial", base_legal: "Legítimo interesse" },
  ],
  tabelas: [
    { nome: "leads", descricao: "Leads (número sequencial por empresa, perfil, prazo, temperatura e pontos, corretor, situação, motivo de perda, acompanhamento)." },
    { nome: "visits", descricao: "Visitas (lead, imóvel, horário, situação, lembrete enviado)." },
  ],
  arquivos: [
    { caminho: "src/index.ts", descricao: "Ponto de entrada" },
    { caminho: "src/robot.ts", descricao: "Define o robô e as páginas do painel" },
    { caminho: "src/settings.ts", descricao: "Esquema/validação de tipos, faixas, catálogo, corretores e visitas; base de conhecimento" },
    { caminho: "src/flow.ts", descricao: "Conversa: qualificação, imóveis, visitas, minha visita" },
    { caminho: "src/match.ts", descricao: "Imóveis compatíveis, pontuação e roteamento ao corretor" },
    { caminho: "src/agenda.ts", descricao: "Dias e horários livres de visita" },
    { caminho: "src/store.ts", descricao: "Leads e visitas (criação atômica e situações)" },
    { caminho: "src/followup.ts", descricao: "Lembretes de visita e acompanhamento de leads" },
    { caminho: "src/admin.ts", descricao: "Leads, visitas, imóveis e indicadores" },
    { caminho: "src/migrations.ts", descricao: "Tabelas do robô" },
    { caminho: "tests/lead.test.ts", descricao: "Testes automatizados" },
  ],
  painel: [
    { pagina: "leads", para_que: "Leads em aberto (quentes primeiro), filtro por corretor; abrir um lead mostra resumo, atribuição e fechamento/perda" },
    { pagina: "visitas", para_que: "Próximas visitas e resultado (realizada, faltou, cancelada)" },
    { pagina: "imoveis", para_que: "Marcar imóvel indisponível/disponível" },
  ],
  manual: {
    cadastrar_info: "Em **Configurações** (ou `config/empresa.json`) preencha `empresa`, os `tipos` de imóvel, os `bairros` atendidos, as `faixas` de valor (até 3 para comprar e 3 para alugar), os `corretores` com seus bairros e o horário das `visitas`. Cadastre as perguntas frequentes em `faq` (financiamento, documentos).",
    alterar_servicos: "O catálogo é a lista `imoveis`: cada um com `id`, `finalidade`, `tipo`, `titulo`, `bairro`, `preco`, `quartos`, `descricao`, `link` e `disponivel`. **Quando um imóvel é vendido ou alugado**, use painel > **Imóveis** > *Marcar indisponível* (vale na hora). Para incluir ou editar, use Configurações; o sistema valida antes de salvar.",
    alterar_precos: "Altere `preco` do imóvel e as faixas em `faixas`. As faixas decidem o que é \"dentro do orçamento\" do cliente: ajuste-as ao mercado da sua região.",
    mensagens: "No bloco `mensagens`: `boas_vindas` e `handoff`. Lembretes e acompanhamentos são padronizados; fora da janela de 24 h usam o **modelo aprovado na Meta** (`lead_visita`).",
    problemas: [
      { sintoma: "O robô diz que não tem imóvel, mas há um no cadastro", causa: "O imóvel está indisponível ou não cabe na faixa/tipo/bairro/quartos escolhidos", solucao: "Confira `disponivel`, o `preco` dentro da faixa e o bairro escrito igual ao de `bairros`." },
      { sintoma: "Nenhum horário de visita aparece", causa: "`visitas.dias_semana` ou `horarios` vazios, ou todos os horários ocupados/dentro da antecedência mínima", solucao: "Amplie os horários ou reduza `antecedencia_horas`; o robô chama um corretor quando não há vaga." },
      { sintoma: "Lead sem corretor", causa: "Nenhum corretor atende o bairro e não há corretor de plantão (bairros vazios)", solucao: "Cadastre um corretor com `bairros: []` ou atribua manualmente no painel." },
      { sintoma: "Lembrete de visita não chegou", causa: "Cliente sem mensagem há mais de 24 h e sem modelo aprovado", solucao: "Cadastre `template.nome` (INSTALACAO, passo 8)." },
      { sintoma: "Comparecimento aparece \"—\"", causa: "Ninguém marcou o resultado das visitas", solucao: "Painel > Visitas > Realizada ou Faltou depois de cada visita." },
    ],
  },
  cliente: {
    rotina: [
      "Abra **Leads** no começo do dia: os **quentes** vêm primeiro.",
      "Para cada lead, veja o resumo, chame pelo WhatsApp (botão do número) e marque **Em contato**.",
      "Confira **Visitas** do dia; depois de cada uma marque **Realizada** ou **Faltou**.",
      "Quando fechar, clique em **Fechou negócio**; quando perder, registre o **motivo**.",
      "Atualize **Imóveis**: marque indisponível o que saiu do mercado.",
      "Olhe o **Início**: leads do dia, quentes em aberto, comparecimento e motivos de perda.",
    ],
    regras_de_ouro: [
      "Responda os leads **quentes** primeiro; o robô já fez a primeira conversa, mas quem fecha é você.",
      "Mantenha o catálogo atualizado: o robô só fala do que está cadastrado.",
      "Marque o resultado das visitas: sem isso não há indicador de comparecimento.",
      "Atenda quem pediu corretor (aparece em Conversas) antes de tudo.",
    ],
  },
  fluxos: `# Fluxos de conversa — LeadZap

As conversas reais (geradas pelo robô) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md).

## Mapa de estados

\`\`\`
inicio ─(comprar/alugar)─► tipo ─► bairro ─► faixa ─► quartos ─► prazo ─► [nome] ─► LEAD CRIADO ─► imoveis ─► detalhe ─(agendar)─► vdia ─► vhora ─► VISITA
   │                                                                          │ (sem imóvel compatível: lead registrado, corretor retorna)
   ├─(minha visita)─► confirmo | remarcar ─► vdia | cancelar
   ├─(dúvida)─► FAQ ─► se não souber: MODO HUMANO
   └─(corretor / erro)─► MODO HUMANO
\`\`\`

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
3. Entre eles, o que tem **menos leads em aberto**; empate pelo \`id\`.
4. Sem corretores cadastrados: lead fica "sem corretor" e aparece no filtro correspondente.

## Regras aplicadas no servidor
- Imóveis exibidos = cadastrados, \`disponivel\`, mesma finalidade/tipo/bairro, preço dentro da faixa e quartos ≥ o mínimo.
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
`,
  requisitos: [
    { id: "RF-01", texto: "Qualificação: finalidade, tipo, bairro, faixa de valor, quartos e prazo", status: "Implementado" },
    { id: "RF-02", texto: "Exibição de imóveis compatíveis apenas do catálogo cadastrado", status: "Implementado" },
    { id: "RF-03", texto: "Classificação do lead (quente/morno/frio) por regra transparente", status: "Implementado" },
    { id: "RF-04", texto: "Roteamento ao corretor por bairro e carga", status: "Implementado" },
    { id: "RF-05", texto: "Agendamento de visita com horários livres por imóvel", status: "Implementado" },
    { id: "RF-06", texto: "Lembrete e confirmação/remarcação/cancelamento de visita", status: "Implementado" },
    { id: "RF-07", texto: "Acompanhamento único do lead e situação \"sem resposta\"", status: "Implementado" },
    { id: "RF-08", texto: "Painel de leads, visitas, imóveis e indicadores", status: "Implementado" },
    { id: "RF-09", texto: "Aviso ao corretor por WhatsApp quando chega um lead quente", status: "Não implementado" },
    { id: "RF-10", texto: "Integração com portais/CRM imobiliário e importação de catálogo", status: "Não implementado" },
    { id: "RF-11", texto: "Agenda individual por corretor", status: "Não implementado" },
    { id: "RF-12", texto: "Editor de catálogo por formulário (hoje: JSON validado + botão de disponibilidade)", status: "Parcial" },
  ],
  pendencias: [
    "Piloto com número real da WhatsApp Business Platform em pelo menos 1 imobiliária (hoje validado por simulação e pelo formato documentado da API).",
    "Modelo `lead_visita` aprovado pela Meta e testado.",
    "Aviso ao corretor por WhatsApp (modelo `lead_novo`) e agenda por corretor — o que mais pedem imobiliárias com equipe.",
    "Importação do catálogo (planilha/feed de portal) e editor por formulário.",
    "Validar com 3 imobiliárias se a regra de temperatura reflete a prioridade real da equipe.",
    "Revisão/pentest de segurança independente; contrato de suporte/hospedagem.",
  ],
  precos: { venda_unica: 2290, mensalidade: 189, implantacao: 690, personalizacao_hora: 150, racional: [] },
  site: {
    chave: "lead", icone: "home", titulo: "Robô para imobiliárias", resumo: "Qualifica o interessado, mostra imóveis reais e agenda a visita com lembrete.",
    tags: ["Leads", "Imóveis", "Visitas"], para: "Imobiliárias, corretores, loteadoras",
    roteiro: [
      { bot: "Olá! Bem-vindo à Casa Certa Imóveis. O que você procura?", ops: [{ t: "Quero alugar" }, { t: "Quero comprar" }] },
      { bot: "Que tipo de imóvel?", ops: [{ t: "Apartamento", set: { i: "apartamento" } }, { t: "Casa", set: { i: "casa" } }] },
      { bot: "Em qual bairro você quer morar?", ops: [{ t: "Centro", set: { b: "Centro" } }, { t: "Bela Vista", set: { b: "Bela Vista" } }] },
      { bot: "Qual faixa de valor cabe no seu bolso?", ops: [{ t: "R$ 1.500 a 3.000" }] },
      { bot: "Para quando você pretende fechar?", ops: [{ t: "Até 30 dias" }, { t: "Só pesquisando" }] },
      { bot: "Anotei! Encontrei 1 opção cadastrada para você:\n<b>Apartamento 2 quartos</b> · {b}\nR$ 2.100,00/mês", ops: [{ t: "Agendar visita" }] },
      { bot: "Qual dia e horário?", ops: [{ t: "Qui 08/10 · 14:00", set: { d: "Qui 08/10 às 14:00" } }, { t: "Sex 09/10 · 11:00", set: { d: "Sex 09/10 às 11:00" } }] },
      { bot: "Visita agendada: {d}. Vou te lembrar antes." },
      { nota: "no dia anterior…" },
      { bot: "Lembrete da sua visita: {d}. Você confirma presença?", ops: [{ t: "Confirmo" }, { t: "Remarcar" }] },
      { bot: "Presença confirmada! Até lá.", fim: true },
    ],
  },
  sales: {
    pagina: `# LeadZap — responda o interessado na hora e leve a visita agendada ao corretor

### Qualificação, imóveis certos, visita com lembrete e lead organizado — no WhatsApp.

O interessado chama, o corretor está numa visita, a resposta demora e ele fecha com outra imobiliária. Quando você responde, ainda precisa perguntar: comprar ou alugar? Qual bairro? Até quanto? Para quando?

O **LeadZap** faz essa primeira conversa por você, 24 horas por dia:

- **Perguntas certas**: finalidade, tipo, bairro, faixa de valor, quartos e prazo.
- **Imóveis do seu cadastro** que cabem no perfil (nunca inventa).
- **Visita agendada** em horários livres, com **lembrete e confirmação**.
- **Lead classificado** como quente, morno ou frio, com a regra à vista.
- **Corretor certo**: o do bairro, com menos leads em aberto.
- **Acompanhamento**: um follow-up com opções reais, depois \"sem resposta\" para a equipe decidir.
- **Painel** com leads, visitas, comparecimento e motivos de perda.

## O que muda no seu dia
- Todo lead chega com o **mesmo resumo**, sem refazer perguntas.
- Você vê primeiro os **quentes**.
- Menos visita marcada e esquecida: o cliente **confirma** antes.

## Como funciona
1. Cliente: \"Oi, vi o anúncio do apartamento\".
2. O robô qualifica, mostra os imóveis compatíveis e oferece a visita.
3. O lead aparece no painel, atribuído ao corretor do bairro.
4. Antes da visita, o cliente confirma, remarca ou cancela.

## Feito do jeito certo
Só fala dos imóveis cadastrados. API **oficial** do WhatsApp, LGPD (opt-out e exclusão por cliente), painel com login e testes automatizados.

## Seja sincero com a sua operação
Não integra com portais/CRM nesta versão, não envia fotos (envia o link que você cadastrar), não simula financiamento e o corretor consulta o painel (ainda não recebe aviso no WhatsApp). Veja [FEATURES.md](FEATURES.md).

## Quanto custa
Veja [PRECIFICACAO.md](PRECIFICACAO.md).

**Quer ver o seu catálogo rodando em 15 minutos? Peça uma demonstração.**
`,
    pitch: `# Pitch — LeadZap

## 15 segundos
\"Eu coloco um robô no WhatsApp da sua imobiliária que responde na hora, mostra os imóveis do seu cadastro que cabem no cliente e já agenda a visita com confirmação.\"

## 1 minuto
\"Quem responde primeiro leva o cliente. Mas o corretor nem sempre pode atender na hora, e cada um pergunta uma coisa diferente.
O LeadZap faz as perguntas essenciais — comprar ou alugar, bairro, faixa, quartos, prazo — mostra só imóveis que você cadastrou, agenda a visita em horário livre e lembra o cliente antes. O lead vai para o painel classificado e atribuído ao corretor do bairro. Não inventa imóvel e não negocia: quem fecha é a sua equipe.\"

## 3 minutos
1. **Descoberta:** \"De onde vêm seus leads? Quanto demora o primeiro retorno? Quantas visitas marcadas não acontecem? Como acompanha quem sumiu?\"
2. **Conta (ilustrativa):** \"Se um negócio fechado rende R$ ___ de comissão e o robô ajudar a fechar UM a mais por trimestre, a mensalidade de R$ 189 se paga várias vezes.\" (use números dele; não prometa percentual.)
3. **Demo:** CONVERSAS.md (qualificação + visita + lembrete) e o painel fictício (leads quentes, visitas).
4. **Honestidade:** \"Sem integração com portais/CRM ainda; o corretor consulta o painel.\"
5. **Próximo passo:** cadastrar 10 imóveis dele e testar com o número dele por 1 semana.

## Mensagem de primeiro contato
> Oi, [Nome]! Eu monto um robô para WhatsApp de imobiliária: responde o interessado na hora, mostra os imóveis cadastrados que cabem no perfil e agenda a visita com lembrete. Posso te mostrar em 10 min com 5 imóveis da [Imobiliária]?

## Qualificação
- Número de leads por semana e canais de origem.
- Tempo médio do primeiro retorno.
- Equipe: quantos corretores, quem atende cada região?
- Já usa CRM? Qual? Quanto paga?
`,
    features: `# Funcionalidades e benefícios — LeadZap

| Funcionalidade | Benefício |
|---|---|
| Qualificação por botões e listas | Lead completo em poucos toques |
| Imóveis só do cadastro | Zero imóvel inventado |
| Temperatura por regra à vista | Fila priorizada, com critério claro |
| Roteamento por bairro e carga | Corretor certo, trabalho distribuído |
| Agendamento por imóvel e horário | Sem duas visitas no mesmo horário |
| Lembrete e confirmação | Menos visita esquecida |
| Remarcar/cancelar pelo WhatsApp | Agenda sempre atualizada |
| Acompanhamento único do lead | Retoma sem insistir |
| Painel de leads e visitas | Tudo em um lugar, sem planilha |
| Indicadores (comparecimento, perdas) | Aprende onde perde negócio |
| Imóvel vendido/alugado em um clique | Cliente não vê o que acabou |
| FAQ + corretor humano | Cliente nunca fica preso |
| API oficial, LGPD | Segurança e propriedade dos dados |

## Em evolução (não está nesta versão)
Aviso ao corretor por WhatsApp, agenda individual por corretor, integração com portais e CRMs, importação de catálogo, simulação de financiamento.
`,
    objecoes: `# Objeções — LeadZap

**1. \"Já uso um CRM imobiliário.\"**
Ótimo. O LeadZap cuida do primeiro atendimento no WhatsApp e da visita. Se o seu CRM tem API, a integração é um serviço por hora; hoje o painel funciona sozinho.

**2. \"Cliente de imóvel quer falar com gente.\"**
Quer — na hora certa. O robô responde de madrugada e no horário de pico; o corretor entra quando o cliente já está qualificado. A qualquer momento ele digita CORRETOR.

**3. \"Tenho muitos imóveis.\"**
O catálogo aceita até 300. Importação por planilha/feed está no roteiro.

**4. \"E se o robô mostrar imóvel que já vendi?\"**
Marque como indisponível no painel (um clique) e ele para de oferecer na hora.

**5. \"Meus corretores são autônomos.\"**
O roteamento é por bairro e carga, e você pode trocar o corretor no painel. Cada um consulta seus leads filtrando pelo nome.

**6. \"O corretor não é avisado no WhatsApp?\"**
Nesta versão, não: ele consulta o painel. Aviso ao corretor é a principal evolução prevista.

**7. \"Cliente nunca confirma visita.\"**
O lembrete com três botões (Confirmo, Remarcar, Cancelar) facilita a resposta. Você vê o status e o comparecimento no painel — sem prometer percentual.

**8. \"O WhatsApp bloqueia?\"**
Usa a API oficial, sem envio em massa. Lembretes e acompanhamentos fora da janela de 24 h exigem modelo aprovado (cobrado pela Meta por mensagem).

**9. \"Meus clientes vão achar chato.\"**
São 5 a 6 toques. O acompanhamento é único e quem pede para parar não recebe mais.

**10. \"E os dados dos clientes?\"**
Ficam no seu servidor. Há opt-out, exclusão por cliente e retenção configurável.
`,
    faq: `# Perguntas frequentes — LeadZap

**Preciso de aplicativo?** Não. O cliente usa o WhatsApp; a equipe usa o painel no navegador.

**O robô negocia preço?** Não. Mostra o valor cadastrado e chama o corretor para negociar.

**De onde vêm os imóveis?** Do catálogo que você cadastra (até 300). O robô nunca fala de imóvel fora dele.

**Mostra fotos?** Mostra o link (https) que você cadastrar para cada imóvel.

**Como é definido lead quente?** Por pontos: prazo curto, imóvel compatível, quartos informados, interesse e visita. A tabela está em docs/FLUXOS.md.

**Como é escolhido o corretor?** O que atende o bairro com menos leads em aberto; você pode trocar no painel.

**O corretor recebe aviso no WhatsApp?** Ainda não; ele consulta o painel.

**Como funciona a visita?** O cliente escolhe um dia e horário livres daquele imóvel. Antes, recebe lembrete com Confirmo, Remarcar e Cancelar.

**E se dois clientes querem o mesmo horário?** Só um consegue: o horário é reservado por imóvel.

**O que acontece com quem não responde?** Um acompanhamento; depois de alguns dias o lead vira \"sem resposta\" e volta à fila se o cliente escrever.

**Funciona fora do horário comercial?** Sim, a qualificação e o agendamento são 24 h; o atendimento humano depende da sua equipe.

**Atende várias imobiliárias?** O sistema é multiempresa; cada empresa tem número, catálogo e painel isolados.
`,
    demo: `# Roteiro de demonstração — LeadZap (15 minutos)

## Antes
1. \`node robots/robot-005-leadzap/demo/servidor-demo.ts\` → http://localhost:3100/admin (chave \`demo-demo-demo-1234\`), já com leads, uma visita e imóveis.
2. Abra \`demo/CONVERSAS.md\`.
3. Descubra: origem dos leads, tempo de resposta, nº de corretores, visitas que não acontecem.

## Roteiro
**1. (2 min) A dor.** \"O que acontece quando chega lead fora do horário? E quando o corretor está em visita?\"

**2. (4 min) A conversa do cliente.** Conversa 1: alugar → apartamento → bairro → faixa → quartos → prazo → imóvel → visita.

**3. (3 min) O painel.** **Leads** (quentes primeiro, corretor atribuído), abra um lead e mostre o resumo; **Visitas** e **Imóveis** (marcar indisponível).

**4. (2 min) Lembrete e confirmação.** Mostre o lembrete e o \"Confirmo\" (conversa 1b).

**5. (2 min) Limites e segurança.** Conversa 3 (bairro fora da área, perfil sem imóvel) e 4 (corretor). Diga: \"o robô só fala do cadastro\".

**6. (2 min) Números e próximo passo.** Início (leads, quentes, comparecimento, perdas). Proposta (PRECIFICACAO.md): implantação + 1 semana de piloto.

## Cuidados
- Diga que os dados são fictícios.
- Seja claro sobre limites (sem portal/CRM, sem aviso ao corretor, sem fotos).
- Não prometa aumento de vendas.
`,
    precificacao: `# Precificação sugerida — LeadZap

> **Sugestões para validar no mercado.** As referências de concorrentes divergem muito em data e escopo; **cote 3 CRMs/assistentes imobiliários** na sua região antes de fixar.

| Modelo | Valor sugerido | O que inclui |
|---|---|---|
| **Implantação** | R$ 690 (única) | Número na Meta, cadastro de tipos, bairros, faixas, corretores e até 20 imóveis, FAQ, modelo \`lead_visita\`, treinamento (1 h) |
| **Mensalidade** (suporte + hospedagem) | R$ 189/mês | Servidor, backup, atualizações, suporte em horário comercial, ajustes simples no catálogo |
| **Venda única** (cliente hospeda) | R$ 2.290 | Pacote + implantação básica; suporte como contrato à parte |
| **Personalização** | R$ 150/hora | Aviso ao corretor, importação de catálogo, integrações com CRM, novos fluxos |

## Como cheguei a esses números
1. **Posição:** acima do PedidoZap por mais regras (roteamento, agenda de visitas, acompanhamento) e porque o valor de um negócio imobiliário é alto em relação à mensalidade.
2. **Retorno (ilustrativo):** compare a mensalidade com a **comissão média** de um negócio fechado pelo cliente. Se o robô ajudar a fechar UM negócio a mais por período, a mensalidade se paga. Use números do cliente; não prometa percentual.
3. **Implantação com catálogo:** cadastrar imóveis é trabalho real; acima de 20 imóveis, cobre por hora ou ensine a equipe.
4. **Custos da Meta:** respostas na janela de 24 h costumam ser gratuitas; lembretes e acompanhamentos fora dela são cobrados por mensagem. Confirme a tabela oficial.
5. **Seu custo:** servidor pequeno + suporte (~1–2 h/mês por cliente).

## Como apresentar
- Piloto de 1 semana com 5 a 10 imóveis reais e o número do corretor-chefe.
- Mostre no painel quantos leads chegaram completos e quantas visitas foram confirmadas.
- Posicione como **complemento** ao CRM, não substituto.

## Validar antes de fixar
- [ ] Cotar 3 CRMs/assistentes imobiliários por WhatsApp.
- [ ] Perguntar a 3 imobiliárias quanto pagariam e quantos leads recebem por semana.
- [ ] Medir seu tempo de implantação do 1º cliente e ajustar o preço.
`,
  },
};
