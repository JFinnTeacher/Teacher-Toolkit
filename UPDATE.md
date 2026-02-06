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
  admin.html            # Admin tools hub: Student Feedback Generator
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

- **Colors:** primary `#2563eb`, accent `#f97316`. Set in Tailwind config and `base.css` variables.
- **Dark mode:** `data-theme="dark"` on `<html>`. Toggle in `site.js`; preference stored in `localStorage`.
- **Cookie banner:** Shown until user accepts. Consent stored in `teacherToolkit:cookieConsent`. Banner HTML on every page; logic in `site.js`.
- **Code/example boxes:** Contrast fixes in `base.css` for light and dark mode (pre.bg-slate-100, code.bg-slate-100, etc.).

---

## Key decisions & behaviours

1. **Tools organisation**
   - **Classroom tools** (Timer, Lollypop Questions, Student Questioning List) → `tools/classroom.html` hub.
   - **Admin tools** (Student Feedback Generator) → `tools/admin.html` hub.
   - Index shows two side-by-side cards: Classroom tools, Admin tools.

2. **Resources**
   - Engineering and Computer Science show "Coming soon" on index. Links to `content/engineering/` and `content/computer-science/` are placeholders.

3. **Student Feedback Generator**
   - Uses **first name only** in `{name}` placeholder (splits on space; first token used).
   - CSV: students (name, gender, score columns) + comment bank (element, min_marks, max_marks, comment_template).
   - Placeholders: `{name}`, `{pronoun}`, `{pronoun_cap}`, `{possessive}`, `{possessive_cap}`, `{object}`, `{score}`, `{max_score}`, `{percentage}`.

4. **Class lists**
   - Managed via modal on index. Shared between Lollypop Questions and Student Questioning List.
   - Stored in `localStorage` under `teacherToolkit:classLists`.

5. **GDPR / data privacy**
   - Pages explain that data stays in the browser and nothing is uploaded to third parties. Cookie banner describes local storage and third-party resources (Tailwind CDN, Google Fonts).

---

## File patterns

- **Tool pages:** Header with "← Back to toolkit" (`../index.html` or `../../index.html`), theme toggle, tt-pill, main content, cookie banner, `site.js` + tool-specific JS.
- **Asset paths:** Tools in `tools/` use `../assets/`; content in `content/foo/` use `../../assets/`.
- **Footer:** Only on index. "The Practical Teacher Toolkit • practical-teacher.com • Made with Tailwind CSS" + "Last updated: [date]".

---

## What to update when adding content

1. **New classroom tool:** Add to `tools/classroom.html` and create `tools/new-tool.html`.
2. **New admin tool:** Add to `tools/admin.html` and create the tool file.
3. **New resource page:** Add under `content/engineering/` or `content/computer-science/`.
4. **Index stats:** Update "Classroom tools" or "Subject areas" counts in hero if needed.
5. **Footer:** Update "Last updated" date in `index.html`.
6. **This file:** Append any new conventions or decisions.

---

## Last significant update

3 February 2026 — Restructured tools into classroom/admin hubs; moved Student Feedback Generator to admin; simplified hero section; added footer with last-updated date.
