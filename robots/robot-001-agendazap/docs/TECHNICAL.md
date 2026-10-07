# Documentação técnica — AgendaZap

## Arquitetura

```
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
```

## Stack
- **Node.js ≥ 22.18** executando TypeScript diretamente (type stripping), **zero dependências de runtime**.
- **SQLite embutido** (`node:sqlite`): um arquivo, sem servidor de banco. O esquema usa SQL padrão e se traduz quase 1:1 para PostgreSQL/Supabase se um dia a escala exigir.
- **WhatsApp Business Platform (Cloud API)** via `fetch`. **IA opcional** (Anthropic Messages API) via `fetch`.
- Testes: `node --test`. Tipos: `tsc --noEmit` (apenas desenvolvimento).

## Estrutura de arquivos

| Arquivo | Função |
|---|---|
| `src/index.ts` | Ponto de entrada (`node src/index.ts`) |
| `src/robot.ts` | Define o robô: fluxo, tarefas agendadas, páginas do painel |
| `src/settings.ts` | Esquema e validação da configuração; base de conhecimento |
| `src/flow.ts` | Máquina de estados da conversa (agendar, meus horários, lembretes, lista de espera, dúvidas) |
| `src/slots.ts` | Cálculo de horários livres (fuso, folgas, duração, conflitos) |
| `src/store.ts` | Acesso ao banco: reserva atômica, cancelamento, lista de espera, lembretes |
| `src/reminders.ts` | Envio dos lembretes vencidos (respeita janela de 24 h, templates e opt-out) |
| `src/admin.ts` | Páginas do painel: agenda, novo agendamento, lista de espera, resumo |
| `src/migrations.ts` | Tabelas do robô |
| `tests/agenda.test.ts` | Testes automatizados dos fluxos |
| `../../shared/` | Camada compartilhada: webhook, cliente WhatsApp, banco, IA, motor de conversa, painel, Pix, validação |

## Banco de dados
Compartilhadas (todas com `tenant_id`): `tenants`, `contacts`, `conversations`, `messages`, `processed_messages` (idempotência), `events` (métricas).

Deste robô:

| Tabela | Descrição |
|---|---|
| `appointments` | Agendamentos (serviço, profissional, início/fim em UTC, preço, situação, origem). Guarda cópia do nome/preço para o histórico não mudar quando o cadastro muda. |
| `reminders` | Lembretes programados por agendamento (horário, enviado em, resultado, próxima tentativa). |
| `waitlist` | Lista de espera (cliente, serviço, dia, situação). |

Migrações versionadas em `src/migrations.ts` (aplicadas na inicialização, idempotentes). Chaves estrangeiras com `ON DELETE CASCADE` implementam a exclusão LGPD.

## Endpoints

| Método e caminho | Descrição |
|---|---|
| `GET /health` | Verificação de saúde (sem dados sensíveis) |
| `GET /webhook` | Verificação da Meta (`hub.challenge`, comparação em tempo constante) |
| `POST /webhook` | Eventos da Meta: assinatura HMAC-SHA256 obrigatória; limite de 600 req/min por IP; corpo máx. 1 MB |
| `/admin/login`, `/admin/logout` | Autenticação do painel (8 tentativas/min por IP) |
| `/admin`, `/admin/conversas`, `/admin/clientes`, `/admin/config` | Páginas comuns do painel |
| `/admin/agenda` | Agenda do dia; marcar compareceu/faltou/cancelar; criar agendamento manual (`/agenda/novo`) |
| `/admin/espera` | Lista de espera por dia e serviço |

## Variáveis de ambiente
Veja `.env.example` (todas comentadas). Obrigatórias em produção: `ADMIN_TOKEN`, `SESSION_SECRET`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`.

## Autenticação e autorização
- Cada empresa (tenant) tem uma **chave de painel**; só o **hash SHA-256** fica no banco.
- Login cria cookie de sessão assinado (HMAC) com validade de 8 h, `HttpOnly`, `SameSite=Strict`, `Secure` em produção.
- Toda consulta do painel é filtrada pelo `tenant_id` da sessão; ações sobre registros de outra empresa retornam 404 (cobertas por testes).
- POSTs do painel exigem mesma origem (cabeçalhos `Origin`/`Sec-Fetch-Site`) — proteção CSRF adicional ao SameSite.

## Fluxo de uma mensagem
1. Webhook recebe → verifica assinatura → `parseWebhook` normaliza (texto, botão, lista, mídia).
2. `processInbound`: resolve a empresa pelo `phone_number_id` → **idempotência** (`processed_messages`) → limite por contato (30/min) → registra a mensagem.
3. Comandos globais: **PARAR** (opt-out), **REATIVAR**, pedido de **atendente** (modo humano). No modo humano o robô se cala (e volta sozinho após `HANDOFF_RESUME_HOURS`).
4. `robot.handle(ctx, msg)` executa o fluxo do robô (máquina de estados guardada em `conversations.state/data`).
5. Respostas são enviadas e registradas; falha de envio nunca derruba o processamento.
6. Envio proativo (lembretes, avisos): `sendProactive` respeita opt-out e a **janela de 24 horas** (texto livre dentro dela; fora dela, só template aprovado; sem template, não envia).

## IA
Opcional. O texto do cliente é tratado como **dado** (delimitado no prompt), a resposta vem em JSON, e é aceita apenas se `encontrou=true` **e** todos os números citados existirem na base de conhecimento. Falha/timeout da IA → mensagem padrão de encaminhamento humano. Prioridade: perguntas e respostas cadastradas (sem custo, sem IA).

## Deploy e manutenção
- Backup: copiar `DATABASE_PATH` (com o robô parado ou usando `sqlite3 .backup`).
- Atualização: substituir a pasta do código e reiniciar (migrações rodam sozinhas).
- Logs: JSON por linha no stdout, com segredos ocultados e telefones mascarados.
- Escala: um processo atende várias empresas do mesmo robô (webhook resolve o tenant por `phone_number_id`); cadastro de novas empresas: `node scripts/criar-empresa.ts` (no repositório da fábrica).

## Limitações técnicas conhecidas
- Piloto com número real da WhatsApp Business Platform em pelo menos 1 empresa (hoje as integrações foram verificadas contra o formato documentado da API e por simulação, não em produção).
- Modelo `lembrete_agendamento` aprovado pela Meta e testado de ponta a ponta.
- Medir faltas antes/depois no piloto antes de usar qualquer número em propaganda.
- Revisão/pentest de segurança independente e contrato de suporte/hospedagem definido.
- Cadastro de serviços e profissionais por formulário (hoje é JSON validado) para clientes sem apoio técnico.
- Limite de taxa e fila de eventos são em memória (1 processo). Para vários processos, mover para Redis/Postgres.
- O token do WhatsApp é único por processo (serve a várias empresas que deram acesso ao mesmo usuário do sistema/parceiro).
