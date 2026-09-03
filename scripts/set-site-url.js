#!/usr/bin/env node
/**
 * Aplica o dominio final de producao a todo o projeto, substituindo o
 * placeholder __SITE_URL__ usado em canonical, Open Graph, sitemap.xml
 * e dados estruturados (JSON-LD), e troca o robots.txt para a versao
 * de producao (permite rastreamento + referencia o sitemap).
 *
 * Uso:
 *   node scripts/set-site-url.js https://dominiofinal.com.br
 *
 * Ou defina a variavel de ambiente SITE_URL e rode sem argumento:
 *   SITE_URL=https://dominiofinal.com.br node scripts/set-site-url.js
 *
 * Rode isso UMA VEZ, localmente, antes do primeiro deploy em producao,
 * e commite o resultado. Nao ha build step em runtime — o site continua
 * sendo servido como arquivos estaticos comuns.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const PLACEHOLDER = '__SITE_URL__';

const rawUrl = process.argv[2] || process.env.SITE_URL;
if (!rawUrl) {
  console.error('Uso: node scripts/set-site-url.js https://dominiofinal.com.br');
  console.error('(ou defina a variavel de ambiente SITE_URL)');
  process.exit(1);
}

let siteUrl;
try {
  const u = new URL(rawUrl);
  if (u.protocol !== 'https:') {
    console.error('SITE_URL deve usar https:// em producao. Recebido: ' + rawUrl);
    process.exit(1);
  }
  siteUrl = rawUrl.replace(/\/+$/, ''); // remove barra final
} catch {
  console.error('URL invalida: ' + rawUrl);
  process.exit(1);
}

const targetExtensions = new Set(['.html', '.xml']);
const skipDirs = new Set(['.git', 'node_modules', 'scripts', 'uploads']);

let filesChanged = 0;
let replacements = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
      continue;
    }
    const ext = path.extname(entry.name);
    if (!targetExtensions.has(ext)) continue;
    const filePath = path.join(dir, entry.name);
    const original = fs.readFileSync(filePath, 'utf8');
    if (!original.includes(PLACEHOLDER)) continue;
    const count = original.split(PLACEHOLDER).length - 1;
    const updated = original.split(PLACEHOLDER).join(siteUrl);
    fs.writeFileSync(filePath, updated, 'utf8');
    filesChanged++;
    replacements += count;
    console.log(`  ${path.relative(root, filePath)} (${count} ocorrência(s))`);
  }
}

console.log(`Aplicando SITE_URL = ${siteUrl}\n`);
walk(root);

// Troca robots.txt pela versao de producao
const prodTemplatePath = path.join(root, 'robots.production.txt.template');
const robotsPath = path.join(root, 'robots.txt');
if (fs.existsSync(prodTemplatePath)) {
  const prodRobots = fs.readFileSync(prodTemplatePath, 'utf8').split(PLACEHOLDER).join(siteUrl);
  fs.writeFileSync(robotsPath, prodRobots, 'utf8');
  console.log('\nrobots.txt atualizado para a versão de produção (rastreamento liberado).');
} else {
  console.warn('\nAviso: robots.production.txt.template não encontrado — robots.txt não foi alterado.');
}

console.log(`\n${filesChanged} arquivo(s) atualizado(s), ${replacements} substituição(ões) no total.`);
console.log('\nPróximo passo: revise as mudanças (git diff) e faça o commit antes do deploy.');
