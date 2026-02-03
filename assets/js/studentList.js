(function () {
  const rosterForm = document.getElementById("roster-form");
  if (!rosterForm) return;

  const rosterInput = document.getElementById("roster-input");
  const csvInput = document.getElementById("csv-input");
  const rosterFeedback = document.getElementById("roster-feedback");
  const rosterList = document.getElementById("roster-list");
  const resetQueueBtn = document.getElementById("reset-queue");
  const clearRosterBtn = document.getElementById("clear-roster");

  const countTotal = document.getElementById("count-total");
  const countReady = document.getElementById("count-ready");
  const countAsked = document.getElementById("count-asked");

  const selectBtn = document.getElementById("select-student");
  const markAskedBtn = document.getElementById("mark-asked");
  const skipBtn = document.getElementById("skip-student");
  const clearHistoryBtn = document.getElementById("clear-history");

  const currentStudentEl = document.getElementById("current-student");
  const selectionNote = document.getElementById("selection-note");
  const historyList = document.getElementById("history-list");

  const message = (text, isError = false) => {
    rosterFeedback.textContent = text;
    rosterFeedback.classList.remove("hidden");
    rosterFeedback.classList.toggle("text-primary", !isError);
    rosterFeedback.classList.toggle("text-rose-500", isError);
    window.clearTimeout(message.timeout);
    message.timeout = window.setTimeout(() => {
      rosterFeedback.classList.add("hidden");
    }, 3200);
  };

  const initialStudents = TeacherToolkit.storage.read("studentListRoster", []);
  const initialHistory = TeacherToolkit.storage.read("studentListHistory", []);

  let students = Array.isArray(initialStudents) ? initialStudents : [];
  let history = Array.isArray(initialHistory) ? initialHistory : [];
  let currentStudentId = null;

  const persist = () => {
    TeacherToolkit.storage.write("studentListRoster", students);
    TeacherToolkit.storage.write("studentListHistory", history);
  };

  const updateCounts = () => {
    const total = students.length;
    const ready = students.filter((student) => student.status === "ready").length;
    const asked = students.filter((student) => student.status === "asked").length;

    countTotal.textContent = total;
    countReady.textContent = ready;
    countAsked.textContent = asked;

    resetQueueBtn.disabled = asked === 0;
    selectBtn.disabled = ready === 0;
  };

  const renderHistory = () => {
    historyList.innerHTML = "";
    if (!history.length) {
      historyList.innerHTML = '<li class="text-slate-500">No selections yet.</li>';
      return;
    }
    history
      .slice()
      .reverse()
      .forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = `${entry.name} · ${new Date(entry.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
        historyList.appendChild(li);
      });
  };

  const makeBadge = (status) => {
    const badge = document.createElement("span");
    badge.className =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
    if (status === "ready") {
      badge.classList.add("bg-primary/10", "text-primary");
      badge.textContent = "Ready";
    } else if (status === "asked") {
      badge.classList.add("bg-slate-200", "text-slate-700");
      badge.textContent = "Asked";
    } else {
      badge.classList.add("bg-amber-100", "text-amber-700");
      badge.textContent = "Absent";
    }
    return badge;
  };

  const renderRoster = () => {
    rosterList.innerHTML = "";
    if (!students.length) {
      rosterList.innerHTML =
        '<p class="text-sm text-slate-500 p-4">Add students to see them listed with quick actions.</p>';
      updateCounts();
      selectBtn.disabled = true;
      markAskedBtn.disabled = true;
      skipBtn.disabled = true;
      currentStudentId = null;
      currentStudentEl.textContent = "Add students to begin";
      selectionNote.textContent = "No student selected yet.";
      return;
    }

    students.forEach((student) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between gap-4 p-4";

      const info = document.createElement("div");
      const name = document.createElement("p");
      name.className = "font-semibold text-slate-800";
      name.textContent = student.name;
      const statusText = document.createElement("p");
      statusText.className = "text-xs text-slate-500 flex items-center gap-2";
      statusText.append(makeBadge(student.status));
      info.append(name, statusText);

      const actions = document.createElement("div");
      actions.className = "flex flex-wrap gap-2 justify-end";

      const toggleAbsentBtn = document.createElement("button");
      toggleAbsentBtn.type = "button";
      toggleAbsentBtn.textContent = student.status === "absent" ? "Mark ready" : "Toggle absent";
      toggleAbsentBtn.className =
        "text-xs font-semibold text-slate-500 hover:text-primary";
      toggleAbsentBtn.addEventListener("click", () => {
        student.status = student.status === "absent" ? "ready" : "absent";
        if (currentStudentId === student.id && student.status !== "ready") {
          currentStudentId = null;
          markAskedBtn.disabled = true;
          skipBtn.disabled = true;
          selectionNote.textContent = "Selection cleared.";
        }
        persist();
        renderRoster();
      });

      const markAskedBtnRow = document.createElement("button");
      markAskedBtnRow.type = "button";
      markAskedBtnRow.textContent =
        student.status === "asked" ? "Mark ready" : "Mark asked";
      markAskedBtnRow.className =
        "text-xs font-semibold text-slate-500 hover:text-primary";
      markAskedBtnRow.addEventListener("click", () => {
        student.status = student.status === "asked" ? "ready" : "asked";
        persist();
        renderRoster();
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.className = "text-xs font-semibold text-rose-500 hover:text-rose-600";
      removeBtn.addEventListener("click", () => {
        students = students.filter((s) => s.id !== student.id);
        history = history.filter((entry) => entry.id !== student.id);
        persist();
        renderRoster();
        renderHistory();
      });

      actions.append(toggleAbsentBtn, markAskedBtnRow, removeBtn);
      row.append(info, actions);
      rosterList.appendChild(row);
    });

    updateCounts();
  };

  const parseNames = (raw) => {
    if (!raw) return [];
    return raw
      .split(/[\n,]/)
      .map((name) => name.trim())
      .filter(Boolean);
  };

  const addNames = (names) => {
    if (!names.length) {
      message("No names detected. Paste or upload a roster.", true);
      return;
    }
    const existingNames = new Set(students.map((student) => student.name.toLowerCase()));
    let added = 0;
    names.forEach((name) => {
      if (existingNames.has(name.toLowerCase())) return;
      students.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        name,
        status: "ready",
      });
      existingNames.add(name.toLowerCase());
      added += 1;
    });
    persist();
    renderRoster();
    if (added) {
      message(`Added ${added} ${added === 1 ? "student" : "students"}.`);
    } else {
      message("All of those names were already in the list.");
    }
  };

  const pickRandomStudent = () => {
    const readyStudents = students.filter((student) => student.status === "ready");
    if (!readyStudents.length) {
      selectionNote.textContent = "Everyone has been called. Reset the queue to start again.";
      markAskedBtn.disabled = true;
      skipBtn.disabled = true;
      return;
    }
    const next = readyStudents[Math.floor(Math.random() * readyStudents.length)];
    currentStudentId = next.id;
    currentStudentEl.textContent = next.name;
    selectionNote.textContent = "Ready to log response.";
    markAskedBtn.disabled = false;
    skipBtn.disabled = false;
  };

  const recordAsked = () => {
    if (!currentStudentId) return;
    const student = students.find((item) => item.id === currentStudentId);
    if (!student) return;
    student.status = "asked";
    history.push({ id: student.id, name: student.name, timestamp: Date.now() });
    currentStudentId = null;
    markAskedBtn.disabled = true;
    skipBtn.disabled = true;
    persist();
    renderRoster();
    renderHistory();
    currentStudentEl.textContent = "Select another student";
    selectionNote.textContent = "Student logged as asked.";
  };

  const clearSelection = () => {
    currentStudentId = null;
    markAskedBtn.disabled = true;
    skipBtn.disabled = true;
    currentStudentEl.textContent = "Selection skipped";
    selectionNote.textContent = "Pick another student when ready.";
  };

  rosterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const names = parseNames(rosterInput.value);
    addNames(names);
    rosterInput.value = "";
  });

  csvInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const names = parseNames(text);
    addNames(names);
    csvInput.value = "";
  });

  clearRosterBtn.addEventListener("click", () => {
    students = [];
    history = [];
    currentStudentId = null;
    persist();
    renderRoster();
    renderHistory();
    message("Roster cleared.");
  });

  resetQueueBtn.addEventListener("click", () => {
    let resetCount = 0;
    students.forEach((student) => {
      if (student.status === "asked") {
        student.status = "ready";
        resetCount += 1;
      }
    });
    persist();
    renderRoster();
    selectionNote.textContent = "Queue reset. Everyone is available again.";
    message(`Reset ${resetCount} students to ready.`);
  });

  selectBtn.addEventListener("click", pickRandomStudent);
  markAskedBtn.addEventListener("click", recordAsked);
  skipBtn.addEventListener("click", () => {
    clearSelection();
    pickRandomStudent();
  });

  clearHistoryBtn.addEventListener("click", () => {
    history = [];
    persist();
    renderHistory();
    message("History cleared.");
  });

  renderRoster();
  renderHistory();
})();
