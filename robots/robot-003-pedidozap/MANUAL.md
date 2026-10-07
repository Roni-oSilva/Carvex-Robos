# Manual de uso — PedidoZap
*Seu cardápio, carrinho e quadro de pedidos dentro do WhatsApp — sem comissão por pedido.*

Este manual é para quem **não é programador**. Quando aparecer um termo técnico, ele é explicado na hora.

## 1. O que é
O **PedidoZap** transforma o WhatsApp do restaurante em um **canal de pedidos guiado**: o cliente vê o cardápio por categorias, escolhe tamanho e quantidade, escreve observações, informa bairro e endereço, escolhe a forma de pagamento e confirma. O robô **calcula tudo no servidor** (preço do cardápio atual, taxa por bairro, pedido mínimo), gera o **Pix copia-e-cola** com o valor exato e entrega o pedido pronto num **quadro** para a cozinha. A cada etapa (aceito, preparando, saiu, pronto, entregue) o cliente é avisado automaticamente.

## 2. Para quem serve
Restaurantes, lanchonetes e deliveries com **entrega própria ou retirada** que já recebem pedidos pelo WhatsApp “na mão” (foto do cardápio, anotação em papel) e querem **vender direto**, com menos erro e menos dependência de marketplaces.

## 3. Qual problema resolve
Pedido por WhatsApp manual é lento (cliente pergunta cardápio, disponibilidade, taxa…), gera erro de anotação e prende um atendente. Ao mesmo tempo, relatos de donos e consumidores em fóruns indicam que as taxas dos marketplaces pesam e que pedir direto costuma sair mais barato — mas “é demorado/ineficiente” quando atendido na mão. (Evidência: relatos de comunidade, não pesquisa formal; valide com seus clientes.)

## 4. Como funciona
1. O cliente escreve “oi” e escolhe **Fazer pedido** (ou **Ver cardápio** para ler tudo).
2. Escolhe categoria → item → tamanho/opção → quantidade → observação (“sem cebola”).
3. Pode adicionar mais itens; o carrinho mostra o subtotal em tempo real.
4. Escolhe **entrega** (bairro e endereço; o robô aplica a taxa do bairro e o pedido mínimo) ou **retirada**.
5. Escolhe pagamento: **Pix** (recebe o copia-e-cola com o valor), **dinheiro** (informa troco) ou **cartão na entrega**.
6. Confere o resumo e confirma. O pedido aparece no **quadro de pedidos** do painel como “Novo”.
7. A equipe avança as etapas com um clique; o cliente recebe um aviso a cada mudança.
8. Fora do horário, o robô mostra o cardápio e o horário de abertura, mas não fecha pedido.

**O que o robô NÃO faz** (para você não se surpreender):
- **Não recebe pagamento online sozinho**: o Pix é estático e a marcação de “pago” é manual.
- Sem adicionais/complementos com múltipla escolha (ex.: borda recheada + extras) nem combos com escolhas internas — use itens separados ou variações.
- Sem frete por distância/CEP/mapa: a taxa é por bairro cadastrado.
- Sem impressão térmica automática nem integração com ERP, iFood ou entregadores (há página de impressão da comanda).
- Sem agendamento de pedido para depois, cupons, fidelidade ou endereço salvo do cliente.
- Edição de cardápio completa (criar itens, mudar preços) é por Configurações (JSON validado); só “esgotado” tem botão.
- Fora da janela de 24 h, os avisos de status só saem com **modelo aprovado pela Meta**.

## 5. Como instalar
Siga o arquivo **INSTALACAO.md**, passo a passo.

## 6. Como configurar
Todos os dados da empresa ficam em um arquivo de texto e no menu **Configurações** do painel. O significado de cada campo está em **CONFIGURACAO.md**.

## 7. Como conectar o WhatsApp
Passo 6 do **INSTALACAO.md**. Resumo: criar o app na Meta, copiar 4 informações (token, ID do número, chave secreta do app e um texto de verificação que você inventa) para o arquivo `.env` e cadastrar o endereço do webhook na Meta.

## 8. Como configurar a IA (opcional)
- Sem IA, o robô responde com as **perguntas e respostas que você cadastrou** (campo `faq`). É grátis, rápido e 100% previsível.
- Com IA (`AI_API_KEY` no `.env`), perguntas que não estão no cadastro são respondidas **somente com base nas informações da empresa**. Se a resposta não estiver lá, o robô diz: *"Não tenho essa informação no momento. Vou encaminhar você para um atendente."*
- A IA tem custo por uso (cobrado pelo provedor). Consulte o preço atual no site do provedor.

## 9. Como configurar o banco de dados
Não precisa. O robô cria sozinho um arquivo (`DATABASE_PATH`, padrão `./data/robot.db`). Só garanta que a pasta fique num disco que **não seja apagado** quando o servidor reiniciar e faça backup (item 18).

## 10. Como cadastrar as informações da empresa
Em **Configurações** (ou `config/empresa.json`) preencha `empresa` (nome, endereço, telefone, horário). Cadastre os bairros atendidos com taxa e tempo em `entrega.bairros` e, se usar Pix, a chave em `pagamento.pix` (sem acentos). Cadastre perguntas frequentes em `faq`.

## 11. Como alterar as mensagens
Em **Configurações**, no bloco `mensagens`: `boas_vindas`, `fora_horario` e `handoff`. Os avisos de status (aceito, preparando, saiu…) são padronizados; fora da janela de 24 h usam o **modelo aprovado na Meta** (`pedido_status`).

## 12. Como alterar o cardápio e as regras de entrega
O cardápio fica em `cardapio`: cada categoria tem `itens`; cada item tem `id`, `nome`, `descricao`, `preco` (ou `variacoes` com tamanhos e preços) e `disponivel`. **Para marcar que algo acabou**, use o painel > **Cardápio** > *Marcar esgotado* (vale na hora). Para criar ou remover itens, edite em **Configurações**; o sistema valida (ids únicos, preços numéricos) antes de salvar.

## 13. Como alterar preços
Em **Configurações**, altere `preco` (ou o `preco` de cada variação) e `entrega.bairros[].taxa`. Pedidos **já feitos mantêm o preço da época**. Itens que já estão no carrinho de um cliente passam a usar o preço novo na hora de confirmar (ele vê o total antes).

## 14. Como ver as conversas
Painel > **Conversas**. Mostra todos os clientes, quem está atendendo (robô ou pessoa) e o histórico. Conversas **aguardando atendente** aparecem no topo, em amarelo. A página atualiza sozinha a cada 30 segundos.

## 15. Como transferir para uma pessoa
- **O cliente pede:** basta escrever *atendente* (ou tocar no botão). O robô para de responder e a conversa vai para o topo da lista.
- **Você assume:** Painel > Conversas > abrir a conversa > **Assumir atendimento**.
- **Responder:** na própria conversa, caixa de texto > **Enviar**. (O WhatsApp só permite texto livre até 24 horas depois da última mensagem do cliente; passado esse prazo a caixa é bloqueada.)
- **Devolver ao robô:** botão **Devolver ao robô**. Se ninguém mexer por 12 horas, o robô volta sozinho.

## 16. Como resolver problemas

| O que acontece | Provável causa | O que fazer |
|---|---|---|
| Não abre o painel | Robô desligado ou endereço errado | Abra `/health`. Se não responder, reinicie o robô. |
| "Chave inválida" no login | Chave do `ADMIN_TOKEN` diferente | Confira o `.env`; reinicie após mudar. |
| O robô não responde no WhatsApp | Webhook não verificado, token expirado ou campo `messages` sem assinatura | Confira a tela de webhook da Meta; gere token permanente (INSTALACAO, passo 6). |
| Webhook "não verificado" | `WHATSAPP_VERIFY_TOKEN` diferente do digitado na Meta | Use o mesmo texto nos dois lugares e reinicie. |
| Mensagens chegam mas nenhuma resposta sai | `WHATSAPP_TOKEN` expirado/sem permissão | Veja o log: "envio_falhou". Gere um novo token. |
| "Configuração inválida" ao salvar | Vírgula, aspas ou valor fora do permitido | A mensagem diz o campo; corrija e salve de novo. |
| Aviso automático não sai | Cliente fora da janela de 24 h e sem modelo aprovado | Cadastre o modelo da Meta (INSTALACAO, passo 8). |
| O robô diz que estamos fechados no horário certo | Fuso ou `empresa.horario` incorreto (dia ausente = fechado) | Confira `TIMEZONE` no .env e o horário de cada dia da semana. |
| Cliente diz que o bairro dele não é aceito | Bairro fora de `entrega.bairros` ou escrito diferente | Cadastre o bairro (o robô aceita o nome sem acento/maiúscula) ou ofereça retirada. |
| Pedido caiu mas o cliente não recebeu avisos de status | Conversa há mais de 24 h e sem modelo aprovado | Cadastre `template.nome` (INSTALACAO, passo 8). |
| Item não aparece no cardápio do robô | Está marcado como esgotado ou a categoria ficou sem itens disponíveis | Painel > Cardápio > Voltar a vender. |
| Pix pago mas pedido continua “a receber” | A confirmação é manual | No quadro, clique em **Marcar pago** (entrega em dinheiro/cartão marca como pago ao concluir). |

## 17. Como atualizar
1. Faça backup (item 18).
2. Substitua a pasta do código pela nova versão (**mantenha** o `.env`, a pasta `config` e a pasta de dados).
3. Reinicie o robô. As alterações no banco são aplicadas sozinhas.
4. Confira `/health` (mostra a versão) e faça uma conversa de teste.

## 18. Como fazer backup
- Pare o robô (ou use uma hora de pouco movimento) e **copie o arquivo do banco** (`DATABASE_PATH`) para outro lugar, com data no nome: `robot-2026-10-07.db`.
- Copie também o `.env` e `config/empresa.json` (guarde em local seguro: contêm segredos).
- Faça isso toda semana, no mínimo. Teste restaurar uma vez para ter certeza.

## 19. Como desligar
- Docker: `docker stop robot-003-pedidozap`. systemd: `sudo systemctl stop robot-003-pedidozap`. Terminal: `Ctrl + C`.
- Para parar de vez: cancele o webhook na Meta e apague o servidor **depois** de exportar o que precisar. Para apagar os dados de clientes, use **Excluir dados** no painel antes.

## 20. Perguntas frequentes
**O cliente percebe que é um robô?** O robô se apresenta como assistente virtual e sempre oferece falar com uma pessoa.
**Posso usar o mesmo número no celular?** Depende da conexão do número com a API; veja a documentação da Meta sobre uso do aplicativo e da API no mesmo número.
**Quanto a Meta cobra?** Respostas dentro de 24 h após a mensagem do cliente costumam ser gratuitas; mensagens de modelo enviadas por iniciativa da empresa são cobradas por mensagem. Confira a tabela atual em developers.facebook.com/docs/whatsapp/pricing.
**O robô pode errar?** Pode: ele segue regras e o cadastro que você fez. Por isso confira o painel nos primeiros dias e ajuste os textos.
**E se cair a internet/servidor?** Mensagens recebidas nesse período são reenviadas pela Meta por um tempo, mas lembretes agendados podem atrasar. Use `Restart=always`/`--restart unless-stopped`.
