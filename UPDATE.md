# Update & continuity notes

Use this file to maintain consistency when switching between machines or Cursor instances. Update it when you make significant changes.

---

## Project overview

**The Practical Teacher Toolkit** — A static site for teachers: classroom tools, admin tools, and subject-specific resources (Engineering, Computer Science). Hosted on GitHub Pages. Domain: **practical-teacher.com**.

- All data stays in the browser (no server uploads). GDPR-compliant messaging throughout.
- Tailwind CSS via CDN + shared `assets/css/base.css`. No build step.

---

## Current structure

```
index.html              # Landing page: hero, Tools (classroom + admin hubs), Resources (Engineering, CS), footer
assets/
  css/base.css          # Design tokens, dark mode, tt-* utility classes, code box contrast
  js/
    site.js             # TeacherToolkit object, storage, classLists, nav, theme toggle, cookie banner
    classLists.js       # Class list modal (index only)
    timer.js
    lollypopQuestions.js
    studentList.js
    feedbackGenerator.js
tools/
  classroom.html        # Classroom tools hub: Timer, Lollypop Questions, Student Questioning List
  admin.html            # Admin tools hub: Exam Feedback Generator
  timer.html
  lollypop-questions.html
  student-list.html
  feedback-generator.html
content/
  engineering/index.html    # Placeholder ("Coming soon")
  computer-science/index.html  # Placeholder ("Coming soon")
```

---

## Design conventions

- **Visual direction — "drawing sheet":** whiteprint (light) / blueprint (dark)
  palette, single "redline" red accent (`#b7402a` light / `#ff7a5c` dark), mono +
  serif + sans type pairing. Full breakdown (CSS variable names, required
  `tailwind.config` block, shared component classes) is in `CLAUDE.md` → *Design
  conventions* — read that before touching any page's head/body shell.
- **Colors:** Defined as CSS variables in `base.css`
  (`--tt-primary-rgb`, `--tt-ink-rgb`, `--tt-slate-{50..900}-rgb`), NOT hardcoded
  hex per page. Each page's `tailwind.config` maps `primary`/`accent`/`dark`/`slate`
  to `rgb(var(--tt-...-rgb) / <alpha-value>)`. RGB triples must stay
  space-separated — comma-separated breaks Tailwind's opacity-modifier syntax
  silently (colors fall back to inherited color, no console error, easy to miss).
- **Typography:** Mono (Cascadia Code/Consolas, `font-mono`) for nav/buttons/tags/
  labels; serif (Cambria, `font-serif`) for page H1s and content headlines only;
  sans (Inter, default) for body text.
- **Dark mode:** `data-theme="dark"` on `<html>`. Toggle in `site.js`; preference
  stored in `localStorage`. Because primary/accent/dark/slate are all
  CSS-variable-driven now, dark mode needs almost no `!important` overrides in
  `base.css` — only `bg-white` (not part of the slate scale) and the
  `bg-slate-900/90` inverted button's text-color flip remain as exceptions.
- **Cookie banner:** Shown until user accepts. Consent stored in `teacherToolkit:cookieConsent`. Banner HTML on every page; logic in `site.js`.

---

## Key decisions & behaviours

1. **Tools organisation**
   - **Classroom tools** (Timer, Lollypop Questions, Student Questioning List) → `tools/classroom.html` hub.
   - **Admin tools** (Exam Feedback Generator) → `tools/admin.html` hub.
   - Index shows two side-by-side cards: Classroom tools, Admin tools.

2. **Resources**
   - Engineering and Computer Science show "Coming soon" on index. Links to `content/engineering/` and `content/computer-science/` are placeholders.

3. **Exam Feedback Generator**
   - Uses **first name only** in `{name}` placeholder (splits on space; first token used).
   - CSV: students (name, gender, score columns) + comment bank (element, min_marks, max_marks, comment_template).
   - Placeholders: `{name}`, `{pronoun}`, `{pronoun_cap}`, `{possessive}`, `{possessive_cap}`, `{object}`, `{score}`, `{max_score}`, `{percentage}`.
   - **Comment bank builder** (optional section on same page): build comment bank in the browser with inputs for element, min_marks, max_marks, comment_template; add rows, clear all, table with per-row remove. Buttons: "Download comment bank CSV" and "Use in generator" (loads built rows as comment bank). Shortcode guide lists each placeholder with a short description and a "Copy" button to copy the shortcode to clipboard. Highlighted note reminds users to download and save the CSV to a safe location if they want to reuse the comment bank later.

4. **Class lists**
   - Managed via modal on index. Shared between Lollypop Questions and Student Questioning List.
   - Stored in `localStorage` under `teacherToolkit:classLists`.

5. **GDPR / data privacy**
   - Pages explain that data stays in the browser and nothing is uploaded to third parties. Cookie banner describes local storage and third-party resources (Tailwind CDN, Google Fonts).

---

## File patterns

- **Page shell:** Every page wraps `<body>` content in `.tt-sheet` (coordinate-ruler
  frame: `.tt-sheet-corner` + `.tt-ruler-top` + `.tt-ruler-left` + `.tt-sheet-content`).
  Header inside has "← Back to toolkit" (`../index.html` or `../../index.html`,
  styled with `.tt-nav-link`), a `.tt-pill` topic badge, theme toggle. Main content
  follows, then a `.tt-title-block` footer, then the cookie banner.
- **Asset paths:** Tools in `tools/` use `../assets/`; content in `content/foo/` use `../../assets/`.
- **Footer:** Every page now has a `.tt-title-block` footer (Project / Sheet / Rev /
  a fourth context-specific cell), not just index — copy the pattern from an
  existing page and update the "Sheet" and any context cell.

---

## What to update when adding content

1. **New classroom tool:** Add to `tools/classroom.html` and create `tools/new-tool.html`.
2. **New admin tool:** Add to `tools/admin.html` and create the tool file.
3. **New resource page:** Add under `content/engineering/` or `content/computer-science/`.
4. **Index stats:** Update "Classroom tools" or "Subject areas" counts in hero if needed.
5. **Footer:** Update the "Rev" cell in the `.tt-title-block` footer (e.g. `index.html`) to the current year.month.
6. **This file:** Append any new conventions or decisions.

---

## Last significant update

- **Visual redesign (2026-07):** Replaced the generic Tailwind-default look
  (blue `#2563eb` / orange `#f97316`, `rounded-full` pills, soft glow shadows) with
  a "drawing sheet" system — whiteprint (light) / blueprint (dark) palette, redline
  accent, mono + serif + sans type pairing, a coordinate-ruler page frame
  (`.tt-sheet`), and an engineering title-block footer (`.tt-title-block`). Applied
  to every page (hub, all tool pages, all content pages).
  - Colors (`primary`/`accent`/`dark`/`slate`) are now CSS-variable-driven in each
    page's `tailwind.config`, which removed ~115 lines of `!important` dark-mode
    overrides from `base.css` that previously fought Tailwind's static utility
    classes.
  - Border radius (`full`/`2xl`/`3xl`) and `boxShadow.glow` are also overridden in
    `tailwind.config`, so existing `rounded-full`/`shadow-glow` markup renders the
    new look without per-element edits.
  - Known tradeoff, unchanged by this update: header/footer/cookie-banner markup
    is still duplicated per page since there's no build step for a shared partial —
    documented in `CLAUDE.md` → *Current focus / known gaps*.
- **Comment bank builder** (exam feedback generator): In-browser UI to build comment bank (element, min/max marks, template); add/remove rows; download as CSV or load into generator. Shortcode guide with descriptions and Copy buttons for each placeholder. Highlighted note to download CSV to a safe location for reuse.
- Earlier: Restructured tools into classroom/admin hubs; moved Exam Feedback Generator to admin; simplified hero; footer with last-updated date (3 February 2026).
