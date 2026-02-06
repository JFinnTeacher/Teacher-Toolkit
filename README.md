# The Practical Teacher Toolkit

Tailwind-powered tools, resources, and content for teachers. Classroom tools (timers, questioning helpers, feedback generators), admin tools, and subject-specific resources for Engineering and Computer Science. Each tool and page shares a central design system so updates stay consistent.

## Project layout

```
index.html                  # Landing page + tool descriptions
assets/
├── css/base.css            # Shared tokens and utility classes
└── js/
    ├── site.js             # Global helpers + nav behavior
    ├── timer.js            # Countdown timer logic
    ├── lollypopQuestions.js   # Lollypop pairing logic
    ├── studentList.js      # Student questioning list
    └── feedbackGenerator.js   # Student feedback generator
tools/
├── timer.html              # Classroom: Countdown timer
├── lollypop-questions.html # Classroom: Pairing for questioning
├── student-list.html       # Classroom: Randomizer for cold-calling
├── feedback-generator.html # Classroom: Generate comments from marks
└── admin.html              # Admin tools hub (placeholder)
content/
├── engineering/            # Engineering resources
│   └── index.html
└── computer-science/       # Computer Science resources
    └── index.html
```

The site is organized into **Tools** (Classroom tools, Admin tools) and **Resources** (Engineering, Computer Science). Add new tools under `tools/` and new content under `content/<subject>/`.

## Included tools

- **Countdown Timer** – Presets (1–10 min), custom durations, progress ring, optional completion chime, and automatic local-storage persistence.
- **Lollypop Questions** – Randomly assign responder/questioner pairs, track single-use refusals, and remove students who succeed from the active list.
- **Student Questioning List** – Paste/upload rosters, mark students as asked or absent, log history, and run non-repeating random selections.
- **Student Feedback Generator** – Upload a students CSV (name, gender, scores per element) and a comment bank CSV (element, mark ranges, templates). Generates one combined written comment per student with placeholders filled; download results as CSV. All processing runs in the browser.

Every page loads Tailwind via CDN plus `assets/css/base.css`, meaning brand updates or focus tweaks cascade throughout the toolkit.

## Resources

Subject-specific content and resources for **Engineering** and **Computer Science** live under `content/engineering/` and `content/computer-science/`. Placeholder pages are in place; add lesson plans, handouts, and other materials as you expand the site.

## Class lists

- Open the landing page and use **Manage class lists** to create, rename, and edit reusable rosters. Each list is stored locally in the browser (no cloud sync).
- Inside **Lollypop Questions** and **Student Questioning List** you’ll find a class selector. Choose a saved roster to load it instantly, then push your edits back with **Save roster to list**.
- The selector links back to the landing page for quick management if you need the full modal while working inside a tool.

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

All links use relative paths, so the site serves correctly from the repository root.

## Customization tips

- Update colors, fonts, or shadows in `assets/css/base.css` to restyle every page instantly.
- Extend Tailwind tokens inside `index.html` (and each tool HTML file) if you need additional utilities.
- Each tool’s JS module includes small helper functions; feel free to expand them or import new scripts if you add more tools later.
