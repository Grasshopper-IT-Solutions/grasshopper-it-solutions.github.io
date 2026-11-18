#!/usr/bin/env node
/**
 * Link and asset checker for the generated pages (run after build:i18n).
 *
 * For every generated page (English at the root, Spanish under es/):
 *   - every relative href/src (and the PDF font loader path) must resolve to
 *     a file in the repo;
 *   - links from a Spanish page to another site page must stay in es/;
 *   - canonical / hreflang / og:url URLs on our own domain must map to a
 *     generated file.
 * External links are not fetched. Links into submodule folders
 * (landing-pages/, projects/, ...) are reported as warnings only, because
 * submodules may not be checked out locally.
 *
 * Usage: npm run check:links
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://grasshoppersolutions.online/';
const PAGES = ['index.html', 'pages/services.html', 'pages/projects.html', 'pages/project-cost-calculator.html', 'pages/project-brief.html'];
const FILES = [...PAGES, ...PAGES.map((p) => 'es/' + p)];
const LOCALIZED = new Set(PAGES);
const SUBMODULE_DIRS = ['landing-pages/', 'projects/', 'proxies/', 'apps/'];

const errors = [];
const warnings = [];
let checked = 0;

// Repo-relative path a URL points at, or null for external / non-file URLs.
function target(fromFile, url) {
  if (/^(#|mailto:|tel:|data:|javascript:)/i.test(url)) return null;
  if (url.startsWith(SITE)) url = '/' + url.slice(SITE.length);
  else if (/^(https?:)?\/\//i.test(url)) return null;
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return null;
  let rel = clean.startsWith('/')
    ? clean.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), clean));
  if (rel === '.' || rel === '') rel = 'index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  return rel;
}

function exists(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return false;
  return fs.statSync(abs).isFile() || fs.existsSync(path.join(abs, 'index.html'));
}

for (const file of FILES) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) {
    errors.push(`${file}: missing (run npm run build:i18n)`);
    continue;
  }
  const html = fs.readFileSync(abs, 'utf8');
  if (/\{\{[^}]*\}\}/.test(html)) errors.push(`${file}: unrendered {{...}} placeholder`);

  const urls = [];
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) urls.push(m[1]);
  for (const m of html.matchAll(/<meta property="og:url" content="([^"]+)"/g)) urls.push(m[1]);
  for (const m of html.matchAll(/tag\.src = '([^']+)'/g)) urls.push(m[1]); // lazy PDF font loader
  for (const m of html.matchAll(/location\.href = '([^']+)'/g)) urls.push(m[1]); // logo onclick
  for (const m of html.matchAll(/location\.replace\("([^"]+)"/g)) urls.push(m[1]); // language redirect

  for (const url of urls) {
    const rel = target(file, url);
    if (!rel) continue;
    checked++;
    const where = `${file}: ${url}`;
    if (rel.startsWith('..')) {
      errors.push(`${where} -> points outside the site root`);
      continue;
    }
    const absolute = url.startsWith(SITE);
    if (!exists(rel)) {
      // Absolute links to other paths on our domain are usually separate
      // GitHub Pages project sites (e.g. /diploma-generator/), not files here.
      if (absolute && !LOCALIZED.has(rel.replace(/^es\//, ''))) warnings.push(`${where} (absolute URL served outside this repo, not checked)`);
      else if (SUBMODULE_DIRS.some((d) => rel.startsWith(d))) warnings.push(`${where} -> ${rel} (submodule/app folder not present locally)`);
      else errors.push(`${where} -> ${rel} does not exist`);
      continue;
    }
    // A Spanish page must link to the Spanish version of other site pages,
    // except the deliberate EN switch and the hreflang alternates.
    const isLangLink = /hreflang=|data-lang-switch/.test(
      html.slice(Math.max(0, html.indexOf(url) - 200), html.indexOf(url) + url.length + 120)
    );
    if (file.startsWith('es/') && LOCALIZED.has(rel) && !isLangLink) {
      errors.push(`${where} -> links to the English page ${rel}`);
    }
  }
}

if (warnings.length) console.warn('warnings:\n  ' + [...new Set(warnings)].join('\n  '));
if (errors.length) {
  console.error('check:links failed:\n  ' + [...new Set(errors)].join('\n  '));
  process.exit(1);
}
console.log(`check:links: ${FILES.length} pages, ${checked} local links/assets OK.`);
