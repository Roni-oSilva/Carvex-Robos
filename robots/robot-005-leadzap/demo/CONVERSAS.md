# Conversas de demonstração — LeadZap

> Gerado automaticamente por `node demo/simulate.ts`: respostas **reais** do robô com dados fictícios (Casa Certa Imóveis). Nada foi enviado ao WhatsApp.
> 🔘 = botão  ·  ▫️ = item de lista  ·  Hoje (fictício) = quarta-feira, 10h.

### 1. Fluxo normal — qualificação, imóvel compatível e visita agendada

**CLIENTE:** “Oi, bom dia”

**ROBÔ:** Olá! Bem-vindo à Casa Certa Imóveis. Vou te ajudar a encontrar o imóvel certo. O que você procura?
> 🔘 Quero comprar
> 🔘 Quero alugar
> 🔘 Falar com corretor

**CLIENTE:** *toca em* “Quero alugar”

**ROBÔ:** Que tipo de imóvel você quer alugar?
> ▫️ Apartamento
> ▫️ Casa
> ▫️ Terreno

**CLIENTE:** *toca em* “Apartamento”

**ROBÔ:** Em qual bairro você quer morar?
> ▫️ Centro
> ▫️ Jardim América
> ▫️ Vila Nova
> ▫️ Bela Vista

**CLIENTE:** *toca em* “Centro”

**ROBÔ:** Qual faixa de valor cabe no seu bolso? (aluguel mensal)
> 🔘 Até R$ 1.500
> 🔘 R$ 1.500 a 3.000
> 🔘 Acima de R$ 3.000

**CLIENTE:** *toca em* “R$ 1.500 a 3.000”

**ROBÔ:** Quantos quartos, no mínimo?
> ▫️ Tanto faz
> ▫️ 1 quarto ou mais
> ▫️ 2 quartos ou mais
> ▫️ 3 quartos ou mais

**CLIENTE:** *toca em* “2 quartos ou mais”

**ROBÔ:** Para quando você pretende fechar?
> 🔘 Até 30 dias
> 🔘 1 a 3 meses
> 🔘 Só pesquisando

**CLIENTE:** *toca em* “Até 30 dias”

**ROBÔ:** Anotei, Ana! Procura alugar apartamento em Centro, faixa R$ 1.500 a 3.000, 2+ quartos, até 30 dias.

**ROBÔ:** Encontrei 1 opção cadastrada para você. Escolha uma para ver os detalhes:
> ▫️ Apartamento 2 quartos n… — R$ 2.100,00/mês · Centro

**CLIENTE:** *toca em* “Apartamento 2 quartos no Centro”

**ROBÔ:** *Apartamento 2 quartos no Centro*
R$ 2.100,00/mês · Centro · 2 quarto(s)
62 m², 1 vaga, portaria 24h.
Fotos e detalhes: https://exemplo.com.br/imoveis/ap-centro-2q
> 🔘 Agendar visita
> 🔘 Ver outras opções
> 🔘 Falar com corretor

**CLIENTE:** *toca em* “Agendar visita”

**ROBÔ:** Em qual dia você quer visitar?
> ▫️ qua 07/10
> ▫️ qui 08/10
> ▫️ sex 09/10
> ▫️ sáb 10/10
> ▫️ seg 12/10
> ▫️ ter 13/10
> ▫️ qua 14/10

**CLIENTE:** *toca em* “qui 08/10”

**ROBÔ:** Horários livres em qui 08/10:
> ▫️ 09:00
> ▫️ 11:00
> ▫️ 14:00
> ▫️ 16:00

**CLIENTE:** *toca em* “14:00”

**ROBÔ:** Visita agendada! ✅
Apartamento 2 quartos no Centro
08/10 às 14:00

Vou te lembrar antes e pedir a sua confirmação. Para ver, remarcar ou cancelar, digite MINHA VISITA.


_Para a equipe, o lead aparece no painel como **quente**, já atribuído ao corretor do bairro, com a visita marcada._

_No dia anterior, o robô lembra e pede confirmação:_

**ROBÔ (lembrete automático):** Lembrete da sua visita: Apartamento 2 quartos no Centro, 08/10 às 14:00. Você confirma presença?
> 🔘 Confirmo
> 🔘 Remarcar
> 🔘 Cancelar visita

### 1b. Cliente confirma

**CLIENTE:** *toca em* “Confirmo”

**ROBÔ:** Presença confirmada para 08/10 às 14:00. Até lá! 🏠


### 2. Fluxo de dúvida — só responde o que está cadastrado

**CLIENTE:** “Vocês fazem financiamento?”

**ROBÔ:** Auxiliamos na simulação com bancos parceiros. As condições dependem do banco e do seu perfil; o corretor explica na visita.

**ROBÔ:** Posso ajudar em mais alguma coisa?
> 🔘 Quero comprar
> 🔘 Quero alugar
> 🔘 Falar com corretor

**CLIENTE:** “Quais bairros vocês atendem?”

**ROBÔ:** Trabalhamos com imóveis em: Centro, Jardim América, Vila Nova, Bela Vista.

**ROBÔ:** Posso ajudar em mais alguma coisa?
> 🔘 Quero comprar
> 🔘 Quero alugar
> 🔘 Falar com corretor

**CLIENTE:** “O apartamento da Bela Vista aceita pet?”

**ROBÔ:** Não tenho essa informação no momento. Vou encaminhar você para um atendente.


### 3. Fluxo de erro — bairro fora da área e perfil sem imóvel cadastrado

**CLIENTE:** *toca em* “Quero comprar”

**ROBÔ:** Que tipo de imóvel você quer comprar?
> ▫️ Apartamento
> ▫️ Casa
> ▫️ Terreno

**CLIENTE:** *toca em* “Casa”

**ROBÔ:** Em qual bairro você quer morar?
> ▫️ Centro
> ▫️ Jardim América
> ▫️ Vila Nova
> ▫️ Bela Vista

**CLIENTE:** “Zona Rural”

**ROBÔ:** Não trabalhamos nessa região no momento. 😕 Atendemos: Centro, Jardim América, Vila Nova, Bela Vista. Escolha uma delas ou digite CORRETOR.
> ▫️ Centro
> ▫️ Jardim América
> ▫️ Vila Nova
> ▫️ Bela Vista

**CLIENTE:** *toca em* “Vila Nova”

**ROBÔ:** Qual faixa de valor cabe no seu bolso?
> 🔘 Até R$ 300 mil
> 🔘 R$ 300 a 600 mil
> 🔘 Acima de R$ 600 mil

**CLIENTE:** *toca em* “Acima de R$ 600 mil”

**ROBÔ:** Quantos quartos, no mínimo?
> ▫️ Tanto faz
> ▫️ 1 quarto ou mais
> ▫️ 2 quartos ou mais
> ▫️ 3 quartos ou mais

**CLIENTE:** *toca em* “Tanto faz”

**ROBÔ:** Para quando você pretende fechar?
> 🔘 Até 30 dias
> 🔘 1 a 3 meses
> 🔘 Só pesquisando

**CLIENTE:** *toca em* “Só pesquisando”

**ROBÔ:** Anotei, Ana! Procura comprar casa em Vila Nova, faixa Acima de R$ 600 mil, só pesquisando.

No momento não tenho imóvel cadastrado com esse perfil, mas já registrei o seu interesse (#1) e Marcos da nossa equipe vai entrar em contato quando houver opções.


_O lead fica registrado como **frio** para a equipe retomar quando surgir um imóvel desse perfil._

### 4. Transferência para corretor humano

**CLIENTE:** “Quero falar com um corretor”

**ROBÔ:** Certo! Já chamei um corretor da equipe. Ele responde assim que possível, por aqui mesmo. 🙂

**CLIENTE:** “Alô?”


_O robô fica em silêncio e a conversa aparece no painel (“Conversas”). Se ninguém assumir em 12h, o robô volta a atender._
