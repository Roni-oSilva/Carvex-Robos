import type { RobotDoc } from "./tipos.ts";

const R$ = (n: number): string => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

export function envExample(r: RobotDoc): string {
  return `# ${r.nome} — variáveis de ambiente
# Copie este arquivo para ".env" (na raiz do pacote) e preencha. NUNCA publique o .env nem envie por e-mail/WhatsApp.

# ---- Servidor
PORT=3000
NODE_ENV=production
# Onde o banco de dados (um único arquivo) fica salvo. Faça backup deste arquivo.
DATABASE_PATH=./data/robot.db
# Identificador curto da sua empresa (letras minúsculas, números e hífen)
TENANT_SLUG=minha-empresa
TIMEZONE=America/Sao_Paulo

# ---- Painel de administração
# Senha do painel (mín. 16 caracteres). Gere uma forte: node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
ADMIN_TOKEN=
# Segredo que assina o login do painel (obrigatório em produção). Gere como acima.
SESSION_SECRET=

# ---- WhatsApp Business Platform (Cloud API oficial da Meta)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
# "App Secret" do app na Meta (Configurações do app > Básico). Usado para validar que o webhook veio mesmo da Meta.
WHATSAPP_APP_SECRET=
# Texto que VOCÊ inventa e cola também na tela de webhook da Meta
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v21.0

# ---- Inteligência artificial (OPCIONAL). Sem a chave, o robô usa só as perguntas e respostas do cadastro.
AI_API_KEY=
AI_MODEL=claude-haiku-5-5

# ---- Ajustes (opcionais)
# Intervalo, em segundos, em que o robô procura tarefas agendadas (lembretes, régua etc.)
TICK_SECONDS=60
# Dias de guarda do histórico de mensagens (LGPD). Depois disso as mensagens são apagadas.
RETENTION_DAYS=180
# Horas sem resposta humana até o robô voltar a atender sozinho
HANDOFF_RESUME_HOURS=12
# "true" se o robô roda atrás de proxy/HTTPS (Nginx, Caddy, Render, Railway...). Necessário para o limite de tentativas de login por IP.
TRUST_PROXY=true
COOKIE_SECURE=true

# ---- Testes locais (NÃO use em produção)
# DRY_RUN=true            -> nada é enviado ao WhatsApp; as mensagens aparecem no terminal
# INSECURE_SKIP_SIGNATURE=true  -> (só com DRY_RUN) aceita webhook sem assinatura para você testar com curl
`;
}

export function changelog(r: RobotDoc): string {
  return `# Histórico de versões — ${r.nome}

## ${r.versao} — primeira versão completa
- Fluxos de conversa, painel de administração, banco de dados multiempresa e testes automatizados.
- Integração com a WhatsApp Business Platform (Cloud API): recebimento por webhook com validação de assinatura, envio de texto, botões, listas e modelos (templates), regra da janela de 24 horas.
- IA opcional restrita ao conhecimento cadastrado (nunca inventa; números fora da base são rejeitados).
- Opt-out (PARAR), exclusão de dados do titular (LGPD) e retenção configurável.

### Antes de vender em escala (pendências conhecidas)
${r.pendencias.map((p) => `- ${p}`).join("\n")}
`;
}

export function instalacao(r: RobotDoc): string {
  const tpl = r.templates.map((t) => `### Modelo \`${t.nome}\` (categoria sugerida: ${t.categoria})
${t.quando}

Texto sugerido (cada \`{{n}}\` é preenchido pelo robô):

> ${t.corpo}

Parâmetros, na ordem: ${t.parametros.map((p, i) => `\`{{${i + 1}}}\` = ${p}`).join("; ")}.

Depois de aprovado pela Meta, coloque o nome (\`${t.nome}\`) no arquivo de configuração da empresa, no campo indicado em CONFIGURACAO.md.`).join("\n\n");
  return `# Guia de instalação — ${r.nome}

> Tempo estimado: 1 a 2 horas na primeira vez (a parte mais demorada é a aprovação da Meta, que pode levar dias). Não precisa saber programar, mas precisa seguir os passos com calma.

## 1. O que você precisa ter

| Item | Detalhe |
|---|---|
| Computador ou servidor | Windows, Mac ou Linux, com **Node.js 22.18 ou mais novo** (teste: abra o terminal e digite \`node --version\`). Baixe em nodejs.org. |
| Número de WhatsApp | Um número que será registrado na WhatsApp Business Platform. Consulte na documentação da Meta como usar um número que hoje está no aplicativo. |
| Conta Meta Business | Em business.facebook.com. Para uso real, a Meta pede a verificação da empresa. |
| Endereço público com HTTPS | O WhatsApp precisa "bater" no seu servidor (webhook). Use um servidor com domínio (ex.: robo.suaempresa.com.br). |
| Chave de IA (opcional) | Só se quiser respostas de IA além do cadastro de perguntas e respostas. |

## 2. Baixar o pacote e abrir a pasta

Descompacte o pacote que você recebeu (ou rode \`node scripts/empacotar-robo.ts ${r.id}\` no repositório da fábrica para gerar \`dist/${r.id}\`). Abra o terminal **dentro da pasta**.

## 3. Preencher as senhas e chaves (.env)

1. Copie o arquivo \`robots/${r.id}/.env.example\` para um arquivo chamado \`.env\` na raiz da pasta.
2. Preencha cada linha conforme os comentários. Para gerar senhas fortes: \`node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"\`.
3. **Nunca** envie o \`.env\` por e-mail/WhatsApp nem coloque em repositórios.

## 4. Cadastrar os dados da empresa

1. Copie \`robots/${r.id}/config/empresa.exemplo.json\` para \`robots/${r.id}/config/empresa.json\`.
2. Abra no Bloco de Notas (ou VS Code) e troque pelos dados reais. O significado de cada campo está em **CONFIGURACAO.md**.
3. Depois de instalado, você pode alterar tudo também pelo painel (menu **Configurações**), que valida antes de salvar.

## 5. Testar no seu computador (sem WhatsApp)

No \`.env\`, coloque \`DRY_RUN=true\` e \`INSECURE_SKIP_SIGNATURE=true\`. Depois:

\`\`\`bash
# na raiz da pasta do pacote (onde está o .env)
npm start
\`\`\`

Abra http://localhost:3000/admin e entre com o valor de \`ADMIN_TOKEN\`. Para ver o painel cheio de dados fictícios: \`node robots/${r.id}/demo/servidor-demo.ts\` (porta 3100; chave: \`demo-demo-demo-1234\`).

Para simular uma mensagem de cliente sem WhatsApp, com o robô rodando em DRY_RUN:

\`\`\`bash
curl -X POST http://localhost:3000/webhook -H "content-type: application/json" -d '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"metadata":{"phone_number_id":"x"},"contacts":[{"wa_id":"5511999990000","profile":{"name":"Teste"}}],"messages":[{"id":"t1","from":"5511999990000","timestamp":"1","type":"text","text":{"body":"oi"}}]}}]}]}'
\`\`\`

A resposta do robô aparece no terminal (\`[DRY_RUN] -> ...\`).

## 6. Conectar ao WhatsApp (Meta)

> As telas da Meta mudam com frequência. Se algo estiver diferente, siga a documentação oficial: developers.facebook.com/docs/whatsapp/cloud-api

1. Em developers.facebook.com, **Criar app** (tipo *Empresa*) e adicione o produto **WhatsApp**.
2. Em **WhatsApp > Configuração da API** você vê o **ID do número de telefone** (→ \`WHATSAPP_PHONE_NUMBER_ID\`) e um **token temporário** (vale 24 h, serve só para testar).
3. Para produção, crie um **usuário do sistema** em Configurações do Negócio, dê acesso ao app e à conta do WhatsApp Business e gere um **token permanente** com as permissões \`whatsapp_business_messaging\` e \`whatsapp_business_management\` (→ \`WHATSAPP_TOKEN\`).
4. Em **Configurações do app > Básico**, copie o **Chave secreta do app** (→ \`WHATSAPP_APP_SECRET\`).
5. Em **WhatsApp > Configuração > Webhook**: URL de retorno \`https://SEU-DOMINIO/webhook\`; token de verificação = o mesmo valor de \`WHATSAPP_VERIFY_TOKEN\`. Clique em Verificar (o robô precisa estar no ar). Depois **assine o campo \`messages\`**.
6. Adicione o número real da empresa e conclua a verificação da empresa quando a Meta pedir.
7. Envie uma mensagem para o número e veja o robô responder.

## 7. Colocar no ar (3 caminhos)

**A) Docker (recomendado)** — no servidor, dentro da pasta do pacote:
\`\`\`bash
docker build -t ${r.id} .
docker run -d --name ${r.id} --restart unless-stopped -p 3000:3000 --env-file .env -v ${r.id}-data:/data -v "$PWD/robots/${r.id}/config:/app/robots/${r.id}/config" ${r.id}
\`\`\`
Coloque um proxy HTTPS na frente (Caddy ou Nginx) apontando para a porta 3000.

**B) Servidor Linux com systemd** — crie \`/etc/systemd/system/${r.id}.service\`:
\`\`\`ini
[Unit]
Description=${r.nome}
After=network.target
[Service]
WorkingDirectory=/opt/${r.id}
EnvironmentFile=/opt/${r.id}/.env
ExecStart=/usr/bin/node robots/${r.id}/src/index.ts
Restart=always
User=robo
[Install]
WantedBy=multi-user.target
\`\`\`
Depois: \`sudo systemctl enable --now ${r.id}\`.

**C) Plataformas de hospedagem (Render, Railway, Fly.io...)** — use o Dockerfile do pacote, defina as variáveis do \`.env\` no painel da plataforma e **monte um disco persistente em \`/data\`** (sem disco persistente o banco é apagado a cada atualização).

### Confirmação
- \`https://SEU-DOMINIO/health\` deve responder \`{"status":"ok",...}\`.
- \`https://SEU-DOMINIO/admin\` abre a tela de login.

## 8. Modelos de mensagem (templates) da Meta

Fora da janela de 24 horas depois da última mensagem do cliente, o WhatsApp **só permite mensagens de modelo aprovadas**. Crie e envie para aprovação em *WhatsApp Manager > Modelos de mensagem*. A Meta decide a categoria final e a cobrança; a aprovação pode levar de minutos a dias e pode ser recusada — ajuste o texto e reenvie.

${tpl || "Este robô não depende de modelos para funcionar; eles só são necessários para avisos fora da janela de 24 horas."}

## 9. Primeiro dia

1. Faça 3 conversas de teste com o seu próprio número (fluxo normal, uma dúvida e "falar com atendente").
2. Confira o painel (**Conversas**) e ajuste textos em **Configurações**.
3. Avise à equipe: quando a conversa aparecer como **aguardando atendente**, alguém deve responder pelo painel ou pelo aplicativo.
4. Faça um backup (veja o MANUAL).
`;
}

export function configuracao(r: RobotDoc): string {
  return `# Guia de configuração — ${r.nome}

Toda a personalização fica em **um arquivo de texto** (\`robots/${r.id}/config/empresa.json\`) e, depois de instalado, também no painel (**Configurações**). **Nada de dados da empresa está dentro do código**: o mesmo robô serve para empresas diferentes só trocando esse arquivo.

## Regras do formato (JSON)
- Textos ficam entre aspas duplas: \`"assim"\`. Números ficam **sem** aspas: \`45.5\` (use ponto, não vírgula).
- Entre um item e outro vai uma vírgula, **menos no último**.
- Se esquecer uma vírgula, o painel avisa o erro e **não salva**.
- IDs (\`"id"\`) usam só letras minúsculas, números, \`-\` e \`_\`, sem espaços nem acentos, e **não devem mudar depois** de usados.

## Campos

| Campo | O que é | Exemplo |
|---|---|---|
${r.config_campos.map((c) => `| \`${c.campo}\` | ${c.descricao} | ${c.exemplo} |`).join("\n")}

## Variáveis de ambiente (.env) × configuração da empresa
- **.env**: segredos e dados técnicos (tokens, senha do painel, porta). Fica no servidor, nunca no painel.
- **empresa.json / painel**: nome, endereço, horários, preços, mensagens — o que o dono da empresa muda no dia a dia.

## Exemplo completo
Veja \`config/empresa.exemplo.json\` (dados fictícios, já validados pelos testes automáticos).
`;
}

export function tecnico(r: RobotDoc): string {
  return `# Documentação técnica — ${r.nome}

## Arquitetura

\`\`\`
 Cliente (WhatsApp)
        │  mensagem
        ▼
 Meta Cloud API ──webhook POST /webhook──►  [ servidor Node (sem frameworks) ]
        ▲                                     │ 1. valida X-Hub-Signature-256 (HMAC, corpo cru)
        │ envio (Graph API)                   │ 2. responde 200 e enfileira
        │                                     │ 3. engine: idempotência → opt-out → handoff → fluxo do robô
        │                                     │ 4. grava no SQLite (tenant_id em tudo)
        └─────────────────────────────────────┘ 5. envia resposta (texto/botões/lista/template)
                                              │
                          painel /admin ◄─────┘ (sessão assinada, HttpOnly, SameSite=Strict)
                          agendador (tick a cada TICK_SECONDS) → tarefas do robô
\`\`\`

## Stack
- **Node.js ≥ 22.18** executando TypeScript diretamente (type stripping), **zero dependências de runtime**.
- **SQLite embutido** (\`node:sqlite\`): um arquivo, sem servidor de banco. O esquema usa SQL padrão e se traduz quase 1:1 para PostgreSQL/Supabase se um dia a escala exigir.
- **WhatsApp Business Platform (Cloud API)** via \`fetch\`. **IA opcional** (Anthropic Messages API) via \`fetch\`.
- Testes: \`node --test\`. Tipos: \`tsc --noEmit\` (apenas desenvolvimento).

## Estrutura de arquivos

| Arquivo | Função |
|---|---|
${r.arquivos.map((a) => `| \`${a.caminho}\` | ${a.descricao} |`).join("\n")}
| \`../../shared/\` | Camada compartilhada: webhook, cliente WhatsApp, banco, IA, motor de conversa, painel, Pix, validação |

## Banco de dados
Compartilhadas (todas com \`tenant_id\`): \`tenants\`, \`contacts\`, \`conversations\`, \`messages\`, \`processed_messages\` (idempotência), \`events\` (métricas).

Deste robô:

| Tabela | Descrição |
|---|---|
${r.tabelas.map((t) => `| \`${t.nome}\` | ${t.descricao} |`).join("\n")}

Migrações versionadas em \`src/migrations.ts\` (aplicadas na inicialização, idempotentes). Chaves estrangeiras com \`ON DELETE CASCADE\` implementam a exclusão LGPD.

## Endpoints

| Método e caminho | Descrição |
|---|---|
| \`GET /health\` | Verificação de saúde (sem dados sensíveis) |
| \`GET /webhook\` | Verificação da Meta (\`hub.challenge\`, comparação em tempo constante) |
| \`POST /webhook\` | Eventos da Meta: assinatura HMAC-SHA256 obrigatória; limite de 600 req/min por IP; corpo máx. 1 MB |
| \`/admin/login\`, \`/admin/logout\` | Autenticação do painel (8 tentativas/min por IP) |
| \`/admin\`, \`/admin/conversas\`, \`/admin/clientes\`, \`/admin/config\` | Páginas comuns do painel |
${r.painel.map((p) => `| \`/admin/${p.pagina}\` | ${p.para_que} |`).join("\n")}

## Variáveis de ambiente
Veja \`.env.example\` (todas comentadas). Obrigatórias em produção: \`ADMIN_TOKEN\`, \`SESSION_SECRET\`, \`WHATSAPP_TOKEN\`, \`WHATSAPP_PHONE_NUMBER_ID\`, \`WHATSAPP_APP_SECRET\`, \`WHATSAPP_VERIFY_TOKEN\`.

## Autenticação e autorização
- Cada empresa (tenant) tem uma **chave de painel**; só o **hash SHA-256** fica no banco.
- Login cria cookie de sessão assinado (HMAC) com validade de 8 h, \`HttpOnly\`, \`SameSite=Strict\`, \`Secure\` em produção.
- Toda consulta do painel é filtrada pelo \`tenant_id\` da sessão; ações sobre registros de outra empresa retornam 404 (cobertas por testes).
- POSTs do painel exigem mesma origem (cabeçalhos \`Origin\`/\`Sec-Fetch-Site\`) — proteção CSRF adicional ao SameSite.

## Fluxo de uma mensagem
1. Webhook recebe → verifica assinatura → \`parseWebhook\` normaliza (texto, botão, lista, mídia).
2. \`processInbound\`: resolve a empresa pelo \`phone_number_id\` → **idempotência** (\`processed_messages\`) → limite por contato (30/min) → registra a mensagem.
3. Comandos globais: **PARAR** (opt-out), **REATIVAR**, pedido de **atendente** (modo humano). No modo humano o robô se cala (e volta sozinho após \`HANDOFF_RESUME_HOURS\`).
4. \`robot.handle(ctx, msg)\` executa o fluxo do robô (máquina de estados guardada em \`conversations.state/data\`).
5. Respostas são enviadas e registradas; falha de envio nunca derruba o processamento.
6. Envio proativo (lembretes, avisos): \`sendProactive\` respeita opt-out e a **janela de 24 horas** (texto livre dentro dela; fora dela, só template aprovado; sem template, não envia).

## IA
Opcional. O texto do cliente é tratado como **dado** (delimitado no prompt), a resposta vem em JSON, e é aceita apenas se \`encontrou=true\` **e** todos os números citados existirem na base de conhecimento. Falha/timeout da IA → mensagem padrão de encaminhamento humano. Prioridade: perguntas e respostas cadastradas (sem custo, sem IA).

## Deploy e manutenção
- Backup: copiar \`DATABASE_PATH\` (com o robô parado ou usando \`sqlite3 .backup\`).
- Atualização: substituir a pasta do código e reiniciar (migrações rodam sozinhas).
- Logs: JSON por linha no stdout, com segredos ocultados e telefones mascarados.
- Escala: um processo atende várias empresas do mesmo robô (webhook resolve o tenant por \`phone_number_id\`); cadastro de novas empresas: \`node scripts/criar-empresa.ts\` (no repositório da fábrica).

## Limitações técnicas conhecidas
${r.pendencias.map((p) => `- ${p}`).join("\n")}
- Limite de taxa e fila de eventos são em memória (1 processo). Para vários processos, mover para Redis/Postgres.
- O token do WhatsApp é único por processo (serve a várias empresas que deram acesso ao mesmo usuário do sistema/parceiro).
`;
}

export function seguranca(r: RobotDoc): string {
  return `# Segurança — ${r.nome}

## O que o sistema faz (e é verificado por testes automáticos)

| Controle | Como |
|---|---|
| Segredos fora do código | Tokens, senhas e chaves só em variáveis de ambiente (\`.env\` fora do Git). O repositório só tem \`.env.example\`. |
| Webhook autêntico | Assinatura \`X-Hub-Signature-256\` (HMAC-SHA256 sobre o corpo cru) validada em tempo constante. Sem assinatura válida → 401. |
| Verificação do webhook | Token comparado em tempo constante. |
| Idempotência | Reenvios da Meta (mesmo id de mensagem) são processados uma vez só. |
| Painel protegido | Chave forte (hash no banco), cookie assinado HttpOnly/SameSite=Strict/Secure, expira em 8 h, limite de tentativas contra força bruta. |
| CSRF | Verificação de origem nos POSTs, além de SameSite. |
| XSS | Todo texto vindo do cliente é escapado no painel (template que escapa por padrão); testado com nomes e descrições maliciosos. |
| Isolamento entre empresas | Todas as tabelas têm \`tenant_id\`; ações cruzadas retornam 404 (testado). |
| Entrada validada | Configuração validada por esquema antes de salvar; valores monetários em centavos inteiros; tamanhos máximos. |
| Logs seguros | Segredos viram \`[oculto]\`; telefones são mascarados (\`5511*****4321\`). |
| Limites | 600 req/min por IP no webhook; 30 mensagens/min por contato; corpo máximo 1 MB. |
| IA contida | Só responde com base no cadastro; números inventados são rejeitados; texto do cliente não vira instrução. |
| Regras da plataforma | Janela de 24 h respeitada; opt-out sempre honrado; nenhum método não oficial. |

## O que você (operador) precisa fazer
- [ ] Gerar \`ADMIN_TOKEN\` e \`SESSION_SECRET\` fortes e diferentes entre si.
- [ ] Servir o painel e o webhook **somente por HTTPS**.
- [ ] Definir \`NODE_ENV=production\`, \`COOKIE_SECURE=true\` e, atrás de proxy, \`TRUST_PROXY=true\`.
- [ ] **Não** usar \`DRY_RUN\`/\`INSECURE_SKIP_SIGNATURE\` em produção.
- [ ] Restringir o acesso ao servidor e ao arquivo do banco (permissões do sistema); fazer backup.
- [ ] Rodar o servidor como usuário sem privilégios (o Dockerfile já faz).
- [ ] Trocar o token do WhatsApp se houver suspeita de vazamento (Meta: Usuários do sistema).
- [ ] Manter o Node.js atualizado.

## Limitações honestas
- O banco (SQLite) **não é criptografado em repouso**. Use disco criptografado no servidor.
- A chave do painel é de fator único (sem 2FA). Compartilhe-a com poucas pessoas e troque ao desligar alguém.
- O limite de tentativas e a fila são em memória (reiniciam com o processo).
- Mídias (fotos/áudios) **não são baixadas nem armazenadas** pelo robô; só o identificador é registrado.
- Não houve teste de invasão (pentest) independente. Recomenda-se um antes de operar com muitos clientes.

## Reportar problemas
Se encontrar uma falha de segurança, não publique detalhes; avise o responsável pela fábrica por canal privado.
`;
}

export function lgpd(r: RobotDoc): string {
  return `# LGPD e privacidade — ${r.nome}

> Este documento descreve **o que o software faz com dados**. Ele não é parecer jurídico: valide as bases legais, os textos de aviso e os contratos com um advogado.

## Papéis
- A **empresa que usa o robô** é a **controladora** dos dados de seus clientes.
- Quem implanta/hospeda o robô para ela costuma ser **operador** (formalize em contrato).

## Dados tratados

| Dado | Para quê | Base legal sugerida |
|---|---|---|
| Número de WhatsApp | Identificar a conversa e responder | Execução de contrato / procedimentos preliminares; legítimo interesse |
| Nome (do perfil do WhatsApp ou informado) | Personalizar o atendimento | Idem |
| Conteúdo das mensagens | Atender e dar contexto ao atendente | Idem |
| Data/hora da última mensagem do cliente | Respeitar a janela de 24 h do WhatsApp | Obrigação técnica da plataforma |
| Preferência de não receber avisos (PARAR) | Honrar a escolha do titular | Obrigação legal / consentimento revogado |
${r.dados.map((d) => `| ${d.dado} | ${d.finalidade} | ${d.base_legal} |`).join("\n")}

**Não coletamos:** documentos (CPF/RG), dados bancários, dados de saúde, localização, nem baixamos fotos/áudios. Se o cliente escrever dados sensíveis espontaneamente, eles ficam apenas no histórico da conversa e são apagados pela retenção ou pela exclusão do titular.

## Onde ficam
Em um arquivo SQLite no **servidor da própria empresa** (\`DATABASE_PATH\`). Não há banco em nuvem do fabricante do robô.

## Com quem os dados são compartilhados (integrações)
| Destinatário | O que recebe | Quando |
|---|---|---|
| Meta / WhatsApp | Mensagens enviadas e recebidas (é o canal) | Sempre |
| Provedor de hospedagem | Armazena o servidor e o banco | Sempre (escolha um com contrato de proteção de dados) |
| Provedor de IA (Anthropic) | Pergunta do cliente + texto do cadastro da empresa; **sem nome nem telefone** | Somente se \`AI_API_KEY\` estiver configurada e a pergunta não estiver no cadastro |

## Retenção
Mensagens são apagadas automaticamente após \`RETENTION_DAYS\` dias (padrão 180). Registros do robô (${r.tabelas.map((t) => t.nome).join(", ")}) seguem a necessidade do negócio e a exclusão abaixo.

## Direitos do titular
- **Parar de receber avisos:** o cliente responde **PARAR** a qualquer momento; vale imediatamente. **REATIVAR** desfaz.
- **Exclusão:** painel > **Clientes** > **Excluir dados** apaga o cliente e tudo ligado a ele (conversas, mensagens, registros do robô). O sistema recusa a exclusão quando há pendências abertas, para não perder obrigações do negócio — resolva-as antes. Obrigações fiscais/contábeis devem ficar no sistema financeiro da empresa, não no robô.
- **Acesso/correção:** o painel mostra o histórico do cliente; correções são feitas pela equipe.

## Boas práticas recomendadas à empresa
1. Informar na primeira conversa/no site que o atendimento usa um assistente automatizado e como falar com uma pessoa (o robô já oferece **ATENDENTE**).
2. Manter a política de privacidade atualizada e indicar o encarregado (DPO) ou canal de contato.
3. Treinar a equipe: não pedir nem registrar dados desnecessários nas conversas.
4. Em caso de incidente, seguir o plano da empresa e comunicar a ANPD e os titulares quando exigido.
`;
}

export function requisitos(r: RobotDoc): string {
  const icon = { Implementado: "✅", Parcial: "🟡", "Não implementado": "⬜" } as const;
  return `# Requisitos — ${r.nome}

## Requisitos de ambiente
- Node.js ≥ 22.18; 256 MB de RAM e 1 GB de disco bastam para uma empresa pequena.
- Domínio com HTTPS válido e porta de entrada para o webhook.
- Conta Meta Business + número na WhatsApp Business Platform; modelos de mensagem aprovados (veja INSTALACAO.md).
- (Opcional) Chave de API de IA.

## Requisitos funcionais

| ID | Requisito | Situação |
|---|---|---|
${r.requisitos.map((q) => `| ${q.id} | ${q.texto} | ${icon[q.status]} ${q.status} |`).join("\n")}

## Requisitos não funcionais

| ID | Requisito | Situação |
|---|---|---|
| RNF-01 | Nenhum segredo no código ou no Git | ✅ Implementado |
| RNF-02 | Webhook autenticado por assinatura | ✅ Implementado |
| RNF-03 | Respeito à janela de 24 h e às regras de templates | ✅ Implementado |
| RNF-04 | Multiempresa (tenant_id em todas as tabelas, painel isolado) | ✅ Implementado |
| RNF-05 | Instalação sem dependências externas de runtime | ✅ Implementado |
| RNF-06 | LGPD: opt-out, exclusão, retenção, minimização | ✅ Implementado |
| RNF-07 | Testes automatizados dos fluxos principais | ✅ Implementado |
| RNF-08 | Escala horizontal (vários processos) | ⬜ Não implementado (fila e limites em memória; SQLite) |
| RNF-09 | Criptografia do banco em repouso | ⬜ Não implementado (use disco criptografado) |
| RNF-10 | Autenticação em dois fatores no painel | ⬜ Não implementado |

## Pendências antes de marcar como COMERCIAL
${r.pendencias.map((p) => `- ${p}`).join("\n")}
`;
}

export function manual(r: RobotDoc): string {
  return `# Manual de uso — ${r.nome}
*${r.slogan}*

Este manual é para quem **não é programador**. Quando aparecer um termo técnico, ele é explicado na hora.

## 1. O que é
${r.resumo}

## 2. Para quem serve
${r.publico}

## 3. Qual problema resolve
${r.problema}

## 4. Como funciona
${r.como_funciona.map((p, i) => `${i + 1}. ${p}`).join("\n")}

**O que o robô NÃO faz** (para você não se surpreender):
${r.limites.map((l) => `- ${l}`).join("\n")}

## 5. Como instalar
Siga o arquivo **INSTALACAO.md**, passo a passo.

## 6. Como configurar
Todos os dados da empresa ficam em um arquivo de texto e no menu **Configurações** do painel. O significado de cada campo está em **CONFIGURACAO.md**.

## 7. Como conectar o WhatsApp
Passo 6 do **INSTALACAO.md**. Resumo: criar o app na Meta, copiar 4 informações (token, ID do número, chave secreta do app e um texto de verificação que você inventa) para o arquivo \`.env\` e cadastrar o endereço do webhook na Meta.

## 8. Como configurar a IA (opcional)
- Sem IA, o robô responde com as **perguntas e respostas que você cadastrou** (campo \`faq\`). É grátis, rápido e 100% previsível.
- Com IA (\`AI_API_KEY\` no \`.env\`), perguntas que não estão no cadastro são respondidas **somente com base nas informações da empresa**. Se a resposta não estiver lá, o robô diz: *"Não tenho essa informação no momento. Vou encaminhar você para um atendente."*
- A IA tem custo por uso (cobrado pelo provedor). Consulte o preço atual no site do provedor.

## 9. Como configurar o banco de dados
Não precisa. O robô cria sozinho um arquivo (\`DATABASE_PATH\`, padrão \`./data/robot.db\`). Só garanta que a pasta fique num disco que **não seja apagado** quando o servidor reiniciar e faça backup (item 18).

## 10. Como cadastrar as informações da empresa
${r.manual.cadastrar_info}

## 11. Como alterar as mensagens
${r.manual.mensagens}

## 12. Como alterar ${r.nome === "AgendaZap" ? "serviços e profissionais" : r.nome === "CobraZap" ? "a régua de cobrança" : "o cardápio e as regras de entrega"}
${r.manual.alterar_servicos}

## 13. Como alterar preços
${r.manual.alterar_precos}

## 14. Como ver as conversas
Painel > **Conversas**. Mostra todos os clientes, quem está atendendo (robô ou pessoa) e o histórico. Conversas **aguardando atendente** aparecem no topo, em amarelo. A página atualiza sozinha a cada 30 segundos.

## 15. Como transferir para uma pessoa
- **O cliente pede:** basta escrever *atendente* (ou tocar no botão). O robô para de responder e a conversa vai para o topo da lista.
- **Você assume:** Painel > Conversas > abrir a conversa > **Assumir atendimento**.
- **Responder:** na própria conversa, caixa de texto > **Enviar**. (O WhatsApp só permite texto livre até 24 horas depois da última mensagem do cliente; passado esse prazo a caixa é bloqueada.)
- **Devolver ao robô:** botão **Devolver ao robô**. Se ninguém mexer por ${"12"} horas, o robô volta sozinho.

## 16. Como resolver problemas

| O que acontece | Provável causa | O que fazer |
|---|---|---|
| Não abre o painel | Robô desligado ou endereço errado | Abra \`/health\`. Se não responder, reinicie o robô. |
| "Chave inválida" no login | Chave do \`ADMIN_TOKEN\` diferente | Confira o \`.env\`; reinicie após mudar. |
| O robô não responde no WhatsApp | Webhook não verificado, token expirado ou campo \`messages\` sem assinatura | Confira a tela de webhook da Meta; gere token permanente (INSTALACAO, passo 6). |
| Webhook "não verificado" | \`WHATSAPP_VERIFY_TOKEN\` diferente do digitado na Meta | Use o mesmo texto nos dois lugares e reinicie. |
| Mensagens chegam mas nenhuma resposta sai | \`WHATSAPP_TOKEN\` expirado/sem permissão | Veja o log: "envio_falhou". Gere um novo token. |
| "Configuração inválida" ao salvar | Vírgula, aspas ou valor fora do permitido | A mensagem diz o campo; corrija e salve de novo. |
| Aviso automático não sai | Cliente fora da janela de 24 h e sem modelo aprovado | Cadastre o modelo da Meta (INSTALACAO, passo 8). |
${r.manual.problemas.map((p) => `| ${p.sintoma} | ${p.causa} | ${p.solucao} |`).join("\n")}

## 17. Como atualizar
1. Faça backup (item 18).
2. Substitua a pasta do código pela nova versão (**mantenha** o \`.env\`, a pasta \`config\` e a pasta de dados).
3. Reinicie o robô. As alterações no banco são aplicadas sozinhas.
4. Confira \`/health\` (mostra a versão) e faça uma conversa de teste.

## 18. Como fazer backup
- Pare o robô (ou use uma hora de pouco movimento) e **copie o arquivo do banco** (\`DATABASE_PATH\`) para outro lugar, com data no nome: \`robot-2026-10-07.db\`.
- Copie também o \`.env\` e \`config/empresa.json\` (guarde em local seguro: contêm segredos).
- Faça isso toda semana, no mínimo. Teste restaurar uma vez para ter certeza.

## 19. Como desligar
- Docker: \`docker stop ${r.id}\`. systemd: \`sudo systemctl stop ${r.id}\`. Terminal: \`Ctrl + C\`.
- Para parar de vez: cancele o webhook na Meta e apague o servidor **depois** de exportar o que precisar. Para apagar os dados de clientes, use **Excluir dados** no painel antes.

## 20. Perguntas frequentes
**O cliente percebe que é um robô?** O robô se apresenta como assistente virtual e sempre oferece falar com uma pessoa.
**Posso usar o mesmo número no celular?** Depende da conexão do número com a API; veja a documentação da Meta sobre uso do aplicativo e da API no mesmo número.
**Quanto a Meta cobra?** Respostas dentro de 24 h após a mensagem do cliente costumam ser gratuitas; mensagens de modelo enviadas por iniciativa da empresa são cobradas por mensagem. Confira a tabela atual em developers.facebook.com/docs/whatsapp/pricing.
**O robô pode errar?** Pode: ele segue regras e o cadastro que você fez. Por isso confira o painel nos primeiros dias e ajuste os textos.
**E se cair a internet/servidor?** Mensagens recebidas nesse período são reenviadas pela Meta por um tempo, mas lembretes agendados podem atrasar. Use \`Restart=always\`/\`--restart unless-stopped\`.
`;
}

export function clientManual(r: RobotDoc): string {
  return `# Manual do cliente — ${r.nome}
*Para o dono e a equipe da empresa que usa o robô.*

## O que o robô faz por você
${r.como_funciona.map((p) => `- ${p}`).join("\n")}

## Sua rotina no painel
${r.cliente.rotina.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Endereço do painel: **\`https://SEU-ENDERECO/admin\`** — entre com a chave de acesso que a implantação te entregou (guarde em local seguro e não compartilhe com quem não trabalha na empresa).

## Páginas do painel
| Página | Para que serve |
|---|---|
| Início | Resumo dos números |
${r.painel.map((p) => `| ${p.pagina.replace(/\/.*$/, "")[0].toUpperCase()}${p.pagina.replace(/\/.*$/, "").slice(1)} | ${p.para_que} |`).join("\n")}
| Conversas | Ver o que foi conversado, assumir o atendimento e responder |
| Clientes | Lista de clientes; excluir dados de quem pedir (LGPD) |
| Configurações | Mudar textos, horários e preços |

## Regras de ouro
${r.cliente.regras_de_ouro.map((p) => `- ${p}`).join("\n")}
- **Conversa "aguardando atendente"?** Responda o quanto antes — o cliente já pediu uma pessoa.
- **Regra do WhatsApp:** você só pode escrever livremente até **24 horas depois da última mensagem do cliente**. Depois disso, só mensagens de modelo aprovado (o robô cuida disso quando configurado).
- **Cliente escreveu PARAR?** O robô não envia mais avisos automáticos a essa pessoa. Respeite: não tente contornar.
- **Nunca** envie a chave do painel por WhatsApp ou e-mail.

## Precisa de ajuda?
Fale com o responsável pela sua implantação: **{{NOME_DO_SUPORTE}} — {{CONTATO_DO_SUPORTE}}** (preencha antes de entregar ao cliente).
`;
}

export function readme(r: RobotDoc): string {
  return `# ${r.nome} — ${r.slogan}

**Status:** ${r.status} · **Versão:** ${r.versao} · **Potencial comercial:** ${r.potencial}
**Segmentos:** ${r.segmentos.join(", ")}

${r.resumo}

## Para quem é
${r.publico}

## Funcionalidades
${r.funcionalidades.map((f) => `- **${f.titulo}** — ${f.descricao}`).join("\n")}

## O que ele não faz
${r.limites.map((l) => `- ${l}`).join("\n")}

## Começar em 5 minutos (sem WhatsApp)
\`\`\`bash
# na raiz da fábrica
node robots/${r.id}/demo/servidor-demo.ts   # painel com dados fictícios em http://localhost:3100/admin (chave: demo-demo-demo-1234)
node robots/${r.id}/demo/simulate.ts         # regenera demo/CONVERSAS.md com conversas reais do robô
npm test                                      # testes do robô e da camada compartilhada
\`\`\`

## Documentação
| Documento | Para quem |
|---|---|
| [MANUAL.md](MANUAL.md) | Quem opera o robô (não programador) |
| [INSTALACAO.md](INSTALACAO.md) | Quem instala |
| [CONFIGURACAO.md](CONFIGURACAO.md) | Quem personaliza para uma empresa |
| [docs/CLIENT-MANUAL.md](docs/CLIENT-MANUAL.md) | Entregar ao cliente final |
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | Desenvolvedores |
| [docs/FLUXOS.md](docs/FLUXOS.md) | Fluxos de conversa |
| [docs/REQUISITOS.md](docs/REQUISITOS.md) | Requisitos e pendências |
| [docs/SEGURANCA.md](docs/SEGURANCA.md) · [docs/LGPD.md](docs/LGPD.md) | Segurança e privacidade |
| [demo/CONVERSAS.md](demo/CONVERSAS.md) | Conversas de demonstração (geradas pelo robô real) |
| [sales/](sales/) | Material de venda |

## Estrutura
\`\`\`
robots/${r.id}/
├── src/            código do robô
├── tests/          testes automatizados
├── config/         empresa.exemplo.json (copie para empresa.json)
├── demo/           conversas, painel fictício e roteiro de simulação
├── docs/           manual técnico, do cliente, fluxos, LGPD, segurança, requisitos
├── sales/          página de vendas, pitch, objeções, FAQ, roteiro de demonstração, preços
└── .env.example
\`\`\`

## Antes de chamar de COMERCIAL
${r.pendencias.map((p) => `- [ ] ${p}`).join("\n")}
`;
}

export function vendas(r: RobotDoc): Record<string, string> {
  return {
    "SALES-PAGE.md": r.sales.pagina,
    "PITCH.md": r.sales.pitch,
    "FEATURES.md": r.sales.features,
    "OBJECTIONS.md": r.sales.objecoes,
    "FAQ.md": r.sales.faq,
    "DEMO-SCRIPT.md": r.sales.demo,
    "PRECIFICACAO.md": r.sales.precificacao,
  };
}

export { R$ };
