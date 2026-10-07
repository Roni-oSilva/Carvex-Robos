# Manual de uso — CobraZap
*Cobrança educada, no tempo certo e dentro da lei — direto no WhatsApp.*

Este manual é para quem **não é programador**. Quando aparecer um termo técnico, ele é explicado na hora.

## 1. O que é
O **CobraZap** roda uma **régua de cobrança** (lembrete antes do vencimento, aviso no dia e acompanhamento depois do atraso) pelo WhatsApp oficial da empresa, com tom educado e **travas legais embutidas**: confirma que está falando com a pessoa certa antes de mencionar dívida, só envia em horário comercial, limita a frequência, nunca ameaça e para quando o cliente pede. O cliente recebe o **Pix copia-e-cola** na hora, avisa “já paguei”, ou **negocia** parcelamento dentro das regras que a empresa definiu; a equipe confere e dá baixa no painel.

## 2. Para quem serve
MEIs e pequenas empresas que **cobram mensalidade, parcela ou boleto** de clientes recorrentes e hoje cobram “quando lembram”, por mensagem manual: academias, escolas, estúdios, prestadores com contrato, lojas com carnê.

## 3. Qual problema resolve
Atraso pequeno vira inadimplência quando ninguém acompanha: o follow-up é esquecido ou constrange quem cobra. Material do setor aponta justamente que **ignorar pequenos atrasos** agrava o problema e que a cobrança por WhatsApp é permitida desde que respeite o CDC e a LGPD (sem constrangimento ou assédio).

## 4. Como funciona
1. Você importa as cobranças (cole da planilha: nome, telefone, descrição, valor, vencimento).
2. No dia certo de cada passo da régua (por padrão 3 dias antes, no vencimento, +3, +7 e +15 dias), o robô avisa o cliente.
3. Na **primeira vez**, ele só pergunta “você é o(a) titular?” — **não revela valor nem dívida** para quem pode ser a pessoa errada.
4. Confirmada a identidade, mostra as pendências e oferece: **Pagar com Pix**, **Já paguei** ou **Negociar**.
5. O Pix copia-e-cola é gerado com a **chave Pix da empresa** e o valor da cobrança.
6. “Já paguei” coloca a cobrança em **conferência** (a régua pausa) e aceita o comprovante; você confirma no painel.
7. “Negociar” oferece à vista com desconto e parcelas dentro dos limites que você definiu; a proposta vai para **Acordos**, onde você aceita (o robô cria as parcelas) ou recusa.
8. Quem responde PARAR ou “número errado” sai da régua na hora.

**O que o robô NÃO faz** (para você não se surpreender):
- **Não vê pagamentos sozinho**: o Pix é estático; a baixa é manual (painel, “paguei” + conferência ou lista de referências do extrato).
- Não emite boleto, não calcula juros/multa e não integra com ERP/banco/PSP nesta versão.
- Não negativa, não protesta, não ameaça e não contata terceiros — por desenho.
- Fora da janela de 24 h, só envia com **modelo aprovado pela Meta**; a Meta pode recusar ou reclassificar modelos de cobrança.
- Não baixa nem armazena a imagem do comprovante (registra que foi recebido); a conferência é feita no seu banco.
- Não substitui orientação jurídica: revise textos, horários e política de cobrança com um advogado.

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
Em **Configurações** (ou `config/empresa.json`) preencha `empresa` e o bloco `pix` (chave, beneficiário e cidade **sem acentos**). Teste o Pix: faça uma cobrança de valor baixo para você mesmo e pague com o código. Cadastre perguntas frequentes em `faq` (sem termos de ameaça — o sistema recusa).

## 11. Como alterar as mensagens
Os textos padrão de cada passo podem ser trocados em `regua[].mensagem`, usando `{{nome}}`, `{{valor}}`, `{{descricao}}`, `{{vencimento}}`, `{{dias_atraso}}`, `{{empresa}}`. Mantenha o tom respeitoso; o sistema recusa ameaças e menções a SPC/Serasa/protesto/processo. O aviso fora da janela de 24 h usa o **modelo aprovado na Meta** (`cobranca_aviso`).

## 12. Como alterar a régua de cobrança
A régua está em `regua`: cada passo tem um `id` e `dias` (negativo = antes do vencimento). Para **tirar** o aviso do 15º dia, apague o passo; para **adicionar** um aviso no 30º dia, acrescente `{ "id": "atraso-30", "dias": 30 }`. Janela e frequência ficam em `envio`. As regras de acordo ficam em `negociacao`. O sistema recusa horários fora de 07h–21h e mensagens com termos de ameaça.

## 13. Como alterar preços
O robô não tem “tabela de preços”: o valor está em **cada cobrança**. Para corrigir uma cobrança errada, cancele-a em Cobranças e importe de novo (use outra referência). Para mudar o **desconto à vista** ou a **parcela mínima** dos acordos, altere `negociacao` em Configurações.

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
| Importei e nada foi enviado | Fora da janela de envio, passo da régua ainda não venceu, ou falta confirmar a titularidade | Veja `envio` na configuração; o robô só envia no horário permitido. A 1ª mensagem é a pergunta “você é o titular?”. |
| Aviso não sai para quem não falou comigo hoje | Sem modelo aprovado na Meta | Cadastre `template.nome` (INSTALACAO, passo 8). Sem ele o robô só envia dentro das 24 h. |
| Cliente diz que pagou e a cobrança continua | A baixa é manual | Conferência > Recebi, ou cole a referência em Importar > Dar baixa em vários pagamentos. |
| Código Pix recusado pelo banco | Chave/nome/cidade incorretos | Confira `pix` na configuração (sem acentos, cidade até 15 caracteres). |

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
- Docker: `docker stop robot-002-cobrazap`. systemd: `sudo systemctl stop robot-002-cobrazap`. Terminal: `Ctrl + C`.
- Para parar de vez: cancele o webhook na Meta e apague o servidor **depois** de exportar o que precisar. Para apagar os dados de clientes, use **Excluir dados** no painel antes.

## 20. Perguntas frequentes
**O cliente percebe que é um robô?** O robô se apresenta como assistente virtual e sempre oferece falar com uma pessoa.
**Posso usar o mesmo número no celular?** Depende da conexão do número com a API; veja a documentação da Meta sobre uso do aplicativo e da API no mesmo número.
**Quanto a Meta cobra?** Respostas dentro de 24 h após a mensagem do cliente costumam ser gratuitas; mensagens de modelo enviadas por iniciativa da empresa são cobradas por mensagem. Confira a tabela atual em developers.facebook.com/docs/whatsapp/pricing.
**O robô pode errar?** Pode: ele segue regras e o cadastro que você fez. Por isso confira o painel nos primeiros dias e ajuste os textos.
**E se cair a internet/servidor?** Mensagens recebidas nesse período são reenviadas pela Meta por um tempo, mas lembretes agendados podem atrasar. Use `Restart=always`/`--restart unless-stopped`.
