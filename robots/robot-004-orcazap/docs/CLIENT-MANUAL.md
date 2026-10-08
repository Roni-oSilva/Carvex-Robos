# Manual do cliente — OrcaZap
*Para o dono e a equipe da empresa que usa o robô.*

## O que o robô faz por você
- O cliente escreve "oi" e toca em **Pedir orçamento**.
- Escolhe o serviço (pintura, elétrica, hidráulica…) e descreve o que precisa.
- Envia até 4 fotos (configurável). O robô confere se o arquivo é mesmo uma imagem JPEG, PNG ou WebP de até 5 MB.
- Informa o bairro (validado contra as regiões atendidas), o endereço e o período preferido para uma visita.
- Confere o resumo e envia. Recebe o número do pedido (#1, #2…).
- A equipe abre o pedido no painel, vê as fotos, informa **valor, prazo e observação** e clica em **Enviar ao cliente**.
- O cliente recebe a proposta com botões. **Aceitar** avisa a equipe; **Recusar** pergunta o motivo; **Tenho dúvida** chama uma pessoa.
- Sem resposta após o prazo configurado (padrão 24 h), o robô lembra **uma vez**. Passada a validade (padrão 7 dias), a proposta vence e o cliente é avisado uma vez.

## Sua rotina no painel
1. Abra o **Quadro de orçamentos** no começo do dia e em intervalos curtos (a página atualiza sozinha).
2. Em cada pedido **Novo**, veja as fotos, clique em **Marcar em análise** se precisar de tempo, ou já preencha **valor, prazo e observação** e envie.
3. Se faltar informação, abra a conversa pelo botão do pedido e peça ao cliente (o robô se cala enquanto você atende).
4. Acompanhe a coluna **Aguardando resposta** e os **Aceitos**; combine a data com quem aceitou.
5. Olhe os **motivos de recusa** no Início para ajustar preço, prazo e forma de apresentar a proposta.

Endereço do painel: **`https://SEU-ENDERECO/admin`** — entre com a chave de acesso que a implantação te entregou (guarde em local seguro e não compartilhe com quem não trabalha na empresa).

## Páginas do painel
| Página | Para que serve |
|---|---|
| Início | Resumo dos números |
| Orcamentos | Quadro com os pedidos por situação; abrir um pedido mostra as fotos e o formulário da proposta |
| Historico | Últimos 100 orçamentos com valor e situação |
| Conversas | Ver o que foi conversado, assumir o atendimento e responder |
| Clientes | Lista de clientes; excluir dados de quem pedir (LGPD) |
| Configurações | Mudar textos, horários e preços |

## Regras de ouro
- Responda o pedido o quanto antes: velocidade é o que mais pesa na escolha do cliente.
- Escreva o que está incluso (material, mão de obra, prazo) na observação da proposta.
- O aceite no WhatsApp não é contrato: formalize como você já faz.
- Nunca peça dados sensíveis ou fotos de documentos por esta conversa.
- **Conversa "aguardando atendente"?** Responda o quanto antes — o cliente já pediu uma pessoa.
- **Regra do WhatsApp:** você só pode escrever livremente até **24 horas depois da última mensagem do cliente**. Depois disso, só mensagens de modelo aprovado (o robô cuida disso quando configurado).
- **Cliente escreveu PARAR?** O robô não envia mais avisos automáticos a essa pessoa. Respeite: não tente contornar.
- **Nunca** envie a chave do painel por WhatsApp ou e-mail.

## Precisa de ajuda?
Fale com o responsável pela sua implantação: **{{NOME_DO_SUPORTE}} — {{CONTATO_DO_SUPORTE}}** (preencha antes de entregar ao cliente).
