# Manual de uso — LeadZap
*Responde na hora, mostra os imóveis certos, agenda a visita e entrega o lead pronto ao corretor.*

Este manual é para quem **não é programador**. Quando aparecer um termo técnico, ele é explicado na hora.

## 1. O que é
O **LeadZap** atende o interessado na hora: pergunta se quer **comprar ou alugar**, tipo de imóvel, bairro, faixa de valor, quartos e prazo, e mostra **somente imóveis do seu cadastro** que cabem no perfil. Se o cliente gostar, **agenda a visita** em horários livres daquele imóvel, **lembra e pede confirmação** antes. O lead vai para o painel **classificado como quente, morno ou frio** (regra de pontos transparente), **já atribuído ao corretor** do bairro, com todo o resumo. Se o cliente some, o robô faz **um** acompanhamento com opções reais do cadastro, e depois o lead vira "sem resposta" para a equipe decidir.

## 2. Para quem serve
Imobiliárias e corretores que recebem **interessados pelo WhatsApp** (anúncios, portais, placas) e perdem negócio porque o primeiro contato demora, a qualificação é feita de forma desigual e as visitas marcadas não acontecem.

## 3. Qual problema resolve
O lead esfria se ninguém responde logo; as informações básicas (comprar ou alugar, bairro, faixa de valor, prazo) são perguntadas de novo por cada corretor; o histórico fica no celular pessoal; e as visitas marcadas sem confirmação viram falta. Há queixas de consumidores sobre visitas que não aconteceram e conteúdo de fornecedores sobre qualificar por orçamento, localização e prazo. As estatísticas que circulam divergem entre si, então **este material não usa percentuais**; valide com 3 imobiliárias antes de investir.

## 4. Como funciona
1. O interessado escreve e toca em **Quero comprar** ou **Quero alugar** (ou **Falar com corretor**).
2. Escolhe o tipo de imóvel e o bairro (validado contra as regiões que você atende).
3. Escolhe a faixa de valor, o mínimo de quartos e o prazo (até 30 dias, 1 a 3 meses, só pesquisando).
4. O robô registra o lead, calcula a temperatura, escolhe o corretor do bairro com menos leads em aberto e mostra até 5 imóveis do cadastro que cabem no perfil.
5. Ao escolher um imóvel, o cliente vê preço, bairro, quartos, descrição e o link das fotos que você cadastrou.
6. Pode **agendar visita**: escolhe o dia e o horário entre os livres daquele imóvel (respeitando a antecedência mínima).
7. Antes da visita (padrão 24 h), recebe o lembrete com **Confirmo, Remarcar ou Cancelar visita**.
8. Se não responde, recebe um único acompanhamento com imóveis reais do cadastro; após o prazo, o lead vira "sem resposta".

**O que o robô NÃO faz** (para você não se surpreender):
- **Não integra com portais, CRMs nem com a base do MLS**: o catálogo é cadastrado nas Configurações (até 300 imóveis).
- Não envia fotos nem vídeos: envia o **link** que você cadastrar (https).
- Não avalia crédito, não simula financiamento e não negocia valores.
- A visita é por imóvel e horário fixos da configuração; não verifica a agenda pessoal do corretor.
- O corretor não recebe aviso no WhatsApp por este robô: ele consulta o painel (aviso ao corretor é evolução).
- A temperatura é uma regra simples, não previsão de venda.
- Fora da janela de 24 h, lembretes e acompanhamentos só saem com **modelo aprovado pela Meta**.

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
Em **Configurações** (ou `config/empresa.json`) preencha `empresa`, os `tipos` de imóvel, os `bairros` atendidos, as `faixas` de valor (até 3 para comprar e 3 para alugar), os `corretores` com seus bairros e o horário das `visitas`. Cadastre as perguntas frequentes em `faq` (financiamento, documentos).

## 11. Como alterar as mensagens
No bloco `mensagens`: `boas_vindas` e `handoff`. Lembretes e acompanhamentos são padronizados; fora da janela de 24 h usam o **modelo aprovado na Meta** (`lead_visita`).

## 12. Como alterar o cardápio e as regras de entrega
O catálogo é a lista `imoveis`: cada um com `id`, `finalidade`, `tipo`, `titulo`, `bairro`, `preco`, `quartos`, `descricao`, `link` e `disponivel`. **Quando um imóvel é vendido ou alugado**, use painel > **Imóveis** > *Marcar indisponível* (vale na hora). Para incluir ou editar, use Configurações; o sistema valida antes de salvar.

## 13. Como alterar preços
Altere `preco` do imóvel e as faixas em `faixas`. As faixas decidem o que é "dentro do orçamento" do cliente: ajuste-as ao mercado da sua região.

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
| O robô diz que não tem imóvel, mas há um no cadastro | O imóvel está indisponível ou não cabe na faixa/tipo/bairro/quartos escolhidos | Confira `disponivel`, o `preco` dentro da faixa e o bairro escrito igual ao de `bairros`. |
| Nenhum horário de visita aparece | `visitas.dias_semana` ou `horarios` vazios, ou todos os horários ocupados/dentro da antecedência mínima | Amplie os horários ou reduza `antecedencia_horas`; o robô chama um corretor quando não há vaga. |
| Lead sem corretor | Nenhum corretor atende o bairro e não há corretor de plantão (bairros vazios) | Cadastre um corretor com `bairros: []` ou atribua manualmente no painel. |
| Lembrete de visita não chegou | Cliente sem mensagem há mais de 24 h e sem modelo aprovado | Cadastre `template.nome` (INSTALACAO, passo 8). |
| Comparecimento aparece "—" | Ninguém marcou o resultado das visitas | Painel > Visitas > Realizada ou Faltou depois de cada visita. |

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
- Docker: `docker stop robot-005-leadzap`. systemd: `sudo systemctl stop robot-005-leadzap`. Terminal: `Ctrl + C`.
- Para parar de vez: cancele o webhook na Meta e apague o servidor **depois** de exportar o que precisar. Para apagar os dados de clientes, use **Excluir dados** no painel antes.

## 20. Perguntas frequentes
**O cliente percebe que é um robô?** O robô se apresenta como assistente virtual e sempre oferece falar com uma pessoa.
**Posso usar o mesmo número no celular?** Depende da conexão do número com a API; veja a documentação da Meta sobre uso do aplicativo e da API no mesmo número.
**Quanto a Meta cobra?** Respostas dentro de 24 h após a mensagem do cliente costumam ser gratuitas; mensagens de modelo enviadas por iniciativa da empresa são cobradas por mensagem. Confira a tabela atual em developers.facebook.com/docs/whatsapp/pricing.
**O robô pode errar?** Pode: ele segue regras e o cadastro que você fez. Por isso confira o painel nos primeiros dias e ajuste os textos.
**E se cair a internet/servidor?** Mensagens recebidas nesse período são reenviadas pela Meta por um tempo, mas lembretes agendados podem atrasar. Use `Restart=always`/`--restart unless-stopped`.
