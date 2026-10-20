---
name: new-landing-page
description: Scaffold a brand-new client landing page from the landing-pages/_template scaffold, wire it into this repo as a git submodule, and hand back a deployment checklist. Trigger on requests like "new landing page", "scaffold a landing page for <client>", "build client X's site", "set up a new landing page project". Not for editing an already-existing landing page.
---

# New landing page

Follow this workflow exactly — it's the same sequence documented in `../../CLAUDE.md` (read that file first if you haven't already this session; it explains the *why* behind each step, especially the contact-info rule).

## 1. Gather/confirm the brief

If `landing-pages/<slug>/BRIEF.md` doesn't exist yet, ask the user through `_template/BRIEF.md`'s fields: business name, one-liner, target audience, must-have sections, style/mood keywords, contact channels, domain plans. Don't proceed to scaffolding until you have at least the business name, contact channel, and a rough sense of the sections wanted.

## 2. Pick a client slug

Kebab-case the business name (e.g. "Alfonso Romero Fotografía" → `alfonso-romero-fotografia`). Check `landing-pages/` for a folder-name collision before doing anything else, and confirm the slug with the user before touching GitHub.

## 3. Create the GitHub repo

```bash
gh auth status   # if this fails, stop and tell the user rather than failing later
gh repo create Grasshopper-IT-Solutions/<slug> --public \
  --description "<Business Name> landing page — built by Grasshopper IT Solutions"
```

If `gh` isn't authenticated, stop here and ask the user to run `gh auth login`, or to create the empty repo manually and hand you the URL.

## 4. Scaffold in a scratch clone

Do this **outside** this repo's working tree (use the session scratchpad), not inside `landing-pages/` directly — the repo doesn't exist as a submodule yet.

```bash
git clone https://github.com/Grasshopper-IT-Solutions/<slug>.git <scratch>/<slug>
cp -r landing-pages/_template/. <scratch>/<slug>/
```

Replace the copied `README.md` with a short project-specific one (business name, live URL once known, "Built by Grasshopper IT Solutions" credit) — don't ship the scaffold's own generic README.

## 5. Fill in contact info and domain

Edit `contact.config.js` from the brief's contact channels. Read the file's own header comment — it says exactly what to double check. If the domain is ready now, rename `CNAME.example` → `CNAME` with that domain; otherwise leave it as `.example`.

## 6. Generate the actual design

This is the point where you design freely. The template's HTML/CSS is a **structural skeleton only** — nothing about its current copy, layout, or (lack of) color scheme is meant to ship. Build the real page per the brief's style/mood keywords and must-have sections: rewrite every `<!-- CUSTOMIZE: ... -->` block, add/remove sections as needed, choose real fonts and a real palette in `tailwind.config.js` and the markup's classes. Keep the semantic structure (header/nav/main/footer), the `mobile-menu-btn`/`mobile-menu` toggle wiring, and the `contact.config.js` wiring intact — don't reinvent those parts.

## 7. Build and verify

```bash
npm install && npm run build:css
```

Confirm `styles/tailwind.css` exists and is non-empty.

## 8. Commit and push

```bash
git add -A
git commit -m "Initial <Business Name> landing page"
git push -u origin main
```

## 9. Wire into the parent repo

Back in `GrasshopperWebSite`:

```bash
git submodule add https://github.com/Grasshopper-IT-Solutions/<slug>.git landing-pages/<slug>
git add .gitmodules landing-pages/<slug>
git commit -m "Add <slug> landing page submodule"
```

Only commit if the user has asked for a commit — otherwise leave it staged and say so, per this repo's standing "never commit without being asked" rule.

## 10. Verify

```bash
git submodule status
```

Confirm `<slug>` shows up with a real commit hash, not `-` (uninitialized).

## 11. Report a deployment checklist

Give the user this checklist rather than a full step-by-step transcript:

- [ ] GitHub Pages: Settings → Pages → Deploy from branch `main` / `(root)`.
- [ ] Domain ready now: `CNAME` renamed and DNS pointed; enable "Enforce HTTPS" once it propagates. Not ready: site is reachable at `https://grasshopper-it-solutions.github.io/<slug>/` meanwhile.
- [ ] `contact.config.js`'s WhatsApp number is confirmed to be the client's own, not `33767834576` (Grasshopper's own — see `../../CLAUDE.md`).
- [ ] **Manual, not done by this skill:** add a reference card/link to `pages/projects.html` on the main site if this project should be showcased there. This skill does not edit that file automatically.
