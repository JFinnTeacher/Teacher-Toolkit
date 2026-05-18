> **Brief ready for:** `_briefs/useful-links.md`
> Save this file to the `_briefs/` folder in the Teacher Toolkit repo, then ask Claude Code to "read _briefs/useful-links.md and build the content page".
> No assets required before Claude Code runs.

---

# Content Brief: Useful Links

## Metadata
- **Subject:** Computer Science
- **Level:** JC and LC
- **Year group:** All year groups
- **Output file:** `content/computer-science/useful-links.html`
- **Page title:** Useful Links — Computer Science
- **Nav label:** Useful Links
- **Syllabus reference:** General — not tied to a specific strand or outcome
- **Brief status:** Draft
- **Brief file:** `_briefs/useful-links.md`

---

## Page purpose

A curated, maintained library of links to external tools, resources, and references useful for teaching and learning Computer Science at JC and LC level in Ireland. The page is aimed at both teachers and students. It is not tied to any single syllabus topic and will grow over time.

---

## Page sections

### Introduction

**Purpose:** Set the context for the page.
**Content prompt:** [WRITE: Short 2–3 sentence intro explaining what the page is, who it is for, and that links are curated and checked periodically.]
**Content type:** Text
**Notes for Claude Code:** Plain paragraph below the page heading. Keep it tight.

---

### Category Navigation

**Purpose:** Let users jump directly to a section without scrolling.
**Content prompt:** No content required — generated from section headings below.
**Content type:** Anchor link list
**Notes for Claude Code:** Generate an anchor nav block below the intro, linking to each category section by its ID. Style as a row of pill-style buttons or a compact link list using Tailwind.

---

### General Resources

**Purpose:** Links broadly useful for CS teaching and learning that don't fit a specific topic.
**Content prompt:** [WRITE: Add links, each with a title, URL, short description, and an audience tag — Teacher, Student, or Both.]
**Content type:** Link list
**Notes for Claude Code:** Render each entry as a card or styled list item showing: link title (clickable), short description, and an audience badge. Use this card pattern consistently across all category sections.

---

### IDEs and Code Editors

**Purpose:** Tools for writing and running code, online and offline.
**Content prompt:** [WRITE: Split into two sub-groups — Offline and Online. For each tool, add a title, URL, short description, and note any free-tier limitations where relevant.]
**Content type:** Link list with sub-grouping
**Notes for Claude Code:** Use two sub-headings within this section: "Offline" and "Online". Apply the same card pattern as other sections.

---

### Python

**Purpose:** Resources specifically for learning and referencing Python.
**Content prompt:** [WRITE: Add links with title, URL, and short description. Note the intended audience and level where relevant.]
**Content type:** Link list
**Notes for Claude Code:** Same card pattern as other sections.

---

### Networking

**Purpose:** Tools and interactive resources to support the networking topic.
**Content prompt:** [WRITE: Add links with title, URL, and short description. Note any that work well as classroom starters or homework activities.]
**Content type:** Link list
**Notes for Claude Code:** Apply an "Interactive" badge to quiz and game-type links to distinguish them from reference links. Same card pattern otherwise.

---

### Artificial Intelligence

**Purpose:** Resources for the AI strand of the LC CS course.
**Content prompt:** [WRITE: Add links with title, URL, and short description. Note where links relate specifically to the LC AI strand versus general interest.]
**Content type:** Link list
**Notes for Claude Code:** Same card pattern as other sections.

---

### Data and Analytics

**Purpose:** Data sources and tools relevant to the ALT2 Applied Learning Task.
**Content prompt:** [WRITE: Add links with title, URL, and short description. Flag any that require a login to access data.]
**Content type:** Link list
**Notes for Claude Code:** Apply a "Login Required" note or badge to any links that need an account. Same card pattern otherwise.

---

### Logic Gates and Circuits

**Purpose:** Tools for building and simulating logic circuits.
**Content prompt:** [WRITE: Add links with title, URL, and short description.]
**Content type:** Link list
**Notes for Claude Code:** Same card pattern as other sections.

---

### Operating Systems

**Purpose:** Resources for the operating systems topic.
**Content prompt:** [WRITE: Add links with title, URL, and short description.]
**Content type:** Link list
**Notes for Claude Code:** Same card pattern as other sections.

---

### Micro:bit

**Purpose:** Resources for physical computing and the Micro:bit platform.
**Content prompt:** [WRITE: Add links with title, URL, and short description. Note whether each requires a physical Micro:bit or works in the simulator.]
**Content type:** Link list
**Notes for Claude Code:** Same card pattern. This section may grow — keep the structure flexible.

---

### Computational Thinking

**Purpose:** Resources for teaching and learning computational thinking.
**Content prompt:** [WRITE: Add links with title, URL, and short description. Note which are teacher-facing and which can be shared directly with students.]
**Content type:** Link list
**Notes for Claude Code:** Same card pattern as other sections.

---

### Classroom Tools and Games

**Purpose:** Interactive tools and games that support teaching and learning across CS topics.
**Content prompt:** [WRITE: Add links with title, URL, and short description. Note the classroom context each one suits — starter activity, demo, consolidation, etc.]
**Content type:** Link list
**Notes for Claude Code:** Apply the "Interactive" badge to games and interactive tools. Same card pattern otherwise.

---

### GitHub Resources

**Purpose:** Curated GitHub repositories worth bookmarking for CS students and teachers.
**Content prompt:** [WRITE: Add links with title, URL, and short description. Note the intended audience and level where relevant.]
**Content type:** Link list
**Notes for Claude Code:** Same card pattern as other sections.

---

### YouTube Channels

**Purpose:** Recommended YouTube channels for CS teaching and learning.
**Content prompt:** [WRITE: Add channels with title, URL, and short description of the type of content covered.]
**Content type:** Link list
**Notes for Claude Code:** Same card pattern as other sections.

---

### Books

**Purpose:** Recommended reading for CS teachers.
**Content prompt:** [WRITE: Add books with title, author, publisher, and a short note on who the book is aimed at and what makes it useful.]
**Content type:** Link list
**Notes for Claude Code:** Apply a "Teacher Resource" badge to all entries in this section. Same card pattern otherwise.

---

## Learning outcomes mapped

This page is not tied to specific learning outcomes. It is a support resource spanning the full LC CS course and JC CS short course. No outcome mapping required.

---

## Suggested related pages

- `content/computer-science/index.html` — CS subject index (existing)
- `content/computer-science/python-basics.html` — future Python topic page (planned)
- `content/computer-science/networking.html` — future Networking topic page (planned)
- `content/computer-science/data-analytics.html` — future ALT2 Data Analytics page (planned)

---

## Images and assets

No images required for this page.

---

## Index entry

**Useful Links**
A curated library of tools, resources, and references for Computer Science — covering IDEs, Python, networking, AI, data sources, logic gates, and more.
Link: `content/computer-science/useful-links.html`

---

## Build instructions for Claude Code

1. Create `content/computer-science/useful-links.html` following the structure of existing CS content pages
2. Load Tailwind from CDN and `assets/css/base.css` — use relative paths
3. Use the nav and footer pattern from existing content pages
4. Build an anchor navigation block below the intro, linking to each category section by ID
5. For each category section, render links using a consistent card or styled list-item pattern showing: link title (clickable), short description, and a badge where applicable
6. Where content prompts are marked [WRITE: ...], leave a clearly visible placeholder comment in the HTML: `<!-- CONTENT: description of what goes here -->`
7. Apply an "Interactive" badge to quiz and game-type links, a "Teacher Resource" badge to teacher-facing items, and a "Login Required" note where flagged
8. When complete, confirm the output file path and flag any sections that still need content added
