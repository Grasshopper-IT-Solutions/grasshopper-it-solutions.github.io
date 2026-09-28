# Landing page scaffold

This is a **scaffold, not a shipped site** — copy it into a fresh repo, don't edit it in place here.

## Using this scaffold

1. Copy everything in this folder (including dotfiles) into the new project's repo.
2. Fill in `BRIEF.md` first — it drives everything else.
3. Edit `contact.config.js` before anything else. See the warning comment at the top of that file.
4. Design and build the actual page in `index.html` / `styles/tailwind-input.css` / `main.js`, replacing every `<!-- CUSTOMIZE: ... -->` marker.
5. `npm install && npm run build:css` — run this before your first commit, and again after any class changes. Commit the resulting `styles/tailwind.css`.
6. Rename `CNAME.example` → `CNAME` only once the custom domain is actually ready to point at GitHub Pages. Until then, leave it as `.example` — the site is still reachable at `https://grasshopperitsolutions.github.io/<slug>/`.
7. Replace **this README** with a short, project-specific one: business name, live URL, and a one-line "Built by Grasshopper IT Solutions" credit.

See `../CLAUDE.md` (in the parent repo) for the full workflow this scaffold is part of, including the submodule setup and the contact-info safety check.
