# Banco de oportunidades — Fábrica de Robôs WhatsApp

> Arquivo GERADO por `node market-research/gerar.ts` a partir de `opportunities.json`. Edite o JSON, não este arquivo.

## Aviso sobre as evidências

A maior parte das fontes encontradas são blogs de **fornecedores de software** (têm interesse comercial em destacar o problema). Os números citados **não foram verificados de forma independente**. Cada oportunidade traz a *força da evidência* (forte / média / fraca). Nenhuma foi classificada como *forte*: nenhuma tem pesquisa independente com amostra representativa. **Valide com 5–10 entrevistas de clientes reais antes de investir em vendas.**

## Como a pontuação é calculada

- Tamanho do problema: peso 12
- Frequência do problema: peso 10
- Quantidade de possíveis clientes: peso 10
- Facilidade de implementação: peso 12
- Potencial de venda: peso 12
- Possibilidade de cobrança mensal: peso 10
- Possibilidade de personalização: peso 8
- Concorrência (10 = pouca concorrência): peso 10
- Custo operacional (10 = baixo custo): peso 8
- Potencial de escala: peso 8

Pontuação = soma(peso × nota de 0 a 10) / 10 → escala 0–100. As notas são julgamento do autor, não medição.

## Ranking

| # | Pontos | Oportunidade | Segmento | Evidência | Status | Robô |
|---|---|---|---|---|---|---|
| 1 | **78.8** | Agenda anti-falta para salões e barbearias | Salões de beleza, barbearias, estúdios | média | concluída | robot-001-agendazap |
| 2 | **75.8** | Régua de cobrança educada para PMEs e MEIs | Prestadores de serviço, escolas, academias, pequenos comércios com mensalidade | média | concluída | robot-002-cobrazap |
| 3 | **75.4** | Confirmação de consultas para clínicas | Clínicas médicas, odontológicas, psicólogos, fisioterapia | média | concluída | robot-001-agendazap |
| 4 | **73.2** | Recepcionista virtual de FAQ 24h para negócios locais | Qualquer negócio local | média | concluída | — |
| 5 | **73.0** | Pedidos próprios por WhatsApp para restaurantes | Lanchonetes, pizzarias, restaurantes, marmitarias | fraca | concluída | robot-003-pedidozap |
| 6 | **69.4** | Pesquisa NPS e pedido de avaliação no Google | Qualquer negócio local | fraca | descoberta | — |
| 7 | **69.2** | Pré-orçamento para prestadores de serviço | Eletricistas, pedreiros, dedetizadoras, serviços residenciais | média | concluída | robot-004-orcazap |
| 8 | **68.4** | Qualificação de leads para imobiliárias e corretores | Imobiliárias e corretores autônomos | média | concluída | robot-005-leadzap |
| 9 | **66.2** | Matrícula e aula experimental para escolas e cursos livres | Escolas de idiomas, cursos livres, reforço escolar | média | analisada | — |
| 10 | **64.6** | Status de serviço e aprovação de orçamento para oficinas | Oficinas mecânicas, funilarias, lava-jatos | média | analisada | — |
| 11 | **64.6** | 'Onde está meu pedido?' para lojas virtuais | E-commerce pequeno (Shopify, Nuvemshop, Tray, WooCommerce) | média | analisada | — |
| 12 | **63.6** | Lembretes de vacina/retorno e recompra para pet shops | Pet shops e veterinárias | fraca | descoberta | — |
| 13 | **63.0** | Pedido recorrente para revendas de gás e água | Revendas de gás de cozinha e água mineral | média | descoberta | — |
| 14 | **62.4** | Acompanhamento de conserto para assistências técnicas | Assistência técnica de celulares e eletrônicos | fraca | descoberta | — |
| 15 | **62.0** | Retenção e reativação para academias | Academias e estúdios fitness | fraca | descoberta | — |
| 16 | **61.6** | Recuperação de carrinho abandonado por WhatsApp | E-commerce | fraca | descoberta | — |
| 17 | **60.0** | Triagem de clientes para escritórios de advocacia | Advocacia (e contabilidade, a validar) | média | descoberta | — |
| 18 | **58.4** | Catálogo, reserva de peças e atendimento para boutiques | Lojas de roupas e acessórios | fraca | descoberta | — |
| 19 | **57.6** | Agenda de aulas e documentos para autoescolas | Autoescolas / CFCs | fraca | descoberta | — |
| 20 | **56.2** | Inscrição e confirmação de presença em eventos | Igrejas, eventos pequenos, escolas | fraca | descoberta | — |
| 21 | **56.0** | Reservas diretas para pousadas | Pousadas e hotéis pequenos | média | descoberta | — |
| 22 | **54.6** | Atendimento ao morador para condomínios | Condomínios e administradoras | média | descoberta | — |

## Fichas

### Oportunidade #1 — Agenda anti-falta para salões e barbearias

**Nome:** Agenda anti-falta para salões e barbearias  
**Segmento:** Salões de beleza, barbearias, estúdios  
**Problema:** Agenda marcada manualmente no WhatsApp gera conflitos de horário, faltas sem aviso e cadeira vazia.  
**Público:** Donos de salões/barbearias com 1 a 10 profissionais  
**Evidência:**
- [Aurora Inbox – guia de agendamento para barbearias (2026)](https://www.aurorainbox.com/pt/2026/05/03/sistema-de-agendamento-via-whatsapp-para-barbearias-e-saloes-de-beleza/) — Afirma 15–22% de não comparecimento no agendamento manual e 1–2 h/dia de horários vagos por profissional (fonte de fornecedor, não verificada).
- [TCC IFPI 2026](https://bia.ifpi.edu.br/jspui/bitstream/123456789/5863/1/2026_tcc_rralves.pdf) — Trabalho acadêmico brasileiro aponta gestão manual de agenda gerando esperas, conflitos, faltas e insatisfação.
- *Força da evidência:* média

**Como resolvem hoje:** Dono responde no WhatsApp pessoal e anota em caderno/agenda; alguns usam apps de agenda.  
**Por que um robô seria útil:** Cliente já pede horário pelo WhatsApp; o robô agenda 24h, confirma e reaproveita vagas canceladas.  
**Solução / funcionalidades:** Agendamento por conversa; Lembrete 24h e 2h com confirmação; Cancelar/remarcar; Lista de espera; Painel da agenda  
**Complexidade:** Média  
**Potencial comercial:** Alto: mensalidade recorrente, mercado enorme e pulverizado.  
**Pontuação:** 78.8 / 100  
**Concorrentes:** SocialHub, Aurora Inbox, Digisac, Wati, apps de agenda (Trinks etc.).  
**Diferencial:** Instalação própria, preço fixo, sem comissão por agendamento, dados do dono, documentação LGPD.  
**Status:** concluída → `robots/robot-001-agendazap`  

### Oportunidade #3 — Régua de cobrança educada para PMEs e MEIs

**Nome:** Régua de cobrança educada para PMEs e MEIs  
**Segmento:** Prestadores de serviço, escolas, academias, pequenos comércios com mensalidade  
**Problema:** Atrasos pequenos viram inadimplência porque o follow-up é esquecido ou constrangedor.  
**Público:** MEIs e PMEs que cobram mensalidade/boleto/Pix  
**Evidência:**
- [Actana – cobranças eficientes para PMEs e MEIs](https://actana.com.br/blog/cobrancas-eficientes-pmes-meis-prestadores-servico) — Recomenda lembrete antes do vencimento, mensagens gentis após atraso e negociação; alerta que ignorar pequenos atrasos agrava a inadimplência (fonte de fornecedor).
- [Zenvia – cobrança pelo WhatsApp](https://zenvia.com/blog/cobranca-whatsapp/) — Cobrança por WhatsApp é permitida se respeitar CDC e LGPD; CDC proíbe constrangimento e assédio.
- *Força da evidência:* média

**Como resolvem hoje:** Dono manda mensagem manual quando lembra; planilha de controle.  
**Por que um robô seria útil:** Cadência automática, tom educado, com Pix copia-e-cola e opção de negociar.  
**Solução / funcionalidades:** Régua D-3/D0/D+3/D+7/D+15; Pix copia-e-cola; Negociação; Opt-out; Painel de recebíveis  
**Complexidade:** Média  
**Potencial comercial:** Alto: ligado diretamente ao caixa do cliente.  
**Pontuação:** 75.8 / 100  
**Concorrentes:** Zenvia, Conta Azul/Asaas (cobrança integrada), planilhas.  
**Diferencial:** Guardrails legais embutidos (horários, limite de contatos, sem terceiros), sem comissão sobre valor recuperado.  
**Status:** concluída → `robots/robot-002-cobrazap`  

### Oportunidade #2 — Confirmação de consultas para clínicas

**Nome:** Confirmação de consultas para clínicas  
**Segmento:** Clínicas médicas, odontológicas, psicólogos, fisioterapia  
**Problema:** Faltas de pacientes (no-show) deixam horários vazios e reduzem a receita da clínica.  
**Público:** Clínicas e consultórios pequenos e médios  
**Evidência:**
- [Medicina S/A – clínicas privadas perdem até R$ 144 mil por problemas de agendamento](https://medicinasa.com.br/agendamento-consultas/) — Reportagem do setor sobre perdas por falhas de agendamento.
- [Digisac – como reduzir faltas de pacientes](https://digisac.com.br/blog/como-reduzir-faltas-de-pacientes) — Define no-show e lista estratégias; fonte de fornecedor.
- [Zenvia – diminuir faltas em consultas](https://zenvia.com/blog/o-que-fazer-para-diminuir-a-falta-em-consultas-medicas/) — Revisões de estudos citam redução de faltas com lembretes, mas efeito do WhatsApp é misto (um estudo brasileiro positivo; México e Índia sem efeito).
- *Força da evidência:* média

**Como resolvem hoje:** Secretária liga ou manda mensagem manualmente na véspera.  
**Por que um robô seria útil:** Automatiza a cadência de confirmação e libera a secretária.  
**Solução / funcionalidades:** Confirmação ativa; Reagendamento pelo chat; Lista de espera; Relatório de faltas  
**Complexidade:** Média (dados de saúde exigem LGPD reforçada)  
**Potencial comercial:** Alto, ticket maior que salões.  
**Pontuação:** 75.4 / 100  
**Concorrentes:** Clint, Digisac, Zenvia, sistemas de prontuário com lembrete.  
**Diferencial:** Mesmo núcleo do robô 001, com política de minimização de dados (não coleta queixa clínica).  
**Status:** concluída → `robots/robot-001-agendazap`  
**Observação:** Atendida como variação de segmento do robot-001 (mesmo motor de agenda).  

### Oportunidade #22 — Recepcionista virtual de FAQ 24h para negócios locais

**Nome:** Recepcionista virtual de FAQ 24h para negócios locais  
**Segmento:** Qualquer negócio local  
**Problema:** Perguntas repetidas (horário, endereço, preço) e demora na resposta fazem perder clientes.  
**Público:** Pequenos negócios em geral  
**Evidência:**
- [ABC da Comunicação – 62% dos consumidores já desistiram de comprar no WhatsApp](https://www.abcdacomunicacao.com.br/62-dos-consumidores-ja-desistiram-de-comprar-no-whatsapp-e-empresas-nem-sabem-quanto-dinheiro-estao-perdendo/) — Pesquisa citada em veículo de comunicação; metodologia não verificada.
- [Bem Paraná – chatbot para pequenas empresas sem perder o atendimento humano](https://www.bemparana.com.br/noticias/geral/como-usar-chatbot-para-whatsapp-em-pequenas-empresas-sem-perder-o-atendimento-humano/) — Descreve perda silenciosa de oportunidades por demora.
- *Força da evidência:* média

**Como resolvem hoje:** Respostas rápidas do WhatsApp Business (gratuito).  
**Por que um robô seria útil:** FAQ com IA restrita à base de conhecimento e handoff — vira componente de todos os robôs.  
**Solução / funcionalidades:** Base de conhecimento; Fora do horário; Handoff  
**Complexidade:** Baixa  
**Potencial comercial:** Médio, mas é a oferta mais commoditizada.  
**Pontuação:** 73.2 / 100  
**Concorrentes:** Praticamente todos os provedores; WhatsApp Business gratuito.  
**Diferencial:** Já embutido em todos os robôs da fábrica (shared/ai).  
**Status:** concluída  
**Observação:** Implementado como camada compartilhada (shared/ai: FAQ restrita à base de conhecimento + handoff), presente em todos os robôs; não vendido como produto isolado por ser a oferta mais comoditizada (o WhatsApp Business gratuito já tem respostas rápidas).  

### Oportunidade #4 — Pedidos próprios por WhatsApp para restaurantes

**Nome:** Pedidos próprios por WhatsApp para restaurantes  
**Segmento:** Lanchonetes, pizzarias, restaurantes, marmitarias  
**Problema:** Taxas de marketplaces pressionam a margem; pedido manual por WhatsApp é lento e gera erro.  
**Público:** Restaurantes e deliveries com entrega própria  
**Evidência:**
- [Tecnoblog (comunidade) – iFood cobra taxa de serviço em todos os pedidos](https://tecnoblog.net/comunidade/t/nao-e-impressao-o-ifood-agora-cobra-taxa-de-servico-em-todos-os-pedidos/150882) — Relatos de usuários (não oficiais) de preços menores pelo WhatsApp e comerciantes voltando a pedidos diretos.
- [Tecnoblog (comunidade) – iFood domina o delivery](https://tecnoblog.net/comunidade/t/ifood-domina-o-delivery-no-brasil-mas-restaurantes-e-rivais-contam-como-vao-reagir/57006) — Comentários dizem que pedir pelo WhatsApp é demorado/ineficiente — a dor que o robô resolve.
- *Força da evidência:* fraca

**Como resolvem hoje:** Atendente anota pedido no WhatsApp; cardápio em foto/PDF.  
**Por que um robô seria útil:** Cardápio, carrinho, endereço, taxa e pagamento em conversa guiada, com painel de pedidos.  
**Solução / funcionalidades:** Cardápio por categorias; Carrinho; Taxa por bairro; Pagamento Pix/cartão/dinheiro; Quadro de pedidos; Aviso de status  
**Complexidade:** Média-alta  
**Potencial comercial:** Alto: frequência diária de uso.  
**Pontuação:** 73.0 / 100  
**Concorrentes:** Menu Dino, Anota AI, Goomer, Olaclick, iFood.  
**Diferencial:** Sem comissão por pedido; dados do cliente ficam com o restaurante.  
**Status:** concluída → `robots/robot-003-pedidozap`  
**Observação:** Evidência baseada em relatos de fóruns; validar com entrevistas a restaurantes.  

### Oportunidade #14 — Pesquisa NPS e pedido de avaliação no Google

**Nome:** Pesquisa NPS e pedido de avaliação no Google  
**Segmento:** Qualquer negócio local  
**Problema:** Poucas avaliações públicas e nenhum canal para ouvir cliente insatisfeito antes da reclamação pública.  
**Público:** Negócios locais com atendimento presencial  
**Evidência:**
- [SocialHub – avaliações 5 estrelas no Google pelo WhatsApp](https://www.socialhub.pro/blog/avaliacoes-google-whatsapp-modelos-pedir-review/) — Sugere pedir em 24–48 h; promocional.
- [Envox – 7 formas de pedir avaliações no Google](https://envox.com.br/?p=11600) — Boas práticas; alerta contra trocar benefício por avaliação (contra as regras do Google).
- *Força da evidência:* fraca

**Como resolvem hoje:** Pedido verbal ou nada.  
**Por que um robô seria útil:** NPS 0–10; promotores recebem o link, detratores vão para contato privado.  
**Solução / funcionalidades:** NPS; Roteamento por nota; Painel de NPS  
**Complexidade:** Baixa  
**Potencial comercial:** Médio-baixo isoladamente; melhor como módulo.  
**Pontuação:** 69.4 / 100  
**Concorrentes:** Muitas ferramentas de reputação.  
**Diferencial:** Módulo plugável nos robôs de agenda/pedidos.  
**Status:** descoberta  
**Observação:** Candidato a módulo plugável (NPS pós-atendimento) dos robôs 001 e 003, em vez de robô isolado.  

### Oportunidade #21 — Pré-orçamento para prestadores de serviço

**Nome:** Pré-orçamento para prestadores de serviço  
**Segmento:** Eletricistas, pedreiros, dedetizadoras, serviços residenciais  
**Problema:** Orçamentos atrasados e follow-ups esquecidos; muita conversa para coletar informações básicas.  
**Público:** Prestadores autônomos e microempresas  
**Evidência:**
- [SocialHub – WhatsApp para prestador de serviço com 2 funcionários](https://www.socialhub.pro/blog/whatsapp-prestador-servico-qualificar-orcar-fechar/) — Aponta orçamento atrasado e follow-up esquecido como gargalos; fonte de fornecedor.
- [WhatsApp Business – história da construtora Engelife](https://whatsappbusiness.com/resources/success-stories/engelife-construtora-e-incorporadora/) — Caso oficial de qualificação por formulário antes do atendimento humano (empresa de médio porte).
- *Força da evidência:* média

**Como resolvem hoje:** Vai trocando mensagens até entender o serviço.  
**Por que um robô seria útil:** Coleta serviço, bairro, urgência e fotos e entrega pronto para orçar.  
**Solução / funcionalidades:** Perguntas por tipo de serviço; Recebimento de fotos; Follow-up 24–48 h; Classificação quente/frio  
**Complexidade:** Média  
**Potencial comercial:** Médio.  
**Pontuação:** 69.2 / 100  
**Concorrentes:** Apps de serviços (GetNinjas), CRMs genéricos.  
**Diferencial:** Perguntas específicas por tipo de serviço; resumo estruturado.  
**Status:** concluída → `robots/robot-004-orcazap`  
**Observação:** Construído como robô #4 (OrcaZap): pedido de orçamento com fotos, proposta e acompanhamento.  

### Oportunidade #5 — Qualificação de leads para imobiliárias e corretores

**Nome:** Qualificação de leads para imobiliárias e corretores  
**Segmento:** Imobiliárias e corretores autônomos  
**Problema:** Leads esfriam por demora no primeiro contato; histórico se perde nos números pessoais dos corretores.  
**Público:** Imobiliárias pequenas e médias, corretores  
**Evidência:**
- [Wati – plataforma de WhatsApp para qualificar leads imobiliários](https://www.wati.io/geo-brazil-pt/plataforma-de-whatsapp-para-qualificar-leads-imobiliarios) — Descreve qualificação por orçamento, localização e prazo; fonte de fornecedor.
- [Método Viral – automação de atendimento em imobiliárias](https://metodoviral.com/blog/mercado-imobiliario-construcao-civil/automacao-de-atendimento-em-imobiliarias-whatsapp/) — Cita estatísticas divergentes entre si sobre leads sem resposta; o ponto consistente é responder em minutos.
- *Força da evidência:* média

**Como resolvem hoje:** Corretor responde quando pode; planilha ou CRM manual.  
**Por que um robô seria útil:** Responde na hora, coleta orçamento/bairro/prazo e entrega lead quente ao corretor.  
**Solução / funcionalidades:** Perguntas de qualificação; Classificação quente/morno/frio; Roteamento ao corretor; Follow-up  
**Complexidade:** Média  
**Potencial comercial:** Alto por lead convertido; mercado menor.  
**Pontuação:** 68.4 / 100  
**Concorrentes:** Wati, Jetimob, Kenlo, CRMs imobiliários.  
**Diferencial:** Entrega resumo estruturado ao corretor; funciona sem CRM.  
**Status:** concluída → `robots/robot-005-leadzap`  
**Observação:** Construído como robô #5 (LeadZap): qualificação, classificação e roteamento de leads, visitas e follow-up.  

### Oportunidade #8 — Matrícula e aula experimental para escolas e cursos livres

**Nome:** Matrícula e aula experimental para escolas e cursos livres  
**Segmento:** Escolas de idiomas, cursos livres, reforço escolar  
**Problema:** Secretaria repete valores/horários e perde lead fora do expediente.  
**Público:** Escolas e cursos pequenos  
**Evidência:**
- [respond.io – WhatsApp para educação](https://respond.io/pt/blog/whatsapp-for-education) — Descreve qualificação, resumo e passagem para humano; fonte de fornecedor.
- [Baguete – Vitru Educação automatiza atendimento com Blip](https://www.baguete.com.br/noticias/vitru-educacao-automatiza-atendimento-com-blip) — Caso de grande instituição; não serve como referência de custo para escola pequena.
- *Força da evidência:* média

**Como resolvem hoje:** Secretária responde quando está presente.  
**Por que um robô seria útil:** Responde FAQ, agenda aula experimental e entrega lead qualificado.  
**Solução / funcionalidades:** FAQ de valores/horários; Agendar aula experimental; Captura de lead; Passagem para humano  
**Complexidade:** Baixa-média  
**Potencial comercial:** Médio-alto.  
**Pontuação:** 66.2 / 100  
**Concorrentes:** Blip, SocialHub, respond.io.  
**Diferencial:** Reutiliza o motor de agenda do robot-001 (aula experimental = agendamento).  
**Status:** analisada  

### Oportunidade #6 — Status de serviço e aprovação de orçamento para oficinas

**Nome:** Status de serviço e aprovação de orçamento para oficinas  
**Segmento:** Oficinas mecânicas, funilarias, lava-jatos  
**Problema:** Clientes ligam para perguntar 'quando fica pronto?'; aprovação de orçamento informal por WhatsApp.  
**Público:** Oficinas pequenas e médias  
**Evidência:**
- [O Mecânico – WhatsApp serve para aprovar orçamento da oficina?](https://omecanico.com.br/whatsapp-serve-para-aprovar-orcamento-da-oficina/) — Advogada ouvida afirma que conversas de WhatsApp são tratadas como indício e não como prova; recomenda formalizar a aprovação (a decisão do STJ citada não foi verificada).
- [SocialHub – mensagens de WhatsApp para oficinas](https://www.socialhub.pro/blog/mensagens-whatsapp-oficina-mecanica/) — Modelos de mensagem por etapa da ordem de serviço; fonte de fornecedor.
- *Força da evidência:* média

**Como resolvem hoje:** Mecânico/recepção responde manualmente ou cliente liga.  
**Por que um robô seria útil:** Notifica cada etapa da OS e registra aprovação do orçamento.  
**Solução / funcionalidades:** Status por OS; Aprovação sim/não registrada; Aviso de veículo pronto; Consulta por placa/código  
**Complexidade:** Média (depende de entrada manual de status)  
**Potencial comercial:** Médio.  
**Pontuação:** 64.6 / 100  
**Concorrentes:** Una, Oficina Inteligente, sistemas de OS com WhatsApp.  
**Diferencial:** Registro formal da aprovação com data/hora e texto exato aprovado.  
**Status:** analisada  

### Oportunidade #10 — 'Onde está meu pedido?' para lojas virtuais

**Nome:** 'Onde está meu pedido?' para lojas virtuais  
**Segmento:** E-commerce pequeno (Shopify, Nuvemshop, Tray, WooCommerce)  
**Problema:** Perguntas de rastreio dominam o suporte (fornecedores estimam 30–50% dos tickets).  
**Público:** Lojas virtuais com 50 a 2.000 pedidos/mês  
**Evidência:**
- [Freshworks – o que é WISMO](https://www.freshworks.com/br/ecommerce/what-is-wismo/) — Define WISMO e sua participação no suporte; fonte de fornecedor.
- [Launchtip – reduzir tickets WISMO no Shopify](https://www.launchtip.com/pt-BR/blog/como-reduzir-tickets-wismo-no-shopify) — Estimativa de 40–50% do volume de suporte; fonte de fornecedor.
- *Força da evidência:* média

**Como resolvem hoje:** Equipe copia código de rastreio manualmente.  
**Por que um robô seria útil:** Envio proativo de status e resposta automática por número do pedido.  
**Solução / funcionalidades:** Webhook da loja; Template de envio; Consulta por pedido; Handoff  
**Complexidade:** Média-alta (uma integração por plataforma)  
**Potencial comercial:** Médio-alto.  
**Pontuação:** 64.6 / 100  
**Concorrentes:** Gorgias, Wati, Yampi, plataformas de rastreio.  
**Diferencial:** Preço fixo e instalação própria.  
**Status:** analisada  

### Oportunidade #16 — Lembretes de vacina/retorno e recompra para pet shops

**Nome:** Lembretes de vacina/retorno e recompra para pet shops  
**Segmento:** Pet shops e veterinárias  
**Problema:** Retornos e vacinas esquecidos; reposição de ração sem lembrete.  
**Público:** Pet shops e clínicas veterinárias  
**Evidência:**
- [SocialHub – WhatsApp para veterinária e pet shop](https://www.socialhub.pro/blog/whatsapp-veterinaria-pet-shop-automacao-fidelizacao-tutores/) — Descreve lembretes baseados no histórico do pet; números de abertura são alegações de fornecedor.
- [GoSmarter – WhatsApp Business para pet shop](https://gosmarter.com.br/whatsapp-business-para-pet-shop-clinica-veterinaria-guia/) — Guia de fornecedor.
- *Força da evidência:* fraca

**Como resolvem hoje:** Planilha/anotação do sistema da loja.  
**Por que um robô seria útil:** Lembrete recorrente por pet e agendamento de banho e tosa.  
**Solução / funcionalidades:** Lembretes recorrentes; Agendar banho e tosa; Recompra  
**Complexidade:** Média  
**Potencial comercial:** Médio.  
**Pontuação:** 63.6 / 100  
**Concorrentes:** Sistemas veterinários (Simples Vet etc.).  
**Diferencial:** Reuso do motor de agenda (robot-001) + lembretes recorrentes.  
**Status:** descoberta  

### Oportunidade #17 — Pedido recorrente para revendas de gás e água

**Nome:** Pedido recorrente para revendas de gás e água  
**Segmento:** Revendas de gás de cozinha e água mineral  
**Problema:** Pedidos por telefone/WhatsApp sem lembrete de reposição nem roteirização.  
**Público:** Revendas locais  
**Evidência:**
- [Baguete – Supergasbras automatiza atendimento com Botmaker](https://www.baguete.com.br/noticias/supergasbras-automatiza-atendimento-com-botmaker) — Grande distribuidora já vende botijão por chatbot de WhatsApp (mais de 142 mil usuários em 2021 segundo a reportagem).
- [Workana – MVP de plataforma de automação na venda de gás e água](https://www.workana.com/job/desenvolvimento-de-mvp-para-plataforma-de-automacao-na-venda-de-gas-e-agua) — Demanda real de freelance por pedidos, painel e despacho — requisito, não case.
- *Força da evidência:* média

**Como resolvem hoje:** Telefone/WhatsApp; anotação manual.  
**Por que um robô seria útil:** Pedido rápido recorrente e lembrete de reposição.  
**Solução / funcionalidades:** Pedido rápido; Lembrete de reposição; Despacho ao entregador  
**Complexidade:** Média; núcleo semelhante ao PedidoZap.  
**Potencial comercial:** Médio.  
**Pontuação:** 63.0 / 100  
**Concorrentes:** Botmaker (grande), apps de entrega de gás.  
**Diferencial:** Variação do robot-003 com recompra.  
**Status:** descoberta  

### Oportunidade #7 — Acompanhamento de conserto para assistências técnicas

**Nome:** Acompanhamento de conserto para assistências técnicas  
**Segmento:** Assistência técnica de celulares e eletrônicos  
**Problema:** Cliente não sabe o andamento do aparelho e pergunta repetidamente.  
**Público:** Assistências técnicas pequenas  
**Evidência:**
- [ConsertaSmart – páginas públicas de ordens de serviço](https://www.consertasmart.com/en/service-order/952) — Mostra status padronizados e convite para orçamento por WhatsApp; não prova a dor, apenas o padrão de mercado.
- *Força da evidência:* fraca

**Como resolvem hoje:** Portal de OS de redes grandes; pequenas lojas respondem manualmente.  
**Por que um robô seria útil:** Mesmo motor do item 6 aplicado a eletrônicos.  
**Solução / funcionalidades:** Status padronizados; Aprovação por resposta; Lembrete de retirada  
**Complexidade:** Média  
**Potencial comercial:** Médio-baixo.  
**Pontuação:** 62.4 / 100  
**Concorrentes:** Sistemas de OS, redes franqueadas.  
**Diferencial:** Reuso do robô de status de OS.  
**Status:** descoberta  
**Observação:** Evidência fraca; fundir com a oportunidade 6 numa futura versão genérica de 'status de OS'.  

### Oportunidade #13 — Retenção e reativação para academias

**Nome:** Retenção e reativação para academias  
**Segmento:** Academias e estúdios fitness  
**Problema:** Churn e alunos inativos; cancelamento precisa de canal formal no contrato.  
**Público:** Academias pequenas  
**Evidência:**
- [SocialHub – WhatsApp para academias](https://www.socialhub.pro/?p=26000) — Defende WhatsApp para matrícula, retenção e reativação; promocional.
- [TJSC – desistência pelo WhatsApp não exonera dívida](https://www.tjsc.jus.br/web/imprensa/noticias/-/asset_publisher/GP1QtxFaSsX0/content/id/19323648) — Caso de faculdade: cancelamento fora do canal contratual não valeu. Útil como alerta, não prova a dor das academias.
- *Força da evidência:* fraca

**Como resolvem hoje:** Recepção liga para quem sumiu.  
**Por que um robô seria útil:** Detecta ausência e reaborda; une com cobrança.  
**Solução / funcionalidades:** Detectar inativos; Mensagem de reativação; Oferta configurável  
**Complexidade:** Média (depende da catraca/ERP)  
**Potencial comercial:** Médio.  
**Pontuação:** 62.0 / 100  
**Concorrentes:** Tecnofit, EVO e ERPs de academia.  
**Diferencial:** Poderia ser módulo do robô de cobrança.  
**Status:** descoberta  

### Oportunidade #11 — Recuperação de carrinho abandonado por WhatsApp

**Nome:** Recuperação de carrinho abandonado por WhatsApp  
**Segmento:** E-commerce  
**Problema:** Grande parte dos carrinhos é abandonada; plataformas não enviam WhatsApp sozinhas.  
**Público:** Lojas virtuais  
**Evidência:**
- [Wassenger – recuperar carrinhos abandonados no Shopify com WhatsApp](https://wassenger.com/blog/pt/recuperar-carrinhos-abandonados-shopify-whatsapp) — Explica que a loja detecta o abandono mas precisa de ferramenta intermediária; fonte de fornecedor.
- [Wati – mensagens de carrinho abandonado](https://www.wati.io/pt-br/blog/mensagens-de-carrinho-abandonado/) — Modelos de mensagem; taxas de abertura são alegações de fornecedor.
- *Força da evidência:* fraca

**Como resolvem hoje:** E-mail automático ou nada.  
**Por que um robô seria útil:** Mensagem com opt-in em 1–24h após abandono.  
**Solução / funcionalidades:** Gatilho por webhook; Template de marketing; Cupom  
**Complexidade:** Média-alta; mensagens de marketing são pagas e exigem opt-in explícito.  
**Potencial comercial:** Médio.  
**Pontuação:** 61.6 / 100  
**Concorrentes:** Wati, SleekFlow, Wassenger, apps da própria plataforma.  
**Diferencial:** Poucos — mercado saturado.  
**Status:** descoberta  

### Oportunidade #12 — Triagem de clientes para escritórios de advocacia

**Nome:** Triagem de clientes para escritórios de advocacia  
**Segmento:** Advocacia (e contabilidade, a validar)  
**Problema:** Primeiro atendimento e coleta de documentos tomam tempo; publicidade e captação têm limites éticos da OAB.  
**Público:** Escritórios pequenos  
**Evidência:**
- [Projuris – autoatendimento via WhatsApp para escritórios](https://www.projuris.com.br/blog/autoatendimento-via-whatsapp/) — Descreve triagem e organização da comunicação; fonte de fornecedor.
- [Desmistificando – funil jurídico no WhatsApp e regras da OAB](https://desmistificando.com.br/funil-vendas-juridico-whatsapp-etica/) — Cita art. 39 do Código de Ética e Provimento 205/2021: atender quem procurou, sem oferta ativa.
- *Força da evidência:* média

**Como resolvem hoje:** Secretária faz triagem manual.  
**Por que um robô seria útil:** Triagem + checklist de documentos + agendamento de consulta.  
**Solução / funcionalidades:** Triagem por área; Coleta mínima de dados; Agenda de consulta; Resumo ao advogado  
**Complexidade:** Média; exige cuidado ético e de sigilo.  
**Potencial comercial:** Médio.  
**Pontuação:** 60.0 / 100  
**Concorrentes:** Projuris, Digisac jurídico.  
**Diferencial:** Coleta mínima e em fases (documentos só após checagem de conflito).  
**Status:** descoberta  

### Oportunidade #20 — Catálogo, reserva de peças e atendimento para boutiques

**Nome:** Catálogo, reserva de peças e atendimento para boutiques  
**Segmento:** Lojas de roupas e acessórios  
**Problema:** Perguntas de preço/tamanho/estoque e reserva de peça no WhatsApp.  
**Público:** Boutiques e lojas pequenas  
**Evidência:**
- [Cielo – como vender roupas pelo WhatsApp](https://blog.cielo.com.br/produtos-e-servicos/venda-roupas-pelo-whatsapp/) — Recomenda catálogo, etiquetas e scripts; o WhatsApp Business já oferece catálogo gratuito.
- [Yampi – catálogo no WhatsApp](https://www.yampi.com.br/blog/catalogo-whatsapp) — Mostra solução existente.
- *Força da evidência:* fraca

**Como resolvem hoje:** WhatsApp Business com catálogo e respostas rápidas (gratuito).  
**Por que um robô seria útil:** Controle de estoque e reserva — mas depende de dados de estoque que a loja raramente mantém atualizados.  
**Solução / funcionalidades:** Catálogo; Reserva; Pagamento por link  
**Complexidade:** Média-alta  
**Potencial comercial:** Baixo-médio.  
**Pontuação:** 58.4 / 100  
**Concorrentes:** WhatsApp Business (grátis), Yampi, Nuvemshop.  
**Diferencial:** Fraco frente à ferramenta gratuita nativa.  
**Status:** descoberta  

### Oportunidade #19 — Agenda de aulas e documentos para autoescolas

**Nome:** Agenda de aulas e documentos para autoescolas  
**Segmento:** Autoescolas / CFCs  
**Problema:** Aulas práticas não avisadas e processo de matrícula com muitas etapas.  
**Público:** Autoescolas  
**Evidência:**
- [Hora de Codar – automações n8n para autoescolas](https://horadecodar.com.br/exemplos-automacoes-n8n-autoescolas/) — Exemplos de automação de agenda e lembretes.
- [Reclame Aqui – aulas não avisadas e cobradas](https://www.reclameaqui.com.br/auto-e-moto-escola-sao-bernardo/aulas-nao-avisadas-e-cobradas_G4g9zen6bajwGulm/) — Reclamação individual sobre aulas não avisadas; indício, não estatística.
- *Força da evidência:* fraca

**Como resolvem hoje:** Instrutor combina por WhatsApp.  
**Por que um robô seria útil:** Agenda e lembretes (variação do robot-001).  
**Solução / funcionalidades:** Agenda de aulas; Lembretes; Checklist de documentos (exige consulta ao Detran local)  
**Complexidade:** Média  
**Potencial comercial:** Baixo-médio.  
**Pontuação:** 57.6 / 100  
**Concorrentes:** Sistemas de CFC.  
**Diferencial:** Reuso do motor de agenda.  
**Status:** descoberta  

### Oportunidade #18 — Inscrição e confirmação de presença em eventos

**Nome:** Inscrição e confirmação de presença em eventos  
**Segmento:** Igrejas, eventos pequenos, escolas  
**Problema:** Inscrição e RSVP feitos em grupos e planilhas.  
**Público:** Organizadores de eventos pequenos  
**Evidência:**
- [ABC da Comunicação – iCasei lança confirmação de presença ativa por WhatsApp](https://www.abcdacomunicacao.com.br/icasei-lanca-a-primeira-confirmacao-de-presenca-ativa-por-whatsapp-do-mercado/) — Existe produto no mercado para casamentos.
- [Tecnoblog – WhatsApp estreia função de eventos em grupos](https://tecnoblog.net/noticias/whatsapp-estreia-funcao-de-eventos/) — O próprio WhatsApp oferece eventos em comunidades — concorrência gratuita.
- *Força da evidência:* fraca

**Como resolvem hoje:** Grupos, formulários, apps de igreja.  
**Por que um robô seria útil:** Coleta de RSVP e lista de presença.  
**Solução / funcionalidades:** RSVP; Lista; Lembrete  
**Complexidade:** Baixa  
**Potencial comercial:** Baixo (pouca disposição a pagar mensalidade).  
**Pontuação:** 56.2 / 100  
**Concorrentes:** Eventos do WhatsApp, apps de igreja, iCasei.  
**Diferencial:** Fraco.  
**Status:** descoberta  

### Oportunidade #9 — Reservas diretas para pousadas

**Nome:** Reservas diretas para pousadas  
**Segmento:** Pousadas e hotéis pequenos  
**Problema:** Comissões de OTAs (citadas entre 15% e 20% em material de marketing) e perguntas repetidas de disponibilidade.  
**Público:** Pousadas independentes  
**Evidência:**
- [Asksuite – guia de WhatsApp para hotelaria](https://novo.asksuite.com/br/blog/guia-whatsapp-para-negocios-na-hotelaria) — Afirma que em alguns hotéis o WhatsApp responde por até 50% das interações; fonte de fornecedor.
- [PANROTAS – Booking lança opção de reservas diretas livres de comissão (2019)](https://www.panrotas.com.br/hotelaria/tecnologia/2019/03/booking-lanca-opcao-para-reservas-diretas-livres-de-comissao_163217.html) — Notícia antiga; condições atuais devem ser verificadas.
- *Força da evidência:* média

**Como resolvem hoje:** Dono responde manualmente; channel manager para OTAs.  
**Por que um robô seria útil:** Cotação rápida e coleta de dados para reserva direta.  
**Solução / funcionalidades:** Consulta de datas; Cotação por tabela; Pré-reserva; Handoff ao dono  
**Complexidade:** Média-alta (disponibilidade precisa de calendário confiável)  
**Potencial comercial:** Médio; nicho menor.  
**Pontuação:** 56.0 / 100  
**Concorrentes:** Asksuite, Hits, Omnibees.  
**Diferencial:** Foco em pousadas muito pequenas sem channel manager.  
**Status:** descoberta  

### Oportunidade #15 — Atendimento ao morador para condomínios

**Nome:** Atendimento ao morador para condomínios  
**Segmento:** Condomínios e administradoras  
**Problema:** Grupos de WhatsApp viram fluxo incontrolável; falta registro formal e há exposição de dados.  
**Público:** Síndicos e administradoras  
**Evidência:**
- [GroupSoftware – WhatsApp em condomínios](https://www.groupsoftware.com.br/blog/whatsapp-em-condominios) — Aponta riscos: falta de controle, exposição de dados pessoais, ausência de registro formal.
- [SíndicoNet – grupo de WhatsApp de condomínio: boas práticas](https://www.sindiconet.com.br/Informese/22624/Conteudo-para-Administradoras/Grupo-de-Whatsapp-de-condominio-boas-praticas-que-devem-ser-consideradas) — Recomenda regras claras; as fontes defendem canais formais para atos oficiais.
- *Força da evidência:* média

**Como resolvem hoje:** Grupos de WhatsApp e apps de condomínio.  
**Por que um robô seria útil:** Roteia demandas (zelador × administradora) e registra ocorrências.  
**Solução / funcionalidades:** Roteamento; Registro de ocorrência; Reserva de área  
**Complexidade:** Média; as fontes indicam que o mercado prefere apps formais.  
**Potencial comercial:** Baixo-médio.  
**Pontuação:** 54.6 / 100  
**Concorrentes:** Apps de condomínio consolidados.  
**Diferencial:** Fraco.  
**Status:** descoberta  
