/**
 * Student Feedback Generator
 * Upload students CSV + comment bank CSV; generate one combined comment per student.
 * Runs entirely in the browser. No data sent to any server.
 */
(function () {
  const studentsInput = document.getElementById("students-file");
  const commentbankInput = document.getElementById("commentbank-file");
  const previewArea = document.getElementById("preview-area");
  const previewSummary = document.getElementById("preview-summary");
  const previewElements = document.getElementById("preview-elements");
  const generateBtn = document.getElementById("generate-btn");
  const statusEl = document.getElementById("status");
  const resultsArea = document.getElementById("results-area");
  const resultsEmpty = document.getElementById("results-empty");
  const resultsSummary = document.getElementById("results-summary");
  const resultsList = document.getElementById("results-list");
  const downloadBtn = document.getElementById("download-btn");
  const sampleStudentsLink = document.getElementById("sample-students");
  const sampleCommentbankLink = document.getElementById("sample-commentbank");

  // Comment bank builder elements
  const cbElementInput = document.getElementById("cb-element");
  const cbMinInput = document.getElementById("cb-min");
  const cbMaxInput = document.getElementById("cb-max");
  const cbTemplateInput = document.getElementById("cb-template");
  const cbAddRowBtn = document.getElementById("cb-add-row");
  const cbClearBtn = document.getElementById("cb-clear");
  const cbDownloadBtn = document.getElementById("cb-download");
  const cbLoadBtn = document.getElementById("cb-load");
  const cbRowsTbody = document.getElementById("cb-rows");
  const cbStatusEl = document.getElementById("cb-status");
  const cbCharCountEl = document.getElementById("cb-char-count");

  if (!studentsInput || !commentbankInput) return;

  let studentsData = null;
  let commentbankData = null;
  let lastResults = null;

  // Local builder state (for comment bank builder UI)
  const builderRows = [];

  const setStatus = (message, isError = false) => {
    statusEl.textContent = message;
    statusEl.classList.toggle("text-rose-500", isError);
    statusEl.classList.toggle("text-slate-500", !isError);
  };

  const setBuilderStatus = (message, isError = false) => {
    if (!cbStatusEl) return;
    cbStatusEl.textContent = message;
    cbStatusEl.classList.toggle("text-rose-500", isError);
    cbStatusEl.classList.toggle("text-slate-500", !isError);
  };

  const CB_MAX_CHARS = 620;

  function updateBuilderCharCount() {
    if (!cbTemplateInput || !cbCharCountEl) return;
    const len = cbTemplateInput.value.length;
    cbCharCountEl.textContent = String(len);
    const over = len > CB_MAX_CHARS;
    cbCharCountEl.classList.toggle("text-rose-600", over);
    cbCharCountEl.classList.toggle("text-slate-600", !over);
  }

  /**
   * Parse CSV text into array of objects. Handles quoted fields.
   */
  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((h, j) => {
        row[h] = values[j] !== undefined ? String(values[j]).trim() : "";
      });
      rows.push(row);
    }
    return rows;
  }

  function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuotes)) {
        result.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    result.push(current.trim());
    return result;
  }

  function validateStudents(rows) {
    if (!rows.length) return "Students CSV has no data rows.";
    const first = rows[0];
    const keys = Object.keys(first);
    if (!keys.includes("name")) return "Students CSV must include a 'name' column.";
    if (!keys.includes("gender")) return "Students CSV must include a 'gender' column.";
    const scoreColumns = keys.filter((k) => k !== "name" && k !== "gender");
    if (scoreColumns.length === 0) return "Students CSV must have at least one score column (besides name and gender).";
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const g = String(row.gender || "").toUpperCase();
      if (g !== "M" && g !== "F") return `Row ${i + 2}: gender must be M or F (got "${row.gender}").`;
      for (const col of scoreColumns) {
        const val = row[col];
        const num = parseFloat(val);
        if (val !== "" && (Number.isNaN(num) || num < 0))
          return `Row ${i + 2}, column "${col}": score must be a non-negative number.`;
      }
    }
    return null;
  }

  const COMMENTBANK_REQUIRED = ["element", "min_marks", "max_marks", "comment_template"];

  function validateCommentbank(rows) {
    if (!rows.length) return "Comment bank CSV has no data rows.";
    const first = rows[0];
    const keys = Object.keys(first);
    for (const req of COMMENTBANK_REQUIRED) {
      if (!keys.includes(req)) return `Comment bank must include columns: element, min_marks, max_marks, comment_template. Missing: ${req}.`;
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const minM = parseFloat(row.min_marks);
      const maxM = parseFloat(row.max_marks);
      if (Number.isNaN(minM) || minM < 0) return `Comment bank row ${i + 2}: min_marks must be a non-negative number.`;
      if (Number.isNaN(maxM) || maxM < 0) return `Comment bank row ${i + 2}: max_marks must be a non-negative number.`;
      if (minM > maxM) return `Comment bank row ${i + 2}: min_marks must not exceed max_marks.`;
    }
    return null;
  }

  function getScoreColumns(studentsRows) {
    const keys = Object.keys(studentsRows[0] || {});
    return keys.filter((k) => k !== "name" && k !== "gender");
  }

  function getMaxMarksPerElement(commentbankRows) {
    const maxByElement = {};
    for (const row of commentbankRows) {
      const el = String(row.element || "").trim();
      const maxM = parseFloat(row.max_marks);
      if (Number.isNaN(maxM)) continue;
      if (maxByElement[el] == null || maxM > maxByElement[el]) maxByElement[el] = maxM;
    }
    return maxByElement;
  }

  const PRONOUNS = {
    M: { pronoun: "he", pronoun_cap: "He", possessive: "his", possessive_cap: "His", object: "him" },
    F: { pronoun: "she", pronoun_cap: "She", possessive: "her", possessive_cap: "Her", object: "her" },
  };

  function replacePlaceholders(template, name, gender, score, maxScore) {
    const safeMax = maxScore > 0 ? maxScore : 1;
    const percentage = maxScore > 0 ? ((score / maxScore) * 100).toFixed(1) : "";
    const pro = PRONOUNS[gender] || PRONOUNS.M;
    return template
      .replace(/\{name\}/g, name)
      .replace(/\{pronoun\}/g, pro.pronoun)
      .replace(/\{pronoun_cap\}/g, pro.pronoun_cap)
      .replace(/\{possessive\}/g, pro.possessive)
      .replace(/\{possessive_cap\}/g, pro.possessive_cap)
      .replace(/\{object\}/g, pro.object)
      .replace(/\{score\}/g, String(score))
      .replace(/\{max_score\}/g, String(maxScore))
      .replace(/\{percentage\}/g, percentage);
  }

  function findMatchingComment(commentbankRows, element, score) {
    const numScore = parseFloat(score);
    if (Number.isNaN(numScore) || numScore < 0) return null;
    for (const r of commentbankRows) {
      if (String(r.element || "").trim() !== element) continue;
      const minM = parseFloat(r.min_marks);
      const maxM = parseFloat(r.max_marks);
      if (Number.isNaN(minM) || Number.isNaN(maxM)) continue;
      if (numScore >= minM && numScore <= maxM) return r;
    }
    return null;
  }

  function generateFeedback(studentsRows, commentbankRows, scoreColumns, maxMarks) {
    const results = [];
    for (const student of studentsRows) {
      const fullName = String(student.name || "").trim();
      const name = fullName.includes(" ") ? fullName.split(" ")[0] : fullName;
      const gender = (String(student.gender || "").toUpperCase() === "F" ? "F" : "M");
      const elementComments = [];
      const outRow = { name: fullName, gender };
      let percentSum = 0;
      let percentCount = 0;

      for (const col of scoreColumns) {
        const rawScore = student[col];
        const score = parseFloat(rawScore);
        const maxScore = maxMarks[col] != null ? maxMarks[col] : 0;
        const safeMax = maxScore > 0 ? maxScore : 1;
        const percent = maxScore > 0 ? ((score / maxScore) * 100).toFixed(1) : "";
        if (maxScore > 0 && !Number.isNaN(score)) {
          percentSum += score / safeMax * 100;
          percentCount += 1;
        }
        outRow[`${col}_score`] = rawScore;
        outRow[`${col}_percent`] = percent;

        const match = findMatchingComment(commentbankRows, col, rawScore);
        if (match && match.comment_template) {
          const text = replacePlaceholders(
            match.comment_template,
            name,
            gender,
            Number.isNaN(score) ? 0 : score,
            maxScore
          );
          elementComments.push(text);
        }
      }

      outRow.comment = elementComments.join(" ").replace(/\s+/g, " ").trim();
      outRow.overall_percent = percentCount > 0 ? (percentSum / percentCount).toFixed(1) : "";
      results.push(outRow);
    }
    return results;
  }

  function refreshPreview() {
    if (!studentsData || !commentbankData) {
      previewArea.classList.add("hidden");
      generateBtn.disabled = true;
      setStatus("Load both CSV files to enable generation.");
      return;
    }
    const errStudents = validateStudents(studentsData);
    const errBank = validateCommentbank(commentbankData);
    if (errStudents) {
      setStatus(errStudents, true);
      previewArea.classList.add("hidden");
      generateBtn.disabled = true;
      return;
    }
    if (errBank) {
      setStatus(errBank, true);
      previewArea.classList.add("hidden");
      generateBtn.disabled = true;
      return;
    }
    const scoreCols = getScoreColumns(studentsData);
    const maxMarks = getMaxMarksPerElement(commentbankData);
    previewSummary.textContent = `${studentsData.length} student(s). Score columns: ${scoreCols.join(", ")}.`;
    const elementsList = Object.keys(maxMarks).length ? Object.entries(maxMarks).map(([el, max]) => `${el} (max ${max})`).join("; ") : "—";
    previewElements.textContent = `Max marks from comment bank: ${elementsList}`;
    previewArea.classList.remove("hidden");
    generateBtn.disabled = false;
    setStatus("Both files loaded. Click “Generate feedback” to create comments.");
  }

  function runGenerate() {
    if (!studentsData || !commentbankData) return;
    const errStudents = validateStudents(studentsData);
    const errBank = validateCommentbank(commentbankData);
    if (errStudents) {
      setStatus(errStudents, true);
      return;
    }
    if (errBank) {
      setStatus(errBank, true);
      return;
    }
    setStatus("Generating…");
    generateBtn.disabled = true;
    setTimeout(() => {
      const scoreColumns = getScoreColumns(studentsData);
      const maxMarks = getMaxMarksPerElement(commentbankData);
      const results = generateFeedback(studentsData, commentbankData, scoreColumns, maxMarks);
      lastResults = results;
      resultsEmpty.classList.add("hidden");
      resultsArea.classList.remove("hidden");
      resultsSummary.textContent = `Generated for ${results.length} student(s).`;
      resultsList.innerHTML = "";
      for (const row of results) {
        const card = document.createElement("div");
        card.className = "p-4 space-y-2";
        const nameEl = document.createElement("p");
        nameEl.className = "font-semibold text-dark";
        nameEl.textContent = row.name;
        const commentEl = document.createElement("p");
        commentEl.className = "text-sm text-slate-600";
        commentEl.textContent = row.comment || "(No comment generated)";
        card.append(nameEl, commentEl);
        resultsList.appendChild(card);
      }
      setStatus(`Generated for ${results.length} student(s).`);
      generateBtn.disabled = false;
    }, 50);
  }

  function downloadResultsCSV() {
    if (!lastResults || lastResults.length === 0) return;
    const headers = Object.keys(lastResults[0]);
    const escape = (v) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.map(escape).join(",")];
    for (const row of lastResults) {
      lines.push(headers.map((h) => escape(row[h])).join(","));
    }
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback-results.csv";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Results downloaded as feedback-results.csv.");
  }

  // --- Comment bank builder helpers ---

  function renderBuilderRows() {
    if (!cbRowsTbody) return;
    cbRowsTbody.innerHTML = "";
    if (!builderRows.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "px-3 py-3 text-center text-slate-500 italic";
      td.textContent = "No rows yet. Add element ranges and comments, then download or load into the generator.";
      tr.appendChild(td);
      cbRowsTbody.appendChild(tr);
      return;
    }
    builderRows.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-3 py-2 text-sm text-slate-700">${row.element}</td>
        <td class="px-3 py-2 text-sm text-slate-700 text-right">${row.min_marks}</td>
        <td class="px-3 py-2 text-sm text-slate-700 text-right">${row.max_marks}</td>
        <td class="px-3 py-2 text-sm text-slate-600">${row.comment_template}</td>
        <td class="px-3 py-2 text-right">
          <button type="button" data-cb-remove="${index}" class="text-xs text-rose-500 hover:text-rose-600">
            Remove
          </button>
        </td>
      `;
      cbRowsTbody.appendChild(tr);
    });
  }

  function handleBuilderAddRow() {
    if (!cbElementInput || !cbMinInput || !cbMaxInput || !cbTemplateInput) return;
    const element = cbElementInput.value.trim();
    const minStr = cbMinInput.value.trim();
    const maxStr = cbMaxInput.value.trim();
    const template = cbTemplateInput.value.trim();

    if (!element || !minStr || !maxStr || !template) {
      setBuilderStatus("Please fill element, min, max, and comment.", true);
      return;
    }
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);
    if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < 0) {
      setBuilderStatus("Min and max must be non-negative numbers.", true);
      return;
    }
    if (min > max) {
      setBuilderStatus("Min marks must not exceed max marks.", true);
      return;
    }
    if (template.length > CB_MAX_CHARS) {
      setBuilderStatus(`Comment template exceeds ${CB_MAX_CHARS} character limit.`, true);
      return;
    }
    builderRows.push({
      element,
      min_marks: min,
      max_marks: max,
      comment_template: template,
    });
    cbElementInput.value = "";
    cbMinInput.value = "";
    cbMaxInput.value = "";
    cbTemplateInput.value = "";
    setBuilderStatus("Row added.");
    renderBuilderRows();
  }

  function handleBuilderClear() {
    if (!builderRows.length) {
      setBuilderStatus("Nothing to clear.", true);
      return;
    }
    builderRows.length = 0;
    renderBuilderRows();
    setBuilderStatus("All rows cleared.");
  }

  function handleBuilderDownload() {
    if (!builderRows.length) {
      setBuilderStatus("Add at least one row before downloading.", true);
      return;
    }
    const escape = (v) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const headers = ["element", "min_marks", "max_marks", "comment_template"];
    const lines = [headers.join(",")];
    for (const row of builderRows) {
      lines.push(headers.map((h) => escape(row[h])).join(","));
    }
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comment-bank.csv";
    a.click();
    URL.revokeObjectURL(url);
    setBuilderStatus("Comment bank downloaded as comment-bank.csv.");
  }

  function handleBuilderLoadIntoGenerator() {
    if (!builderRows.length) {
      setBuilderStatus("Add at least one row before loading into the generator.", true);
      return;
    }
    commentbankData = builderRows.map((row) => ({
      element: row.element,
      min_marks: String(row.min_marks),
      max_marks: String(row.max_marks),
      comment_template: row.comment_template,
    }));
    setStatus("Comment bank loaded from builder. Now upload a students CSV.", false);
    setBuilderStatus("Loaded into generator.");
    if (studentsData) {
      refreshPreview();
    }
  }

  const SAMPLE_STUDENTS = `name,gender,element1,element2,element3
John Smith,M,17,36,45
Sarah Jones,F,13,44,35
Alex Brown,M,15,40,38`;

  const SAMPLE_COMMENTBANK = `element,min_marks,max_marks,comment_template
element1,0,10,{name} struggled with this component. {pronoun_cap} needs to focus on revision.
element1,11,14,{name} showed some understanding. {pronoun_cap} should work on weaker areas.
element1,15,17,{name} demonstrated a good grasp. {pronoun_cap} effectively applied the concepts.
element1,18,20,{name} excelled in this area. {possessive_cap} work was outstanding.
element2,0,25,{name} found this section challenging ({score}/{max_score}, {percentage}%).
element2,26,35,{name} performed adequately. {pronoun_cap} could aim higher with more practice.
element2,36,45,{name} did very well here. {possessive_cap} result of {score}/{max_score} reflects strong understanding.
element3,0,30,{name} needs to revisit this topic.
element3,31,40,{name} showed good progress. {pronoun_cap} is on the right track.
element3,41,50,{name} achieved an excellent result ({percentage}%).`;

  function initSampleDownloads() {
    if (sampleStudentsLink) {
      const blob = new Blob([SAMPLE_STUDENTS], { type: "text/csv;charset=utf-8" });
      sampleStudentsLink.href = URL.createObjectURL(blob);
    }
    if (sampleCommentbankLink) {
      const blob = new Blob([SAMPLE_COMMENTBANK], { type: "text/csv;charset=utf-8" });
      sampleCommentbankLink.href = URL.createObjectURL(blob);
    }
  }

  studentsInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      studentsData = null;
      refreshPreview();
      return;
    }
    try {
      const text = await file.text();
      studentsData = parseCSV(text);
      setStatus("Students CSV loaded.");
      refreshPreview();
    } catch (err) {
      setStatus("Could not read students file.", true);
      studentsData = null;
      refreshPreview();
    }
  });

  commentbankInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      commentbankData = null;
      refreshPreview();
      return;
    }
    try {
      const text = await file.text();
      commentbankData = parseCSV(text);
      setStatus("Comment bank CSV loaded.");
      refreshPreview();
    } catch (err) {
      setStatus("Could not read comment bank file.", true);
      commentbankData = null;
      refreshPreview();
    }
  });

  generateBtn.addEventListener("click", runGenerate);
  downloadBtn.addEventListener("click", downloadResultsCSV);
  initSampleDownloads();

  // Wire up comment bank builder (if present on this page)
  if (cbRowsTbody) {
    renderBuilderRows();
    cbRowsTbody.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.matches("button[data-cb-remove]")) {
        const index = parseInt(target.getAttribute("data-cb-remove"), 10);
        if (!Number.isNaN(index)) {
          builderRows.splice(index, 1);
          renderBuilderRows();
          setBuilderStatus("Row removed.");
        }
      }
    });
  }
  if (cbAddRowBtn) cbAddRowBtn.addEventListener("click", handleBuilderAddRow);
  if (cbClearBtn) cbClearBtn.addEventListener("click", handleBuilderClear);
  if (cbDownloadBtn) cbDownloadBtn.addEventListener("click", handleBuilderDownload);
  if (cbLoadBtn) cbLoadBtn.addEventListener("click", handleBuilderLoadIntoGenerator);

  // Shortcode copy buttons in the builder guide
  const shortcodeButtons = document.querySelectorAll("[data-shortcode-copy]");
  if (shortcodeButtons.length) {
    shortcodeButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const code = btn.getAttribute("data-shortcode-copy");
        if (!code) return;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(code);
          } else {
            const ta = document.createElement("textarea");
            ta.value = code;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          }
          setBuilderStatus(`Copied ${code} to clipboard.`);
        } catch (err) {
          setBuilderStatus("Could not copy to clipboard.", true);
        }
      });
    });
  }

  if (cbTemplateInput && cbCharCountEl) {
    cbTemplateInput.addEventListener("input", updateBuilderCharCount);
    updateBuilderCharCount();
  }
})();
