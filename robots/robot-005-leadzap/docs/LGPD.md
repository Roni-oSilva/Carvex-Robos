# LGPD e privacidade — LeadZap

> Este documento descreve **o que o software faz com dados**. Ele não é parecer jurídico: valide as bases legais, os textos de aviso e os contratos com um advogado.

## Papéis
- A **empresa que usa o robô** é a **controladora** dos dados de seus clientes.
- Quem implanta/hospeda o robô para ela costuma ser **operador** (formalize em contrato).

## Dados tratados

| Dado | Para quê | Base legal sugerida |
|---|---|---|
| Número de WhatsApp | Identificar a conversa e responder | Execução de contrato / procedimentos preliminares; legítimo interesse |
| Nome (do perfil do WhatsApp ou informado) | Personalizar o atendimento | Idem |
| Conteúdo das mensagens | Atender e dar contexto ao atendente | Idem |
| Data/hora da última mensagem do cliente | Respeitar a janela de 24 h do WhatsApp | Obrigação técnica da plataforma |
| Preferência de não receber avisos (PARAR) | Honrar a escolha do titular | Obrigação legal / consentimento revogado |
| Nome e telefone | Atender o interessado e permitir contato do corretor | Execução de contrato (procedimentos preliminares) |
| Preferências do imóvel (finalidade, tipo, bairro, faixa de valor, quartos, prazo) | Mostrar imóveis compatíveis e priorizar o atendimento | Execução de contrato (procedimentos preliminares) |
| Visitas agendadas e resposta aos lembretes | Organizar e confirmar visitas | Execução de contrato (procedimentos preliminares) |
| Situação do lead e motivo de perda (registrado pela equipe) | Gestão comercial | Legítimo interesse |

**Não coletamos:** documentos (CPF/RG), dados bancários, dados de saúde, localização, nem baixamos fotos/áudios. Se o cliente escrever dados sensíveis espontaneamente, eles ficam apenas no histórico da conversa e são apagados pela retenção ou pela exclusão do titular.

## Onde ficam
Em um arquivo SQLite no **servidor da própria empresa** (`DATABASE_PATH`). Não há banco em nuvem do fabricante do robô.

## Com quem os dados são compartilhados (integrações)
| Destinatário | O que recebe | Quando |
|---|---|---|
| Meta / WhatsApp | Mensagens enviadas e recebidas (é o canal) | Sempre |
| Provedor de hospedagem | Armazena o servidor e o banco | Sempre (escolha um com contrato de proteção de dados) |
| Provedor de IA (Anthropic) | Pergunta do cliente + texto do cadastro da empresa; **sem nome nem telefone** | Somente se `AI_API_KEY` estiver configurada e a pergunta não estiver no cadastro |

## Retenção
Mensagens são apagadas automaticamente após `RETENTION_DAYS` dias (padrão 180). Registros do robô (leads, visits) seguem a necessidade do negócio e a exclusão abaixo.

## Direitos do titular
- **Parar de receber avisos:** o cliente responde **PARAR** a qualquer momento; vale imediatamente. **REATIVAR** desfaz.
- **Exclusão:** painel > **Clientes** > **Excluir dados** apaga o cliente e tudo ligado a ele (conversas, mensagens, registros do robô). O sistema recusa a exclusão quando há pendências abertas, para não perder obrigações do negócio — resolva-as antes. Obrigações fiscais/contábeis devem ficar no sistema financeiro da empresa, não no robô.
- **Acesso/correção:** o painel mostra o histórico do cliente; correções são feitas pela equipe.

## Boas práticas recomendadas à empresa
1. Informar na primeira conversa/no site que o atendimento usa um assistente automatizado e como falar com uma pessoa (o robô já oferece **ATENDENTE**).
2. Manter a política de privacidade atualizada e indicar o encarregado (DPO) ou canal de contato.
3. Treinar a equipe: não pedir nem registrar dados desnecessários nas conversas.
4. Em caso de incidente, seguir o plano da empresa e comunicar a ANPD e os titulares quando exigido.
