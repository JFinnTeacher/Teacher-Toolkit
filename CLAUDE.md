# Teacher Toolkit — Claude Context

## What this project is
A GitHub Pages site of browser-based tools and subject resources for classroom use.
Live at: https://www.practical-teacher.com/
Repo: https://github.com/JFinnTeacher/Teacher-Toolkit

Target users: teachers (primarily the owner). Tools must work reliably in a classroom
context — fast, offline-tolerant, no login, no cloud dependency.

## Stack
- Plain HTML + vanilla JS (ES modules) + CSS
- Tailwind CSS via CDN — no build step, no npm
- No frameworks, no bundler, no backend
- All data stays in the browser (localStorage where needed)

## Project structure
```
index.html              # Landing page
assets/
  css/base.css          # Shared design tokens — edit here to restyle everything
  data/                 # JSON data files for JS-rendered pages
  js/
    site.js             # Global helpers + nav
    timer.js
    lollypopQuestions.js
    studentList.js
    feedbackGenerator.js
tools/                  # One HTML file per tool
content/
  engineering/
  computer-science/
_briefs/                # Content briefs (not served by GitHub Pages)
  assets/               # Images referenced in briefs
  done/                 # Completed briefs, archived after merge
```

## Existing tools
- **Countdown Timer** — presets, custom durations, progress ring, chime, localStorage
- **Lollypop Questions** — random responder/questioner pairs, refusal tracking
- **Student Questioning List** — roster upload, cold-call randomiser, history log
- **Feedback Generator** — CSV upload (students + comment bank), generates comments, download as CSV

## Design conventions
Visual direction: **"drawing sheet"** — a technical/blueprint aesthetic. Light theme
is a pale "whiteprint" (blue-tinted paper, blue linework); dark theme is a true
blueprint (deep blue ground, white/cyan linework). Accent is a single "redline" red,
used the way an engineer's red pencil marks up a drawing — sparingly, for
links/CTAs/tags. Don't reintroduce the old blue/orange or `rounded-full` pill look.

- **Typography has three roles, not one face:**
  - Mono (`font-mono`, Cascadia Code/Consolas) — nav, buttons, tags, labels, footer metadata
  - Serif (`font-serif`, Cambria) — page-level H1s and content/lesson headlines only
  - Sans (Inter, default body) — everything else: paragraphs, form labels, tool UI text
- **Colors are CSS variables, not hardcoded hex.** `assets/css/base.css` defines
  `--tt-primary-rgb`, `--tt-ink-rgb`, and `--tt-slate-{50..900}-rgb` as
  space-separated RGB triples (light values in `:root`, dark values under
  `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`). Every page's
  `tailwind.config` maps `primary`/`accent`/`dark`/`slate` to
  `rgb(var(--tt-...-rgb) / <alpha-value>)`. **Keep the RGB triples space-separated**
  (`183 64 42`, not `183, 64, 42`) — commas silently break Tailwind's
  opacity-modifier syntax and colors fall back to inherited text color with no error.
- **Radius and shadow are centralized too**, via `borderRadius` (`full`, `2xl`,
  `3xl`) and `boxShadow.glow` overrides in the same `tailwind.config` block, so
  `rounded-full` / `shadow-glow` render as the small-radius, flat-shadow look
  sitewide without per-element edits.
- **Shared component classes** in `base.css`: `.tt-surface` (flat bordered panel),
  `.tt-pill` (mono tag chip), `.tt-nav-link` (hairline-underlined link),
  `.tt-frame-corners` (accent corner brackets on hero panels),
  `.tt-section-heading` (mono eyebrow label), `.tt-sheet` / `.tt-ruler-top` /
  `.tt-ruler-left` / `.tt-sheet-corner` / `.tt-sheet-content` (the coordinate-ruler
  page frame), `.tt-title-block` (engineering-drawing-style footer metadata table).
- **Every page needs the same `tailwind.config` block** (colors, fontFamily,
  borderRadius, boxShadow) in its `<head>` — copy it from an existing page (e.g.
  `tools/timer.html`) rather than writing it from scratch.
- **Every page wraps `<body>` content in the sheet frame** (`.tt-sheet` >
  `.tt-sheet-corner` + `.tt-ruler-top` + `.tt-ruler-left` + `.tt-sheet-content`) and
  ends with a `.tt-title-block` footer before the cookie banner. Copy this shell
  from an existing page rather than reconstructing it.
- All pages load Tailwind from CDN + `assets/css/base.css`
- New tools go in `tools/`, new content under `content/<subject>/`
- Use relative paths everywhere (site must work from repo root on GitHub Pages)

## What to preserve
- No build step — keep it zero-config
- No external JS dependencies beyond Tailwind CDN
- All processing in the browser — no data leaves the user's machine
- Consistent nav and visual style across all pages

## What to avoid
- Do not introduce npm, a bundler, or a framework
- Do not add cloud sync, accounts, or server-side logic
- Do not break the relative path structure
- Do not use `innerHTML` with unsanitised user input

## Git workflow
- **Working branch is `site-updates`** — all edits go here, never directly to `main`
- Write files to `C:\Users\J Finn\Documents\GitHub\Teacher-Toolkit` (the main repo working directory)
- Do not create Claude worktrees or Claude branches — they are invisible to GitHub Desktop
- Push and merge to `main` are handled by the user via GitHub Desktop
- Never attempt `git push` or `gh pr create` via CLI

## JSON-driven content pages
JSON-driven pages are the exception — only use this pattern when explicitly requested.

The default for all content pages is to generate static HTML directly from the Markdown brief. Do not introduce a JSON data file unless the user specifically asks for one.

When JSON is requested:
- Data file: `assets/data/<page-name>.json`
- Page fetches the JSON via `fetch()` and renders cards/sections with vanilla JS
- The JSON includes `_note`, `_link_schema`, and `_badges` keys as inline documentation — these are ignored by the rendering JS
- These pages require HTTP to run (GitHub Pages serves them correctly; use `python -m http.server 8000` for local testing)

Current JSON-driven pages:
- `content/computer-science/useful-links.html` → `assets/data/useful-links.json`

## Current focus / known gaps
- `content/engineering/` is a placeholder — needs real content
- Class list management currently lives only on the landing page modal
- CS index tag filter buttons must be updated manually when new resource cards are added
- Header/footer/cookie-banner markup is duplicated per page (no build step means no
  shared partial) — copy drift is possible; keep pages in sync by hand when editing
  shared chrome

## Content brief workflow
New content pages are commissioned via Markdown briefs in `_briefs/`.

1. Read the brief file fully before writing any code
2. Generate the content page under `content/<subject>/` following existing page structure
3. Reference images are in `_briefs/assets/`
4. When work is complete and merged, move the brief to `_briefs/done/`

Briefs are for **content pages only** — not new tools. Tools are built interactively.

## How to add a new tool
1. Create `tools/<tool-name>.html` following the structure of an existing tool
2. Add the tool's JS module to `assets/js/<tool-name>.js`
3. Link it from `index.html` in the tools section
4. Test locally with `python -m http.server 8000` before pushing
