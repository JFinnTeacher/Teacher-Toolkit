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
- Tailwind utility classes are the primary styling approach
- `assets/css/base.css` holds shared tokens — always update here for global changes
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

## Current focus / known gaps
- `content/engineering/` and `content/computer-science/` are placeholder pages — need real content
- `tools/admin.html` is a placeholder — admin tools not yet defined
- Class list management currently lives only on the landing page modal

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
