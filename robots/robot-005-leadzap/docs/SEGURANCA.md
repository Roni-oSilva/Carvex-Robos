# Segurança — LeadZap

## O que o sistema faz (e é verificado por testes automáticos)

| Controle | Como |
|---|---|
| Segredos fora do código | Tokens, senhas e chaves só em variáveis de ambiente (`.env` fora do Git). O repositório só tem `.env.example`. |
| Webhook autêntico | Assinatura `X-Hub-Signature-256` (HMAC-SHA256 sobre o corpo cru) validada em tempo constante. Sem assinatura válida → 401. |
| Verificação do webhook | Token comparado em tempo constante. |
| Idempotência | Reenvios da Meta (mesmo id de mensagem) são processados uma vez só. |
| Painel protegido | Chave forte (hash no banco), cookie assinado HttpOnly/SameSite=Strict/Secure, expira em 8 h, limite de tentativas contra força bruta. |
| CSRF | Verificação de origem nos POSTs, além de SameSite. |
| XSS | Todo texto vindo do cliente é escapado no painel (template que escapa por padrão); testado com nomes e descrições maliciosos. |
| Isolamento entre empresas | Todas as tabelas têm `tenant_id`; ações cruzadas retornam 404 (testado). |
| Entrada validada | Configuração validada por esquema antes de salvar; valores monetários em centavos inteiros; tamanhos máximos. |
| Logs seguros | Segredos viram `[oculto]`; telefones são mascarados (`5511*****4321`). |
| Limites | 600 req/min por IP no webhook; 30 mensagens/min por contato; corpo máximo 1 MB. |
| IA contida | Só responde com base no cadastro; números inventados são rejeitados; texto do cliente não vira instrução. |
| Regras da plataforma | Janela de 24 h respeitada; opt-out sempre honrado; nenhum método não oficial. |

## O que você (operador) precisa fazer
- [ ] Gerar `ADMIN_TOKEN` e `SESSION_SECRET` fortes e diferentes entre si.
- [ ] Servir o painel e o webhook **somente por HTTPS**.
- [ ] Definir `NODE_ENV=production`, `COOKIE_SECURE=true` e, atrás de proxy, `TRUST_PROXY=true`.
- [ ] **Não** usar `DRY_RUN`/`INSECURE_SKIP_SIGNATURE` em produção.
- [ ] Restringir o acesso ao servidor e ao arquivo do banco (permissões do sistema); fazer backup.
- [ ] Rodar o servidor como usuário sem privilégios (o Dockerfile já faz).
- [ ] Trocar o token do WhatsApp se houver suspeita de vazamento (Meta: Usuários do sistema).
- [ ] Manter o Node.js atualizado.

## Limitações honestas
- O banco (SQLite) **não é criptografado em repouso**. Use disco criptografado no servidor.
- A chave do painel é de fator único (sem 2FA). Compartilhe-a com poucas pessoas e troque ao desligar alguém.
- O limite de tentativas e a fila são em memória (reiniciam com o processo).
- Mídias (fotos/áudios) **não são baixadas nem armazenadas** pelo robô; só o identificador é registrado.
- Não houve teste de invasão (pentest) independente. Recomenda-se um antes de operar com muitos clientes.

## Reportar problemas
Se encontrar uma falha de segurança, não publique detalhes; avise o responsável pela fábrica por canal privado.
