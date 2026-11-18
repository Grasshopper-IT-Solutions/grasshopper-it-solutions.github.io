# <img src="assets/grasshopper-geometric-logo.svg" alt="Grasshopper IT Solutions" height="32" style="vertical-align: middle;"> Grasshopper IT Solutions

[![Pages Status](https://github.com/Grasshopper-IT-Solutions/grasshopperitsolutions.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/Grasshopper-IT-Solutions/grasshopperitsolutions.github.io/actions/workflows/pages/pages-build-deployment)

Growing Green. Building Clean. Leaping Far.

A cyberpunk-inspired landing page for Grasshopper IT Solutions LLC — premium software at grassroots rates, with an instant project cost calculator and direct WhatsApp contact.

🌐 **Live Site**: [grasshoppersolutions.online](https://grasshoppersolutions.online)

## Features

- **Responsive Design**: Fully mobile-optimized with smooth animations
- **Service Showcase**: Comprehensive display of development capabilities
- **Tech Stack Visualization**: Animated technology breakdown
- **App Center**: Links to additional applications and tools

## Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS
- Lucide Icons
- Hosted on GitHub Pages

## Languages (English + Spanish)

The site is bilingual: US English at the usual URLs (`/`, `/pages/...`) and
Latin American Spanish (`es-419`) under `/es/` with the same structure
(`/es/`, `/es/pages/...`). Both are generated from one set of templates, and
the generated HTML is committed (GitHub Pages serves it as-is).

```
src/                    page templates (edit these, not the generated pages)
  index.html, pages/*.html
  partials/             header, footer, language switcher, <head> SEO block
i18n/en/*.json          English strings, one file per page/namespace
i18n/es/*.json          Spanish strings, same files and keys
scripts/build-i18n.js   templates + strings -> index.html, pages/, es/, sitemap.xml
scripts/check-links.js  checks every local link/asset in the generated pages
```

**Edit or add text**

1. Change the string in `i18n/en/<page>.json` **and** `i18n/es/<page>.json`
   (same key in both). To add new text, put `{{page.my_key}}` in the template
   and add `my_key` to both files. Strings are inserted as HTML, so write `&amp;`
   for `&`, and avoid `"` in strings used inside attributes.
2. Run `npm run build` (= `build:i18n`, then `build:css`, then `check:links`).
   The build stops with a list if a key is missing in either language.

Other template tags: `{{json:ns}}` inlines a whole string file for page
scripts (the calculator and the brief form build their labels, toasts, PDF and
WhatsApp text from `calculator-js.json` / `brief-js.json`), `{{$var}}` is a
build variable (paths, URLs, locale), `{{> name}}` includes a partial, and
`{{#en}}...{{/en}}` / `{{#es}}...{{/es}}` keep a block in one language only.

**Language selection.** English pages run a tiny script at the top of
`<head>`: a saved choice (`localStorage` key `gh_lang`, set by the EN | ES
switcher in the header and mobile menu) always wins; with none, the first
entry of `navigator.languages` decides once (`es*` -> Spanish) and is saved.
Spanish pages never redirect, so there are no loops, and both URLs stay
directly reachable. Every page carries `hreflang` alternates (`en`, `es-419`,
`x-default` -> English) and its own canonical.

Prices stay in USD in both languages. Calculator state (`gh_calc_state`,
`?state=` links) uses language-independent keys, so saved and shared quotes
open in either language.

## 📞 Contact

- **Email**: 📧 general@grasshoppersolutions.online
- **GitHub**: [Grasshopper-IT-Solutions](https://github.com/Grasshopper-IT-Solutions)
- **Website**: [grasshoppersolutions.online](grasshoppersolutions.online)

**Made with ❤️ by Grasshopper IT Solutions, LLC**
