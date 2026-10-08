# Fábrica de Robôs WhatsApp

Uma **fábrica de produtos de automação**: pesquisa problemas reais de pequenos negócios, escolhe os que valem a pena e entrega **robôs de WhatsApp prontos para instalar, demonstrar e vender** — cada um na sua pasta, com manual, material comercial, demonstração e testes.

> **Estado honesto:** os 3 primeiros robôs estão **PRONTOS** (código, testes, documentação e material de venda completos), mas **ainda não COMERCIAIS**: nenhum foi testado em produção com credenciais reais da Meta nem com cliente pagante. Veja as pendências de cada um em [ROBOTS.md](ROBOTS.md).

## Robôs disponíveis

| Robô | Para quem | O que faz | Status |
|---|---|---|---|
| [**AgendaZap**](robots/robot-001-agendazap) | Barbearias, salões, clínicas, pet shops | Agenda 24 h, lembretes com confirmação, remarcar/cancelar, lista de espera, painel | PRONTO |
| [**CobraZap**](robots/robot-002-cobrazap) | Academias, escolas, prestadores com mensalidade | Régua de cobrança educada com travas legais, Pix copia-e-cola, negociação, conferência | PRONTO |
| [**PedidoZap**](robots/robot-003-pedidozap) | Pizzarias, lanchonetes, deliveries | Cardápio, carrinho, taxa por bairro, Pix, quadro de pedidos, avisos de status | PRONTO |

Painel interno: [ROBOTS.md](ROBOTS.md) · Catálogo comercial: [CATALOG.md](CATALOG.md) · Como foram escolhidos: [market-research/opportunities.md](market-research/opportunities.md) (22 oportunidades, com fontes, notas e ranking).

## Página de vendas
`site/index.html` — página única da **Carvex Tecnologia** (autocontida, sem dependências): demonstrações de conversa interativas, preços, FAQ e botão **Comprar um robô** que abre o WhatsApp com a mensagem pronta.
`npm run site` abre em http://localhost:4000. O WhatsApp de vendas já está configurado (`CONFIG.whatsapp`); a logo oficial da Carvex já está em `site/assets/`. Publicação na Vercel: veja `site/LEIA-ME.md` (o `vercel.json` da raiz serve a pasta `site/`).

## Como funciona (a fábrica)

```
 pesquisa de mercado ──► ranking (0-100) ──► seleção ──► robô (código + testes) ──► documentação + vendas ──► catálogo
 market-research/        opportunities.md    5 escolhidas   robots/robot-00N-*          scripts/docs → sales/      ROBOTS.md / CATALOG.md
                                             3 construídas       ▲
                                                                 └── usa a camada compartilhada shared/
```

1. **Pesquisa:** `market-research/opportunities.json` guarda cada oportunidade com **fontes e URLs**. A pontuação 0–100 é calculada por 10 critérios ponderados (`criterios.json`); `npm run docs` gera o ranking.
2. **Robôs:** cada pasta em `robots/` é independente e usa a mesma camada `shared/` (sem duplicar código).
3. **Documentação e vendas:** geradas de `scripts/docs/` (partes comuns por modelo; partes de cada robô escritas à mão) e **verificadas por testes** para nunca ficarem desatualizadas.

## Arquitetura

- **Node.js ≥ 22.18**, TypeScript executado direto (sem build), **zero dependências de runtime** (só `typescript` e `@types/node` para checagem de tipos).
- **SQLite embutido** (`node:sqlite`), esquema **multiempresa** (`tenant_id` em tudo; painel isolado por chave).
- **WhatsApp Business Platform (Cloud API oficial):** webhook com assinatura HMAC, janela de 24 h, templates, botões/listas, opt-out. Nada de métodos não oficiais.
- **IA opcional** (Anthropic Messages API) **restrita ao cadastro da empresa**: não inventa; sem resposta, diz “Não tenho essa informação no momento. Vou encaminhar você para um atendente.”
- **Painel** de administração por robô (agenda, cobranças, pedidos, conversas, clientes, configurações).

```
shared/            camada compartilhada (whatsapp, database, ai, auth, dashboard, engine, payments/pix, utils, testing)
robots/            um robô por pasta + registry.ts
market-research/   oportunidades, critérios, geração do ranking
scripts/           empacotar-robo, criar-empresa, gerar-docs, gerar-catalogo, gerar-demos + testes da fábrica
docs/              NOVO-ROBO.md
.github/workflows/ CI (tipos + testes)
```

## Executar

```bash
npm install                      # só ferramentas de desenvolvimento (tsc)
npm test                         # ~140 testes: camada compartilhada, 3 robôs, pesquisa, docs, segredos, empacotamento
npm run typecheck

# ver um robô funcionando (dados fictícios, sem WhatsApp):
node robots/robot-001-agendazap/demo/servidor-demo.ts      # http://localhost:3100/admin  (chave: demo-demo-demo-1234)
node robots/robot-002-cobrazap/demo/servidor-demo.ts
node robots/robot-003-pedidozap/demo/servidor-demo.ts

npm run demo                     # regenera demo/CONVERSAS.md de cada robô (o robô real respondendo)
npm run docs                     # regenera documentação, catálogo e ranking
```

### Instalar um robô para um cliente
```bash
node scripts/empacotar-robo.ts robot-001-agendazap          # gera dist/robot-001-agendazap(.tar.gz) — pasta autônoma com Dockerfile
# no servidor do cliente: siga robots/robot-001-agendazap/INSTALACAO.md (Meta + .env + empresa.json)

# vários clientes no mesmo robô (uma instalação):
node scripts/criar-empresa.ts --robo robot-001-agendazap --slug barbearia-ze --config empresa.json --phone-number-id 123456
```

## Criar novos robôs
Siga [docs/NOVO-ROBO.md](docs/NOVO-ROBO.md). Resumo: pesquise de novo, **não repita** o que existe, registre a oportunidade com fontes, implemente `Robot<Settings>` reaproveitando `shared/`, escreva testes, gere a documentação e só então mude o status.

## Segurança e privacidade
Segredos só em variáveis de ambiente (há um teste que varre o repositório); `.env` nunca versionado; webhook autenticado; painel com cookie assinado e proteção CSRF/XSS testadas; isolamento entre empresas testado; LGPD (PARAR, exclusão do titular, retenção). Detalhes e limitações em `robots/*/docs/SEGURANCA.md` e `LGPD.md`. Nenhum desses documentos substitui parecer jurídico ou pentest independente.

## Contribuir
1. Crie uma branch, faça a mudança e rode `npm run docs && npm test && npm run typecheck`.
2. Mudou fluxo ou configuração de um robô? Atualize `scripts/docs/conteudo/<robô>.ts` e regenere (o teste de sincronia falha se esquecer).
3. Não inclua segredos, dados reais de clientes nem arquivos `.env`.

## Histórico
O repositório começou com um projeto de fábrica de **e-books** (Next.js + Supabase). Ele foi removido da árvore atual a pedido do dono do projeto e continua acessível no histórico do Git (commit `91e2e33`).
