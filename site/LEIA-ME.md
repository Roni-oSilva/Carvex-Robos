# Página de vendas — Carvex Tecnologia

Arquivo único (`index.html`) + logos em `assets/`. Sem build, sem dependências, sem serviços de terceiros.

## O que editar
| O quê | Onde |
|---|---|
| WhatsApp que recebe os pedidos | `CONFIG.whatsapp` no `index.html` (hoje `5591981902529` = 55 + 91 + 98190-2529) |
| Preços | `CONFIG.robos[]` (um teste confere com os preços sugeridos de cada robô) |
| Logo | `assets/carvex-logo-azul.png` (cabeçalho/rodapé), `carvex-logo-branco.png`, `carvex-simbolo-azul.png` (ícone da aba) e `carvex-simbolo-branco.png` (celulares). Foram recortadas da logo oficial; se tiver o SVG/PNG original sem fundo, substitua mantendo os nomes |
| Textos das conversas de demonstração | `ROTEIROS` no `index.html` |

## Ver no seu computador
```bash
npm run site        # http://localhost:4000
```

## Publicar na Vercel (a partir do GitHub)
1. Em vercel.com: **Add New > Project** e importe este repositório do GitHub.
2. Deixe **Framework Preset = Other**, **Root Directory** em branco e **Build Command** vazio. O arquivo `vercel.json` da raiz já manda servir a pasta `site/`.
   - Se preferir apontar o *Root Directory* para `site`, também funciona: há um `site/vercel.json` com os mesmos cabeçalhos de segurança.
3. Clique em **Deploy**. A Vercel gera um endereço `*.vercel.app`.
4. **Branch de produção:** a Vercel publica em produção a branch principal do repositório (normalmente `main`). Branches de trabalho geram *previews*. Para publicar em produção, faça o *merge* na `main` (ou mude a *Production Branch* em Settings > Git).
5. **Domínio próprio:** Settings > Domains > adicione seu domínio e siga os registros DNS que a Vercel mostrar.
6. Depois de publicar, **teste o botão "Comprar um robô"** no endereço real: ele deve abrir o WhatsApp com a mensagem pronta.

## Segurança já configurada (`vercel.json`)
Cabeçalhos `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e `Content-Security-Policy` (só recursos do próprio site; a página não carrega nada de terceiros).
