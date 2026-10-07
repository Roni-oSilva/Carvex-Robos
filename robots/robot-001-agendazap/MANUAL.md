# Manual de uso — AgendaZap
*Seu atendente de agenda no WhatsApp: marca, confirma, remarca e preenche as vagas — 24 horas por dia.*

Este manual é para quem **não é programador**. Quando aparecer um termo técnico, ele é explicado na hora.

## 1. O que é
O **AgendaZap** é um assistente de agenda que funciona dentro do WhatsApp oficial da empresa. O cliente escolhe serviço, profissional, dia e hora por botões ou digitando; o robô confere a agenda em tempo real, confirma, **lembra antes do horário pedindo confirmação**, permite **remarcar e cancelar** dentro da regra da casa e, quando um horário abre, **avisa quem estava na lista de espera**. A equipe acompanha tudo em um painel simples e assume a conversa quando quiser.

## 2. Para quem serve
Donos e recepcionistas de negócios que vendem **horário marcado** com 1 a 10 profissionais e hoje agendam no WhatsApp “na mão”: barbearias, salões, estúdios, clínicas e consultórios pequenos, pet shops.

## 3. Qual problema resolve
Agenda feita à mão no WhatsApp gera conflito de horário, mensagens sem resposta fora do expediente e **faltas sem aviso** (horário vazio = dinheiro perdido). Fontes do setor citam taxas de não comparecimento na casa de dois dígitos sem lembretes — números de fornecedores, não verificados de forma independente; **meça a sua taxa antes e depois**.

## 4. Como funciona
1. O cliente escreve “oi” ou “quero marcar” no WhatsApp da empresa.
2. O robô mostra os serviços, os profissionais e só os **dias e horários realmente livres** (respeitando expediente, folgas, duração do serviço e antecedência mínima).
3. O cliente confirma e o horário é reservado na hora — duas pessoas nunca ficam com o mesmo horário.
4. Antes do horário (por padrão 24 h e 2 h), o robô manda um lembrete pedindo confirmação: **Confirmo / Remarcar / Cancelar**.
5. Se alguém cancela, quem estava na **lista de espera** daquele dia é avisado e o primeiro que responder QUERO fica com a vaga.
6. Dúvidas (endereço, preços, formas de pagamento) são respondidas a partir do cadastro da empresa. O que o robô não souber, ele **não inventa**: chama uma pessoa.
7. A equipe vê a agenda do dia, marca quem compareceu ou faltou e acompanha os números no painel.

**O que o robô NÃO faz** (para você não se surpreender):
- Não cobra nem recebe pagamento (sem sinal ou pré-pagamento).
- Não sincroniza com Google Agenda ou outros sistemas — a agenda do robô é a fonte da verdade (horários marcados fora dele precisam ser lançados pelo painel).
- Não cancela automaticamente quem não confirmou (isso é decisão do dono; hoje o painel mostra “sem confirmar”).
- Um agendamento por vez (não combina vários serviços em sequência automaticamente — use um serviço “combo”, como Corte + Barba).
- Lembretes fora da janela de 24 h só saem com **modelo aprovado pela Meta**; sem modelo, não são enviados.
- Não garante redução de faltas: o resultado depende do negócio. O painel permite medir.

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
Painel > **Configurações** (ou arquivo `config/empresa.json`): preencha `empresa` (nome, endereço, telefone, horário, formas de pagamento). Esses dados aparecem nas confirmações, nos lembretes e nas respostas de dúvidas. Cadastre também as perguntas frequentes em `faq` — quanto mais perguntas reais dos seus clientes, menos o robô precisa chamar uma pessoa.

## 11. Como alterar as mensagens
Em **Configurações**, no bloco `mensagens`: `boas_vindas` (primeira mensagem), `handoff` (quando chama atendente), `fora_horario` (quando pedem atendente e a empresa está fechada) e `politica_cancelamento` (aparece na confirmação). Os lembretes fora da janela de 24 h usam o texto do **modelo aprovado na Meta**, que só se altera lá.

## 12. Como alterar serviços e profissionais
Em **Configurações**, edite a lista `servicos` (nome, duração em minutos e preço) e `profissionais` (nome e expediente por dia da semana). Para **bloquear um dia** (folga, feriado), acrescente a data em `folgas` do profissional. Para um serviço que só um profissional faz, use `profissionais` dentro do serviço. Não mude o `id` de serviços/profissionais que já têm agendamentos.

## 13. Como alterar preços
Em **Configurações**, altere o campo `preco` (em reais, número com ponto: `45.5`). Agendamentos já feitos **mantêm o preço da época**; os novos usam o preço atualizado.

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
| Cliente não vê o horário que eu esperava | Fora do expediente do profissional, folga, antecedência mínima ou serviço não feito por ele | Confira `profissionais[].horario`, `folgas` e `agenda.antecedencia_horas`. |
| Lembrete não chegou | Cliente fora da janela de 24 h e sem modelo aprovado, ou fez PARAR | Cadastre `lembretes.template_nome` (INSTALACAO, passo 8). Veja se o cliente fez PARAR em Clientes. |
| Horário marcado fora do robô aparece livre | O robô só conhece o que está na agenda dele | Lance o horário em Agenda > Novo agendamento. |

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
- Docker: `docker stop robot-001-agendazap`. systemd: `sudo systemctl stop robot-001-agendazap`. Terminal: `Ctrl + C`.
- Para parar de vez: cancele o webhook na Meta e apague o servidor **depois** de exportar o que precisar. Para apagar os dados de clientes, use **Excluir dados** no painel antes.

## 20. Perguntas frequentes
**O cliente percebe que é um robô?** O robô se apresenta como assistente virtual e sempre oferece falar com uma pessoa.
**Posso usar o mesmo número no celular?** Depende da conexão do número com a API; veja a documentação da Meta sobre uso do aplicativo e da API no mesmo número.
**Quanto a Meta cobra?** Respostas dentro de 24 h após a mensagem do cliente costumam ser gratuitas; mensagens de modelo enviadas por iniciativa da empresa são cobradas por mensagem. Confira a tabela atual em developers.facebook.com/docs/whatsapp/pricing.
**O robô pode errar?** Pode: ele segue regras e o cadastro que você fez. Por isso confira o painel nos primeiros dias e ajuste os textos.
**E se cair a internet/servidor?** Mensagens recebidas nesse período são reenviadas pela Meta por um tempo, mas lembretes agendados podem atrasar. Use `Restart=always`/`--restart unless-stopped`.
