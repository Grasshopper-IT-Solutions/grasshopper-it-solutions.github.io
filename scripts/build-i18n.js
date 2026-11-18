#!/usr/bin/env node
/**
 * Bilingual static build for grasshoppersolutions.online.
 *
 *   src/<page>.html  +  i18n/<lang>/<namespace>.json   ->   generated pages
 *
 * English is written to the repo root at the CURRENT URLs (index.html,
 * pages/*.html). Spanish (es-419) is written to es/ with the same structure
 * (es/index.html, es/pages/*.html). The generated files are committed -
 * GitHub Pages serves them as plain static files. Never edit them by hand;
 * edit the template or the string file and run `npm run build:i18n`.
 *
 * Template syntax (deliberately tiny):
 *   {{ns.key}}       string `key` from i18n/<lang>/<ns>.json, inserted as-is
 *                    (values are HTML: write &amp; for &, and no " inside
 *                    strings that end up in an attribute)
 *   {{json:ns}}      the whole i18n/<lang>/<ns>.json as a JS object literal,
 *                    for page scripts (calculator, brief, shared script.js)
 *   {{$var}}         a build variable - see pageVars() below
 *   {{> name}}       include src/partials/name.html
 *   {{#en}}..{{/en}} keep the block only in the English build (same for es)
 *
 * The build fails on any missing string, and warns about strings that exist
 * in one language but not the other, or that no template uses.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const I18N = path.join(ROOT, 'i18n');
const SITE_URL = 'https://grasshoppersolutions.online/';

const LANGS = {
  en: { htmlLang: 'en', locale: 'en-US', ogLocale: 'en_US', outDir: '' },
  es: { htmlLang: 'es-419', locale: 'es-419', ogLocale: 'es_LA', outDir: 'es/' },
};

// Every page of the site's own (templates live at the same path under src/).
// `sitemap: false` keeps noindex pages out of sitemap.xml.
const PAGES = [
  { path: 'index.html', priority: '1.0' },
  { path: 'pages/services.html', priority: '0.8' },
  { path: 'pages/projects.html', priority: '0.8' },
  { path: 'pages/project-cost-calculator.html', priority: '0.9' },
  { path: 'pages/project-brief.html', sitemap: false },
];

// ---------------------------------------------------------------------------
// Strings

function loadStrings(lang) {
  const dir = path.join(I18N, lang);
  const out = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const ns = file.slice(0, -5);
    try {
      out[ns] = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch (err) {
      throw new Error(`i18n/${lang}/${file}: ${err.message}`);
    }
  }
  return out;
}

// Flattens { a: { b: 'x' } } to { 'a.b': 'x' } so nested JS dictionaries can
// be compared key by key between languages.
function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Paths and URLs

const publicPath = (page) => (page === 'index.html' ? '' : page);
const depth = (p) => p.split('/').length - 1;
const up = (n) => '../'.repeat(n);

// Relative link from one generated file to another; links to an index.html
// use the directory form (es/ rather than es/index.html).
function relLink(fromFile, toFile) {
  let rel = path.posix.relative(path.posix.dirname(fromFile), toFile);
  if (rel === 'index.html') return './';
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
  return rel;
}

function pageVars(lang, page) {
  const L = LANGS[lang];
  const other = lang === 'en' ? 'es' : 'en';
  const outFile = L.outDir + page;
  const otherFile = LANGS[other].outDir + page;
  const atLangRoot = depth(page) === 0;
  return {
    lang: L.htmlLang, // <html lang>
    langCode: lang, // en | es
    locale: L.locale, // for Intl / toLocaleDateString in page scripts
    ogLocale: L.ogLocale,
    ogLocaleAlt: LANGS[other].ogLocale,
    url: SITE_URL + L.outDir + publicPath(page),
    urlEn: SITE_URL + LANGS.en.outDir + publicPath(page),
    urlEs: SITE_URL + LANGS.es.outDir + publicPath(page),
    altHref: relLink(outFile, otherFile), // same page, other language
    site: up(depth(outFile)), // to the repo root: assets/, styles/, script.js...
    root: up(depth(page)), // to this language's home (index.html)
    pagesDir: atLangRoot ? 'pages/' : '', // to this language's pages/ folder
    contactHref: atLangRoot ? '#contact' : up(depth(page)) + 'index.html#contact',
  };
}

// ---------------------------------------------------------------------------
// Rendering

const TOKEN = /\{\{\s*(json:|\$)?([\w.-]+)\s*\}\}/g;

function includePartials(text, seen) {
  return text.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (all, name) => {
    if (seen.includes(name)) throw new Error('partial include loop: ' + seen.concat(name).join(' > '));
    const file = path.join(SRC, 'partials', name + '.html');
    if (!fs.existsSync(file)) throw new Error('missing partial src/partials/' + name + '.html');
    const body = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '');
    return includePartials(body, seen.concat(name));
  });
}

function render(template, lang, strings, vars, used, errors, where) {
  let text = includePartials(template, []);
  // Language blocks: keep {{#lang}}..{{/lang}} for this language, drop the rest.
  text = text.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (all, l, body) => (l === lang ? body : ''));
  return text.replace(TOKEN, (all, kind, name) => {
    if (kind === '$') {
      if (!(name in vars)) errors.push(`${where}: unknown variable {{$${name}}}`);
      return vars[name] ?? '';
    }
    if (kind === 'json:') {
      if (!strings[name]) {
        errors.push(`${where}: missing i18n/${lang}/${name}.json`);
        return '{}';
      }
      used.add(name + '.*');
      // Escape "<" so a string can never close the surrounding <script>.
      return JSON.stringify(strings[name]).replace(/</g, '\\u003c');
    }
    const dot = name.indexOf('.');
    const ns = name.slice(0, dot);
    const key = name.slice(dot + 1);
    const value = dot > 0 && strings[ns] ? strings[ns][key] : undefined;
    if (typeof value !== 'string') {
      errors.push(`${where}: missing string "${name}" in i18n/${lang}/${ns}.json`);
      return all;
    }
    used.add(name);
    return value;
  });
}

const BANNER = (page) =>
  `<!-- GENERATED by scripts/build-i18n.js from src/${page} - do not edit this file; ` +
  `edit the template or i18n/*/*.json and run "npm run build:i18n". -->`;

function writeIfChanged(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
  if (before === content) return false;
  fs.writeFileSync(file, content);
  return true;
}

// ---------------------------------------------------------------------------
// Sitemap (with hreflang alternates for both languages)

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];
  for (const page of PAGES.filter((p) => p.sitemap !== false)) {
    const en = SITE_URL + LANGS.en.outDir + publicPath(page.path);
    const es = SITE_URL + LANGS.es.outDir + publicPath(page.path);
    for (const loc of [en, es]) {
      urls.push(
        [
          '  <url>',
          `    <loc>${loc}</loc>`,
          `    <xhtml:link rel="alternate" hreflang="en" href="${en}" />`,
          `    <xhtml:link rel="alternate" hreflang="es-419" href="${es}" />`,
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${en}" />`,
          `    <lastmod>LASTMOD</lastmod>`,
          '    <changefreq>monthly</changefreq>',
          `    <priority>${page.priority}</priority>`,
          '  </url>',
        ].join('\n')
      );
    }
  }
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('\n') +
    '\n</urlset>\n';
  // Only bump <lastmod> when the URL set itself changed, so rebuilding on a
  // different day does not produce a noisy sitemap diff.
  const file = path.join(ROOT, 'sitemap.xml');
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : '';
  const strip = (s) => s.replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod>LASTMOD</lastmod>');
  if (strip(old) === xml) return false;
  return writeIfChanged('sitemap.xml', xml.replace(/LASTMOD/g, today));
}

// ---------------------------------------------------------------------------

function main() {
  const strings = { en: loadStrings('en'), es: loadStrings('es') };
  const errors = [];
  const warnings = [];
  const used = new Set();
  let written = 0;

  // Both languages must define the same keys.
  for (const ns of new Set([...Object.keys(strings.en), ...Object.keys(strings.es)])) {
    const en = flatten(strings.en[ns] || {}, '', {});
    const es = flatten(strings.es[ns] || {}, '', {});
    for (const k of Object.keys(en)) if (!(k in es)) errors.push(`i18n/es/${ns}.json is missing "${k}"`);
    for (const k of Object.keys(es)) if (!(k in en)) warnings.push(`i18n/es/${ns}.json has "${k}", which English does not`);
  }

  const outputs = [];
  for (const page of PAGES) {
    const template = fs.readFileSync(path.join(SRC, page.path), 'utf8').replace(/\r\n/g, '\n');
    for (const lang of Object.keys(LANGS)) {
      const vars = pageVars(lang, page.path);
      let html = render(template, lang, strings[lang], vars, used, errors, `src/${page.path} [${lang}]`);
      html = html.replace(/^<!doctype html>\n/i, (d) => d + BANNER(page.path) + '\n');
      outputs.push([LANGS[lang].outDir + page.path, html]);
    }
  }

  // Unused strings are only a warning (JS dictionaries are used as a whole).
  for (const [ns, dict] of Object.entries(strings.en)) {
    if (used.has(ns + '.*')) continue;
    for (const k of Object.keys(dict)) if (!used.has(ns + '.' + k)) warnings.push(`unused string ${ns}.${k}`);
  }

  if (errors.length) {
    console.error('build:i18n failed:\n  ' + [...new Set(errors)].join('\n  '));
    process.exit(1);
  }
  for (const [rel, html] of outputs) if (writeIfChanged(rel, html)) written++;
  const sitemap = buildSitemap();
  if (warnings.length) console.warn('warnings:\n  ' + warnings.join('\n  '));
  console.log(
    `build:i18n: ${outputs.length} pages (${PAGES.length} x ${Object.keys(LANGS).length} languages), ` +
      `${written} updated${sitemap ? ', sitemap.xml updated' : ''}.`
  );
}

main();
