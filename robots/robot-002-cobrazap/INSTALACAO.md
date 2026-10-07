# Guia de instalação — CobraZap

> Tempo estimado: 1 a 2 horas na primeira vez (a parte mais demorada é a aprovação da Meta, que pode levar dias). Não precisa saber programar, mas precisa seguir os passos com calma.

## 1. O que você precisa ter

| Item | Detalhe |
|---|---|
| Computador ou servidor | Windows, Mac ou Linux, com **Node.js 22.18 ou mais novo** (teste: abra o terminal e digite `node --version`). Baixe em nodejs.org. |
| Número de WhatsApp | Um número que será registrado na WhatsApp Business Platform. Consulte na documentação da Meta como usar um número que hoje está no aplicativo. |
| Conta Meta Business | Em business.facebook.com. Para uso real, a Meta pede a verificação da empresa. |
| Endereço público com HTTPS | O WhatsApp precisa "bater" no seu servidor (webhook). Use um servidor com domínio (ex.: robo.suaempresa.com.br). |
| Chave de IA (opcional) | Só se quiser respostas de IA além do cadastro de perguntas e respostas. |

## 2. Baixar o pacote e abrir a pasta

Descompacte o pacote que você recebeu (ou rode `node scripts/empacotar-robo.ts robot-002-cobrazap` no repositório da fábrica para gerar `dist/robot-002-cobrazap`). Abra o terminal **dentro da pasta**.

## 3. Preencher as senhas e chaves (.env)

1. Copie o arquivo `robots/robot-002-cobrazap/.env.example` para um arquivo chamado `.env` na raiz da pasta.
2. Preencha cada linha conforme os comentários. Para gerar senhas fortes: `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`.
3. **Nunca** envie o `.env` por e-mail/WhatsApp nem coloque em repositórios.

## 4. Cadastrar os dados da empresa

1. Copie `robots/robot-002-cobrazap/config/empresa.exemplo.json` para `robots/robot-002-cobrazap/config/empresa.json`.
2. Abra no Bloco de Notas (ou VS Code) e troque pelos dados reais. O significado de cada campo está em **CONFIGURACAO.md**.
3. Depois de instalado, você pode alterar tudo também pelo painel (menu **Configurações**), que valida antes de salvar.

## 5. Testar no seu computador (sem WhatsApp)

No `.env`, coloque `DRY_RUN=true` e `INSECURE_SKIP_SIGNATURE=true`. Depois:

```bash
# na raiz da pasta do pacote (onde está o .env)
npm start
```

Abra http://localhost:3000/admin e entre com o valor de `ADMIN_TOKEN`. Para ver o painel cheio de dados fictícios: `node robots/robot-002-cobrazap/demo/servidor-demo.ts` (porta 3100; chave: `demo-demo-demo-1234`).

Para simular uma mensagem de cliente sem WhatsApp, com o robô rodando em DRY_RUN:

```bash
curl -X POST http://localhost:3000/webhook -H "content-type: application/json" -d '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"metadata":{"phone_number_id":"x"},"contacts":[{"wa_id":"5511999990000","profile":{"name":"Teste"}}],"messages":[{"id":"t1","from":"5511999990000","timestamp":"1","type":"text","text":{"body":"oi"}}]}}]}]}'
```

A resposta do robô aparece no terminal (`[DRY_RUN] -> ...`).

## 6. Conectar ao WhatsApp (Meta)

> As telas da Meta mudam com frequência. Se algo estiver diferente, siga a documentação oficial: developers.facebook.com/docs/whatsapp/cloud-api

1. Em developers.facebook.com, **Criar app** (tipo *Empresa*) e adicione o produto **WhatsApp**.
2. Em **WhatsApp > Configuração da API** você vê o **ID do número de telefone** (→ `WHATSAPP_PHONE_NUMBER_ID`) e um **token temporário** (vale 24 h, serve só para testar).
3. Para produção, crie um **usuário do sistema** em Configurações do Negócio, dê acesso ao app e à conta do WhatsApp Business e gere um **token permanente** com as permissões `whatsapp_business_messaging` e `whatsapp_business_management` (→ `WHATSAPP_TOKEN`).
4. Em **Configurações do app > Básico**, copie o **Chave secreta do app** (→ `WHATSAPP_APP_SECRET`).
5. Em **WhatsApp > Configuração > Webhook**: URL de retorno `https://SEU-DOMINIO/webhook`; token de verificação = o mesmo valor de `WHATSAPP_VERIFY_TOKEN`. Clique em Verificar (o robô precisa estar no ar). Depois **assine o campo `messages`**.
6. Adicione o número real da empresa e conclua a verificação da empresa quando a Meta pedir.
7. Envie uma mensagem para o número e veja o robô responder.

## 7. Colocar no ar (3 caminhos)

**A) Docker (recomendado)** — no servidor, dentro da pasta do pacote:
```bash
docker build -t robot-002-cobrazap .
docker run -d --name robot-002-cobrazap --restart unless-stopped -p 3000:3000 --env-file .env -v robot-002-cobrazap-data:/data -v "$PWD/robots/robot-002-cobrazap/config:/app/robots/robot-002-cobrazap/config" robot-002-cobrazap
```
Coloque um proxy HTTPS na frente (Caddy ou Nginx) apontando para a porta 3000.

**B) Servidor Linux com systemd** — crie `/etc/systemd/system/robot-002-cobrazap.service`:
```ini
[Unit]
Description=CobraZap
After=network.target
[Service]
WorkingDirectory=/opt/robot-002-cobrazap
EnvironmentFile=/opt/robot-002-cobrazap/.env
ExecStart=/usr/bin/node robots/robot-002-cobrazap/src/index.ts
Restart=always
User=robo
[Install]
WantedBy=multi-user.target
```
Depois: `sudo systemctl enable --now robot-002-cobrazap`.

**C) Plataformas de hospedagem (Render, Railway, Fly.io...)** — use o Dockerfile do pacote, defina as variáveis do `.env` no painel da plataforma e **monte um disco persistente em `/data`** (sem disco persistente o banco é apagado a cada atualização).

### Confirmação
- `https://SEU-DOMINIO/health` deve responder `{"status":"ok",...}`.
- `https://SEU-DOMINIO/admin` abre a tela de login.

## 8. Modelos de mensagem (templates) da Meta

Fora da janela de 24 horas depois da última mensagem do cliente, o WhatsApp **só permite mensagens de modelo aprovadas**. Crie e envie para aprovação em *WhatsApp Manager > Modelos de mensagem*. A Meta decide a categoria final e a cobrança; a aprovação pode levar de minutos a dias e pode ser recusada — ajuste o texto e reenvie.

### Modelo `cobranca_aviso` (categoria sugerida: UTILITY (utilidade) — a Meta pode reclassificar)
Usado em todo aviso enviado por iniciativa da empresa quando o cliente não escreve há mais de 24 horas — inclusive a pergunta de confirmação de titularidade. Um único modelo genérico cobre todos os passos.

Texto sugerido (cada `{{n}}` é preenchido pelo robô):

> Olá {{1}}, aqui é a {{2}}. {{3}}

Parâmetros, na ordem: `{{1}}` = primeiro nome do cliente; `{{2}}` = nome da empresa; `{{3}}` = texto do aviso (o robô monta; sem quebras de linha).

Depois de aprovado pela Meta, coloque o nome (`cobranca_aviso`) no arquivo de configuração da empresa, no campo indicado em CONFIGURACAO.md.

## 9. Primeiro dia

1. Faça 3 conversas de teste com o seu próprio número (fluxo normal, uma dúvida e "falar com atendente").
2. Confira o painel (**Conversas**) e ajuste textos em **Configurações**.
3. Avise à equipe: quando a conversa aparecer como **aguardando atendente**, alguém deve responder pelo painel ou pelo aplicativo.
4. Faça um backup (veja o MANUAL).
