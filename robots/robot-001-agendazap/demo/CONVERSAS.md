# Conversas de demonstração — AgendaZap

> Gerado automaticamente por `node demo/simulate.ts`: são respostas **reais** do robô rodando com dados fictícios (Barbearia do Zé). Nada foi enviado ao WhatsApp.
> 🔘 = botão  ·  ▫️ = item de lista  ·  Hoje (fictício) = quarta-feira, 12:00.

### 1. Fluxo normal — agendar um corte

**CLIENTE:** “Oi, quero marcar um horário”

**ROBÔ:** Qual serviço você quer agendar?
> ▫️ Corte masculino — 30 min · R$ 45,00
> ▫️ Barba — 30 min · R$ 30,00
> ▫️ Corte + barba — 60 min · R$ 70,00
> ▫️ Sobrancelha — 30 min · R$ 20,00

**CLIENTE:** *toca em* “Corte masculino”

**ROBÔ:** Com quem você prefere?
> ▫️ Sem preferência — O primeiro horário livre
> ▫️ João
> ▫️ Marcos

**CLIENTE:** *toca em* “Sem preferência”

**ROBÔ:** Qual dia para *Corte masculino*?
> ▫️ Hoje (qua 07/10)
> ▫️ Amanhã (qui 08/10)
> ▫️ sex 09/10
> ▫️ sáb 10/10
> ▫️ seg 12/10
> ▫️ ter 13/10
> ▫️ qua 14/10
> ▫️ qui 15/10
> ▫️ sex 16/10
> ▫️ sáb 17/10

**CLIENTE:** *toca em* “Amanhã (qui 08/10)”

**ROBÔ:** Horários livres em Amanhã (qui 08/10):
> ▫️ 09:00
> ▫️ 09:30
> ▫️ 10:00
> ▫️ 10:30
> ▫️ 11:00
> ▫️ 11:30
> ▫️ 12:00
> ▫️ 12:30
> ▫️ 13:00
> ▫️ Mais horários ▶

**CLIENTE:** *toca em* “10:00”

**ROBÔ:** Posso confirmar?

*Corte masculino* com João
📅 08/10 às 10:00
💰 R$ 45,00
> 🔘 Confirmar ✅
> 🔘 Outro horário
> 🔘 Cancelar

**CLIENTE:** *toca em* “Confirmar ✅”

**ROBÔ:** Agendado com sucesso! ✅

*Corte masculino* com João
📅 08/10 às 10:00
💰 R$ 45,00

📍 Rua das Flores, 120 - Centro

Cancelamentos e remarcações podem ser feitos por aqui até 2h antes do horário.
Vou te enviar um lembrete antes do horário. Se não quiser lembretes, responda PARAR.


### 2. Fluxo de dúvida — o robô só responde o que está cadastrado

**CLIENTE:** “Vocês aceitam cartão e pix?”

**ROBÔ:** Aceitamos Pix, dinheiro e cartão de débito/crédito.

**ROBÔ:** Posso ajudar em mais alguma coisa?
> 🔘 Agendar horário
> 🔘 Menu

**CLIENTE:** “Qual o endereço?”

**ROBÔ:** Ficamos na Rua das Flores, 120 - Centro. Tem estacionamento na rua.

**ROBÔ:** Posso ajudar em mais alguma coisa?
> 🔘 Agendar horário
> 🔘 Menu


### 3. Fluxo de erro — o horário foi ocupado por outra pessoa e entrada inválida

**CLIENTE (Bia):** *toca em* “Confirmar ✅” _(a Ana confirmou o mesmo horário um minuto antes, com o mesmo barbeiro)_

**ROBÔ:** Poxa, esse horário acabou de ser ocupado por outra pessoa. 😕 Vou mostrar as opções atualizadas.

**ROBÔ:** Horários livres em Amanhã (qui 08/10):
> ▫️ 09:00
> ▫️ 09:30
> ▫️ 10:00
> ▫️ 10:30
> ▫️ 11:00
> ▫️ 11:30
> ▫️ 12:00
> ▫️ 12:30
> ▫️ 13:00
> ▫️ Mais horários ▶

### 3b. Entrada que o robô não entende (áudio)

**CLIENTE:** 📎 (áudio enviado)

**ROBÔ:** Recebi seu arquivo, mas eu só consigo entender mensagens de texto e botões. 🙂 Digite MENU para ver as opções ou ATENDENTE para falar com uma pessoa.


### 4. Transferência para atendente humano — a pedido do cliente

**CLIENTE:** “Oi”

**ROBÔ:** Olá! 💈 Aqui é o assistente da Barbearia do Zé. Posso marcar seu horário, tirar dúvidas ou chamar um atendente.
> 🔘 Agendar horário
> 🔘 Meus horários
> 🔘 Falar com atendente

**CLIENTE:** *toca em* “Falar com atendente”

**ROBÔ:** Certo! Já chamei um atendente. Ele responde assim que possível, por aqui mesmo. 🙂

**CLIENTE:** “Alô?”


_Depois do pedido o robô fica em silêncio: a conversa aparece no painel como “aguardando atendente” e a equipe responde por lá. Se ninguém assumir em 12h, o robô volta a atender._

### 4b. Transferência automática — pergunta que não está na base de conhecimento

**CLIENTE:** “Vocês fazem tatuagem?”

**ROBÔ:** Não tenho essa informação no momento. Vou encaminhar você para um atendente.


_O robô não inventa resposta: avisa que não sabe e chama uma pessoa._

### 5. Lembrete automático 24h antes e confirmação

**ROBÔ (lembrete enviado sozinho):** Oi! 👋 Lembrete: *Corte masculino* com João em 09/10 às 10:00.
Você confirma presença?
> 🔘 Confirmo ✅
> 🔘 Remarcar
> 🔘 Cancelar

**CLIENTE:** *toca em* “Confirmo ✅”

**ROBÔ:** Presença confirmada! ✅ Te esperamos em 09/10 às 10:00.
📍 Rua das Flores, 120 - Centro


### 6. Lista de espera — o dia está lotado e uma vaga abre

**CLIENTE:** *toca em* “Quero marcar”

**ROBÔ:** Qual serviço você quer agendar?
> ▫️ Corte masculino — 30 min · R$ 45,00
> ▫️ Barba — 30 min · R$ 30,00
> ▫️ Corte + barba — 60 min · R$ 70,00

**CLIENTE:** *toca em* “Corte masculino”

**ROBÔ:** Qual dia para *Corte masculino*?
> ▫️ Hoje (qua 07/10)
> ▫️ sex 09/10
> ▫️ sáb 10/10
> ▫️ seg 12/10
> ▫️ ter 13/10
> ▫️ qua 14/10
> ▫️ qui 15/10
> ▫️ sex 16/10
> ▫️ sáb 17/10
> ▫️ seg 19/10

**CLIENTE:** “08/10”

**ROBÔ:** Não há horários livres em Amanhã (qui 08/10). Quer entrar na lista de espera desse dia? Eu aviso se alguém cancelar.
> 🔘 Entrar na espera
> 🔘 Ver outros dias

**CLIENTE:** *toca em* “Entrar na espera”

**ROBÔ:** Anotado! 📝 Você está na lista de espera para Amanhã (qui 08/10). Se um horário abrir, eu aviso aqui no WhatsApp (e você pode sair da lista respondendo PARAR).


_Horas depois, outro cliente cancela o das 10:00. O robô avisa quem estava esperando:_

**ROBÔ (aviso automático):** Boa notícia! 🎉 Abriu uma vaga de *Corte masculino* em 08/10 às 10:00. Quer esse horário? Responda QUERO nas próximas horas (quem responder primeiro garante).
> 🔘 QUERO
> 🔘 Não quero

**CLIENTE:** *toca em* “QUERO”

**ROBÔ:** Garantido! ✅

*Corte masculino* com João
📅 08/10 às 10:00
💰 R$ 45,00

Até lá! 😊

