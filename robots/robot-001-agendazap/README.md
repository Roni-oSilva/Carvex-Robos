# AgendaZap — Seu atendente de agenda no WhatsApp: marca, confirma, remarca e preenche as vagas — 24 horas por dia.

**Status:** PRONTO · **Versão:** 1.0.0 · **Potencial comercial:** Alto
**Segmentos:** Barbearias, Salões de beleza, Estúdios, Clínicas e consultórios, Pet shops (banho e tosa), Autoescolas (aulas)

O **AgendaZap** é um assistente de agenda que funciona dentro do WhatsApp oficial da empresa. O cliente escolhe serviço, profissional, dia e hora por botões ou digitando; o robô confere a agenda em tempo real, confirma, **lembra antes do horário pedindo confirmação**, permite **remarcar e cancelar** dentro da regra da casa e, quando um horário abre, **avisa quem estava na lista de espera**. A equipe acompanha tudo em um painel simples e assume a conversa quando quiser.

## Para quem é
Donos e recepcionistas de negócios que vendem **horário marcado** com 1 a 10 profissionais e hoje agendam no WhatsApp “na mão”: barbearias, salões, estúdios, clínicas e consultórios pequenos, pet shops.

## Funcionalidades
- **Agendamento por conversa** — Serviço → profissional (ou “sem preferência”) → dia → hora → confirmação, por botões/listas ou texto livre (“amanhã”, “15/10”, “10h30”).
- **Agenda sem conflito** — Reserva atômica no banco: se dois clientes escolhem o mesmo horário, só um garante e o outro recebe novas opções.
- **Regras da casa** — Expediente por profissional, folgas, duração por serviço, intervalo da agenda, antecedência mínima e prazo para cancelar.
- **Lembretes com confirmação** — Até 4 lembretes por horário (padrão 24 h e 2 h). Dentro da janela de 24 h do WhatsApp vão com botões; fora dela, por modelo aprovado.
- **Remarcar e cancelar** — O horário antigo só é cancelado quando o novo é confirmado. Alterações fora do prazo vão para uma pessoa.
- **Lista de espera** — Dia lotado? O cliente entra na fila e é avisado quando abre uma vaga (primeiro a responder leva).
- **Dúvidas sem inventar** — Perguntas e respostas cadastradas + IA opcional restrita ao cadastro. Fora da base: transfere para atendente.
- **Painel da equipe** — Agenda do dia, presença/falta, agendamento manual, lista de espera, conversas e números dos últimos 30 dias.
- **Privacidade (LGPD)** — PARAR/REATIVAR, exclusão de dados do cliente, retenção automática do histórico, mínimo de dados.

## O que ele não faz
- Não cobra nem recebe pagamento (sem sinal ou pré-pagamento).
- Não sincroniza com Google Agenda ou outros sistemas — a agenda do robô é a fonte da verdade (horários marcados fora dele precisam ser lançados pelo painel).
- Não cancela automaticamente quem não confirmou (isso é decisão do dono; hoje o painel mostra “sem confirmar”).
- Um agendamento por vez (não combina vários serviços em sequência automaticamente — use um serviço “combo”, como Corte + Barba).
- Lembretes fora da janela de 24 h só saem com **modelo aprovado pela Meta**; sem modelo, não são enviados.
- Não garante redução de faltas: o resultado depende do negócio. O painel permite medir.

## Começar em 5 minutos (sem WhatsApp)
```bash
# na raiz da fábrica
node robots/robot-001-agendazap/demo/servidor-demo.ts   # painel com dados fictícios em http://localhost:3100/admin (chave: demo-demo-demo-1234)
node robots/robot-001-agendazap/demo/simulate.ts         # regenera demo/CONVERSAS.md com conversas reais do robô
npm test                                      # testes do robô e da camada compartilhada
```

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
```
robots/robot-001-agendazap/
├── src/            código do robô
├── tests/          testes automatizados
├── config/         empresa.exemplo.json (copie para empresa.json)
├── demo/           conversas, painel fictício e roteiro de simulação
├── docs/           manual técnico, do cliente, fluxos, LGPD, segurança, requisitos
├── sales/          página de vendas, pitch, objeções, FAQ, roteiro de demonstração, preços
└── .env.example
```

## Antes de chamar de COMERCIAL
- [ ] Piloto com número real da WhatsApp Business Platform em pelo menos 1 empresa (hoje as integrações foram verificadas contra o formato documentado da API e por simulação, não em produção).
- [ ] Modelo `lembrete_agendamento` aprovado pela Meta e testado de ponta a ponta.
- [ ] Medir faltas antes/depois no piloto antes de usar qualquer número em propaganda.
- [ ] Revisão/pentest de segurança independente e contrato de suporte/hospedagem definido.
- [ ] Cadastro de serviços e profissionais por formulário (hoje é JSON validado) para clientes sem apoio técnico.
