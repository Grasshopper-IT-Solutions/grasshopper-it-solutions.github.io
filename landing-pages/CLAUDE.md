# Landing Pages — Creating New Ones

## Purpose

This file governs **creating new** client landing pages under `landing-pages/`. It is not a maintenance guide for the projects that already exist here — each of those is managed independently (see "Standing rule" below).

## Standing rule

`ludovica-piro/`, `alfonso-romero-fotografia/`, and `miguel-e-sofia/` are git submodules — separate repositories with their own history, owned and deployed independently of this one. `nuno-moreira/` and `sofia-moreira/` are plain files tracked directly in this repo, but are personal pages (the founder and his partner), not client work in progress.

**Never edit inside any of those five folders as part of the "new landing page" workflow.** If a change is genuinely needed inside one of them, that's a separate, explicit task — not something this document or its skill/agent should do as a side effect of building something else.

## Tech stack for new landing pages

Every new landing page is **plain HTML/CSS/JS with no runtime build step**, and **Tailwind precompiled to a static stylesheet** — the same pattern this repo's own root site uses (see `../package.json`'s `build:css` script). Concretely:

- No framework (no React/Vue/etc.), no bundler needed to *view or hand-edit* the shipped site.
- Tailwind is compiled once via the CLI (`npm run build:css`) and the resulting `styles/tailwind.css` is committed. Visitors never download a CDN compiler.
- The only thing `npm install` is ever needed for is running that one build command.

**Why:** these pages are usually handed off or left untouched for long stretches between edits. A page that needs `npm install && npm run dev` just to be readable a year later is a worse deliverable than one you can open in a text editor and understand immediately. It also avoids the `cdn.tailwindcss.com` play-CDN, which this repo's own root site moved off of for the same reason (it ships a live compiler to every visitor and is explicitly not meant for production).

This is a deliberate change from some of the earlier projects below — it is not a retrofit of them, only the default for what's built next.

## Existing projects (precedent, read-only context)

| Project | Tech stack | Submodule? | Domain |
|---|---|---|---|
| `nuno-moreira` | HTML + Tailwind CDN | No (plain files) | none |
| `sofia-moreira` | HTML + Tailwind CDN | No (plain files) | none |
| `ludovica-piro` | Vanilla JS + Vite + prerender | Yes (`ludovica-piro-page` repo) | ludovicapiro.com |
| `alfonso-romero-fotografia` | React + Vite SPA | Yes | alfonso-romero.art |
| `miguel-e-sofia` | Single inline HTML | Yes | miguel-e-sofia.site |
| `tic-tac-toe-ignore` | n/a | n/a — gitignored (`*-ignore*` rule), not a real client project | n/a |

New pages do not follow any of the stacks above — they follow the **Tech stack for new landing pages** section.

## Creating a new landing page: submodule workflow

Every new client landing page is its own git repository, added to this repo as a submodule under `landing-pages/<slug>/`:

```bash
# 1. Create the (empty) GitHub repo
gh repo create grasshopperitsolutions/<slug> --public \
  --description "<Business Name> landing page — built by Grasshopper IT Solutions"

# 2. Build the site in a scratch clone — NOT inside this repo's working tree
git clone https://github.com/grasshopperitsolutions/<slug>.git <scratch>/<slug>
cp -r landing-pages/_template/. <scratch>/<slug>/
# ... customize the copy, then:
cd <scratch>/<slug>
npm install && npm run build:css
git add -A
git commit -m "Initial <Business Name> landing page"
git push -u origin main

# 3. Wire it into this repo as a submodule
cd <path-to-GrasshopperWebSite>
git submodule add https://github.com/grasshopperitsolutions/<slug>.git landing-pages/<slug>
git add .gitmodules landing-pages/<slug>
git commit -m "Add <slug> landing page submodule"

# 4. Verify
git submodule status
```

**Naming convention going forward:** the GitHub repo name matches the folder slug exactly (kebab-case of the business name) — e.g. `alfonso-romero-fotografia` and `miguel-e-sofia` already do this; only the older `ludovica-piro-page` repo breaks the pattern, and that's not being renamed retroactively.

**GitHub Pages settings** for the new repo: Settings → Pages → Source = "Deploy from a branch", branch `main`, folder `/(root)`. No GitHub Actions workflow is needed — the compiled `styles/tailwind.css` is already committed, so there's nothing to build server-side.

## Contact-info centralization

This rule exists because of a real bug: `landing-pages/alfonso-romero-fotografia/src/utils/whatsapp.js:5` hardcodes

```js
const PHONE_NUMBER = "+33767834576"; // Replace with actual number
```

— which is **Grasshopper's own** business WhatsApp number (see `../script.js:10`'s `WHATSAPP_NUMBER`), left in as a placeholder and never swapped for the photographer's real number. His live contact page has been sending enquiries to Grasshopper, not to him, because the number was hardcoded inline instead of centralized somewhere obvious to check.

**The rule:** every new landing page keeps phone, WhatsApp, email, and social links in exactly **one** file — `contact.config.js` — and nowhere else. No other file should contain a raw phone number or `wa.me`/`api.whatsapp.com` URL.

**Required pre-deploy check**, stated literally so it's unambiguous: confirm `contact.config.js`'s `whatsapp` value is **not** `33767834576` (Grasshopper's own number) and genuinely matches the client's own number as given in that project's `BRIEF.md`.

## Generating a new page

- Interactive use: invoke the `landing-pages:new-landing-page` skill.
- Delegated/background build: use the `landing-page-builder` subagent.

Both follow the exact same workflow described above — see `landing-pages/_template/` for the scaffold they start from.
