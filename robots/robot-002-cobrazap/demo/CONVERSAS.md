# Conversas de demonstração — CobraZap

> Gerado automaticamente por `node demo/simulate.ts`: respostas **reais** do robô com dados fictícios (Academia Corpo em Movimento). Nada foi enviado ao WhatsApp.
> 🔘 = botão  ·  ▫️ = item de lista  ·  Hoje (fictício) = quarta-feira, 12:00. A empresa tem um modelo de mensagem aprovado, usado quando o cliente não escreveu nas últimas 24h.

### 1. Fluxo normal — da régua automática ao pagamento

_Quarta, 12h: faltam 3 dias para o vencimento. O robô confirma antes se está falando com a pessoa certa (não revela valores ainda):_

**ROBÔ (enviado sozinho):** _(modelo aprovado: cobranca_aviso)_ Maria · Academia Corpo em Movimento · Você é o(a) titular? Responda SIM para receber um aviso sobre um pagamento.

**CLIENTE:** *toca em* “Sim, sou eu”

**ROBÔ:** Obrigado por confirmar, Maria! 😊

Estas são suas pendências com a Academia Corpo em Movimento:
• Mensalidade outubro — R$ 150,00 — venc. 10/10 (vence em 3 dias)

**ROBÔ:** O que você prefere fazer?
> 🔘 Pagar com Pix
> 🔘 Já paguei
> 🔘 Negociar

**CLIENTE:** *toca em* “Pagar com Pix”

**ROBÔ:** Pix copia e cola para *Mensalidade outubro* (R$ 150,00).
É só copiar o código abaixo e colar no app do seu banco (Pix > Pix Copia e Cola):

**ROBÔ:** 00020126560014br.gov.bcb.pix0134financeiro@corpoemmovimento.com.br5204000053039865406150.005802BR5918Corpo em Movimento6009Sao Paulo62060502C163041459

**ROBÔ:** Depois de pagar, responda PAGUEI (e, se quiser, envie o comprovante) para a gente conferir. ✅

**CLIENTE:** “paguei!”

**ROBÔ:** Obrigado por avisar! 🙏 Vamos conferir o pagamento de *Mensalidade outubro* (pode levar até 1 dia útil).

Se puder, envie aqui o comprovante (foto ou PDF) para agilizar.


_No painel, a empresa confere no banco e clica em “Recebi”. A cobrança sai da régua._

### 2. Fluxo de dúvida — responde só o que está cadastrado

**CLIENTE:** “Posso trancar meu plano?”

**ROBÔ:** Sim. O trancamento é feito na recepção, com até 60 dias por ano. Fale com um atendente para solicitar.

**CLIENTE:** “Qual o horário de funcionamento?”

**ROBÔ:** Funcionamos de segunda a sexta das 6h às 22h e aos sábados das 8h às 14h.


### 3. Fluxo de erro — número errado (a cobrança nunca é exposta)

_O robô perguntou se falava com a Maria; quem recebeu a mensagem não é ela:_

**CLIENTE:** *toca em* “Número errado”

**ROBÔ:** Desculpe o engano! Removemos este número dos nossos avisos. Tenha um ótimo dia. 🙏


_O número é removido de todos os avisos e o fato fica registrado no painel._

### 3b. Mensagem que o robô não entende (áudio)

**CLIENTE:** 📎 (áudio enviado)

**ROBÔ:** Só consigo entender mensagens de texto e botões. Para falar com uma pessoa, digite ATENDENTE.


### 4. Transferência para atendente humano

**CLIENTE:** “Quero falar com um atendente”

**ROBÔ:** Certo! Já chamei um atendente. Ele responde assim que possível, por aqui mesmo. 🙂

**CLIENTE:** “Alô?”


_A régua continua respeitando o limite de contatos, mas a conversa passa a ser da equipe, no painel._

### 5. Negociação — o cliente propõe parcelar

**CLIENTE:** “Não consigo pagar tudo agora, dá pra parcelar?”

**ROBÔ:** Pix copia e cola para *Mensalidade outubro* (R$ 150,00).
É só copiar o código abaixo e colar no app do seu banco (Pix > Pix Copia e Cola):

**ROBÔ:** 00020126560014br.gov.bcb.pix0134financeiro@corpoemmovimento.com.br5204000053039865406150.005802BR5918Corpo em Movimento6009Sao Paulo62060502C163041459

**ROBÔ:** Depois de pagar, responda PAGUEI (e, se quiser, envie o comprovante) para a gente conferir. ✅

**CLIENTE:** *toca em* “3x de R$ 50,00”

**ROBÔ:** Não tenho essa informação no momento. Vou encaminhar você para um atendente.


_A equipe vê a proposta em “Acordos”, escolhe o 1º vencimento e aceita: o robô cria as 3 parcelas, avisa a cliente e passa a lembrar de cada uma._

### 6. Número sem pendências

**CLIENTE:** “Oi”

**ROBÔ:** Olá! Sou o assistente de cobranças da Academia Corpo em Movimento. Não encontrei pendências para este número. Se precisar de ajuda, digite ATENDENTE.

