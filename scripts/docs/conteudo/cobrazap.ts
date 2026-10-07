import type { RobotDoc } from "../tipos.ts";

export const cobrazap: RobotDoc = {
  id: "robot-002-cobrazap",
  nome: "CobraZap",
  slogan: "Cobrança educada, no tempo certo e dentro da lei — direto no WhatsApp.",
  versao: "1.0.0",
  status: "PRONTO",
  segmentos: ["Academias", "Escolas e cursos", "Prestadores de serviço com mensalidade", "Pequenos comércios com crediário", "Condomínios e associações (mensalidades)"],
  publico: "MEIs e pequenas empresas que **cobram mensalidade, parcela ou boleto** de clientes recorrentes e hoje cobram “quando lembram”, por mensagem manual: academias, escolas, estúdios, prestadores com contrato, lojas com carnê.",
  problema: "Atraso pequeno vira inadimplência quando ninguém acompanha: o follow-up é esquecido ou constrange quem cobra. Material do setor aponta justamente que **ignorar pequenos atrasos** agrava o problema e que a cobrança por WhatsApp é permitida desde que respeite o CDC e a LGPD (sem constrangimento ou assédio).",
  resumo: "O **CobraZap** roda uma **régua de cobrança** (lembrete antes do vencimento, aviso no dia e acompanhamento depois do atraso) pelo WhatsApp oficial da empresa, com tom educado e **travas legais embutidas**: confirma que está falando com a pessoa certa antes de mencionar dívida, só envia em horário comercial, limita a frequência, nunca ameaça e para quando o cliente pede. O cliente recebe o **Pix copia-e-cola** na hora, avisa “já paguei”, ou **negocia** parcelamento dentro das regras que a empresa definiu; a equipe confere e dá baixa no painel.",
  oportunidades: [3, 13],
  potencial: "Alto",
  como_funciona: [
    "Você importa as cobranças (cole da planilha: nome, telefone, descrição, valor, vencimento).",
    "No dia certo de cada passo da régua (por padrão 3 dias antes, no vencimento, +3, +7 e +15 dias), o robô avisa o cliente.",
    "Na **primeira vez**, ele só pergunta “você é o(a) titular?” — **não revela valor nem dívida** para quem pode ser a pessoa errada.",
    "Confirmada a identidade, mostra as pendências e oferece: **Pagar com Pix**, **Já paguei** ou **Negociar**.",
    "O Pix copia-e-cola é gerado com a **chave Pix da empresa** e o valor da cobrança.",
    "“Já paguei” coloca a cobrança em **conferência** (a régua pausa) e aceita o comprovante; você confirma no painel.",
    "“Negociar” oferece à vista com desconto e parcelas dentro dos limites que você definiu; a proposta vai para **Acordos**, onde você aceita (o robô cria as parcelas) ou recusa.",
    "Quem responde PARAR ou “número errado” sai da régua na hora.",
  ],
  funcionalidades: [
    { titulo: "Régua configurável", descricao: "Passos relativos ao vencimento, com texto padrão educado ou personalizado por passo." },
    { titulo: "Confirmação de titularidade", descricao: "Evita expor dívida a terceiros (número trocado, família). Pode ser desligada, mas vem ligada." },
    { titulo: "Travas legais", descricao: "Janela de envio (padrão 8h–20h, seg–sáb, nunca fora de 7h–21h), máximo por semana, intervalo mínimo, mensagem única consolidada por pessoa, sem termos de ameaça (SPC, protesto, processo…)." },
    { titulo: "Pix copia-e-cola automático", descricao: "Código EMV válido (CRC16) com a chave Pix da empresa e o valor; aceita código/link próprios por cobrança." },
    { titulo: "“Já paguei” + comprovante", descricao: "Pausa a cobrança, registra o comprovante recebido e leva à tela de Conferência." },
    { titulo: "Negociação guiada", descricao: "Opções automáticas (à vista com desconto, parcelas com valor mínimo); aceite pela equipe cria as parcelas mensais." },
    { titulo: "Importação por planilha", descricao: "Cole as linhas; o robô valida, relata erros por linha e evita duplicar referência. Baixa em lote por referência." },
    { titulo: "Painel de recebíveis", descricao: "Em aberto, vencido, a vencer, recebido (30 dias), para conferir, propostas de acordo." },
    { titulo: "Privacidade (LGPD)", descricao: "PARAR/REATIVAR, número errado, exclusão de dados (bloqueada se houver dívida aberta), retenção do histórico." },
  ],
  limites: [
    "**Não vê pagamentos sozinho**: o Pix é estático; a baixa é manual (painel, “paguei” + conferência ou lista de referências do extrato).",
    "Não emite boleto, não calcula juros/multa e não integra com ERP/banco/PSP nesta versão.",
    "Não negativa, não protesta, não ameaça e não contata terceiros — por desenho.",
    "Fora da janela de 24 h, só envia com **modelo aprovado pela Meta**; a Meta pode recusar ou reclassificar modelos de cobrança.",
    "Não baixa nem armazena a imagem do comprovante (registra que foi recebido); a conferência é feita no seu banco.",
    "Não substitui orientação jurídica: revise textos, horários e política de cobrança com um advogado.",
  ],
  diferenciais: [
    "Funciona com **qualquer banco/chave Pix**: não obriga a trocar de plataforma de cobrança.",
    "**Proteção a terceiros** (confirmação de titularidade) e travas legais ativas por padrão.",
    "Negociação com regras do dono (desconto, parcela mínima, validade) e geração automática das parcelas.",
    "Sem comissão sobre o valor recuperado; preço fixo.",
    "Dados no servidor da própria empresa; documentação de LGPD e segurança incluída.",
  ],
  config_campos: [
    { campo: "empresa.*", descricao: "Nome, endereço, telefone, horário e formas de pagamento (aparecem nas mensagens e respostas)", exemplo: "\"Academia Corpo em Movimento\"" },
    { campo: "pix.chave / beneficiario / cidade", descricao: "Dados do Pix copia-e-cola. Beneficiário até 25 e cidade até 15 caracteres, sem acento.", exemplo: "\"financeiro@empresa.com.br\", \"Corpo em Movimento\", \"Sao Paulo\"" },
    { campo: "regua[].id / dias", descricao: "Passos da régua. `dias` negativo = antes do vencimento; 0 = no dia; positivo = depois", exemplo: "{ \"id\": \"atraso-3\", \"dias\": 3 }" },
    { campo: "regua[].mensagem", descricao: "(opcional) Texto próprio do passo. Variáveis: `{{nome}} {{empresa}} {{descricao}} {{valor}} {{vencimento}} {{dias_atraso}}`. Termos de ameaça são recusados.", exemplo: "\"{{descricao}} ({{valor}}) está em aberto...\"" },
    { campo: "envio.inicio / fim", descricao: "Janela diária de envio. Limites rígidos: 07:00 a 21:00", exemplo: "\"08:00\", \"20:00\"" },
    { campo: "envio.dias_semana", descricao: "Dias permitidos (0=domingo … 6=sábado)", exemplo: "[1,2,3,4,5,6]" },
    { campo: "envio.max_por_semana / intervalo_horas", descricao: "Máximo de mensagens por pessoa em 7 dias e intervalo mínimo entre elas", exemplo: "3, 48" },
    { campo: "exigir_confirmacao_titular", descricao: "Pergunta “você é o titular?” antes de falar de dívida", exemplo: "true" },
    { campo: "negociacao.ativo / max_parcelas / parcela_minima / desconto_a_vista_percentual / validade_dias", descricao: "Regras do acordo automático. `parcela_minima` em reais; `validade_dias` = quanto tempo a cobrança fica pausada aguardando a equipe", exemplo: "true, 3, 50, 5, 7" },
    { campo: "template.nome / idioma", descricao: "Modelo aprovado na Meta usado fora da janela de 24 h. Vazio = só envia dentro da janela.", exemplo: "\"cobranca_aviso\", \"pt_BR\"" },
    { campo: "faq[]", descricao: "Perguntas e respostas (também não aceitam termos de ameaça)", exemplo: "{ \"pergunta\": \"Posso trancar o plano?\", \"resposta\": \"...\" }" },
    { campo: "mensagens.handoff", descricao: "(opcional) Texto ao chamar atendente", exemplo: "\"Já chamei uma pessoa...\"" },
  ],
  templates: [{
    nome: "cobranca_aviso", categoria: "UTILITY (utilidade) — a Meta pode reclassificar", parametros: ["primeiro nome do cliente", "nome da empresa", "texto do aviso (o robô monta; sem quebras de linha)"],
    corpo: "Olá {{1}}, aqui é a {{2}}. {{3}}",
    quando: "Usado em todo aviso enviado por iniciativa da empresa quando o cliente não escreve há mais de 24 horas — inclusive a pergunta de confirmação de titularidade. Um único modelo genérico cobre todos os passos.",
  }],
  dados: [
    { dado: "Descrição, valor e vencimento das cobranças", finalidade: "Cobrar e controlar recebimentos", base_legal: "Execução de contrato / exercício regular de direitos" },
    { dado: "Confirmação de titularidade e “número errado”", finalidade: "Evitar exposição indevida a terceiros", base_legal: "Legítimo interesse / dever de segurança" },
    { dado: "Histórico de avisos enviados (passo, data, resultado)", finalidade: "Respeitar limites de frequência e provar o que foi enviado", base_legal: "Legítimo interesse" },
    { dado: "Propostas de acordo", finalidade: "Negociar a dívida", base_legal: "Execução de contrato" },
    { dado: "Registro de que um comprovante foi recebido (sem a imagem)", finalidade: "Conferir pagamento", base_legal: "Execução de contrato" },
  ],
  tabelas: [
    { nome: "charges", descricao: "Cobranças (descrição, valor em centavos, vencimento, Pix/link, situação, pausa, referência única por empresa)." },
    { nome: "cz_clientes", descricao: "Por pessoa: titularidade confirmada, pergunta enviada, número errado." },
    { nome: "cz_envios", descricao: "Cada aviso enviado/pulado/adiado (alimenta os limites de frequência e evita repetição)." },
    { nome: "cz_acordos", descricao: "Propostas de acordo (parcelas, valor, situação)." },
  ],
  arquivos: [
    { caminho: "src/index.ts", descricao: "Ponto de entrada" },
    { caminho: "src/robot.ts", descricao: "Define o robô, a tarefa agendada (régua) e o painel" },
    { caminho: "src/settings.ts", descricao: "Esquema da configuração e **travas legais** (termos proibidos, limites de horário)" },
    { caminho: "src/regua.ts", descricao: "Motor da régua: janela de envio, limites, consolidação, titularidade" },
    { caminho: "src/mensagens.ts", descricao: "Textos dos passos e resumos" },
    { caminho: "src/flow.ts", descricao: "Conversa do devedor: titularidade, Pix, “paguei”, negociação, dúvidas" },
    { caminho: "src/store.ts", descricao: "Acesso ao banco" },
    { caminho: "src/importar.ts", descricao: "Leitura/validação da planilha colada" },
    { caminho: "src/admin.ts", descricao: "Painel: cobranças, importação, conferência, acordos, resumo" },
    { caminho: "src/migrations.ts", descricao: "Tabelas do robô" },
    { caminho: "tests/cobra.test.ts", descricao: "Testes automatizados" },
  ],
  painel: [
    { pagina: "cobrancas", para_que: "Lista (em aberto, vencidas, pagas), dar baixa, pausar, cancelar; `/cobrancas/importar` para planilha e baixa em lote" },
    { pagina: "conferencia", para_que: "Pagamentos que o cliente disse ter feito: Recebi / Não encontrei" },
    { pagina: "acordos", para_que: "Propostas de parcelamento: aceitar (com 1º vencimento) ou recusar" },
  ],
  manual: {
    cadastrar_info: "Em **Configurações** (ou `config/empresa.json`) preencha `empresa` e o bloco `pix` (chave, beneficiário e cidade **sem acentos**). Teste o Pix: faça uma cobrança de valor baixo para você mesmo e pague com o código. Cadastre perguntas frequentes em `faq` (sem termos de ameaça — o sistema recusa).",
    alterar_servicos: "A régua está em `regua`: cada passo tem um `id` e `dias` (negativo = antes do vencimento). Para **tirar** o aviso do 15º dia, apague o passo; para **adicionar** um aviso no 30º dia, acrescente `{ \"id\": \"atraso-30\", \"dias\": 30 }`. Janela e frequência ficam em `envio`. As regras de acordo ficam em `negociacao`. O sistema recusa horários fora de 07h–21h e mensagens com termos de ameaça.",
    alterar_precos: "O robô não tem “tabela de preços”: o valor está em **cada cobrança**. Para corrigir uma cobrança errada, cancele-a em Cobranças e importe de novo (use outra referência). Para mudar o **desconto à vista** ou a **parcela mínima** dos acordos, altere `negociacao` em Configurações.",
    mensagens: "Os textos padrão de cada passo podem ser trocados em `regua[].mensagem`, usando `{{nome}}`, `{{valor}}`, `{{descricao}}`, `{{vencimento}}`, `{{dias_atraso}}`, `{{empresa}}`. Mantenha o tom respeitoso; o sistema recusa ameaças e menções a SPC/Serasa/protesto/processo. O aviso fora da janela de 24 h usa o **modelo aprovado na Meta** (`cobranca_aviso`).",
    problemas: [
      { sintoma: "Importei e nada foi enviado", causa: "Fora da janela de envio, passo da régua ainda não venceu, ou falta confirmar a titularidade", solucao: "Veja `envio` na configuração; o robô só envia no horário permitido. A 1ª mensagem é a pergunta “você é o titular?”." },
      { sintoma: "Aviso não sai para quem não falou comigo hoje", causa: "Sem modelo aprovado na Meta", solucao: "Cadastre `template.nome` (INSTALACAO, passo 8). Sem ele o robô só envia dentro das 24 h." },
      { sintoma: "Cliente diz que pagou e a cobrança continua", causa: "A baixa é manual", solucao: "Conferência > Recebi, ou cole a referência em Importar > Dar baixa em vários pagamentos." },
      { sintoma: "Código Pix recusado pelo banco", causa: "Chave/nome/cidade incorretos", solucao: "Confira `pix` na configuração (sem acentos, cidade até 15 caracteres)." },
    ],
  },
  cliente: {
    rotina: [
      "Importe as cobranças do mês em **Cobranças > Importar** (cole da planilha).",
      "Todo dia útil, abra **Conferência** e confirme os pagamentos que os clientes avisaram (ou dê baixa pelo extrato).",
      "Abra **Acordos** e aceite ou recuse as propostas de parcelamento.",
      "Olhe **Conversas** para quem pediu atendente e responda com cordialidade.",
      "No **Início**, acompanhe: em aberto, vencido e recebido.",
    ],
    regras_de_ouro: [
      "Dê baixa nos pagamentos **no mesmo dia**: o robô só para de cobrar quando você marca como paga.",
      "Nunca peça ao robô para ameaçar ou expor o cliente — por lei isso é proibido e o sistema não aceita.",
      "Se o cliente disser “número errado”, não insista nesse contato: corrija o telefone no cadastro da empresa.",
      "Importe somente clientes com quem você tem **relação contratual** e cujo telefone eles mesmos informaram.",
    ],
  },
  fluxos: `# Fluxos de conversa — CobraZap

As conversas reais (geradas pelo robô) estão em [../demo/CONVERSAS.md](../demo/CONVERSAS.md).

## Régua (iniciativa do robô)
\`\`\`
cada minuto (TICK_SECONDS) ─► dentro da janela de envio? ─não─► nada
        │ sim
        ▼
 para cada pessoa com cobrança ABERTA (não pausada, sem opt-out, sem "número errado"):
   limite semanal atingido ou intervalo mínimo não cumprido? ─sim─► pula
   há passo da régua vencido e ainda não enviado? ─não─► pula
   titularidade exigida e não confirmada?
        ├─ já perguntou há < 7 dias ─► espera
        └─ senão ─► envia "você é o(a) titular?" [Sim, sou eu | Número errado]
   senão ─► monta UMA mensagem (resumo de todas as pendências devidas) + botões [Pagar com Pix | Já paguei | Negociar]
            passos antigos acumulados viram "pulado"; só o mais recente é dito
   envio: dentro de 24h = texto com botões; fora = modelo aprovado; sem modelo = adia 30 min
\`\`\`

## Conversa do cliente
\`\`\`
qualquer mensagem
   ├─ sem nenhuma cobrança ─► "não encontrei pendências" (ou FAQ)
   ├─ titularidade pendente ─► pergunta; "sim" = confirma e mostra resumo; "errado" = remove o número (opt-out)
   ├─ PIX / pagar ─► (escolhe a cobrança, se várias) ─► mensagem + código copia-e-cola
   ├─ PAGUEI ─► (escolhe) ─► cobrança em CONFERÊNCIA (régua pausa); foto/PDF = "comprovante recebido"
   ├─ NEGOCIAR ─► (escolhe) ─► lista [à vista c/ desconto | 2x | 3x ... | outra proposta] ─► proposta registrada, cobrança pausada
   ├─ quanto devo ─► resumo
   └─ dúvida ─► FAQ/IA ─► se não souber: atendente
\`\`\`

## Fluxo normal
Régua (-3 dias) → pergunta de titularidade → “Sim, sou eu” → resumo → “Pagar com Pix” → código → “paguei” → Conferência → **Recebi** → paga.

## Fluxo de dúvida
FAQ cadastrado → resposta. Fora da base → “Não tenho essa informação no momento. Vou encaminhar você para um atendente.” (modo humano).

## Fluxo de erro
Número errado (para tudo e registra) · áudio/mídia sem sentido · comprovante sem “paguei” prévio (orienta) · cliente sem cobrança · Pix não configurado (chama atendente).

## Transferência para humano
Palavra *atendente*, “outra proposta” na negociação, parcela mínima sem opção automática, falta de Pix/link, pergunta sem resposta, erro interno. No modo humano o robô se cala e a **régua não envia avisos automáticos** a essa pessoa; se ninguém devolver a conversa ao robô, a régua volta sozinha depois de 12 h (configurável por HANDOFF_RESUME_HOURS). Se a negociação com a pessoa for longa, use Cobranças > **Pausar 7 dias**.

## Acordo (painel)
Proposta → **Acordos** → escolher 1º vencimento → **Aceitar**: a cobrança original vira “acordo”, são criadas as parcelas (uma por mês, última ajusta os centavos) e o cliente é avisado.
`,
  requisitos: [
    { id: "RF-01", texto: "Régua configurável relativa ao vencimento", status: "Implementado" },
    { id: "RF-02", texto: "Confirmar titularidade antes de revelar dívida", status: "Implementado" },
    { id: "RF-03", texto: "Janela de envio, limite semanal e intervalo mínimo", status: "Implementado" },
    { id: "RF-04", texto: "Recusar textos com ameaça/menção a órgãos de restrição na configuração", status: "Implementado" },
    { id: "RF-05", texto: "Mensagem única consolidada e sem rajada de passos antigos", status: "Implementado" },
    { id: "RF-06", texto: "Pix copia-e-cola válido por cobrança", status: "Implementado" },
    { id: "RF-07", texto: "“Já paguei”, comprovante, conferência e baixa", status: "Implementado" },
    { id: "RF-08", texto: "Negociação com regras do dono e geração de parcelas", status: "Implementado" },
    { id: "RF-09", texto: "Importação por planilha colada e baixa em lote por referência", status: "Implementado" },
    { id: "RF-10", texto: "Opt-out, número errado, exclusão LGPD", status: "Implementado" },
    { id: "RF-11", texto: "Baixa automática de pagamentos (PSP/extrato)", status: "Não implementado" },
    { id: "RF-12", texto: "Cálculo de juros e multa", status: "Não implementado" },
    { id: "RF-13", texto: "Emissão de boleto / link de pagamento próprio", status: "Não implementado" },
    { id: "RF-14", texto: "Integração com ERP/sistema financeiro", status: "Não implementado" },
  ],
  pendencias: [
    "Piloto com número real da WhatsApp Business Platform e o modelo `cobranca_aviso` aprovado (a Meta pode recusar ou cobrar como marketing).",
    "Revisão dos textos padrão, horários e política por um advogado (CDC art. 42, LGPD) antes de oferecer a clientes.",
    "Baixa automática de pagamentos (webhook de PSP/Open Finance ou conciliação de extrato) — hoje é manual.",
    "Juros/multa e emissão de boleto, se o público-alvo exigir.",
    "Revisão/pentest de segurança independente; contrato de suporte/hospedagem.",
  ],
  precos: { venda_unica: 1990, mensalidade: 149, implantacao: 590, personalizacao_hora: 150, racional: [] },
  sales: {
    pagina: `# CobraZap — cobrança que não constrange e não esquece

### Receba em dia sem virar “o chato da cobrança”.

Todo mês é igual: alguns clientes atrasam, você lembra de uns, esquece de outros, e cobrar dá aquele desconforto. O pequeno atraso vira grande.

O **CobraZap** faz o acompanhamento por você, pelo WhatsApp da sua empresa:

- ✅ **Lembra antes de vencer** e **avisa no dia**, com educação.
- ✅ **Acompanha o atraso** na cadência certa — sem encher o cliente de mensagens.
- ✅ **Manda o Pix copia-e-cola** na hora, já com o valor certo.
- ✅ **Negocia dentro das suas regras**: à vista com desconto ou parcelado, com valor mínimo de parcela.
- ✅ **Protege você e o cliente**: antes de falar de dívida, confirma que está falando com a pessoa certa; nunca ameaça; só envia em horário comercial; para quando o cliente pede.

## Como funciona
1. Você cola as cobranças da planilha.
2. O robô cuida da régua de lembretes.
3. O cliente paga pelo Pix, avisa “paguei” ou pede para negociar.
4. Você confere no painel e dá baixa. Pronto.

## Diferenciais
- **Qualquer banco, qualquer chave Pix** — sem trocar de plataforma de cobrança.
- **Travas legais por padrão**: horário, frequência, sem termos de ameaça, sem expor terceiros.
- **Sem comissão** sobre o que você recebe.
- **API oficial do WhatsApp** e dados no seu servidor (LGPD).

## O que ele NÃO faz (para você decidir com clareza)
Não vê o pagamento sozinho (a baixa é manual), não gera boleto, não calcula juros e não negativa nem protesta. Ele **lembra, facilita o pagamento e organiza a negociação**.

## Quanto custa
Veja [PRECIFICACAO.md](PRECIFICACAO.md).

**👉 Quer ver com as cobranças da sua empresa (dados fictícios na demonstração)? Peça 15 minutos.**
`,
    pitch: `# Pitch — CobraZap

## 15 segundos
“Eu coloco no WhatsApp da sua academia uma régua de cobrança educada: lembra antes, avisa no dia, manda o Pix e organiza a negociação — sem constrangimento, dentro da lei, e você só confere e dá baixa.”

## 1 minuto
“Quase todo negócio com mensalidade tem o mesmo problema: o atraso pequeno vira grande porque ninguém acompanha, e cobrar incomoda. O CobraZap faz o acompanhamento pelo seu WhatsApp oficial. Antes de falar de dívida, ele confirma se está falando com a pessoa certa. Depois lembra, manda o Pix copia-e-cola e, se o cliente pedir, oferece as condições de parcelamento que *você* definiu. Se o cliente pedir para parar, para. Você só confere os pagamentos no painel.”

## 3 minutos
1. **Descoberta:** “Quantas mensalidades/cobranças por mês? Quantas atrasam? Quem cobra hoje e como?”
2. **Conta:** “Se o robô fizer você recuperar *uma* mensalidade de R$ ___ por mês, ele já pagou a mensalidade dele.” (aritmética com o valor do cliente; não prometa o resultado.)
3. **Segurança:** “Não expõe o cliente: confirma titularidade, respeita horário, limita mensagens, nunca ameaça.”
4. **Demonstração:** CONVERSAS.md + painel fictício.
5. **Honestidade:** “Ele não vê o pagamento sozinho: você dá baixa. Em compensação funciona com o seu banco atual.”
6. **Próximo passo:** configurar com 10 cobranças reais de teste.

## Mensagem de primeiro contato
> Oi, [Nome]! Eu ajudo academias/escolas a acompanharem mensalidades atrasadas sem constranger o cliente: um assistente no WhatsApp que lembra, manda o Pix e organiza a negociação. Posso mostrar em 10 min com exemplos da sua área?

## Qualificação
- Quantas cobranças por mês e qual o valor médio?
- Como cobram hoje? Quem faz?
- Que chave Pix/banco usam? Já têm plataforma de cobrança (Asaas, etc.)?
- Têm contrato assinado/relação formal com os clientes?
`,
    features: `# Funcionalidades e benefícios — CobraZap

| Funcionalidade | Benefício |
|---|---|
| Régua antes/no dia/depois do vencimento | Constância sem esforço; o pequeno atraso é tratado cedo |
| Confirmação de titularidade | Não expõe dívida a quem não é o devedor (reduz risco jurídico e de imagem) |
| Janela de envio, limite semanal e intervalo mínimo | Não vira assédio; mensagens no melhor momento |
| Sem termos de ameaça (SPC, protesto, processo…) | Conformidade com o CDC; sua marca fica protegida |
| Mensagem única consolidada | Cliente com vários débitos recebe um aviso claro |
| Pix copia-e-cola com o valor certo | Pagar leva segundos |
| “Já paguei” + comprovante + conferência | Cobrança pausa; sem cobrar quem já pagou |
| Negociação guiada com regras suas | Atende quem quer pagar mas não consegue tudo |
| Parcelas geradas automaticamente | Acordo vira nova régua sem planilha |
| Importação por planilha, baixa em lote | Adoção rápida |
| Painel de recebíveis | Visão clara de aberto, vencido e recebido |
| PARAR, número errado, exclusão LGPD | Respeito ao titular |
| API oficial do WhatsApp, dados no seu servidor | Segurança e propriedade dos dados |
`,
    objecoes: `# Objeções — CobraZap

**1. “Já uso Asaas / outra plataforma que manda lembrete.”**
Se ela já cobre o que você precisa (lembrete + pagamento + conciliação), talvez você não precise do CobraZap. Ele faz sentido quando você quer **manter seu banco/Pix atual**, quer uma **negociação conduzida pelo WhatsApp** com suas regras e a **confirmação de titularidade**. Ele *não* faz conciliação automática de pagamentos.

**2. “Cobrar por WhatsApp é permitido?”**
Em geral sim, desde que sem constrangimento, ameaça ou exposição (CDC) e respeitando a LGPD. O CobraZap já vem com travas (horário, frequência, sem termos de ameaça, titularidade). Mesmo assim, **valide a política com seu advogado**.

**3. “E se o cliente se irritar?”**
O tom é cordial, o envio é limitado e **PARAR** funciona na hora. O cliente sempre pode chamar uma pessoa.

**4. “Vou ter que dar baixa à mão?”**
Sim, hoje a baixa é manual (painel, conferência ou lista de referências do extrato). A baixa automática exige integração com banco/PSP e está nas pendências do produto.

**5. “O robô vai mandar mensagem para quem pagou?”**
Só se você ainda não deu baixa. Por isso a rotina diária de conferência é parte do processo; “paguei” já pausa a cobrança.

**6. “Meu cliente não é ‘devedor’, é só atraso.”**
Perfeito — por isso o tom padrão é de lembrete. Você controla o texto de cada passo.

**7. “O WhatsApp pode bloquear meu número?”**
Usa a API oficial, com opt-out, janela de 24 h e modelos aprovados. Não faz envio em massa não solicitado: só para clientes que você já tem relação contratual. A Meta pode, porém, recusar ou reclassificar modelos de cobrança.

**8. “E a LGPD?”**
Dados mínimos, no seu servidor, retenção automática e exclusão do titular (bloqueada se houver dívida aberta). Documentação inclusa; não substitui parecer jurídico.

**9. “Quanto custa por mensagem?”**
O robô tem preço fixo. A Meta cobra por mensagem de modelo enviada fora da janela de 24 h (uma plataforma cita ~US$ 0,008 por mensagem de utilidade no Brasil — confirme a tabela oficial). Respostas dentro da janela costumam ser gratuitas.

**10. “Quanto vou recuperar?”**
Não sei, e ninguém deveria prometer. Depende da sua carteira e da sua relação com os clientes. O painel mostra o recebido para você avaliar.
`,
    faq: `# Perguntas frequentes — CobraZap

**Como importo as cobranças?** Cole na tela Cobranças > Importar uma linha por cobrança: nome; telefone; descrição; valor; vencimento; referência (opcional). Pode copiar direto da planilha.

**O que acontece na primeira mensagem?** O robô pergunta se a pessoa é o(a) titular. Só depois mostra valores.

**E se for número errado?** O cliente toca em “Número errado”: o número é removido de todos os avisos e fica registrado.

**Quais horários o robô cobra?** Os que você configurar, nunca fora de 07h–21h. Padrão: 8h–20h, segunda a sábado.

**Quantas mensagens por semana?** Padrão: no máximo 3 por pessoa, com 48 h de intervalo mínimo.

**Posso escrever meu próprio texto?** Sim, por passo. O sistema recusa ameaças e menções a SPC/Serasa/protesto/processo.

**Como o cliente paga?** Pelo Pix copia-e-cola gerado com a sua chave (ou um código/link que você importar).

**Como sei que ele pagou?** Pela baixa manual no painel (Conferência ou lista de referências). Não há baixa automática nesta versão.

**O que é “Conferência”?** Lista de quem disse “paguei”. Você confere no banco e clica em Recebi ou Não encontrei.

**Como funciona a negociação?** O cliente escolhe uma das opções que você permitiu (à vista com desconto, parcelas com valor mínimo). Você aceita no painel, escolhendo o 1º vencimento; o robô cria as parcelas.

**Calcula juros e multa?** Não nesta versão.

**Gera boleto?** Não.

**Serve para condomínio/associação?** Serve para mensalidades recorrentes; verifique as regras do seu estatuto e consulte um advogado.

**Posso excluir os dados de um cliente?** Sim, quando não há dívida aberta.

**A IA é obrigatória?** Não. Sem IA responde pelo FAQ cadastrado.
`,
    demo: `# Roteiro de demonstração — CobraZap (15 minutos)

## Antes
1. \`node robots/robot-002-cobrazap/demo/servidor-demo.ts\` → http://localhost:3100/admin (chave \`demo-demo-demo-1234\`).
2. Abra \`demo/CONVERSAS.md\`.
3. Descubra: nº de cobranças/mês, valor médio, banco/Pix, quem cobra hoje.

## Roteiro
**1. (2 min) A dor.** “Como cobram hoje? O que acontece com atraso de 3 dias?”

**2. (3 min) A régua.** Conversa 1: o aviso que o robô envia 3 dias antes e *a pergunta de titularidade*. Destaque: “ele não revela valor antes de confirmar a pessoa”.

**3. (2 min) Pagar e avisar.** Pix copia-e-cola, “paguei”, Conferência no painel (**Recebi**).

**4. (2 min) Negociação.** Conversa 5 + tela **Acordos**: aceitar com 1º vencimento → parcelas criadas.

**5. (2 min) Proteções.** Número errado (conversa 3), PARAR, horário/limites (mostrar \`envio\` na configuração), recusa de termos de ameaça (tente salvar “vamos negativar no SPC” e mostre o erro).

**6. (2 min) O painel.** Início (aberto/vencido/recebido), Cobranças, Importar (cole 2 linhas de uma planilha).

**7. (2 min) Honestidade e próximo passo.** Diga o que *não* faz (baixa automática, juros, boleto). Proponha um piloto com 10–20 cobranças reais.

## Cuidados
- Dados fictícios: avise.
- Nunca prometa percentual de recuperação.
- Sugira que o cliente revise a política de cobrança com o advogado dele.
`,
    precificacao: `# Precificação sugerida — CobraZap

> **Sugestões para validar no mercado.** Os números de referência vêm de fontes de datas e confiabilidade variadas; peça propostas atualizadas antes de usar.

| Modelo | Valor sugerido | O que inclui |
|---|---|---|
| **Implantação** | R$ 590 (única) | Número na Meta, modelo \`cobranca_aviso\`, configuração da régua e do Pix, importação inicial, treinamento de 1 h |
| **Mensalidade** (suporte + hospedagem) | R$ 149/mês | Servidor, backup, atualizações, suporte em horário comercial; até ~300 cobranças ativas (acima disso, reavalie) |
| **Venda única** (cliente hospeda) | R$ 1.990 | Pacote + implantação básica; suporte como contrato separado |
| **Personalização** | R$ 150/hora | Textos/passos especiais, integração com ERP/PSP, juros/multa |

## Como cheguei a esses números
1. **Retorno (aritmética, não promessa):** a mensalidade de R$ 149 equivale a recuperar **uma** mensalidade de ~R$ 150 por mês. Use o valor *do cliente*.
2. **Referências (a validar):** o Asaas cita Pix a R$ 0,99–1,99 por cobrança recebida (com franquia gratuita nas primeiras 100 recebimentos por chave, segundo o blog da empresa; páginas de parceiros mostram valores diferentes) e boleto cobrado só quando pago; e já permite lembretes por WhatsApp. **Isso é concorrência real**: o CobraZap só vale para quem quer manter o banco atual, usar sua própria chave Pix sem taxa por cobrança e negociar pelo WhatsApp com regras próprias — em troca da baixa manual.
3. **Custos da Meta:** mensagens de modelo fora da janela de 24 h são cobradas por mensagem (uma plataforma cita ~US$ 0,008 por mensagem de utilidade no Brasil; confirme a tabela oficial). Exemplo: 300 cobranças × 3 avisos = 900 mensagens ≈ US$ 7,3/mês pelo valor citado (converta pela cotação do dia); repasse ou embuta no contrato.
4. **Seu custo:** servidor pequeno + suporte; a mensalidade cobre ~1–2 h/mês por cliente.
5. **Risco regulatório:** o cliente deve ter a política revisada por advogado — considere cobrar a implantação separadamente para cobrir essa orientação.

## Como apresentar
- Mensalidade + piloto de 30 dias com 10–20 cobranças reais.
- Mostre o painel de recebido antes/depois, sem prometer percentual.
- Para quem já usa plataforma de cobrança: posicione como **complemento de relacionamento**, não substituto.

## Validar antes de fixar
- [ ] Cotar 3 soluções de cobrança com WhatsApp na sua região.
- [ ] Perguntar a 5 donos de academias/escolas quanto pagariam.
- [ ] Calcular custo de suporte por cliente.
- [ ] Confirmar com a Meta a categoria e o preço do modelo de cobrança.
`,
  },
};
