# Conversas de demonstração — OrcaZap

> Gerado automaticamente por `node demo/simulate.ts`: respostas **reais** do robô com dados fictícios (Reforma Fácil Serviços). Nada foi enviado ao WhatsApp.
> 🔘 = botão  ·  ▫️ = item de lista  ·  📎 = foto enviada pelo cliente  ·  Hoje (fictício) = quarta-feira, 10h.

### 1. Fluxo normal — pedido de orçamento com fotos, proposta e aceite

**CLIENTE:** “Oi, bom dia”

**ROBÔ:** Olá! Aqui é a Reforma Fácil Serviços. Posso receber o seu pedido de orçamento com fotos. Como posso ajudar?
> 🔘 Pedir orçamento
> 🔘 Meu orçamento
> 🔘 Tirar dúvida

**CLIENTE:** *toca em* “Pedir orçamento”

**ROBÔ:** Qual serviço você precisa?
> ▫️ Pintura
> ▫️ Elétrica
> ▫️ Hidráulica
> ▫️ Gesso e forro
> ▫️ Ar-condicionado

**CLIENTE:** *toca em* “Pintura”

**ROBÔ:** Descreva o que precisa ser feito (o que está acontecendo, medidas aproximadas, material, o que você espera). Quanto mais detalhes, mais preciso o orçamento.

**CLIENTE:** “Pintar sala e dois quartos, tem mofo no canto de uma parede”

**ROBÔ:** Agora envie fotos do local ou do problema (até 4). Quando terminar, toque em “Já enviei”.
> 🔘 Sem fotos

**CLIENTE:** 📎 (foto enviada)

**ROBÔ:** Foto 1 de 4 recebida. Pode enviar mais ou tocar em “Já enviei”.
> 🔘 Já enviei

**CLIENTE:** 📎 (foto enviada)

**ROBÔ:** Foto 2 de 4 recebida. Pode enviar mais ou tocar em “Já enviei”.
> 🔘 Já enviei

**CLIENTE:** *toca em* “Já enviei”

**ROBÔ:** Em qual bairro fica o serviço?
> ▫️ Centro
> ▫️ Jardim América
> ▫️ Vila Nova
> ▫️ Bela Vista

**CLIENTE:** *toca em* “Centro”

**ROBÔ:** Qual o endereço (rua, número e ponto de referência)? Usamos só para a equipe avaliar e agendar.

**CLIENTE:** “Rua das Acácias, 45, apto 12”

**ROBÔ:** Se for preciso uma visita, qual período é melhor para você?
> 🔘 Manhã
> 🔘 Tarde
> 🔘 Tanto faz

**CLIENTE:** *toca em* “Manhã”

**ROBÔ:** Confira o seu pedido de orçamento:
Serviço: Pintura
O que precisa: Pintar sala e dois quartos, tem mofo no canto de uma parede
Local: Rua das Acácias, 45, apto 12 — Centro
Fotos: 2
Período para visita: Manhã
Nome: Ana Paula

Esse tipo de serviço costuma precisar de visita; o valor final pode ser confirmado após a avaliação.
> 🔘 Enviar pedido
> 🔘 Cancelar

**CLIENTE:** *toca em* “Enviar pedido”

**ROBÔ:** Pedido de orçamento *#1* recebido!
A equipe vai analisar as fotos e enviar o valor por aqui. Se precisar de mais informações, entraremos em contato.

Para ver a situação, digite MEU ORÇAMENTO.


_No painel, a equipe abre o pedido, vê as fotos, informa o valor e clica em “Enviar ao cliente”. O cliente recebe a proposta com botões:_

**ROBÔ (proposta da equipe):** *Orçamento #1* — Pintura
Valor: *R$ 2.850,00*
Prazo: 5 dias úteis; 50% de entrada
Inclui tratamento do mofo e 2 demãos de tinta (material por nossa conta).
Proposta válida até 14/10/2026.
> 🔘 Aceitar
> 🔘 Recusar
> 🔘 Tenho dúvida

### 1b. Cliente aceita

**CLIENTE:** *toca em* “Aceitar”

**ROBÔ:** Combinado! Orçamento #1 aceito (R$ 2.850,00). A equipe vai falar com você para combinar a data e os detalhes.


### 2. Fluxo de dúvida — só responde o que está cadastrado

**CLIENTE:** “Quanto custa o orçamento?”

**ROBÔ:** O valor depende do serviço e do local. Eu reúno as informações e as fotos aqui no WhatsApp e a equipe envia o orçamento. Toque em “Pedir orçamento” para começar.

**ROBÔ:** Posso ajudar em mais alguma coisa?
> 🔘 Pedir orçamento
> 🔘 Menu

**CLIENTE:** “Quais bairros vocês atendem?”

**ROBÔ:** Atendemos: Centro, Jardim América, Vila Nova, Bela Vista.

**ROBÔ:** Posso ajudar em mais alguma coisa?
> 🔘 Pedir orçamento
> 🔘 Menu

**CLIENTE:** “Vocês consertam telhado?”

**ROBÔ:** Não tenho essa informação no momento. Vou encaminhar você para um atendente.


### 3. Fluxo de erro — arquivo que não é foto e bairro fora da área

**CLIENTE:** *toca em* “Pedir orçamento”

**ROBÔ:** Qual serviço você precisa?
> ▫️ Pintura
> ▫️ Elétrica
> ▫️ Hidráulica
> ▫️ Gesso e forro
> ▫️ Ar-condicionado

**CLIENTE:** *toca em* “Elétrica”

**ROBÔ:** Descreva o que precisa ser feito (o que está acontecendo, medidas aproximadas, material, o que você espera). Quanto mais detalhes, mais preciso o orçamento.

**CLIENTE:** “Trocar o quadro de luz”

**ROBÔ:** Agora envie fotos do local ou do problema (até 4). Quando terminar, toque em “Já enviei”.
> 🔘 Sem fotos


### 3b. Continuação

**CLIENTE:** 📎 (foto enviada)

**ROBÔ:** Não consegui usar esse arquivo (não é uma imagem JPEG, PNG ou WebP). Envie uma foto em JPEG, PNG ou WebP de até 5 MB.

**CLIENTE:** *toca em* “Sem fotos”

**ROBÔ:** Em qual bairro fica o serviço?
> ▫️ Centro
> ▫️ Jardim América
> ▫️ Vila Nova
> ▫️ Bela Vista

**CLIENTE:** “Bairro Distante”

**ROBÔ:** Ainda não atendemos esse bairro. 😕 Atendemos: Centro, Jardim América, Vila Nova, Bela Vista. Se achar que é um engano, digite ATENDENTE.


### 4. Transferência para atendente humano

**CLIENTE:** “Quero falar com um atendente”

**ROBÔ:** Certo! Já chamei um atendente. Ele responde assim que possível, por aqui mesmo. 🙂

**CLIENTE:** “Alô?”


_O robô fica em silêncio e a conversa aparece no painel (“Conversas”). Se ninguém assumir em 12h, o robô volta a atender._
