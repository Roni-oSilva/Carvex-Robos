# Manual do cliente — AgendaZap
*Para o dono e a equipe da empresa que usa o robô.*

## O que o robô faz por você
- O cliente escreve “oi” ou “quero marcar” no WhatsApp da empresa.
- O robô mostra os serviços, os profissionais e só os **dias e horários realmente livres** (respeitando expediente, folgas, duração do serviço e antecedência mínima).
- O cliente confirma e o horário é reservado na hora — duas pessoas nunca ficam com o mesmo horário.
- Antes do horário (por padrão 24 h e 2 h), o robô manda um lembrete pedindo confirmação: **Confirmo / Remarcar / Cancelar**.
- Se alguém cancela, quem estava na **lista de espera** daquele dia é avisado e o primeiro que responder QUERO fica com a vaga.
- Dúvidas (endereço, preços, formas de pagamento) são respondidas a partir do cadastro da empresa. O que o robô não souber, ele **não inventa**: chama uma pessoa.
- A equipe vê a agenda do dia, marca quem compareceu ou faltou e acompanha os números no painel.

## Sua rotina no painel
1. Abra **Agenda** e confira os horários de hoje.
2. Quando o cliente terminar, toque em **Compareceu** — ou **Faltou**. Isso alimenta os números do painel.
3. Olhe **Conversas**: se houver alguém *aguardando atendente*, responda.
4. Se alguém ligar ou aparecer pessoalmente para marcar, use **+ Novo agendamento** para o robô não oferecer o mesmo horário.
5. Semanalmente, veja o **Início** (faltas, valor atendido, vagas reocupadas pela lista de espera).

Endereço do painel: **`https://SEU-ENDERECO/admin`** — entre com a chave de acesso que a implantação te entregou (guarde em local seguro e não compartilhe com quem não trabalha na empresa).

## Páginas do painel
| Página | Para que serve |
|---|---|
| Início | Resumo dos números |
| Agenda | Agenda do dia; marcar compareceu/faltou/cancelar; criar agendamento manual (`/agenda/novo`) |
| Espera | Lista de espera por dia e serviço |
| Conversas | Ver o que foi conversado, assumir o atendimento e responder |
| Clientes | Lista de clientes; excluir dados de quem pedir (LGPD) |
| Configurações | Mudar textos, horários e preços |

## Regras de ouro
- Marque *Compareceu/Faltou* todo dia: sem isso o painel não consegue mostrar a taxa de comparecimento.
- Folga ou feriado? Cadastre em `folgas` (Configurações) **antes**, ou o robô oferecerá o dia.
- No agendamento manual, só marque “o cliente autorizou lembretes” se ele realmente autorizou.
- **Conversa "aguardando atendente"?** Responda o quanto antes — o cliente já pediu uma pessoa.
- **Regra do WhatsApp:** você só pode escrever livremente até **24 horas depois da última mensagem do cliente**. Depois disso, só mensagens de modelo aprovado (o robô cuida disso quando configurado).
- **Cliente escreveu PARAR?** O robô não envia mais avisos automáticos a essa pessoa. Respeite: não tente contornar.
- **Nunca** envie a chave do painel por WhatsApp ou e-mail.

## Precisa de ajuda?
Fale com o responsável pela sua implantação: **{{NOME_DO_SUPORTE}} — {{CONTATO_DO_SUPORTE}}** (preencha antes de entregar ao cliente).
