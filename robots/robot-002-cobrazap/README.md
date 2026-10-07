# CobraZap — Cobrança educada, no tempo certo e dentro da lei — direto no WhatsApp.

**Status:** PRONTO · **Versão:** 1.0.0 · **Potencial comercial:** Alto
**Segmentos:** Academias, Escolas e cursos, Prestadores de serviço com mensalidade, Pequenos comércios com crediário, Condomínios e associações (mensalidades)

O **CobraZap** roda uma **régua de cobrança** (lembrete antes do vencimento, aviso no dia e acompanhamento depois do atraso) pelo WhatsApp oficial da empresa, com tom educado e **travas legais embutidas**: confirma que está falando com a pessoa certa antes de mencionar dívida, só envia em horário comercial, limita a frequência, nunca ameaça e para quando o cliente pede. O cliente recebe o **Pix copia-e-cola** na hora, avisa “já paguei”, ou **negocia** parcelamento dentro das regras que a empresa definiu; a equipe confere e dá baixa no painel.

## Para quem é
MEIs e pequenas empresas que **cobram mensalidade, parcela ou boleto** de clientes recorrentes e hoje cobram “quando lembram”, por mensagem manual: academias, escolas, estúdios, prestadores com contrato, lojas com carnê.

## Funcionalidades
- **Régua configurável** — Passos relativos ao vencimento, com texto padrão educado ou personalizado por passo.
- **Confirmação de titularidade** — Evita expor dívida a terceiros (número trocado, família). Pode ser desligada, mas vem ligada.
- **Travas legais** — Janela de envio (padrão 8h–20h, seg–sáb, nunca fora de 7h–21h), máximo por semana, intervalo mínimo, mensagem única consolidada por pessoa, sem termos de ameaça (SPC, protesto, processo…).
- **Pix copia-e-cola automático** — Código EMV válido (CRC16) com a chave Pix da empresa e o valor; aceita código/link próprios por cobrança.
- **“Já paguei” + comprovante** — Pausa a cobrança, registra o comprovante recebido e leva à tela de Conferência.
- **Negociação guiada** — Opções automáticas (à vista com desconto, parcelas com valor mínimo); aceite pela equipe cria as parcelas mensais.
- **Importação por planilha** — Cole as linhas; o robô valida, relata erros por linha e evita duplicar referência. Baixa em lote por referência.
- **Painel de recebíveis** — Em aberto, vencido, a vencer, recebido (30 dias), para conferir, propostas de acordo.
- **Privacidade (LGPD)** — PARAR/REATIVAR, número errado, exclusão de dados (bloqueada se houver dívida aberta), retenção do histórico.

## O que ele não faz
- **Não vê pagamentos sozinho**: o Pix é estático; a baixa é manual (painel, “paguei” + conferência ou lista de referências do extrato).
- Não emite boleto, não calcula juros/multa e não integra com ERP/banco/PSP nesta versão.
- Não negativa, não protesta, não ameaça e não contata terceiros — por desenho.
- Fora da janela de 24 h, só envia com **modelo aprovado pela Meta**; a Meta pode recusar ou reclassificar modelos de cobrança.
- Não baixa nem armazena a imagem do comprovante (registra que foi recebido); a conferência é feita no seu banco.
- Não substitui orientação jurídica: revise textos, horários e política de cobrança com um advogado.

## Começar em 5 minutos (sem WhatsApp)
```bash
# na raiz da fábrica
node robots/robot-002-cobrazap/demo/servidor-demo.ts   # painel com dados fictícios em http://localhost:3100/admin (chave: demo-demo-demo-1234)
node robots/robot-002-cobrazap/demo/simulate.ts         # regenera demo/CONVERSAS.md com conversas reais do robô
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
robots/robot-002-cobrazap/
├── src/            código do robô
├── tests/          testes automatizados
├── config/         empresa.exemplo.json (copie para empresa.json)
├── demo/           conversas, painel fictício e roteiro de simulação
├── docs/           manual técnico, do cliente, fluxos, LGPD, segurança, requisitos
├── sales/          página de vendas, pitch, objeções, FAQ, roteiro de demonstração, preços
└── .env.example
```

## Antes de chamar de COMERCIAL
- [ ] Piloto com número real da WhatsApp Business Platform e o modelo `cobranca_aviso` aprovado (a Meta pode recusar ou cobrar como marketing).
- [ ] Revisão dos textos padrão, horários e política por um advogado (CDC art. 42, LGPD) antes de oferecer a clientes.
- [ ] Baixa automática de pagamentos (webhook de PSP/Open Finance ou conciliação de extrato) — hoje é manual.
- [ ] Juros/multa e emissão de boleto, se o público-alvo exigir.
- [ ] Revisão/pentest de segurança independente; contrato de suporte/hospedagem.
