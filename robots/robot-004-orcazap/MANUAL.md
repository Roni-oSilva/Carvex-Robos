# Manual de uso — OrcaZap
*O cliente manda o problema com fotos e você responde com o orçamento — tudo organizado no WhatsApp.*

Este manual é para quem **não é programador**. Quando aparecer um termo técnico, ele é explicado na hora.

## 1. O que é
O **OrcaZap** conduz o cliente por um pedido de orçamento completo: escolhe o serviço, descreve o que precisa, **envia fotos**, informa bairro, endereço e período preferido para visita. A equipe recebe tudo num **quadro de orçamentos** (fotos, descrição, local), digita o valor e o prazo, e o cliente recebe a **proposta no WhatsApp com botões Aceitar, Recusar e Tenho dúvida**. Se ele não responde, o robô faz **um** lembrete e, passada a validade, encerra a proposta. **O robô nunca calcula nem informa preço**: o valor é sempre digitado por uma pessoa.

## 2. Para quem serve
Prestadores de serviço e pequenas empresas que **orçam pelo WhatsApp**: hoje trocam dezenas de mensagens para entender o serviço, pedem foto, esquecem de responder e perdem o cliente para quem respondeu primeiro.

## 3. Qual problema resolve
Para orçar, o prestador precisa de serviço, local, fotos e urgência. Colher isso por conversa solta é lento, o orçamento atrasa e o acompanhamento ("e aí, fechamos?") é esquecido. A evidência vem de conteúdo de fornecedores de software e de um caso oficial de qualificação por formulário em uma construtora de médio porte; **não é pesquisa de campo** — valide com 5 prestadores antes de investir.

## 4. Como funciona
1. O cliente escreve "oi" e toca em **Pedir orçamento**.
2. Escolhe o serviço (pintura, elétrica, hidráulica…) e descreve o que precisa.
3. Envia até 4 fotos (configurável). O robô confere se o arquivo é mesmo uma imagem JPEG, PNG ou WebP de até 5 MB.
4. Informa o bairro (validado contra as regiões atendidas), o endereço e o período preferido para uma visita.
5. Confere o resumo e envia. Recebe o número do pedido (#1, #2…).
6. A equipe abre o pedido no painel, vê as fotos, informa **valor, prazo e observação** e clica em **Enviar ao cliente**.
7. O cliente recebe a proposta com botões. **Aceitar** avisa a equipe; **Recusar** pergunta o motivo; **Tenho dúvida** chama uma pessoa.
8. Sem resposta após o prazo configurado (padrão 24 h), o robô lembra **uma vez**. Passada a validade (padrão 7 dias), a proposta vence e o cliente é avisado uma vez.

**O que o robô NÃO faz** (para você não se surpreender):
- **Não calcula preço** (de propósito): sem tabela de preços por m², o robô só coleta e organiza.
- Não faz análise automática das fotos: quem avalia é a equipe.
- Não agenda a visita técnica: registra o período preferido e a equipe combina (agenda integrada é evolução).
- Fotos ficam no disco do servidor (pasta MEDIA_DIR): é preciso incluí-la no backup; vídeos e documentos não são aceitos.
- Aceite do cliente por WhatsApp **não substitui contrato**: formalize prazo, material e pagamento como você já faz.
- Fora da janela de 24 h, a proposta e os lembretes só saem com **modelo aprovado pela Meta**.
- Cadastro de serviços e regiões é por Configurações (JSON validado).

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
Em **Configurações** (ou `config/empresa.json`) preencha `empresa`, os `servicos` que você realiza, as regiões em `atendimento.bairros` e as respostas em `faq` (garantia, formas de pagamento, prazo de visita). Mantenha as respostas curtas e verdadeiras: o robô só repete o que estiver cadastrado.

## 11. Como alterar as mensagens
No bloco `mensagens`: `boas_vindas` e `handoff`. A proposta, o lembrete e o aviso de vencimento são padronizados; fora da janela de 24 h usam o **modelo aprovado na Meta** (`orcamento_proposta`).

## 12. Como alterar o cardápio e as regras de entrega
Edite a lista `servicos` (id sem acento/espaço, nome até 24 caracteres). Marque `exige_visita: true` para serviços em que o valor final depende de avaliação no local; o cliente é avisado no resumo.

## 13. Como alterar preços
O robô **não tem tabela de preços**: o valor é digitado por você em cada proposta (painel > Orçamentos > abrir o pedido). Para mudar validade e prazo do lembrete, edite `atendimento.validade_dias` e `atendimento.followup_horas`.

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
| A proposta não foi enviada e o painel mostra erro | O cliente não fala com a empresa há mais de 24 h e não há modelo aprovado cadastrado | Cadastre `template.nome` (INSTALACAO, passo 8) ou peça ao cliente para escrever. |
| A foto do cliente não aparece | Arquivo não é JPEG/PNG/WebP, passou de 5 MB ou o download da Meta falhou | O robô avisa o cliente na hora. Peça para reenviar como foto (não como documento). |
| Fotos sumiram depois de restaurar o servidor | A pasta MEDIA_DIR não estava no backup | Inclua MEDIA_DIR (padrão ./data/media) junto com o banco nos backups. |
| Cliente diz que o bairro dele é atendido, mas o robô recusa | Bairro fora de `atendimento.bairros` ou escrito diferente | Cadastre o bairro ou deixe a lista vazia para aceitar qualquer região. |
| Cliente aceitou, mas ninguém viu | Aceite aparece no quadro (coluna Aceitos) e nos indicadores, mas não dispara alerta externo | Deixe o quadro aberto (atualiza sozinho) e combine a rotina de checar Aceitos. |

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
- Docker: `docker stop robot-004-orcazap`. systemd: `sudo systemctl stop robot-004-orcazap`. Terminal: `Ctrl + C`.
- Para parar de vez: cancele o webhook na Meta e apague o servidor **depois** de exportar o que precisar. Para apagar os dados de clientes, use **Excluir dados** no painel antes.

## 20. Perguntas frequentes
**O cliente percebe que é um robô?** O robô se apresenta como assistente virtual e sempre oferece falar com uma pessoa.
**Posso usar o mesmo número no celular?** Depende da conexão do número com a API; veja a documentação da Meta sobre uso do aplicativo e da API no mesmo número.
**Quanto a Meta cobra?** Respostas dentro de 24 h após a mensagem do cliente costumam ser gratuitas; mensagens de modelo enviadas por iniciativa da empresa são cobradas por mensagem. Confira a tabela atual em developers.facebook.com/docs/whatsapp/pricing.
**O robô pode errar?** Pode: ele segue regras e o cadastro que você fez. Por isso confira o painel nos primeiros dias e ajuste os textos.
**E se cair a internet/servidor?** Mensagens recebidas nesse período são reenviadas pela Meta por um tempo, mas lembretes agendados podem atrasar. Use `Restart=always`/`--restart unless-stopped`.
