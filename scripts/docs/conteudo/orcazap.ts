import type { RobotDoc } from "../tipos.ts";

export const orcazap: RobotDoc = {
  id: "robot-004-orcazap",
  nome: "OrcaZap",
  slogan: "O cliente manda o problema com fotos e você responde com o orçamento — tudo organizado no WhatsApp.",
  versao: "1.0.0",
  status: "PRONTO",
  segmentos: ["Pintores e reformas", "Eletricistas e encanadores", "Gesso, forro e marcenaria", "Instalação de ar-condicionado", "Dedetização e limpeza pós-obra"],
  publico: "Prestadores de serviço e pequenas empresas que **orçam pelo WhatsApp**: hoje trocam dezenas de mensagens para entender o serviço, pedem foto, esquecem de responder e perdem o cliente para quem respondeu primeiro.",
  problema: "Para orçar, o prestador precisa de serviço, local, fotos e urgência. Colher isso por conversa solta é lento, o orçamento atrasa e o acompanhamento (\"e aí, fechamos?\") é esquecido. A evidência vem de conteúdo de fornecedores de software e de um caso oficial de qualificação por formulário em uma construtora de médio porte; **não é pesquisa de campo** — valide com 5 prestadores antes de investir.",
  resumo: "O **OrcaZap** conduz o cliente por um pedido de orçamento completo: escolhe o serviço, descreve o que precisa, **envia fotos**, informa bairro, endereço e período preferido para visita. A equipe recebe tudo num **quadro de orçamentos** (fotos, descrição, local), digita o valor e o prazo, e o cliente recebe a **proposta no WhatsApp com botões Aceitar, Recusar e Tenho dúvida**. Se ele não responde, o robô faz **um** lembrete e, passada a validade, encerra a proposta. **O robô nunca calcula nem informa preço**: o valor é sempre digitado por uma pessoa.",
  oportunidades: [21],
  potencial: "Médio",
  como_funciona: [
    "O cliente escreve \"oi\" e toca em **Pedir orçamento**.",
    "Escolhe o serviço (pintura, elétrica, hidráulica…) e descreve o que precisa.",
    "Envia até 4 fotos (configurável). O robô confere se o arquivo é mesmo uma imagem JPEG, PNG ou WebP de até 5 MB.",
    "Informa o bairro (validado contra as regiões atendidas), o endereço e o período preferido para uma visita.",
    "Confere o resumo e envia. Recebe o número do pedido (#1, #2…).",
    "A equipe abre o pedido no painel, vê as fotos, informa **valor, prazo e observação** e clica em **Enviar ao cliente**.",
    "O cliente recebe a proposta com botões. **Aceitar** avisa a equipe; **Recusar** pergunta o motivo; **Tenho dúvida** chama uma pessoa.",
    "Sem resposta após o prazo configurado (padrão 24 h), o robô lembra **uma vez**. Passada a validade (padrão 7 dias), a proposta vence e o cliente é avisado uma vez.",
  ],
  funcionalidades: [
    { titulo: "Pedido guiado por serviço", descricao: "Lista de serviços da empresa, descrição obrigatória e período preferido para visita." },
    { titulo: "Recebimento de fotos", descricao: "Até 4 fotos por pedido (1 a 6), com conferência do tipo real do arquivo e limite de 5 MB." },
    { titulo: "Regiões atendidas", descricao: "Bairro validado contra a lista cadastrada; fora da área, o robô explica e oferece atendente." },
    { titulo: "Quadro de orçamentos", descricao: "Colunas Novos, Em análise, Aguardando resposta e Aceitos, com fotos e dados do cliente numa página." },
    { titulo: "Proposta pelo WhatsApp", descricao: "Valor, prazo, observação e validade enviados com botões Aceitar, Recusar e Tenho dúvida." },
    { titulo: "Preço só humano", descricao: "O robô não calcula, estima nem cita valores: quem digita o valor é a equipe." },
    { titulo: "Acompanhamento automático", descricao: "Um lembrete após o prazo e aviso de vencimento; nada de insistência em sequência." },
    { titulo: "Motivo da recusa", descricao: "Pergunta (opcional) por que o cliente recusou e mostra no resumo para ajustar preço e prazo." },
    { titulo: "Meu orçamento", descricao: "O cliente consulta a situação do último pedido e responde à proposta a qualquer momento." },
    { titulo: "Indicadores", descricao: "Novos esperando, propostas abertas, valor aceito, taxa de aceite e tempo até enviar a proposta." },
    { titulo: "LGPD para fotos", descricao: "Fotos privadas (acesso só pelo painel), apagadas junto com o cliente, se o pedido for cancelado ou pela política de retenção." },
    { titulo: "Dúvidas e atendente", descricao: "FAQ cadastrado (serviços, regiões, garantia); fora da base, chama uma pessoa." },
  ],
  limites: [
    "**Não calcula preço** (de propósito): sem tabela de preços por m², o robô só coleta e organiza.",
    "Não faz análise automática das fotos: quem avalia é a equipe.",
    "Não agenda a visita técnica: registra o período preferido e a equipe combina (agenda integrada é evolução).",
    "Fotos ficam no disco do servidor (pasta MEDIA_DIR): é preciso incluí-la no backup; vídeos e documentos não são aceitos.",
    "Aceite do cliente por WhatsApp **não substitui contrato**: formalize prazo, material e pagamento como você já faz.",
    "Fora da janela de 24 h, a proposta e os lembretes só saem com **modelo aprovado pela Meta**.",
    "Cadastro de serviços e regiões é por Configurações (JSON validado).",
  ],
  diferenciais: [
    "Pedido **completo na primeira conversa**: serviço, descrição, fotos, local e período.",
    "Proposta com **botões**: aceitar ou recusar em um toque, com acompanhamento e validade.",
    "Preço **sempre humano**: nenhuma estimativa inventada pelo robô.",
    "Funciona **sem CRM**: o quadro de orçamentos já é o controle.",
    "API oficial do WhatsApp, fotos protegidas e exclusão de dados por cliente (LGPD).",
  ],
  config_campos: [
    { campo: "empresa.*", descricao: "Nome, endereço, telefone, horário (texto) e condições de pagamento (texto)", exemplo: "\"Reforma Fácil Serviços\"" },
    { campo: "servicos[].id / nome / exige_visita", descricao: "Serviços oferecidos (até 20). `nome` até 24 caracteres. `exige_visita=true` avisa o cliente de que o valor final pode depender de avaliação presencial.", exemplo: "{ \"id\": \"pintura\", \"nome\": \"Pintura\", \"exige_visita\": true }" },
    { campo: "atendimento.bairros", descricao: "Regiões atendidas. Lista vazia = aceita qualquer bairro (o cliente digita).", exemplo: "[\"Centro\", \"Vila Nova\"]" },
    { campo: "atendimento.max_fotos", descricao: "Fotos por pedido (1 a 6)", exemplo: "4" },
    { campo: "atendimento.validade_dias", descricao: "Dias de validade da proposta (1 a 90)", exemplo: "7" },
    { campo: "atendimento.followup_horas", descricao: "Horas sem resposta até o lembrete único (2 a 240)", exemplo: "24" },
    { campo: "atendimento.pedir_endereco", descricao: "Pede o endereço completo além do bairro", exemplo: "true" },
    { campo: "template.nome / idioma", descricao: "Modelo aprovado na Meta para propostas e lembretes fora da janela de 24 h", exemplo: "\"orcamento_proposta\", \"pt_BR\"" },
    { campo: "faq[] e mensagens.*", descricao: "Perguntas/respostas e textos opcionais (boas_vindas, handoff)", exemplo: "\"Sim, damos garantia...\"" },
  ],
  templates: [{
    nome: "orcamento_proposta", categoria: "UTILITY (utilidade)", parametros: ["primeiro nome do cliente", "número do orçamento", "texto da proposta (o robô monta)", "nome da empresa"],
    corpo: "Olá {{1}}! Sobre o seu orçamento #{{2}}: {{3}} — {{4}}",
    quando: "Usado quando a equipe envia a proposta (ou o robô faz o lembrete/aviso de vencimento) e o cliente não escreveu nas últimas 24 horas.",
  }],
  dados: [
    { dado: "Nome e telefone", finalidade: "Identificar o cliente e responder ao pedido", base_legal: "Execução de contrato (procedimentos preliminares)" },
    { dado: "Descrição do serviço, bairro e endereço", finalidade: "Avaliar e orçar o serviço; agendar visita", base_legal: "Execução de contrato (procedimentos preliminares)" },
    { dado: "Fotos enviadas pelo cliente", finalidade: "Avaliar o serviço sem visita inicial. Podem mostrar o interior da casa: ficam privadas e são apagadas por solicitação, no cancelamento do pedido ou pela retenção.", base_legal: "Execução de contrato (procedimentos preliminares)", retencao: "Fotos de pedidos não concluídos: 2 dias. Orçamentos encerrados: conforme RETENTION_DAYS." },
    { dado: "Valor, prazo e resposta à proposta (aceite/recusa/motivo)", finalidade: "Controle comercial e melhoria do atendimento", base_legal: "Execução de contrato / legítimo interesse" },
  ],
  tabelas: [
    { nome: "quotes", descricao: "Orçamentos (número sequencial por empresa, serviço, descrição, local, período, situação, valor, prazo, validade, lembrete, motivo de recusa)." },
    { nome: "quote_photos", descricao: "Fotos de cada pedido (nome do arquivo aleatório, tipo e tamanho). O arquivo fica em MEDIA_DIR; sem vínculo, é apagado em 2 dias." },
  ],
  arquivos: [
    { caminho: "src/index.ts", descricao: "Ponto de entrada" },
    { caminho: "src/robot.ts", descricao: "Define o robô, as páginas do painel, a limpeza de fotos e a exclusão LGPD" },
    { caminho: "src/settings.ts", descricao: "Esquema/validação de serviços e regras; base de conhecimento" },
    { caminho: "src/flow.ts", descricao: "Conversa: pedido, fotos, proposta, aceite/recusa, meu orçamento" },
    { caminho: "src/store.ts", descricao: "Criação atômica do orçamento (numeração + vínculo das fotos) e situações" },
    { caminho: "src/notify.ts", descricao: "Texto e envio da proposta, lembrete e aviso de vencimento" },
    { caminho: "src/followup.ts", descricao: "Acompanhamento automático (lembrete único e vencimento)" },
    { caminho: "src/admin.ts", descricao: "Quadro de orçamentos, detalhe com fotos, envio da proposta, histórico e indicadores" },
    { caminho: "src/migrations.ts", descricao: "Tabelas do robô" },
    { caminho: "tests/orca.test.ts", descricao: "Testes automatizados" },
  ],
  painel: [
    { pagina: "orcamentos", para_que: "Quadro com os pedidos por situação; abrir um pedido mostra as fotos e o formulário da proposta" },
    { pagina: "historico", para_que: "Últimos 100 orçamentos com valor e situação" },
  ],
  manual: {
    cadastrar_info: "Em **Configurações** (ou `config/empresa.json`) preencha `empresa`, os `servicos` que você realiza, as regiões em `atendimento.bairros` e as respostas em `faq` (garantia, formas de pagamento, prazo de visita). Mantenha as respostas curtas e verdadeiras: o robô só repete o que estiver cadastrado.",
    alterar_servicos: "Edite a lista `servicos` (id sem acento/espaço, nome até 24 caracteres). Marque `exige_visita: true` para serviços em que o valor final depende de avaliação no local; o cliente é avisado no resumo.",
    alterar_precos: "O robô **não tem tabela de preços**: o valor é digitado por você em cada proposta (painel > Orçamentos > abrir o pedido). Para mudar validade e prazo do lembrete, edite `atendimento.validade_dias` e `atendimento.followup_horas`.",
    mensagens: "No bloco `mensagens`: `boas_vindas` e `handoff`. A proposta, o lembrete e o aviso de vencimento são padronizados; fora da janela de 24 h usam o **modelo aprovado na Meta** (`orcamento_proposta`).",
    problemas: [
      { sintoma: "A proposta não foi enviada e o painel mostra erro", causa: "O cliente não fala com a empresa há mais de 24 h e não há modelo aprovado cadastrado", solucao: "Cadastre `template.nome` (INSTALACAO, passo 8) ou peça ao cliente para escrever." },
      { sintoma: "A foto do cliente não aparece", causa: "Arquivo não é JPEG/PNG/WebP, passou de 5 MB ou o download da Meta falhou", solucao: "O robô avisa o cliente na hora. Peça para reenviar como foto (não como documento)." },
      { sintoma: "Fotos sumiram depois de restaurar o servidor", causa: "A pasta MEDIA_DIR não estava no backup", solucao: "Inclua MEDIA_DIR (padrão ./data/media) junto com o banco nos backups." },
      { sintoma: "Cliente diz que o bairro dele é atendido, mas o robô recusa", causa: "Bairro fora de `atendimento.bairros` ou escrito diferente", solucao: "Cadastre o bairro ou deixe a lista vazia para aceitar qualquer região." },
      { sintoma: "Cliente aceitou, mas ninguém viu", causa: "Aceite aparece no quadro (coluna Aceitos) e nos indicadores, mas não dispara alerta externo", solucao: "Deixe o quadro aberto (atualiza sozinho) e combine a rotina de checar Aceitos." },
    ],
  },
  cliente: {
    rotina: [
      "Abra o **Quadro de orçamentos** no começo do dia e em intervalos curtos (a página atualiza sozinha).",
      "Em cada pedido **Novo**, veja as fotos, clique em **Marcar em análise** se precisar de tempo, ou já preencha **valor, prazo e observação** e envie.",
      "Se faltar informação, abra a conversa pelo botão do pedido e peça ao cliente (o robô se cala enquanto você atende).",
      "Acompanhe a coluna **Aguardando resposta** e os **Aceitos**; combine a data com quem aceitou.",
      "Olhe os **motivos de recusa** no Início para ajustar preço, prazo e forma de apresentar a proposta.",
    ],
    regras_de_ouro: [
      "Responda o pedido o quanto antes: velocidade é o que mais pesa na escolha do cliente.",
      "Escreva o que está incluso (material, mão de obra, prazo) na observação da proposta.",
      "O aceite no WhatsApp não é contrato: formalize como você já faz.",
      "Nunca peça dados sensíveis ou fotos de documentos por esta conversa.",
    ],
  },
  fluxos: `# Fluxos de conversa — OrcaZap

As conversas reais (geradas pelo robô) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md).

## Mapa de estados

\`\`\`
inicio ─(pedir orçamento)─► servico ─► descricao ─► fotos ─► bairro ─► [endereco] ─► periodo ─► [nome] ─► confirmar ─► ORÇAMENTO CRIADO ─► inicio
   │                                                                                    └─(cancelar)─► apaga as fotos
   ├─(meu orçamento)─► situação do último pedido (se "enviado": botões Aceitar/Recusar/Dúvida)
   ├─(botão da proposta)─► aceitar | recusar ─► motivo (opcional) | dúvida ─► MODO HUMANO
   ├─(dúvida)─► FAQ ─► se não souber: MODO HUMANO
   └─(atendente / erro)─► MODO HUMANO
\`\`\`

\`[ ]\` = etapa pulada quando não se aplica (endereço desligado em \`atendimento.pedir_endereco\`; nome já conhecido).

## Ciclo do orçamento

\`novo → em_analise → enviado → aceito | recusado | expirado\` · \`cancelado\` antes de encerrar.

## Regras aplicadas no servidor
- Foto: tipo conferido pelos bytes (JPEG, PNG ou WebP), até 5 MB, limite por pedido (\`max_fotos\`), nome de arquivo aleatório, acesso só pelo painel autenticado.
- Várias fotos enviadas ao mesmo tempo: o limite é conferido de novo depois do download.
- Fotos de pedido não concluído são apagadas em 2 dias; ao cancelar na confirmação, na hora.
- A resposta à proposta só vale para o **dono** do orçamento e enquanto a situação for "enviado" e a validade não tiver passado.
- O valor vem **somente** do painel (digitado por uma pessoa). O robô não faz estimativa.
- Lembrete: **1 vez**, depois de \`followup_horas\`, e nunca para quem está em atendimento humano ou pediu para parar. Ao vencer a validade o orçamento passa a "expirado" e o cliente é avisado 1 vez.
- Fora da janela de 24 h: só modelo aprovado; sem modelo, a mensagem não é enviada (e o painel avisa).

## Fluxo de dúvida
FAQ → resposta. Sem resposta → "Não tenho essa informação no momento. Vou encaminhar você para um atendente."

## Fluxo de erro
Arquivo que não é foto · foto grande demais · falha ao baixar · bairro fora da área · descrição curta demais · proposta vencida · resposta a orçamento de outro cliente · erro interno (pede desculpas e chama atendente).

## Transferência para humano
Palavra *atendente*, "Tenho dúvida" na proposta, pergunta sem resposta, erro interno. No modo humano o robô se cala; volta ao ser devolvido ou após 12 h.
`,
  requisitos: [
    { id: "RF-01", texto: "Pedido de orçamento guiado (serviço, descrição, local, período)", status: "Implementado" },
    { id: "RF-02", texto: "Recebimento e validação de fotos, com armazenamento privado", status: "Implementado" },
    { id: "RF-03", texto: "Quadro de orçamentos com fotos e dados do cliente", status: "Implementado" },
    { id: "RF-04", texto: "Proposta com valor, prazo, observação e validade enviada pelo WhatsApp", status: "Implementado" },
    { id: "RF-05", texto: "Aceite, recusa (com motivo) e dúvida pelo cliente", status: "Implementado" },
    { id: "RF-06", texto: "Lembrete único e vencimento automático", status: "Implementado" },
    { id: "RF-07", texto: "Indicadores: taxa de aceite, tempo até a proposta, valor aceito", status: "Implementado" },
    { id: "RF-08", texto: "Exclusão LGPD com remoção dos arquivos de foto; limpeza por retenção", status: "Implementado" },
    { id: "RF-09", texto: "Agendamento da visita técnica integrado", status: "Não implementado" },
    { id: "RF-10", texto: "Perguntas específicas por tipo de serviço (ex.: metragem da parede)", status: "Parcial" },
    { id: "RF-11", texto: "Geração de PDF da proposta e assinatura", status: "Não implementado" },
  ],
  pendencias: [
    "Piloto com número real da WhatsApp Business Platform em pelo menos 1 prestador (hoje validado por simulação e pelo formato documentado da API, incluindo o download de mídia).",
    "Modelo `orcamento_proposta` aprovado pela Meta e testado.",
    "Perguntas por tipo de serviço (metragem, material, andar) — o que mais ajuda a orçar sem visita.",
    "Validar com 5 prestadores se a taxa de resposta/fechamento melhora (a evidência atual vem de conteúdo de fornecedores).",
    "Revisão/pentest de segurança independente (upload de arquivos); contrato de suporte/hospedagem.",
  ],
  precos: { venda_unica: 1790, mensalidade: 139, implantacao: 490, personalizacao_hora: 150, racional: [] },
  site: {
    chave: "orca", icone: "clipboard", titulo: "Robô para orçamento", resumo: "Pedido de orçamento com fotos, proposta com botões e lembrete único.",
    tags: ["Fotos", "Proposta", "Acompanhamento"], para: "Pintores, eletricistas, reformas, ar-condicionado",
    roteiro: [
      { bot: "Olá! Aqui é a Reforma Fácil. Posso receber o seu pedido de orçamento com fotos.", ops: [{ t: "Pedir orçamento" }] },
      { bot: "Qual serviço você precisa?", ops: [{ t: "Pintura", set: { s: "Pintura" } }, { t: "Elétrica", set: { s: "Elétrica" } }] },
      { bot: "Descreva o que precisa ser feito. Quanto mais detalhes, mais preciso o orçamento.", ops: [{ t: "Pintar sala e 2 quartos" }] },
      { bot: "Agora envie fotos do local (até 4).", ops: [{ t: "Enviar 2 fotos" }] },
      { bot: "Foto 2 de 4 recebida. Em qual bairro fica o serviço?", ops: [{ t: "Centro", set: { b: "Centro" } }, { t: "Vila Nova", set: { b: "Vila Nova" } }] },
      { bot: "Confira: {s}, 2 fotos, bairro {b}. Posso enviar o pedido para a equipe?", ops: [{ t: "Enviar pedido" }] },
      { bot: "Pedido de orçamento #1 recebido! A equipe vai analisar as fotos e responder por aqui." },
      { nota: "a equipe analisa e informa o valor…" },
      { bot: "Orçamento #1 — {s}\nValor: R$ 2.850,00\nPrazo: 5 dias úteis\nVálido até 14/10.", ops: [{ t: "Aceitar" }, { t: "Recusar" }] },
      { bot: "Combinado! A equipe vai falar com você para marcar a data.", fim: true },
    ],
  },
  sales: {
    pagina: `# OrcaZap — receba o pedido de orçamento completo, com fotos, no WhatsApp

### Menos conversa solta, mais orçamento enviado — e o cliente aceita com um toque.

Quem orça pelo WhatsApp conhece o ciclo: o cliente manda \"quanto custa pintar?\", você pergunta o endereço, pede foto, pergunta de novo o que ele quer… e quando você responde, ele já fechou com outro.

O **OrcaZap** faz a primeira parte da conversa por você:

- **Pedido guiado**: serviço, descrição, bairro, endereço e período para visita.
- **Fotos** do local ou do problema, recebidas e guardadas com segurança.
- **Quadro de orçamentos** com tudo numa tela: você olha, calcula e digita o valor.
- **Proposta pelo WhatsApp** com botões Aceitar, Recusar e Tenho dúvida.
- **Acompanhamento**: um lembrete educado se o cliente não responde e vencimento automático.
- **Motivo da recusa** para você ajustar preço e prazo.

## O que muda no seu dia
- Você recebe o pedido **já completo**, com fotos.
- Responde mais rápido e **não esquece** de acompanhar quem ficou de pensar.
- Sabe quanto está **aceito**, quanto está **em aberto** e por que recusam.

## Como funciona
1. Cliente: \"Oi, quero um orçamento de pintura\".
2. O robô pergunta o que precisa, recebe as fotos e o endereço.
3. Você abre o pedido, informa o valor e o prazo e clica em **Enviar ao cliente**.
4. O cliente aceita ou recusa em um toque.

## Feito do jeito certo
O robô **nunca inventa preço**: quem digita o valor é você. API **oficial** do WhatsApp, fotos privadas (só você vê no painel), exclusão de dados por cliente e testes automatizados.

## Seja sincero com a sua operação
Não faz análise automática das fotos, não agenda a visita técnica sozinho e o aceite por WhatsApp não substitui contrato. Veja [FEATURES.md](FEATURES.md).

## Quanto custa
Veja [PRECIFICACAO.md](PRECIFICACAO.md).

**Quer ver o seu serviço rodando em 15 minutos? Peça uma demonstração.**
`,
    pitch: `# Pitch — OrcaZap

## 15 segundos
\"Eu organizo o pedido de orçamento do seu WhatsApp: o cliente manda serviço, fotos e endereço, você só digita o valor e ele aceita com um toque.\"

## 1 minuto
\"Quem demora para responder o orçamento perde o serviço. O problema é que, para orçar, você precisa de várias informações e fotos, e isso vira muita conversa.
O OrcaZap pede tudo isso ao cliente de forma guiada, junta num quadro com as fotos, e você responde com o valor. A proposta vai com botões de aceitar ou recusar e, se o cliente some, o robô lembra uma vez. Não calcula preço, não inventa nada: o valor é seu.\"

## 3 minutos
1. **Descoberta:** \"Quantos orçamentos por semana? Quantos você fecha? Quanto tempo leva para responder? Onde você anota hoje?\"
2. **Conta (ilustrativa):** \"Se um serviço médio rende R$ ___ e o robô ajudar a fechar mais ___ por mês, a mensalidade de R$ 139 se paga com um único serviço.\" (use números dele; não prometa percentual.)
3. **Demo:** CONVERSAS.md (pedido com fotos e proposta) + painel fictício.
4. **Honestidade:** \"Não analisa as fotos nem agenda a visita sozinho; o aceite não substitui contrato.\"
5. **Próximo passo:** configurar os serviços dele e testar com o número dele por 1 semana.

## Mensagem de primeiro contato
> Oi, [Nome]! Eu monto um sistema que recebe o pedido de orçamento pelo WhatsApp já com fotos, endereço e o que o cliente precisa — e você só responde com o valor. Posso te mostrar em 10 min com os serviços da [Empresa]?

## Qualificação
- Orçamentos por semana e taxa de fechamento (estimada por ele).
- Tempo médio para responder um orçamento.
- Precisa de visita para orçar? Em quais serviços?
- Quem responde hoje? Usa planilha, caderno ou CRM?
`,
    features: `# Funcionalidades e benefícios — OrcaZap

| Funcionalidade | Benefício |
|---|---|
| Pedido guiado por serviço | Chega completo, sem ficar perguntando |
| Recebimento de fotos (JPEG, PNG, WebP) | Avalia o serviço antes de ir ao local |
| Regiões atendidas | Não perde tempo com quem está fora da área |
| Quadro de orçamentos | Tudo em uma tela, nada se perde |
| Proposta com botões | Cliente aceita ou recusa em um toque |
| Preço sempre digitado pela equipe | Zero estimativa inventada pelo robô |
| Lembrete único e vencimento | Acompanhamento sem insistência |
| Motivo da recusa | Aprende o que ajustar |
| Meu orçamento | Menos \"e aí, deu certo?\" |
| Indicadores (aceite, valor, tempo) | Decisão com dados |
| Fotos privadas e exclusão LGPD | Segurança e respeito ao cliente |
| FAQ + atendente | Cliente nunca fica preso |

## Em evolução (não está nesta versão)
Agenda de visita técnica, perguntas específicas por tipo de serviço, PDF da proposta, assinatura, integração com sistemas de gestão.
`,
    objecoes: `# Objeções — OrcaZap

**1. \"Meu cliente prefere conversar.\"**
Em qualquer momento ele digita ATENDENTE e uma pessoa assume. O robô só cuida da coleta inicial.

**2. \"Cada serviço é diferente, não dá para padronizar.\"**
O pedido pede serviço, descrição livre e fotos — o que você precisa para orçar em qualquer caso. Perguntas específicas por tipo de serviço podem ser contratadas por hora.

**3. \"Já uso GetNinjas ou outro app.\"**
Ótimo para captar clientes novos. O OrcaZap cuida de quem já chama você no WhatsApp e do acompanhamento do orçamento. Não há comissão por serviço fechado.

**4. \"E se o robô passar preço errado?\"**
Ele não passa preço. O valor é digitado por você em cada proposta.

**5. \"As fotos ficam seguras?\"**
Ficam em pasta privada do servidor, só abrem pelo painel com login, e são apagadas junto com o cliente (LGPD) ou pela política de retenção.

**6. \"O cliente não manda foto.\"**
Dá para pular a etapa; mas quem manda foto costuma receber o orçamento mais rápido.

**7. \"E o contrato?\"**
O aceite por botão é um registro da intenção. Formalize como você já faz.

**8. \"É difícil de usar?\"**
O dia a dia é abrir o quadro, ver as fotos e digitar o valor.

**9. \"O WhatsApp bloqueia?\"**
Usa a API oficial, sem envio em massa. Propostas fora da janela de 24 h exigem modelo aprovado (cobrado pela Meta por mensagem).

**10. \"Funciona se a internet cair?\"**
Se o servidor ficar fora, o WhatsApp reenvia mensagens por um tempo, mas pedidos podem atrasar. Use hospedagem estável e acompanhe o quadro.
`,
    faq: `# Perguntas frequentes — OrcaZap

**Preciso de aplicativo?** Não. O cliente usa o WhatsApp; a equipe usa o painel no navegador.

**Quantas fotos o cliente pode mandar?** Até 4 por padrão (de 1 a 6, configurável), JPEG, PNG ou WebP de até 5 MB.

**O robô analisa as fotos?** Não. As fotos são para a sua equipe avaliar.

**O robô informa preço?** Não. O valor é sempre digitado por uma pessoa.

**Como o cliente recebe a proposta?** Mensagem no WhatsApp com valor, prazo, observação, validade e botões Aceitar, Recusar e Tenho dúvida.

**E se o cliente não responder?** Um lembrete após o prazo configurado e, passada a validade, a proposta vence.

**Posso revisar a proposta?** Sim, pode reenviar com novos valores enquanto estiver aberta.

**O robô marca a visita?** Não nesta versão: registra o período preferido e a equipe combina.

**Posso saber por que recusaram?** Se o cliente quiser contar, o motivo aparece no Início.

**Onde ficam as fotos?** Na pasta MEDIA_DIR do servidor, fora do banco; inclua no backup.

**Atende várias empresas?** O sistema é multiempresa; cada empresa tem número, serviços e painel isolados.
`,
    demo: `# Roteiro de demonstração — OrcaZap (15 minutos)

## Antes
1. \`node robots/robot-004-orcazap/demo/servidor-demo.ts\` → http://localhost:3100/admin (chave \`demo-demo-demo-1234\`), já com orçamentos em cada coluna.
2. Abra \`demo/CONVERSAS.md\`.
3. Descubra: orçamentos por semana, tempo de resposta, serviços principais, se precisa de visita.

## Roteiro
**1. (2 min) A dor.** \"Como o orçamento chega hoje? Quanto tempo você leva para responder?\"

**2. (4 min) O pedido do cliente.** Conversa 1: serviço → descrição → fotos → bairro → endereço → período → enviar.

**3. (3 min) O quadro.** Painel > **Orçamentos**: coluna Novos, abra um pedido, mostre o formulário de proposta. Diga: \"o robô nunca informa preço\".

**4. (2 min) A proposta e o aceite.** Mostre a proposta com botões e o aceite (conversa 1b), o lembrete e o vencimento.

**5. (2 min) Segurança e humano.** Conversa 3 (arquivo inválido, bairro fora da área) e 4 (atendente).

**6. (2 min) Números e próximo passo.** Início (aceitos, taxa de aceite, motivos). Proposta (PRECIFICACAO.md): implantação + 1 semana de piloto.

## Cuidados
- Diga que os dados são fictícios.
- Seja claro sobre limites (não analisa foto, não agenda visita, aceite ≠ contrato).
- Não prometa aumento de fechamento.
`,
    precificacao: `# Precificação sugerida — OrcaZap

> **Sugestões para validar no mercado.** Não há tabela de concorrentes verificada para este nicho; **cote 3 alternativas** na sua região antes de fixar.

| Modelo | Valor sugerido | O que inclui |
|---|---|---|
| **Implantação** | R$ 490 (única) | Número na Meta, cadastro dos serviços e regiões, FAQ, modelo \`orcamento_proposta\`, treinamento (1 h) |
| **Mensalidade** (suporte + hospedagem) | R$ 139/mês | Servidor, backup do banco **e das fotos**, atualizações, suporte em horário comercial, ajustes simples |
| **Venda única** (cliente hospeda) | R$ 1.790 | Pacote + implantação básica; suporte como contrato à parte |
| **Personalização** | R$ 150/hora | Perguntas por tipo de serviço, PDF da proposta, integrações |

## Como cheguei a esses números
1. **Posição:** entre o AgendaZap (R$ 129) e o CobraZap (R$ 149): o OrcaZap tem mais trabalho de hospedagem por causa das **fotos** (armazenamento e backup).
2. **Retorno (ilustrativo):** compare a mensalidade com o **valor médio de um serviço fechado** pelo cliente. Se um serviço médio rende R$ ___ e o robô ajudar a fechar UM a mais por mês, a mensalidade se paga. Use números do cliente; não prometa percentual.
3. **Custos da Meta:** respostas na janela de 24 h costumam ser gratuitas; propostas e lembretes fora dela são cobrados por mensagem. Confirme a tabela oficial.
4. **Seu custo:** servidor pequeno com disco para fotos + suporte (~1–2 h/mês por cliente).

## Como apresentar
- Piloto de 1 semana com o número do próprio prestador.
- Mostre no painel quantos pedidos chegaram completos e quantas propostas foram aceitas.
- Posicione como **complemento** a apps de captação de clientes.

## Validar antes de fixar
- [ ] Cotar 3 sistemas de orçamento/CRM para prestadores na sua região.
- [ ] Perguntar a 5 prestadores quanto pagariam e quantos orçamentos fazem por semana.
- [ ] Medir seu tempo de implantação do 1º cliente e ajustar o preço.
`,
  },
};
