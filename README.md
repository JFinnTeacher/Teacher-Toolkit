# Teacher Toolkit

Tailwind-powered classroom utilities you can run locally or host on GitHub Pages. Each tool has its own page but shares a central design system so updates only happen once.

## Project layout

```
index.html                  # Landing page + tool descriptions
assets/
├── css/base.css            # Shared tokens and utility classes
└── js/
    ├── site.js             # Global helpers + nav behavior
    ├── timer.js            # Countdown timer logic
    ├── quickQuiz.js        # Quiz builder + presenter
    └── studentList.js      # Student questioning list
tools/
├── timer.html
├── quick-quiz.html
└── student-list.html
```

## Included tools

- **Countdown Timer** – Presets (1–10 min), custom durations, progress ring, optional completion chime, and automatic local-storage persistence.
- **Quick Quiz Builder** – Create multiple-choice checks, run live sessions one prompt at a time, and import/export quizzes as JSON.
- **Student Questioning List** – Paste/upload rosters, mark students as asked or absent, log history, and run non-repeating random selections.

Every page loads Tailwind via CDN plus `assets/css/base.css`, meaning brand updates or focus tweaks cascade throughout the toolkit.

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
