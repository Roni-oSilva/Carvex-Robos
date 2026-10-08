# OrcaZap — O cliente manda o problema com fotos e você responde com o orçamento — tudo organizado no WhatsApp.

**Status:** PRONTO · **Versão:** 1.0.0 · **Potencial comercial:** Médio
**Segmentos:** Pintores e reformas, Eletricistas e encanadores, Gesso, forro e marcenaria, Instalação de ar-condicionado, Dedetização e limpeza pós-obra

O **OrcaZap** conduz o cliente por um pedido de orçamento completo: escolhe o serviço, descreve o que precisa, **envia fotos**, informa bairro, endereço e período preferido para visita. A equipe recebe tudo num **quadro de orçamentos** (fotos, descrição, local), digita o valor e o prazo, e o cliente recebe a **proposta no WhatsApp com botões Aceitar, Recusar e Tenho dúvida**. Se ele não responde, o robô faz **um** lembrete e, passada a validade, encerra a proposta. **O robô nunca calcula nem informa preço**: o valor é sempre digitado por uma pessoa.

## Para quem é
Prestadores de serviço e pequenas empresas que **orçam pelo WhatsApp**: hoje trocam dezenas de mensagens para entender o serviço, pedem foto, esquecem de responder e perdem o cliente para quem respondeu primeiro.

## Funcionalidades
- **Pedido guiado por serviço** — Lista de serviços da empresa, descrição obrigatória e período preferido para visita.
- **Recebimento de fotos** — Até 4 fotos por pedido (1 a 6), com conferência do tipo real do arquivo e limite de 5 MB.
- **Regiões atendidas** — Bairro validado contra a lista cadastrada; fora da área, o robô explica e oferece atendente.
- **Quadro de orçamentos** — Colunas Novos, Em análise, Aguardando resposta e Aceitos, com fotos e dados do cliente numa página.
- **Proposta pelo WhatsApp** — Valor, prazo, observação e validade enviados com botões Aceitar, Recusar e Tenho dúvida.
- **Preço só humano** — O robô não calcula, estima nem cita valores: quem digita o valor é a equipe.
- **Acompanhamento automático** — Um lembrete após o prazo e aviso de vencimento; nada de insistência em sequência.
- **Motivo da recusa** — Pergunta (opcional) por que o cliente recusou e mostra no resumo para ajustar preço e prazo.
- **Meu orçamento** — O cliente consulta a situação do último pedido e responde à proposta a qualquer momento.
- **Indicadores** — Novos esperando, propostas abertas, valor aceito, taxa de aceite e tempo até enviar a proposta.
- **LGPD para fotos** — Fotos privadas (acesso só pelo painel), apagadas junto com o cliente, se o pedido for cancelado ou pela política de retenção.
- **Dúvidas e atendente** — FAQ cadastrado (serviços, regiões, garantia); fora da base, chama uma pessoa.

## O que ele não faz
- **Não calcula preço** (de propósito): sem tabela de preços por m², o robô só coleta e organiza.
- Não faz análise automática das fotos: quem avalia é a equipe.
- Não agenda a visita técnica: registra o período preferido e a equipe combina (agenda integrada é evolução).
- Fotos ficam no disco do servidor (pasta MEDIA_DIR): é preciso incluí-la no backup; vídeos e documentos não são aceitos.
- Aceite do cliente por WhatsApp **não substitui contrato**: formalize prazo, material e pagamento como você já faz.
- Fora da janela de 24 h, a proposta e os lembretes só saem com **modelo aprovado pela Meta**.
- Cadastro de serviços e regiões é por Configurações (JSON validado).

## Começar em 5 minutos (sem WhatsApp)
```bash
# na raiz da fábrica
node robots/robot-004-orcazap/demo/servidor-demo.ts   # painel com dados fictícios em http://localhost:3100/admin (chave: demo-demo-demo-1234)
node robots/robot-004-orcazap/demo/simulate.ts         # regenera demo/CONVERSAS.md com conversas reais do robô
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
robots/robot-004-orcazap/
├── src/            código do robô
├── tests/          testes automatizados
├── config/         empresa.exemplo.json (copie para empresa.json)
├── demo/           conversas, painel fictício e roteiro de simulação
├── docs/           manual técnico, do cliente, fluxos, LGPD, segurança, requisitos
├── sales/          página de vendas, pitch, objeções, FAQ, roteiro de demonstração, preços
└── .env.example
```

## Antes de chamar de COMERCIAL
- [ ] Piloto com número real da WhatsApp Business Platform em pelo menos 1 prestador (hoje validado por simulação e pelo formato documentado da API, incluindo o download de mídia).
- [ ] Modelo `orcamento_proposta` aprovado pela Meta e testado.
- [ ] Perguntas por tipo de serviço (metragem, material, andar) — o que mais ajuda a orçar sem visita.
- [ ] Validar com 5 prestadores se a taxa de resposta/fechamento melhora (a evidência atual vem de conteúdo de fornecedores).
- [ ] Revisão/pentest de segurança independente (upload de arquivos); contrato de suporte/hospedagem.
