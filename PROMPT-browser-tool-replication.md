# Prompt: Student Feedback Generator – Browser-Based Education Tool

Use this prompt to build a **Student Feedback Generator** as a single-page tool for an education tools website. The tool must run **entirely in the browser** (no server, no data sent to a server). Use **Tailwind CSS** for layout and styling and **vanilla JavaScript** for logic. All CSV parsing and feedback generation must happen client-side.

---

## Tool purpose

Teachers upload (1) a **students CSV** (names, gender, scores per element) and (2) a **comment bank CSV** (mark ranges and comment templates per element). The tool generates **one combined written comment per student** by matching each student’s raw marks to the comment bank, replacing placeholders (name, pronouns, score, percentage), and concatenating the element comments into a single paragraph. Results can be previewed and downloaded as CSV. Maximum marks per element are **derived from the comment bank** (highest `max_marks` per element); no separate “max marks” input is required.

---

## Technical constraints

- **Browser-only**: No backend. Use `<input type="file">` and the File API to read CSV files. Parse CSVs in JavaScript (e.g. split on newlines and commas, or a small client-side CSV parser). Do not send file contents or results to any server.
- **Stack**: HTML, Tailwind CSS (via CDN or build), vanilla JavaScript. No frameworks required.
- **Accessibility**: Use semantic HTML, labels for file inputs, and clear error/success messages.

---

## File formats

### 1. Students CSV

- **Required columns**: `name`, `gender`, then one or more score columns (any names, e.g. `element1`, `element2`, `element3` or `Q1`, `Q2`).
- **Rules**:  
  - `gender` must be `M` or `F` (case-insensitive; normalize to uppercase).  
  - All other columns except `name` and `gender` are treated as numeric score columns. Scores must be non-negative numbers.  
  - Support any number of score columns (different classes/courses can have different elements).
- **Example**:
  ```text
  name,gender,element1,element2,element3
  John Smith,M,17,36,45
  Sarah Jones,F,13,44,35
  ```

### 2. Comment bank CSV

- **Required columns**: `element`, `min_marks`, `max_marks`, `comment_template`.
- **Rules**:  
  - `element` must match a score column name from the students CSV (e.g. `element1`).  
  - `min_marks` and `max_marks` are numbers; ranges are **inclusive** (min_marks ≤ score ≤ max_marks). Comment matching is by **raw marks**, not percentage.  
  - `min_marks` must be non-negative.  
  - For each element, the **maximum marks** (used for percentage and for `{max_score}` / `{percentage}` placeholders) is the **maximum value of `max_marks`** among all rows for that element. No separate “max marks” input in the UI.
- **Example**:
  ```text
  element,min_marks,max_marks,comment_template
  element1,0,10,{name} struggled with this component. {pronoun_cap} needs to focus on...
  element1,11,14,{name} showed some understanding. {pronoun_cap} should work on...
  element1,15,17,{name} demonstrated a good grasp. {pronoun_cap} effectively...
  element1,18,20,{name} excelled in this area. {possessive_cap} work was outstanding.
  element2,0,25,...
  ```

---

## Placeholders in comment_template

Replace these in the comment text (case-sensitive). Use student `gender` (M/F) to choose pronoun forms.

| Placeholder       | Replaced with                          |
|------------------|----------------------------------------|
| `{name}`         | Student’s name                         |
| `{pronoun}`      | `he` or `she`                          |
| `{pronoun_cap}`  | `He` or `She`                          |
| `{possessive}`   | `his` or `her`                         |
| `{possessive_cap}` | `His` or `Her`                       |
| `{object}`       | `him` or `her`                         |
| `{score}`        | Student’s raw score for that element   |
| `{max_score}`    | Max marks for that element (from bank) |
| `{percentage}`   | (score / max_score) × 100, 1 decimal   |

If `max_score` is 0, use a safe divisor so percentage is still a number (e.g. treat as 1 to avoid division by zero).

---

## Core logic (implement in JavaScript)

1. **Parse CSVs**  
   From file inputs, parse both CSVs into arrays of objects (one object per row, keys = column headers). Trim whitespace from headers and string cells. Validate required columns and types.

2. **Score columns**  
   From the students CSV, score columns = all column names except `name` and `gender`.

3. **Max marks per element**  
   From the comment bank only: for each `element` that appears in the comment bank, set `maxMarks[element] = max(row.max_marks for all rows where row.element === element)`. Use this for percentage and for `{max_score}` / `{percentage}`.

4. **For each student row**  
   - For each **score column** (element):  
     - Get the student’s raw **score** for that element.  
     - Find the **first** comment bank row where `element` matches and `min_marks ≤ score ≤ max_marks`.  
     - Take that row’s `comment_template`.  
     - Replace all placeholders using the student’s name, gender (M/F), score, max marks for that element, and computed percentage.  
     - Append the result to a list of “element comments” for this student.  
   - **Combined comment**: join all element comments with a single space and collapse multiple spaces (one combined comment per student).

5. **Percentages**  
   For each element: if `maxMarks[element] > 0`, percentage = round((score / maxMarks[element]) * 100, 1). Otherwise leave percentage empty or N/A for display.

6. **Overall percentage**  
   Optional: average of element percentages (only over elements that have max marks). Round to 1 decimal.

7. **Output structure**  
   One row per student. Columns: `name`, `gender`, then for each element `{element}_score` and `{element}_percent`, then **`comment`** (the single combined comment), then `overall_percent` (optional).

---

## UI requirements (Tailwind + HTML/JS)

- **File inputs**  
  Two file inputs (accept `.csv` or all): one for “Students CSV”, one for “Comment bank CSV”. Label each clearly.

- **Preview area**  
  After both files are loaded, show a short preview: e.g. number of students, column names from students CSV, and a few sample rows (scores + computed percentages using max marks from comment bank). Optionally show comment bank elements and their mark ranges. Use Tailwind for a simple card/section layout.

- **Generate button**  
  “Generate feedback” (or similar). Enabled when both CSVs are loaded. On click: run the logic above, then show results and enable download.

- **Progress / status**  
  While generating (e.g. in a loop), show a brief “Generating…” state. Then show “Generated for N students” or an error message. No server call.

- **Results**  
  - **View**: Show a list or table of students with name, scores/percentages per element, and the **single combined comment** per student. No need to show per-element comments in the UI if the spec is “one combined comment per student”.  
  - **Download**: Button “Download results CSV” that builds a CSV string from the output rows (with headers) and triggers a download (e.g. `Blob` + temporary `<a download>`). Filename e.g. `feedback-results.csv`.

- **Validation and errors**  
  - If students CSV is missing `name` or `gender`, or comment bank is missing `element`, `min_marks`, `max_marks`, or `comment_template`, show a clear error and do not generate.  
  - If any gender is not M/F, or any score is negative, or min_marks/max_marks are not numeric (or min_marks &lt; 0), show a short message and do not generate.  
  - All validation and parsing must happen in the browser.

---

## Output CSV format

Headers (example with three elements):

`name,gender,element1_score,element1_percent,element2_score,element2_percent,element3_score,element3_percent,comment,overall_percent`

Each data row: student name, gender, then for each element the raw score and percentage (or empty if no max marks), then the **one combined comment** for that student, then overall_percent (or empty). No per-element comment columns—only the single `comment` column.

---

## Copy and behaviour summary

- **Name**: “Student Feedback Generator” (or similar). Short description: “Upload a students CSV and a comment bank CSV; get one combined written comment per student, with scores and percentages. Runs in your browser; no data is sent to any server.”
- **Tone**: Professional, educational. Error messages should be clear and actionable (e.g. “Comment bank must include columns: element, min_marks, max_marks, comment_template”).
- **No server**: Emphasise in UI or short help text that files are processed locally and nothing is uploaded.

---

## Optional enhancements

- Allow editing the comment bank in the browser (e.g. textarea with CSV content, re-parse on “Apply”) before generating.
- Sample/downloadable example CSVs (students + comment bank) so users can try the tool immediately.
- Basic accessibility: focus states, aria-labels where helpful, and keyboard-friendly buttons.

Use this prompt to replicate the Student Feedback Generator as a browser-based education tool using Tailwind and JavaScript, with one combined comment per student and no server-side processing.
