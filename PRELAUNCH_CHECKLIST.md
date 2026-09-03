# Checklist de pré-lançamento — Tritiva

Auditoria realizada em 2026-09-03, com o projeto ainda local (sem domínio de produção definido). Testes de Lighthouse rodados localmente contra `http://localhost:8791` via `npx playwright` + `lighthouse` CLI (Chromium headless), mobile e desktop, com throttling simulado.

## Contexto técnico do projeto (para calibrar o que se aplica)

Este é um site estático puro: HTML + CSS + JS vanilla, sem framework, sem bundler, sem build step, sem backend/API, sem dependências de npm em produção. Por isso, itens do pedido original como "bundles", "tree shaking", "code splitting", "dynamic import", "dependências utilizadas desnecessariamente" **não se aplicam** — não há bundle: cada página carrega um único `css/style.css` e um único `js/script.js` (4.3KB), direto, sem processamento. Isso já elimina de saída boa parte dos riscos de performance que uma auditoria desse tipo normalmente encontra em projetos com framework.

## Resultados do Lighthouse (local, simulado)

| Página | Mobile Perf | Desktop Perf | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|---|
| index.html | 89 | 99 | 100 | 100 | 61* |
| produtos/amido-de-trigo.html | 89 | — | 100 | 100 | 61* |

\* **O SEO=61 é esperado e correto no estado atual.** As duas únicas reprovações são "Page is blocked from indexing" e "Document does not have a valid canonical" — ambas existem *de propósito*, porque o `robots.txt` bloqueia todo rastreamento (correto, o site não foi lançado) e o canonical usa o placeholder `__SITE_URL__` (correto, o domínio ainda não existe). Rodar `node scripts/set-site-url.js https://dominiofinal.com.br` antes do deploy resolve as duas automaticamente — teste feito contra uma cópia descartável do projeto, confirmado.

Métricas de laboratório da home (mobile simulado): FCP 2.7s, LCP 3.2s, TBT 0ms, CLS 0.024, Speed Index 2.9s. Nenhum "long task" relevante — o `TBT=0ms` reflete o fato de o JS ser mínimo e não bloquear a thread principal. CLS 0.024 está bem dentro da faixa "boa" (<0.1).

## O que foi corrigido nesta sessão

- **SEO técnico**: canonical, Open Graph, Twitter Card e `meta robots` em todas as 12 páginas públicas; JSON-LD (Organization na home, BreadcrumbList nas demais, Product nas 3 páginas de produto).
- **`robots.txt`** bloqueando tudo por padrão (seguro para pré-lançamento) + `robots.production.txt.template` pronto para produção.
- **`sitemap.xml`** com as 12 páginas públicas.
- **`scripts/set-site-url.js`**: um comando único substitui o domínio em todo o projeto (evita espalhar URL manualmente).
- **Acessibilidade**: landmark `<main>` real + skip-link em todas as páginas; contraste do dourado corrigido (2.4:1 → 5.4:1) em textos sobre fundo claro; ordem de headings corrigida no rodapé (H4→H2, estava pulando nível).
- **Performance**: `defer` nos scripts, remoção do peso de fonte não usado (Inter 500), `width`/`height` nativos em imagens, `preload` com `fetchpriority=high` da imagem de hero de cada página, CSS morto removido.
- **Páginas legais**: Política de Privacidade e Termos de Uso criadas e linkadas no rodapé de todas as páginas.
- **Páginas de teste/debug**: nenhuma encontrada (`/teste`, `/debug`, `/rascunho` etc. não existem no projeto).
- **Duas páginas duplicadas/vazias**: nenhuma encontrada.

---

## ✅ PRONTO PARA PRODUÇÃO

- HTML válido, sem erros de console, sem requisições quebradas em nenhuma das 13 páginas testadas (10 originais + 404 + 2 legais).
- Título e meta description únicos e com tamanho adequado em todas as páginas.
- Exatamente um `<h1>` por página; ordem de headings agora sequencial (corrigido o pulo H2→H4 do rodapé).
- Todas as imagens com `alt` descritivo.
- Canonical, Open Graph, Twitter Card e dados estruturados (JSON-LD) implementados em todas as páginas, prontos para receber o domínio final com um único comando.
- `sitemap.xml` e `robots.txt` existem e estão estruturados corretamente (robots.txt está propositalmente bloqueando tudo até o lançamento).
- Menu mobile: bug real encontrado e corrigido (banner de cookies sobrepunha e bloqueava cliques nos últimos itens do menu em telas pequenas — corrigido via z-index do cabeçalho).
- Rodapé: acessível (contraste OK), com Política de Privacidade e Termos de Uso linkados.
- Responsividade testada em 375/390/414/768/900/1280/1366/1440/1536/1920px — sem overflow horizontal, sem sobreposição, sem elementos cortados.
- CLS praticamente zero (todas as imagens principais usam `aspect-ratio` ou dimensões fixas via CSS).
- `defer` em todos os scripts; nenhum script bloqueia a renderização.
- Fontes: `preconnect` já configurado, `font-display: swap` já em uso, peso não utilizado removido.
- Nenhuma página de teste, debug ou rascunho encontrada no projeto.
- `.vercelignore` mantém o PDF/texto de referência interno (`uploads/`) fora do site publicado, sem removê-lo do histórico do git.
- Cache de longo prazo (`Cache-Control: immutable`) configurado via `vercel.json` para `/assets`, `/css`, `/js` — seguro porque o CSS já usa cache-busting via `?v=`.
- Headers básicos de segurança (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) configurados via `vercel.json`.

## ⚠️ VERIFICAR ANTES DO DEPLOY

Estes itens dependem de decisões/infraestrutura que só existem no momento do lançamento — não são bugs, são passos pendentes por natureza:

1. **Definir o domínio final** e rodar:
   ```
   node scripts/set-site-url.js https://dominiofinal.com.br
   ```
   Isso substitui `__SITE_URL__` em todo HTML + sitemap.xml, e troca o `robots.txt` para a versão de produção. Revisar o `git diff` resultante e commitar antes do deploy.
2. **Favicon real**: hoje o `<link rel="icon">` aponta para o `.webp` do logo. Não há `favicon.ico`, `apple-touch-icon` (180×180 PNG) nem `manifest.json`. Funciona na maioria dos navegadores modernos, mas para cobertura completa (Safari mais antigo, atalhos de tela inicial no iOS/Android) recomendo gerar esses arquivos — não consegui gerar imagens neste ambiente (sem Pillow/ImageMagick/cwebp instalados).
3. **Confirmar dados institucionais**: `politica-de-privacidade.html` tem um placeholder `[Razão social e CNPJ a confirmar]` — preencher com os dados reais da empresa antes de publicar. Revisar o conteúdo jurídico com time jurídico/contábil se possível (o texto é um modelo padrão sólido, mas não substitui revisão legal formal).
4. **LinkedIn "a confirmar"**: aparece no rodapé de todas as páginas — decidir se entra a URL real ou se o item é removido antes do lançamento.
5. **Google Analytics / GTM / Search Console / Bing Webmaster**: nenhum instalado (correto — não inventei IDs). `.env.example` já documenta onde colocar os IDs quando existirem. Nenhum código de tracking está no projeto ainda.
6. **Confirmar que o build/deploy do Vercel não muda**: este projeto não tem `package.json` nem build step — o Vercel serve os arquivos estáticos diretamente. Isso continua funcionando sem nenhuma configuração adicional. Não adicionei build step para não arriscar quebrar esse fluxo sem acesso ao painel do Vercel.
7. **HTTPS**: presumo que o Vercel already fornece certificado automático no domínio custom — confirmar isso no painel ao apontar o domínio.
8. **Imagem de produto real** nas páginas de amido/glúten/farinhas: o placeholder `.img-placeholder` ainda mostra o texto "Imagem real do produto — pendente" sobreposto à foto de banco de imagens atual — decidir se essa é a imagem final ou se será substituída.

## 🚨 IMPEDITIVOS

Nenhum problema foi encontrado que eu considere motivo para **não** lançar o site após os itens de "⚠️" acima serem resolvidos. O único bloqueio real e automático hoje é o `robots.txt` em modo "bloqueia tudo" — que é *intencional* e se resolve com o passo 1 da seção anterior.

## 📈 APÓS A PUBLICAÇÃO

- [ ] Testar HTTPS em todas as páginas (sem conteúdo misto / mixed content).
- [ ] Verificar que `www` → `apex` (ou vice-versa, conforme decidido) redireciona corretamente, sem loop.
- [ ] Confirmar que o `<link rel="canonical">` de cada página resolve para uma URL real e retorna 200 (abrir view-source em 3–4 páginas).
- [ ] Confirmar que `/robots.txt` está servindo a versão de produção (`Allow: /` + linha `Sitemap:`), não a versão de bloqueio.
- [ ] Validar `/sitemap.xml` em https://www.xml-sitemaps.com/validate-xml-sitemap.html ou equivalente.
- [ ] Cadastrar o sitemap no Google Search Console (Configurações → Sitemaps).
- [ ] Cadastrar a propriedade no Bing Webmaster Tools (pode importar direto do Search Console).
- [ ] Solicitar indexação manual da home e das páginas de produto no Search Console ("Inspecionar URL" → "Solicitar indexação").
- [ ] Rodar o PageSpeed Insights real (https://pagespeed.web.dev) em produção para as páginas principais (home, produtos/index, um produto, contato) — comparar com os números simulados locais.
- [ ] Testar Rich Results (https://search.google.com/test/rich-results) para a home (Organization) e para uma página de produto (Product + Breadcrumb).
- [ ] Acompanhar Core Web Vitals de usuários reais no Search Console (relatório "Experiência" fica populado depois de ~28 dias de tráfego).
- [ ] Verificar erros 404 no Search Console / logs do servidor nas primeiras semanas.
- [ ] Confirmar que o Analytics (quando instalado) está disparando pageview em todas as páginas, inclusive nas duas novas (política/termos).
- [ ] Acompanhar cobertura de indexação no Search Console (todas as 12 URLs do sitemap devem aparecer como "Válidas" em 1–2 semanas).
- [ ] Reconferir o formulário de contato em produção (ele monta um `mailto:` no navegador do usuário — confirmar que abre corretamente em diferentes clientes de e-mail/dispositivos).
- [ ] Testar o banner de cookies e o menu mobile num celular real (não só emulado), já que o bug corrigido nesta auditoria só aparecia em combinações específicas de altura de tela.
