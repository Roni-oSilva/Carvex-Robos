# Como criar um novo robô

> Regra de ouro da fábrica: **comece por um problema real, com evidência, e por quem pagaria para resolvê-lo** — não pelo que é divertido programar. Não crie robôs quase idênticos só para aumentar a quantidade.

## 0. Quando alguém pedir “crie mais robôs”
1. Releia [ROBOTS.md](../ROBOTS.md) e [market-research/opportunities.md](../market-research/opportunities.md) para **não repetir** o que já existe.
2. **Pesquise de novo** na web (segmentos, dores, concorrentes, preços). Anote **fonte e URL** de cada evidência.
3. Acrescente as oportunidades novas em `market-research/opportunities.json` (notas de 0 a 10 por critério; veja `criterios.json`) e rode `npm run docs`.
4. Escolha pelo ranking **e** pela diferença em relação aos robôs atuais (um segmento novo ou uma dor nova; variações de segmento viram *configuração* do robô existente, não robô novo).
5. Valide a ideia com 5 conversas reais antes de investir.

## 1. Criar o robô
```
robots/robot-00N-nome/
├── src/        index.ts, robot.ts, settings.ts, flow.ts, store.ts, migrations.ts, admin.ts [, tarefas agendadas]
├── tests/      nome.test.ts
├── config/     empresa.exemplo.json
└── demo/       simulate.ts, servidor-demo.ts
```
Use qualquer robô existente como modelo. Um robô é um objeto `Robot<Settings>` (veja `shared/engine/types.ts`):

| Campo | Para quê |
|---|---|
| `id`, `nome`, `version` | Identificação |
| `migrations` | Tabelas do robô (todas com `tenant_id`) |
| `defaultSettings()` / `validateSettings(raw)` | Configuração da empresa — **nada fixo no código**; use `Check` de `shared/utils/validate.ts` |
| `knowledge(settings)` | Base de conhecimento para FAQ/IA (a IA nunca inventa) |
| `handle(ctx, msg)` | Máquina de estados da conversa; devolve mensagens (`text`, `buttons`, `list`, `template`) |
| `tick(env, now)` | (opcional) Tarefas periódicas: lembretes, réguas… use `sendProactive` (respeita opt-out e janela de 24 h) |
| `admin` | Menu, página inicial e rotas do painel (use `h` — escapa HTML — e filtre sempre por `ctx.tenant.id`) |
| `beforeDeleteContact` | (opcional) Bloqueia a exclusão LGPD quando há pendências |

Registre em `robots/registry.ts`.

## 2. Regras que todo robô cumpre
- Segredos só em variáveis de ambiente; `.env.example` sem valores.
- Webhook, janela de 24 h, opt-out (PARAR), atendente humano e idempotência já vêm do motor — **não reimplemente**.
- Dinheiro em **centavos inteiros**; preços e totais calculados no servidor.
- Entrada do usuário sempre validada/sanitizada; nenhuma consulta sem `tenant_id`.
- A IA, se usada, só responde com o cadastro da empresa; sem resposta → *“Não tenho essa informação no momento. Vou encaminhar você para um atendente.”*
- Dados mínimos (LGPD) e descrição em `dados` do conteúdo de documentação.

## 3. Testes (obrigatórios)
Fluxo principal, fluxo de dúvida, erros/entradas inválidas, transferência para humano, opt-out, regras de negócio, painel (login, XSS, isolamento entre empresas), configuração válida/ inválida. Rode `npm test`.

## 4. Documentação e material de venda
Crie `scripts/docs/conteudo/nome.ts` (copie um existente) com resumo, funcionalidades, **limites**, campos de configuração, modelos da Meta, dados pessoais, fluxos, requisitos, **pendências**, preços e todo o material de `sales/`. Adicione o robô em `scripts/gerar-docs.ts` e rode:

```bash
npm run docs     # README, manuais, LGPD, segurança, vendas, ROBOTS.md, CATALOG.md, opportunities.md
npm run demo     # regenera demo/CONVERSAS.md rodando o robô de verdade
npm test         # inclui: documentação sincronizada, checklist "PRONTO", varredura de segredos, empacotamento
```

## 5. Status do robô
`IDEIA → PESQUISA → PLANEJADO → DESENVOLVIMENTO → TESTE → PRONTO → COMERCIAL → DESCONTINUADO`

**PRONTO** exige o checklist (código, estrutura, configuração, `.env.example`, integrações, tratamento de erros, testes, README, manual técnico e do cliente, instalação, configuração, demonstração, material comercial, FAQ, pitch, requisitos, segurança, LGPD, preço, público, diferenciais, fluxos) — o teste `checklist PRONTO` verifica os arquivos.
**COMERCIAL** exige ainda: piloto com credenciais reais da Meta, modelos aprovados, um cliente real e revisão jurídica/segurança.

## 6. Empacotar e entregar
```bash
node scripts/empacotar-robo.ts robot-00N-nome     # gera dist/robot-00N-nome (+ .tar.gz)
node scripts/criar-empresa.ts --robo robot-00N-nome --slug cliente --config empresa.json --phone-number-id 123
```
