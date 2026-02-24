# The Practical Teacher Toolkit

Tailwind-powered tools, resources, and content for teachers. Classroom tools, admin tools, and subject-specific resources for Engineering and Computer Science. All data stays in the browser—GDPR compliant, no server uploads. Domain: **practical-teacher.com**.

## Current status

| Area | Status |
|------|--------|
| **Classroom tools** | 3 tools: Countdown Timer, Lollypop Questions, Student Questioning List |
| **Admin tools** | 1 tool: Student Feedback Generator (with in-browser comment bank builder) |
| **Resources** | Engineering and Computer Science placeholder pages ("Coming soon") |
| **Class lists** | Shared across Lollypop Questions and Student Questioning List; count shown on index |
| **Design** | Tailwind CDN + `base.css`; dark mode; cookie banner; contrast fixes for code boxes |

## Project layout

```
index.html                  # Landing page: hero, Tools (2 hubs), Resources, class list count, footer
assets/
├── css/base.css            # Design tokens, dark mode, tt-* utilities, code box contrast
└── js/
    ├── site.js             # TeacherToolkit, storage, classLists, nav, theme, cookie banner, class list count
    ├── classLists.js       # Class list modal (index only)
    ├── timer.js
    ├── lollypopQuestions.js
    ├── studentList.js
    └── feedbackGenerator.js
tools/
├── classroom.html          # Classroom tools hub
├── admin.html              # Admin tools hub
├── timer.html
├── lollypop-questions.html
├── student-list.html
└── feedback-generator.html
content/
├── engineering/index.html      # Placeholder
└── computer-science/index.html # Placeholder
```

The site is organized into **Tools** (Classroom hub, Admin hub) and **Resources** (Engineering, Computer Science). Add new tools under `tools/` and new content under `content/<subject>/`.

## Included tools

### Classroom tools (via `tools/classroom.html`)

- **Countdown Timer** – Presets (1–10 min), custom durations, progress ring, optional chime, local-storage persistence.
- **Lollypop Questions** – Pair students to ask and answer; track refusals; remove successful students from rotation.
- **Student Questioning List** – Paste/upload rosters; mark asked or absent; non-repeating random selection; history log.

### Admin tools (via `tools/admin.html`)

- **Student Feedback Generator** – Upload students CSV (name, gender, scores per element) and comment bank CSV (element, min/max marks, template). Generates one combined comment per student; download results as CSV. Optional **comment bank builder** on the same page: build comment bank in the browser (element, min/max marks, template), shortcode guide with Copy buttons, 620-character limit per template, download CSV or load into generator. Uses first name only for `{name}` placeholder.

Every page loads Tailwind via CDN plus `assets/css/base.css`; brand updates cascade across the site.

## Resources

Subject-specific content for **Engineering** and **Computer Science** lives under `content/engineering/` and `content/computer-science/`. Placeholder pages show "Coming soon"; add lesson plans and materials as you expand.

## Class lists

- Open the landing page and use **Manage class lists** to create, rename, and edit reusable rosters. The index shows how many class lists are saved in a stat box.
- Each list is stored locally in the browser (no cloud sync). Stored under `teacherToolkit:classLists`.
- Inside **Lollypop Questions** and **Student Questioning List** you’ll find a class selector. Choose a saved roster to load it instantly, then push your edits back with **Save roster to list**.

## Local usage

1. Clone the repo and open the workspace in your editor of choice.
2. Serve the site (for example: `python -m http.server 8000`) **or** open `index.html` directly in the browser.
3. Navigate between tools from the landing page hero or visit the HTML files under `tools/`.

No build step is required because scripts are plain ES modules and Tailwind loads from the CDN.

## Deploying to GitHub Pages

1. Commit your changes and push to `main`.
2. In your GitHub repository, open **Settings → Pages**.
3. Set the source to the `main` branch (root directory).
4. Save the settings; Pages will publish at `https://<your-username>.github.io/Teacher-Toolkit/`.
5. Optionally point a custom domain (e.g. practical-teacher.com) in Pages settings.

All links use relative paths, so the site serves correctly from the repository root.

## Continuity

See `UPDATE.md` for detailed conventions, key decisions, and what to update when adding content. Useful when switching machines or Cursor instances.

## Customization tips

- Update colors, fonts, or shadows in `assets/css/base.css` to restyle every page instantly.
- Extend Tailwind tokens inside `index.html` (and each tool HTML file) if you need additional utilities.
- Each tool’s JS module includes small helper functions; feel free to expand them or import new scripts if you add more tools later.
