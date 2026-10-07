# Manual do cliente — CobraZap
*Para o dono e a equipe da empresa que usa o robô.*

## O que o robô faz por você
- Você importa as cobranças (cole da planilha: nome, telefone, descrição, valor, vencimento).
- No dia certo de cada passo da régua (por padrão 3 dias antes, no vencimento, +3, +7 e +15 dias), o robô avisa o cliente.
- Na **primeira vez**, ele só pergunta “você é o(a) titular?” — **não revela valor nem dívida** para quem pode ser a pessoa errada.
- Confirmada a identidade, mostra as pendências e oferece: **Pagar com Pix**, **Já paguei** ou **Negociar**.
- O Pix copia-e-cola é gerado com a **chave Pix da empresa** e o valor da cobrança.
- “Já paguei” coloca a cobrança em **conferência** (a régua pausa) e aceita o comprovante; você confirma no painel.
- “Negociar” oferece à vista com desconto e parcelas dentro dos limites que você definiu; a proposta vai para **Acordos**, onde você aceita (o robô cria as parcelas) ou recusa.
- Quem responde PARAR ou “número errado” sai da régua na hora.

## Sua rotina no painel
1. Importe as cobranças do mês em **Cobranças > Importar** (cole da planilha).
2. Todo dia útil, abra **Conferência** e confirme os pagamentos que os clientes avisaram (ou dê baixa pelo extrato).
3. Abra **Acordos** e aceite ou recuse as propostas de parcelamento.
4. Olhe **Conversas** para quem pediu atendente e responda com cordialidade.
5. No **Início**, acompanhe: em aberto, vencido e recebido.

Endereço do painel: **`https://SEU-ENDERECO/admin`** — entre com a chave de acesso que a implantação te entregou (guarde em local seguro e não compartilhe com quem não trabalha na empresa).

## Páginas do painel
| Página | Para que serve |
|---|---|
| Início | Resumo dos números |
| Cobrancas | Lista (em aberto, vencidas, pagas), dar baixa, pausar, cancelar; `/cobrancas/importar` para planilha e baixa em lote |
| Conferencia | Pagamentos que o cliente disse ter feito: Recebi / Não encontrei |
| Acordos | Propostas de parcelamento: aceitar (com 1º vencimento) ou recusar |
| Conversas | Ver o que foi conversado, assumir o atendimento e responder |
| Clientes | Lista de clientes; excluir dados de quem pedir (LGPD) |
| Configurações | Mudar textos, horários e preços |

## Regras de ouro
- Dê baixa nos pagamentos **no mesmo dia**: o robô só para de cobrar quando você marca como paga.
- Nunca peça ao robô para ameaçar ou expor o cliente — por lei isso é proibido e o sistema não aceita.
- Se o cliente disser “número errado”, não insista nesse contato: corrija o telefone no cadastro da empresa.
- Importe somente clientes com quem você tem **relação contratual** e cujo telefone eles mesmos informaram.
- **Conversa "aguardando atendente"?** Responda o quanto antes — o cliente já pediu uma pessoa.
- **Regra do WhatsApp:** você só pode escrever livremente até **24 horas depois da última mensagem do cliente**. Depois disso, só mensagens de modelo aprovado (o robô cuida disso quando configurado).
- **Cliente escreveu PARAR?** O robô não envia mais avisos automáticos a essa pessoa. Respeite: não tente contornar.
- **Nunca** envie a chave do painel por WhatsApp ou e-mail.

## Precisa de ajuda?
Fale com o responsável pela sua implantação: **{{NOME_DO_SUPORTE}} — {{CONTATO_DO_SUPORTE}}** (preencha antes de entregar ao cliente).
