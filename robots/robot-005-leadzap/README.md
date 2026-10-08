# LeadZap — Responde na hora, mostra os imóveis certos, agenda a visita e entrega o lead pronto ao corretor.

**Status:** PRONTO · **Versão:** 1.0.0 · **Potencial comercial:** Alto
**Segmentos:** Imobiliárias pequenas e médias, Corretores autônomos e equipes, Loteadoras e construtoras pequenas, Administradoras de aluguel

O **LeadZap** atende o interessado na hora: pergunta se quer **comprar ou alugar**, tipo de imóvel, bairro, faixa de valor, quartos e prazo, e mostra **somente imóveis do seu cadastro** que cabem no perfil. Se o cliente gostar, **agenda a visita** em horários livres daquele imóvel, **lembra e pede confirmação** antes. O lead vai para o painel **classificado como quente, morno ou frio** (regra de pontos transparente), **já atribuído ao corretor** do bairro, com todo o resumo. Se o cliente some, o robô faz **um** acompanhamento com opções reais do cadastro, e depois o lead vira "sem resposta" para a equipe decidir.

## Para quem é
Imobiliárias e corretores que recebem **interessados pelo WhatsApp** (anúncios, portais, placas) e perdem negócio porque o primeiro contato demora, a qualificação é feita de forma desigual e as visitas marcadas não acontecem.

## Funcionalidades
- **Qualificação em poucos toques** — Finalidade, tipo, bairro, faixa de valor, quartos e prazo — com botões e listas.
- **Imóveis só do seu cadastro** — Mostra apenas imóveis disponíveis que cabem no perfil. Nada de imóvel inventado.
- **Temperatura transparente** — Quente, morno ou frio por pontos fixos (prazo, imóvel compatível, interesse, visita). Você enxerga a regra.
- **Roteamento ao corretor** — Atribui ao corretor que atende o bairro com menos leads em aberto; você troca no painel quando quiser.
- **Agendamento de visita** — Horários livres por imóvel, antecedência mínima, sem duas visitas no mesmo horário do mesmo imóvel.
- **Lembrete e confirmação** — Aviso antes da visita com botões Confirmo, Remarcar e Cancelar visita.
- **Acompanhamento do lead** — Um follow-up com opções reais do cadastro; depois, "sem resposta". Respeita quem pediu para parar e quem está em atendimento humano.
- **Painel de leads** — Quentes primeiro, filtro por corretor, resumo completo, link direto para o WhatsApp e motivos de perda.
- **Agenda de visitas** — Próximas visitas com resultado (realizada, faltou, cancelada) para medir comparecimento.
- **Disponibilidade dos imóveis** — Marque vendido/alugado em um clique e o robô para de oferecer.
- **Dúvidas e corretor** — FAQ cadastrado; fora da base ou a pedido, chama uma pessoa.
- **LGPD** — Consentimento por contato iniciado pelo cliente, opt-out, exclusão por cliente e retenção configurável.

## O que ele não faz
- **Não integra com portais, CRMs nem com a base do MLS**: o catálogo é cadastrado nas Configurações (até 300 imóveis).
- Não envia fotos nem vídeos: envia o **link** que você cadastrar (https).
- Não avalia crédito, não simula financiamento e não negocia valores.
- A visita é por imóvel e horário fixos da configuração; não verifica a agenda pessoal do corretor.
- O corretor não recebe aviso no WhatsApp por este robô: ele consulta o painel (aviso ao corretor é evolução).
- A temperatura é uma regra simples, não previsão de venda.
- Fora da janela de 24 h, lembretes e acompanhamentos só saem com **modelo aprovado pela Meta**.

## Começar em 5 minutos (sem WhatsApp)
```bash
# na raiz da fábrica
node robots/robot-005-leadzap/demo/servidor-demo.ts   # painel com dados fictícios em http://localhost:3100/admin (chave: demo-demo-demo-1234)
node robots/robot-005-leadzap/demo/simulate.ts         # regenera demo/CONVERSAS.md com conversas reais do robô
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
robots/robot-005-leadzap/
├── src/            código do robô
├── tests/          testes automatizados
├── config/         empresa.exemplo.json (copie para empresa.json)
├── demo/           conversas, painel fictício e roteiro de simulação
├── docs/           manual técnico, do cliente, fluxos, LGPD, segurança, requisitos
├── sales/          página de vendas, pitch, objeções, FAQ, roteiro de demonstração, preços
└── .env.example
```

## Antes de chamar de COMERCIAL
- [ ] Piloto com número real da WhatsApp Business Platform em pelo menos 1 imobiliária (hoje validado por simulação e pelo formato documentado da API).
- [ ] Modelo `lead_visita` aprovado pela Meta e testado.
- [ ] Aviso ao corretor por WhatsApp (modelo `lead_novo`) e agenda por corretor — o que mais pedem imobiliárias com equipe.
- [ ] Importação do catálogo (planilha/feed de portal) e editor por formulário.
- [ ] Validar com 3 imobiliárias se a regra de temperatura reflete a prioridade real da equipe.
- [ ] Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
