import type { RobotDoc } from "../tipos.ts";

export const pedidozap: RobotDoc = {
  id: "robot-003-pedidozap",
  nome: "PedidoZap",
  slogan: "Seu cardápio, carrinho e quadro de pedidos dentro do WhatsApp — sem comissão por pedido.",
  versao: "1.0.0",
  status: "PRONTO",
  segmentos: ["Pizzarias", "Lanchonetes e hamburguerias", "Restaurantes e marmitarias", "Açaí e sorveterias", "Padarias com delivery"],
  publico: "Restaurantes, lanchonetes e deliveries com **entrega própria ou retirada** que já recebem pedidos pelo WhatsApp “na mão” (foto do cardápio, anotação em papel) e querem **vender direto**, com menos erro e menos dependência de marketplaces.",
  problema: "Pedido por WhatsApp manual é lento (cliente pergunta cardápio, disponibilidade, taxa…), gera erro de anotação e prende um atendente. Ao mesmo tempo, relatos de donos e consumidores em fóruns indicam que as taxas dos marketplaces pesam e que pedir direto costuma sair mais barato — mas “é demorado/ineficiente” quando atendido na mão. (Evidência: relatos de comunidade, não pesquisa formal; valide com seus clientes.)",
  resumo: "O **PedidoZap** transforma o WhatsApp do restaurante em um **canal de pedidos guiado**: o cliente vê o cardápio por categorias, escolhe tamanho e quantidade, escreve observações, informa bairro e endereço, escolhe a forma de pagamento e confirma. O robô **calcula tudo no servidor** (preço do cardápio atual, taxa por bairro, pedido mínimo), gera o **Pix copia-e-cola** com o valor exato e entrega o pedido pronto num **quadro** para a cozinha. A cada etapa (aceito, preparando, saiu, pronto, entregue) o cliente é avisado automaticamente.",
  oportunidades: [4, 17],
  potencial: "Alto",
  como_funciona: [
    "O cliente escreve “oi” e escolhe **Fazer pedido** (ou **Ver cardápio** para ler tudo).",
    "Escolhe categoria → item → tamanho/opção → quantidade → observação (“sem cebola”).",
    "Pode adicionar mais itens; o carrinho mostra o subtotal em tempo real.",
    "Escolhe **entrega** (bairro e endereço; o robô aplica a taxa do bairro e o pedido mínimo) ou **retirada**.",
    "Escolhe pagamento: **Pix** (recebe o copia-e-cola com o valor), **dinheiro** (informa troco) ou **cartão na entrega**.",
    "Confere o resumo e confirma. O pedido aparece no **quadro de pedidos** do painel como “Novo”.",
    "A equipe avança as etapas com um clique; o cliente recebe um aviso a cada mudança.",
    "Fora do horário, o robô mostra o cardápio e o horário de abertura, mas não fecha pedido.",
  ],
  funcionalidades: [
    { titulo: "Cardápio por categorias", descricao: "Itens com descrição, tamanhos/variações e preço; marque **esgotado** em um clique e o item some do robô na hora." },
    { titulo: "Carrinho com observações", descricao: "Quantidade (1–20) e observação livre por item, sanitizada." },
    { titulo: "Entrega ou retirada", descricao: "Taxa e tempo por bairro, pedido mínimo para entrega, tempo de retirada." },
    { titulo: "Preço confiável", descricao: "Preços e disponibilidade são recalculados do cardápio atual na hora de confirmar — nada vem do cliente." },
    { titulo: "Pix copia-e-cola", descricao: "Código válido com a sua chave e o total do pedido; baixa manual no painel." },
    { titulo: "Dinheiro com troco / cartão na entrega", descricao: "Valida que o troco cobre o total." },
    { titulo: "Quadro de pedidos", descricao: "Colunas Novo → Aceito → Em preparo → Saiu/Pronto; marcar pago; cancelar; imprimir comanda." },
    { titulo: "Avisos de status", descricao: "Cliente é avisado a cada etapa (texto dentro de 24 h; modelo aprovado fora disso)." },
    { titulo: "Meu pedido / cancelar", descricao: "Cliente acompanha o último pedido e cancela sozinho enquanto estiver “Novo”." },
    { titulo: "Horário de funcionamento", descricao: "Não fecha pedido com a loja fechada; fecha no meio do pedido? Avisa." },
    { titulo: "Resumo do dia", descricao: "Pedidos, vendas, ticket médio, tempo até entregar, mais vendidos (7 dias)." },
    { titulo: "Dúvidas e atendente", descricao: "FAQ cadastrado + taxa/bairros automáticos; fora da base, chama uma pessoa." },
  ],
  limites: [
    "**Não recebe pagamento online sozinho**: o Pix é estático e a marcação de “pago” é manual.",
    "Sem adicionais/complementos com múltipla escolha (ex.: borda recheada + extras) nem combos com escolhas internas — use itens separados ou variações.",
    "Sem frete por distância/CEP/mapa: a taxa é por bairro cadastrado.",
    "Sem impressão térmica automática nem integração com ERP, iFood ou entregadores (há página de impressão da comanda).",
    "Sem agendamento de pedido para depois, cupons, fidelidade ou endereço salvo do cliente.",
    "Edição de cardápio completa (criar itens, mudar preços) é por Configurações (JSON validado); só “esgotado” tem botão.",
    "Fora da janela de 24 h, os avisos de status só saem com **modelo aprovado pela Meta**.",
  ],
  diferenciais: [
    "**Sem comissão por pedido**; mensalidade fixa. O cliente e os dados são do restaurante.",
    "Foco no **WhatsApp que o cliente já usa**: não precisa instalar app.",
    "Cálculo de preço, taxa e mínimo **no servidor** (à prova de adulteração).",
    "Pix com valor exato e quadro de pedidos simples para cozinha leiga em tecnologia.",
    "API oficial do WhatsApp, LGPD e testes automatizados do fluxo de ponta a ponta.",
  ],
  config_campos: [
    { campo: "empresa.*", descricao: "Nome, endereço, telefone, formas de pagamento (texto) e horário", exemplo: "\"Pizzaria Bella Massa\"" },
    { campo: "empresa.horario", descricao: "Horário de funcionamento por dia (0=domingo … 6=sábado); dia ausente = fechado. O fechamento deve ser depois da abertura no mesmo dia (ex.: \"23:30\").", exemplo: "{ \"2\": { \"abre\": \"18:00\", \"fecha\": \"23:30\" } }" },
    { campo: "cardapio[].id / nome", descricao: "Categorias (até 10). `nome` até 24 caracteres.", exemplo: "\"pizzas\", \"Pizzas\"" },
    { campo: "cardapio[].itens[].id / nome / descricao", descricao: "Item. `id` único em todo o cardápio, sem acento/espaço.", exemplo: "\"calabresa\", \"Pizza Calabresa\"" },
    { campo: "cardapio[].itens[].preco", descricao: "Preço em reais (número com ponto). Omitido quando há `variacoes`.", exemplo: "12.5" },
    { campo: "cardapio[].itens[].variacoes[]", descricao: "Tamanhos/opções com preço próprio (até 9)", exemplo: "{ \"id\": \"grande\", \"nome\": \"Grande (8 fatias)\", \"preco\": 52 }" },
    { campo: "cardapio[].itens[].disponivel", descricao: "`false` = esgotado (não aparece). Também alternável no painel > Cardápio.", exemplo: "true" },
    { campo: "entrega.entrega_ativa / retirada_ativa", descricao: "Liga entrega e/ou retirada", exemplo: "true, true" },
    { campo: "entrega.bairros[]", descricao: "Bairros atendidos: `nome`, `taxa` (R$) e `tempo_min`", exemplo: "{ \"nome\": \"Centro\", \"taxa\": 5, \"tempo_min\": 40 }" },
    { campo: "entrega.pedido_minimo", descricao: "Subtotal mínimo para entrega (R$). 0 = sem mínimo", exemplo: "30" },
    { campo: "entrega.tempo_retirada_min", descricao: "Previsão informada para retirada", exemplo: "30" },
    { campo: "pagamento.formas", descricao: "Formas aceitas: `pix`, `dinheiro`, `cartao_entrega`", exemplo: "[\"pix\", \"dinheiro\"]" },
    { campo: "pagamento.pix.chave / beneficiario / cidade", descricao: "Obrigatórios se `pix` estiver nas formas. Sem acento; beneficiário até 25 e cidade até 15 caracteres.", exemplo: "\"11999990000\", \"Bella Massa\", \"Sao Paulo\"" },
    { campo: "template.nome / idioma", descricao: "Modelo aprovado na Meta para avisos de status fora da janela de 24 h", exemplo: "\"pedido_status\", \"pt_BR\"" },
    { campo: "faq[] e mensagens.*", descricao: "Perguntas/respostas e textos opcionais (boas_vindas, fora_horario, handoff)", exemplo: "\"Olá! 🍕 ...\"" },
  ],
  templates: [{
    nome: "pedido_status", categoria: "UTILITY (utilidade)", parametros: ["primeiro nome do cliente", "número do pedido", "texto da atualização (o robô monta)", "nome do restaurante"],
    corpo: "Olá {{1}}! Atualização do pedido #{{2}}: {{3}} — {{4}}",
    quando: "Usado quando a equipe muda o status de um pedido e o cliente não escreveu nas últimas 24 horas (por exemplo, pedido agendado para muito depois ou conversa antiga).",
  }],
  dados: [
    { dado: "Nome, telefone e endereço de entrega (rua, número, bairro)", finalidade: "Entregar o pedido", base_legal: "Execução de contrato" },
    { dado: "Itens, observações, valor, forma de pagamento e troco", finalidade: "Preparar, cobrar e emitir comanda", base_legal: "Execução de contrato" },
    { dado: "Situação do pedido", finalidade: "Acompanhamento e avisos ao cliente", base_legal: "Execução de contrato" },
  ],
  tabelas: [
    { nome: "orders", descricao: "Pedidos (número sequencial por empresa, tipo, situação, endereço, subtotal/taxa/total em centavos, pagamento, troco, pago, previsão)." },
    { nome: "order_items", descricao: "Itens do pedido com cópia do nome, variação, quantidade e preço unitário da época (o histórico não muda se o cardápio mudar)." },
  ],
  arquivos: [
    { caminho: "src/index.ts", descricao: "Ponto de entrada" },
    { caminho: "src/robot.ts", descricao: "Define o robô e as páginas do painel" },
    { caminho: "src/settings.ts", descricao: "Esquema/validação do cardápio, entrega e pagamento; base de conhecimento" },
    { caminho: "src/flow.ts", descricao: "Conversa: cardápio, carrinho, checkout, confirmação, “meu pedido”" },
    { caminho: "src/store.ts", descricao: "Criação atômica de pedido (numeração + itens + totais) e status" },
    { caminho: "src/notify.ts", descricao: "Texto e envio dos avisos de status" },
    { caminho: "src/admin.ts", descricao: "Quadro de pedidos, comanda, histórico, cardápio (esgotado) e resumo" },
    { caminho: "src/migrations.ts", descricao: "Tabelas do robô" },
    { caminho: "tests/pedido.test.ts", descricao: "Testes automatizados" },
  ],
  painel: [
    { pagina: "pedidos", para_que: "Quadro de pedidos em andamento; avançar etapa, marcar pago, cancelar; `/pedidos/<id>` = comanda para imprimir" },
    { pagina: "cardapio", para_que: "Marcar itens como esgotados / voltar a vender" },
    { pagina: "historico", para_que: "Últimos 100 pedidos" },
  ],
  manual: {
    cadastrar_info: "Em **Configurações** (ou `config/empresa.json`) preencha `empresa` (nome, endereço, telefone, horário). Cadastre os bairros atendidos com taxa e tempo em `entrega.bairros` e, se usar Pix, a chave em `pagamento.pix` (sem acentos). Cadastre perguntas frequentes em `faq`.",
    alterar_servicos: "O cardápio fica em `cardapio`: cada categoria tem `itens`; cada item tem `id`, `nome`, `descricao`, `preco` (ou `variacoes` com tamanhos e preços) e `disponivel`. **Para marcar que algo acabou**, use o painel > **Cardápio** > *Marcar esgotado* (vale na hora). Para criar ou remover itens, edite em **Configurações**; o sistema valida (ids únicos, preços numéricos) antes de salvar.",
    alterar_precos: "Em **Configurações**, altere `preco` (ou o `preco` de cada variação) e `entrega.bairros[].taxa`. Pedidos **já feitos mantêm o preço da época**. Itens que já estão no carrinho de um cliente passam a usar o preço novo na hora de confirmar (ele vê o total antes).",
    mensagens: "Em **Configurações**, no bloco `mensagens`: `boas_vindas`, `fora_horario` e `handoff`. Os avisos de status (aceito, preparando, saiu…) são padronizados; fora da janela de 24 h usam o **modelo aprovado na Meta** (`pedido_status`).",
    problemas: [
      { sintoma: "O robô diz que estamos fechados no horário certo", causa: "Fuso ou `empresa.horario` incorreto (dia ausente = fechado)", solucao: "Confira `TIMEZONE` no .env e o horário de cada dia da semana." },
      { sintoma: "Cliente diz que o bairro dele não é aceito", causa: "Bairro fora de `entrega.bairros` ou escrito diferente", solucao: "Cadastre o bairro (o robô aceita o nome sem acento/maiúscula) ou ofereça retirada." },
      { sintoma: "Pedido caiu mas o cliente não recebeu avisos de status", causa: "Conversa há mais de 24 h e sem modelo aprovado", solucao: "Cadastre `template.nome` (INSTALACAO, passo 8)." },
      { sintoma: "Item não aparece no cardápio do robô", causa: "Está marcado como esgotado ou a categoria ficou sem itens disponíveis", solucao: "Painel > Cardápio > Voltar a vender." },
      { sintoma: "Pix pago mas pedido continua “a receber”", causa: "A confirmação é manual", solucao: "No quadro, clique em **Marcar pago** (entrega em dinheiro/cartão marca como pago ao concluir)." },
    ],
  },
  cliente: {
    rotina: [
      "No começo do expediente, abra **Cardápio** e marque como esgotado o que não tem.",
      "Deixe o **Quadro de pedidos** aberto na cozinha/balcão (atualiza sozinho). Quando entrar um pedido *Novo*, clique **Aceito →**.",
      "Avance as etapas: **Em preparo → Saiu para entrega** (ou **Pronto p/ retirada**) **→ Entregue**. O cliente é avisado em cada uma.",
      "Confira os pagamentos por Pix no seu banco e clique em **Marcar pago**.",
      "Toque em **Imprimir** para a comanda; olhe **Conversas** para quem pediu atendente.",
      "No fim do dia, veja o **Início**: pedidos, vendas, ticket médio e mais vendidos.",
    ],
    regras_de_ouro: [
      "Aceite rápido: o cliente só recebe a confirmação quando você clica em *Aceito*.",
      "Marque esgotado **antes** de o cliente pedir.",
      "Pedido já em preparo não é cancelado pelo robô: se o cliente pedir, a conversa vai para uma pessoa decidir.",
      "Entrega em dinheiro: confira o troco antes de sair (o pedido mostra o valor informado).",
    ],
  },
  fluxos: `# Fluxos de conversa — PedidoZap

As conversas reais (geradas pelo robô) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md).

## Mapa de estados

\`\`\`
inicio ─(fazer pedido)─► categoria ─► item ─► [variacao] ─► qtd ─► obs ─► carrinho ──(adicionar mais)──► categoria
   │                                                                        │
   │                                                                        └─(finalizar)─► tipo ─► [bairro] ─► [nome] ─► [endereco] ─► pagamento ─► [troco] ─► confirmar ─► PEDIDO CRIADO ─► inicio
   ├─(ver cardápio)─► texto do cardápio (só itens disponíveis)
   ├─(meu pedido)────► situação do último pedido
   ├─("cancelar pedido")─► cancela se "novo"; senão chama atendente
   ├─(dúvida)─► FAQ (inclui taxas/bairros) ─► se não souber: MODO HUMANO
   └─(atendente / erro)─► MODO HUMANO
\`\`\`

\`[ ]\` = etapa pulada quando não se aplica (item sem variação; retirada não pede bairro/endereço; nome já conhecido; pagamento que não é dinheiro não pede troco).

## Fluxo normal
Menu → categoria → item → tamanho → quantidade → observação → (adicionar mais) → finalizar → entrega/retirada → bairro → endereço → pagamento → resumo → **Confirmar** → número do pedido + Pix (se escolhido) → avisos de status.

## Regras aplicadas no servidor
- Preço, disponibilidade e taxa vêm sempre do cadastro **no momento de confirmar**; itens indisponíveis saem do carrinho com aviso.
- Pedido mínimo vale só para entrega; abaixo dele o robô oferece adicionar itens ou retirar.
- Fechado: não cria pedido (nem no meio do fluxo, se a loja fechar).
- Quantidade 1–20; observação limpa de caracteres de controle e símbolos < >; endereço mínimo de 8 caracteres.
- Troco deve ser ≥ total.

## Fluxo de dúvida
FAQ → resposta (inclui taxas e bairros) → “Posso ajudar em mais alguma coisa?”. Sem resposta → “Não tenho essa informação no momento. Vou encaminhar você para um atendente.”

## Fluxo de erro
Quantidade inválida · bairro fora da área (lista os atendidos e oferece retirada) · pedido mínimo · loja fechada · item que esgotou · mídia sem sentido · erro interno (pede desculpas e chama atendente).

## Transferência para humano
Palavra *atendente*, pergunta sem resposta, cancelamento de pedido já em andamento, cardápio sem itens, erro interno. No modo humano o robô se cala; volta ao ser devolvido ou após 12 h.

## Ciclo do pedido (painel)
\`novo → aceito → preparando → saiu (entrega) | pronto (retirada) → entregue\` · \`cancelado\` a qualquer momento antes de encerrar. Cada mudança avisa o cliente.
`,
  requisitos: [
    { id: "RF-01", texto: "Cardápio por categorias com variações e disponibilidade", status: "Implementado" },
    { id: "RF-02", texto: "Carrinho com quantidade e observação", status: "Implementado" },
    { id: "RF-03", texto: "Entrega com taxa/tempo por bairro, pedido mínimo, retirada", status: "Implementado" },
    { id: "RF-04", texto: "Cálculo de totais no servidor a partir do cardápio atual", status: "Implementado" },
    { id: "RF-05", texto: "Pagamento: Pix copia-e-cola, dinheiro com troco, cartão na entrega", status: "Implementado" },
    { id: "RF-06", texto: "Numeração sequencial por empresa e criação atômica do pedido", status: "Implementado" },
    { id: "RF-07", texto: "Quadro de pedidos, comanda para impressão, histórico, indicadores", status: "Implementado" },
    { id: "RF-08", texto: "Avisos de status ao cliente (texto/modelo)", status: "Implementado" },
    { id: "RF-09", texto: "Horário de funcionamento", status: "Implementado" },
    { id: "RF-10", texto: "“Meu pedido” e cancelamento enquanto “novo”", status: "Implementado" },
    { id: "RF-11", texto: "Adicionais / combos com múltipla escolha", status: "Não implementado" },
    { id: "RF-12", texto: "Frete por distância/CEP; endereços salvos", status: "Não implementado" },
    { id: "RF-13", texto: "Pagamento online com baixa automática", status: "Não implementado" },
    { id: "RF-14", texto: "Impressão térmica automática; integração com ERP/marketplaces", status: "Não implementado" },
    { id: "RF-15", texto: "Editor de cardápio por formulário (hoje: JSON validado + botão de esgotado)", status: "Parcial" },
  ],
  pendencias: [
    "Piloto com número real da WhatsApp Business Platform em pelo menos 1 restaurante (hoje validado por simulação e pelo formato documentado da API).",
    "Modelo `pedido_status` aprovado pela Meta e testado.",
    "Editor de cardápio por formulário e **adicionais** (borda, extras) — o que mais restaurantes pedem.",
    "Baixa automática de Pix (PSP) e impressão térmica, se o público exigir.",
    "Validar com 5 restaurantes o ganho real frente ao marketplace que usam (a evidência atual vem de relatos de fórum).",
    "Revisão/pentest de segurança independente; contrato de suporte/hospedagem.",
  ],
  precos: { venda_unica: 2490, mensalidade: 179, implantacao: 790, personalizacao_hora: 150, racional: [] },
  sales: {
    pagina: `# PedidoZap — seu delivery no WhatsApp, sem comissão por pedido

### Cardápio, carrinho, taxa de entrega, Pix e cozinha organizados — tudo na conversa.

Hoje o cliente pergunta: “tem o cardápio?”, “qual a taxa?”, “aceita Pix?”. Você (ou seu atendente) responde, anota, confirma, erra uma observação… e o pedido demora.

O **PedidoZap** conduz o cliente do “oi” ao **pedido fechado**, no WhatsApp do seu restaurante:

- 🍕 **Cardápio** por categorias, com tamanhos e observações (“sem cebola”).
- 🧺 **Carrinho** com subtotal em tempo real.
- 🛵 **Entrega ou retirada**, com **taxa por bairro** e pedido mínimo.
- 💳 **Pix copia-e-cola** com o valor exato, dinheiro com troco ou cartão na entrega.
- 📋 **Quadro de pedidos** para a cozinha: Novo → Aceito → Em preparo → Saiu → Entregue.
- 🔔 **Avisos automáticos** ao cliente a cada etapa.
- 🚫 **Item acabou?** Um clique e some do cardápio do robô.

## O que muda no seu dia
- Menos tempo digitando e menos erro de anotação.
- Pedido já chega **completo** (itens, endereço, pagamento, troco).
- Clientes e dados **são seus** — sem comissão por pedido, só mensalidade fixa.

## Como funciona
1. Cliente: “Oi, quero uma pizza grande”.
2. O robô guia: categoria → sabor → tamanho → quantidade → observação → endereço → pagamento.
3. Pedido aparece no seu quadro. Você clica “Aceito”. O cliente é avisado.

## Feito do jeito certo
API **oficial** do WhatsApp, preços e taxas calculados no servidor (ninguém altera o valor pela conversa), horário de funcionamento respeitado, LGPD.

## Seja sincero com a sua operação
Não recebe pagamento online sozinho (você marca como pago), não tem adicionais com múltipla escolha nem frete por distância nesta versão, e não imprime sozinho em impressora térmica (tem comanda para imprimir). Tudo isso está no roteiro de evolução — veja [FEATURES.md](FEATURES.md).

## Quanto custa
Veja [PRECIFICACAO.md](PRECIFICACAO.md).

**👉 Quer ver o seu cardápio rodando em 15 minutos? Peça uma demonstração.**
`,
    pitch: `# Pitch — PedidoZap

## 15 segundos
“Eu transformo o WhatsApp do seu delivery em um canal de pedidos que atende sozinho: cardápio, taxa por bairro, Pix e quadro de pedidos pra cozinha — sem comissão por pedido.”

## 1 minuto
“Você já recebe muito pedido no WhatsApp, mas cada um toma tempo: cliente pergunta preço, taxa, forma de pagamento, você anota e confirma. Fora do horário de pico, o pedido espera.
O PedidoZap guia o cliente do cardápio ao pedido fechado, calcula tudo certinho (taxa por bairro, mínimo, Pix com o valor exato) e entrega o pedido pronto num quadro para a cozinha. O cliente é avisado a cada etapa. Não é aplicativo de terceiro: é o seu WhatsApp, seus clientes, mensalidade fixa e nenhuma comissão por pedido.”

## 3 minutos
1. **Descoberta:** “Quantos pedidos por dia no WhatsApp? Quem atende? Quanto você paga de comissão nos marketplaces hoje?”
2. **Conta (ilustrativa):** “Se você paga X% de comissão num pedido de R$ ___ e passar uma parte dos pedidos para o canal próprio, a economia por pedido é R$ ___. A mensalidade de R$ 179 se paga com ~N pedidos.” (use o percentual do **contrato dele**; não invente.)
3. **Demo:** CONVERSAS.md (fluxo de pizza) + painel fictício (quadro de pedidos).
4. **Honestidade:** “Não recebe Pix sozinho, não tem adicionais com múltipla escolha ainda.” (diga antes que ele pergunte.)
5. **Próximo passo:** montar o cardápio dele e testar com o próprio número por 1 semana.

## Mensagem de primeiro contato
> Oi, [Nome]! Eu monto um sistema de pedidos pelo WhatsApp para deliverys: o cliente escolhe os itens, informa o endereço e paga por Pix; o pedido cai organizado num quadro para a cozinha. Sem comissão por pedido. Posso te mostrar com o cardápio da [Pizzaria] em 10 min?

## Qualificação
- Pedidos/dia, ticket médio, horários de pico.
- Entrega própria? Quantos bairros e quais taxas?
- Usa marketplace? Qual comissão (pelo contrato)?
- Quem aceita e prepara os pedidos? Tem tablet/computador na cozinha?
`,
    features: `# Funcionalidades e benefícios — PedidoZap

| Funcionalidade | Benefício |
|---|---|
| Cardápio por categorias, tamanhos e observações | Cliente pede sozinho, do jeito que quer |
| Marcar esgotado em 1 clique | Menos pedido de item que acabou |
| Carrinho com subtotal | Cliente confere antes de fechar |
| Taxa e tempo por bairro, pedido mínimo | Frete certo, sem negociação |
| Totais calculados no servidor | Ninguém altera preço pela conversa |
| Pix copia-e-cola com valor exato | Pagar leva segundos |
| Dinheiro com troco validado, cartão na entrega | Entregador sai preparado |
| Quadro de pedidos (Novo→Entregue) | Cozinha organizada, nada se perde |
| Avisos automáticos de status | Menos “cadê meu pedido?” |
| Comanda para imprimir | Papel na cozinha sem digitar |
| Horário de funcionamento | Não aceita pedido fechado |
| Meu pedido / cancelar enquanto “novo” | Menos ligações |
| Resumo do dia (vendas, ticket, mais vendidos) | Decisão com dados |
| FAQ + transferência para atendente | Cliente nunca fica preso |
| API oficial, LGPD, dados no seu servidor | Segurança e propriedade |

## Em evolução (não está nesta versão)
Adicionais com múltipla escolha e combos, frete por distância, impressão térmica automática, baixa automática de Pix, editor de cardápio por formulário, integrações com ERP/marketplaces.
`,
    objecoes: `# Objeções — PedidoZap

**1. “Já tenho iFood/marketplace.”**
Ótimo — o PedidoZap não substitui a vitrine do marketplace; ele cuida do **cliente que já chama você no WhatsApp**. Quanto desse público você consegue trazer para o canal próprio, mais economiza de comissão. (Não prometo percentual; use o contrato que você tem.)

**2. “Já uso Anota AI / outro sistema de cardápio digital.”**
Se atende bem, talvez nem precise. Compare mensalidade, taxas por pedido, suporte e o que cada um faz de verdade (as faixas de preço que encontrei variam muito entre fontes e datas). Diferenciais do PedidoZap: sem taxa por pedido, dados no seu servidor e preço fixo — mas com menos recursos (sem adicionais múltiplos, por exemplo).

**3. “E se o cliente quiser algo fora do cardápio?”**
Ele escreve ATENDENTE e uma pessoa assume. A observação por item cobre “sem cebola”, “bem passado”.

**4. “Meus clientes não gostam de robô.”**
O fluxo é de botões e listas — mais rápido que digitar. Em qualquer ponto, o cliente chama uma pessoa.

**5. “Não consigo editar o cardápio sozinho.”**
Esgotar/voltar a vender é um botão. Mudar preço ou criar item é em Configurações (texto validado). Na implantação deixo o cardápio pronto, e posso fazer alterações como serviço. Um editor por formulário está no roteiro.

**6. “Pix: como sei que pagou?”**
O código Pix traz o valor exato, mas a confirmação é manual (você vê no banco e clica *Marcar pago*). Baixa automática está no roteiro.

**7. “E a entrega longe/CEP?”**
A taxa é por bairro. Frete por distância ainda não existe; para áreas amplas, cadastre os bairros atendidos.

**8. “O WhatsApp bloqueia?”**
Usa a API oficial, sem envio em massa. Respostas dentro de 24 h costumam ser gratuitas; avisos fora disso exigem modelos aprovados (cobrados pela Meta por mensagem).

**9. “É difícil de instalar?”**
A implantação é feita por você/por mim; o dia a dia é só abrir o quadro de pedidos.

**10. “Funciona se a internet cair?”**
Se o servidor ficar fora, o WhatsApp reenvia mensagens por um tempo, mas pedidos podem atrasar. Use hospedagem estável e acompanhe o quadro.
`,
    faq: `# Perguntas frequentes — PedidoZap

**Preciso de aplicativo?** Não. O cliente usa o próprio WhatsApp; a equipe usa o painel no navegador (celular, tablet ou computador).

**O cliente vê todo o cardápio?** Pode tocar em “Ver cardápio” (texto completo) ou pedir por categorias.

**Como funcionam tamanhos?** Cada item pode ter variações com preço próprio (ex.: média/grande).

**Posso ter adicionais (borda recheada, extras)?** Ainda não nesta versão; use itens/variações separados.

**Como é calculada a taxa?** Pelo bairro cadastrado. Bairro fora da lista: o robô sugere retirada ou chama atendente.

**Existe pedido mínimo?** Sim, só para entrega, configurável.

**Que formas de pagamento?** Pix (copia-e-cola), dinheiro (com troco) e cartão na entrega/retirada.

**O robô recebe o dinheiro do Pix?** Não: o Pix vai direto para a sua chave. A marcação de “pago” é manual.

**O cliente é avisado quando o pedido sai?** Sim, a cada mudança de status feita no quadro.

**Dá para imprimir o pedido?** Sim, a página da comanda (botão Imprimir). Impressão térmica automática: ainda não.

**Como marco que um item acabou?** Painel > Cardápio > Marcar esgotado. Vale na hora.

**Posso cancelar um pedido?** Pela loja, a qualquer momento antes de encerrar (o cliente é avisado). Pelo cliente, só enquanto “Novo”.

**Funciona fora do horário?** Mostra cardápio e horário; não fecha pedido.

**Atende várias lojas?** O sistema é multiempresa; cada loja tem número, cardápio e painel isolados.

**Tem relatório?** Resumo do dia e mais vendidos (7 dias); histórico dos últimos 100 pedidos.
`,
    demo: `# Roteiro de demonstração — PedidoZap (15 minutos)

## Antes
1. \`node robots/robot-003-pedidozap/demo/servidor-demo.ts\` → http://localhost:3100/admin (chave \`demo-demo-demo-1234\`), já com pedidos em andamento.
2. Abra \`demo/CONVERSAS.md\`.
3. Descubra: pedidos/dia, bairros e taxas, comissão do marketplace (pelo contrato dele), pagamento mais usado.

## Roteiro
**1. (2 min) A dor.** “Como um pedido entra hoje? Quanto tempo cada um toma?”

**2. (4 min) O pedido do cliente.** Conversa 1: oi → pizza → tamanho → observação → bebida → entrega → bairro → endereço → Pix → confirmar. Destaque: *resumo com total*, *Pix com valor exato*.

**3. (3 min) A cozinha.** Painel > **Pedidos**: colunas, clique em **Aceito →**, **Em preparo →**, **Saiu**; mostre os avisos ao cliente (final da conversa 1). **Imprimir** a comanda.

**4. (2 min) Cardápio e regras.** Marque um item como esgotado e peça de novo no robô para mostrar que sumiu. Mostre pedido mínimo e bairro fora da área (conversa 3).

**5. (2 min) Segurança e humano.** Conversa 2 e 4: dúvida só pelo cadastro; atendente quando quiser.

**6. (2 min) Números e próximo passo.** Início (vendas, ticket, mais vendidos). Proposta (PRECIFICACAO.md): implantação com cardápio montado + 1 semana de piloto.

## Cuidados
- Diga que os dados são fictícios.
- Seja claro sobre limites (adicionais, Pix manual, frete por bairro).
- Nunca invente a comissão do marketplace dele.
`,
    precificacao: `# Precificação sugerida — PedidoZap

> **Sugestões para validar no mercado.** As referências abaixo vêm de fontes de datas e confiabilidade variadas; **cote propostas atualizadas** antes de usar.

| Modelo | Valor sugerido | O que inclui |
|---|---|---|
| **Implantação** | R$ 790 (única) | Número na Meta, cardápio completo montado, bairros/taxas, Pix, modelo \`pedido_status\`, treinamento da equipe (1 h) |
| **Mensalidade** (suporte + hospedagem) | R$ 179/mês | Servidor, backup, atualizações, suporte em horário comercial, ajustes simples de cardápio |
| **Venda única** (cliente hospeda) | R$ 2.490 | Pacote + implantação básica; suporte como contrato à parte |
| **Personalização** | R$ 150/hora | Adicionais, integrações, impressão, novos fluxos |

## Como cheguei a esses números
1. **Referência de concorrente (a validar):** para a Anota AI, uma matéria cita planos “a partir de R$ 178,99/mês” no plano anual e um guia de parceiro lista planos de R$ 249,99 a R$ 389,99 — as fontes divergem em data e condições, e o guia avisa que há outras taxas. Meu preço de **R$ 179** fica na faixa de entrada citada, **sem taxa por pedido**. Se a concorrente tem mais recursos (adicionais, integrações, app), seja honesto sobre isso.
2. **Retorno (ilustrativo):** mensalidade ÷ (ticket × comissão que o cliente paga hoje no marketplace). Exemplo *ilustrativo*: com ticket R$ 60 e comissão de 12%, cada pedido migrado economiza R$ 7,20 e ~25 pedidos/mês cobrem R$ 179. **Use o percentual do contrato do cliente**; não invente.
3. **Implantação maior que nos outros robôs** porque inclui montar o cardápio e as regras de entrega (trabalho real).
4. **Custos da Meta:** respostas na janela de 24 h costumam ser gratuitas; avisos por modelo fora dela são cobrados por mensagem (uma plataforma cita ~US$ 0,008 por mensagem de utilidade no Brasil; confirme a tabela oficial).
5. **Seu custo:** servidor pequeno + suporte (~1–2 h/mês por cliente em horários de pico de feriado).

## Como apresentar
- Piloto de 1 semana com o cardápio real e o próprio número do dono.
- Mostre no painel o ticket médio e os pedidos do período.
- Para quem tem iFood: posicione como **canal complementar**, não substituto.

## Validar antes de fixar
- [ ] Cotar 3 sistemas de cardápio/pedido por WhatsApp na sua região.
- [ ] Perguntar a 5 donos de delivery quanto pagariam e quanto pagam de comissão (pelo contrato).
- [ ] Medir seu tempo de implantação do 1º cliente e ajustar o preço.
`,
  },
  site: {
    "chave": "pedido",
    "icone": "bag",
    "titulo": "Robô para pedidos",
    "resumo": "Cardápio, carrinho, taxa por bairro, Pix e quadro de pedidos.",
    "tags": [
      "Cardápio",
      "Entrega",
      "Quadro de pedidos"
    ],
    "para": "Pizzarias, lanchonetes, deliveries",
    "roteiro": [
      {
        "bot": "Bem-vindo à Pizzaria Bella Massa!",
        "ops": [
          {
            "t": "Fazer pedido"
          }
        ]
      },
      {
        "bot": "O que você quer pedir?",
        "ops": [
          {
            "t": "Pizzas"
          },
          {
            "t": "Bebidas"
          }
        ]
      },
      {
        "bot": "Pizza Calabresa — qual tamanho?",
        "ops": [
          {
            "t": "Grande · R$ 52"
          },
          {
            "t": "Média · R$ 42"
          }
        ]
      },
      {
        "bot": "Quantas?",
        "ops": [
          {
            "t": "1"
          },
          {
            "t": "2"
          }
        ]
      },
      {
        "bot": "Seu pedido\n2x Pizza Calabresa ... R$ 104,00\n Entrega (Centro) ... R$ 5,00\n\n<b>Total: R$ 109,00</b>\nComo prefere pagar?",
        "ops": [
          {
            "t": "Pix"
          },
          {
            "t": "Dinheiro"
          }
        ]
      },
      {
        "bot": "Pedido #1 recebido! Aqui o Pix copia e cola"
      },
      {
        "nota": "a cozinha aceita o pedido…"
      },
      {
        "bot": "Seu pedido #1 está sendo preparado"
      },
      {
        "bot": "Seu pedido #1 saiu para entrega Bom apetite!",
        "fim": true
      }
    ]
  },
};
