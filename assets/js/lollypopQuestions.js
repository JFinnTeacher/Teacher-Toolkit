/**
 * Lollypop Questions: random pairing tool
 * - Import roster
 * - Pick responder and questioner
 * - Track single-use refusals and round outcomes
 * - Reset state on reload (no persistence)
 */
(function () {
  const rosterForm = document.getElementById("roster-form");
  if (!rosterForm) return;

  const rosterInput = document.getElementById("roster-input");
  const csvInput = document.getElementById("csv-input");
  const rosterFeedback = document.getElementById("roster-feedback");
  const rosterList = document.getElementById("roster-list");
  const clearRosterBtn = document.getElementById("clear-roster");
  const resetRoundBtn = document.getElementById("reset-round");

  const countActive = document.getElementById("count-active");
  const countComplete = document.getElementById("count-complete");
  const countRefusal = document.getElementById("count-refusal");

  const pickResponderBtn = document.getElementById("pick-responder");
  const pickQuestionerBtn = document.getElementById("pick-questioner");
  const responderRefuseBtn = document.getElementById("responder-refuse");
  const questionerRefuseBtn = document.getElementById("questioner-refuse");
  const responderName = document.getElementById("responder-name");
  const questionerName = document.getElementById("questioner-name");
  const responderNote = document.getElementById("responder-note");
  const questionerNote = document.getElementById("questioner-note");

  const markResponderSuccessBtn = document.getElementById("mark-responder-success");
  const markQuestionerSuccessBtn = document.getElementById("mark-questioner-success");
  const markNoResultBtn = document.getElementById("mark-no-result");
  const roundStatus = document.getElementById("round-status");

  const historyList = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history");
  const classSelect = document.querySelector("[data-classlist-select]");
  const classSaveBtn = document.querySelector("[data-classlist-sync]");
  const toolkit = window.TeacherToolkit;
  const classLists = toolkit && toolkit.classLists ? toolkit.classLists : null;
  const randomId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  let students = [];
  let history = [];
  const round = { responderId: null, questionerId: null };
  let lastClassSelection = "";

  const rosterNamesFromState = () =>
    Array.from(
      new Set(
        students
          .map((student) => student.name.trim())
          .filter((name) => name.length > 0),
      ),
    );

  const updateSaveButtonState = () => {
    if (!classSaveBtn) return;
    classSaveBtn.disabled = !classSelect || !classSelect.value;
  };

  const setRosterMessage = (message, isError = false) => {
    rosterFeedback.textContent = message;
    rosterFeedback.classList.remove("hidden");
    rosterFeedback.classList.toggle("text-primary", !isError);
    rosterFeedback.classList.toggle("text-rose-500", isError);
    window.clearTimeout(setRosterMessage.timeout);
    setRosterMessage.timeout = window.setTimeout(() => {
      rosterFeedback.classList.add("hidden");
    }, 3200);
  };

  const parseNames = (raw) =>
    raw
      .split(/[\n,]/)
      .map((name) => name.trim())
      .filter(Boolean);

  const getStudent = (id) => students.find((student) => student.id === id) || null;

  const ensureClassListExists = (id) => {
    if (!classLists) return null;
    const data = classLists.read();
    return data.lists.find((item) => item.id === id) || null;
  };

  const populateClassSelect = (options = {}) => {
    if (!classSelect || !classLists) return;
    const { shouldLoad = false, skipConfirm = false } = options;
    const data = classLists.read();
    const prevValue = classSelect.value;
    classSelect.innerHTML = `<option value="">Select a saved class…</option>`;
    data.lists.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} (${item.students.length})`;
      classSelect.appendChild(option);
    });
    classSelect.disabled = data.lists.length === 0;
    const selectedId = data.lastSelectedId && ensureClassListExists(data.lastSelectedId)
      ? data.lastSelectedId
      : "";
    classSelect.value = selectedId;
    lastClassSelection = selectedId;
    updateSaveButtonState();
    if (
      shouldLoad &&
      selectedId &&
      (!students.length || skipConfirm)
    ) {
      loadClassList(selectedId, { silent: true, skipConfirm });
    } else if (!selectedId) {
      updateSaveButtonState();
    } else {
      classSelect.value = selectedId;
    }
  };

  const loadClassList = (id, { silent = false, skipConfirm = false } = {}) => {
    if (!classLists || !id) return false;
    const list = ensureClassListExists(id);
    if (!list) {
      setRosterMessage("Selected class list no longer exists.", true);
      populateClassSelect();
      return false;
    }
    if (!skipConfirm && students.length) {
      const proceed = window.confirm(
        "Replace the current roster with the selected class list?",
      );
      if (!proceed) {
        classSelect.value = lastClassSelection;
        updateSaveButtonState();
        return false;
      }
    }
    students = list.students.map((name) => ({
      id: randomId(),
      name,
      status: "active",
      refusalUsed: false,
    }));
    history = [];
    historyList.innerHTML =
      '<li data-empty="true" class="text-slate-500">No rounds recorded yet.</li>';
    resetRound();
    renderRoster();
    updateRoundUI();
    roundStatus.textContent = "Awaiting selections.";
    if (!silent) {
      setRosterMessage(
        `Loaded ${list.students.length} ${
          list.students.length === 1 ? "student" : "students"
        } from "${list.name}".`,
      );
    }
    classLists.setLastSelected(id);
    lastClassSelection = id;
    updateSaveButtonState();
    return true;
  };

  const updateCounts = () => {
    const active = students.filter((student) => student.status === "active").length;
    const complete = students.filter((student) => student.status === "completed").length;
    const refused = students.filter((student) => student.refusalUsed).length;
    countActive.textContent = active;
    countComplete.textContent = complete;
    countRefusal.textContent = refused;
  };

  const makeBadge = (text, variant) => {
    const badge = document.createElement("span");
    badge.className =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
    switch (variant) {
      case "active":
        badge.classList.add("bg-primary/10", "text-primary");
        break;
      case "completed":
        badge.classList.add("bg-emerald-100", "text-emerald-700");
        break;
      case "refusal":
        badge.classList.add("bg-amber-100", "text-amber-700");
        break;
      default:
        badge.classList.add("bg-slate-200", "text-slate-700");
    }
    badge.textContent = text;
    return badge;
  };

  const renderRoster = () => {
    rosterList.innerHTML = "";
    if (!students.length) {
      rosterList.innerHTML =
        '<p class="text-sm text-slate-500 p-4">Add students to see status, refusal usage, and results here.</p>';
      updateCounts();
      return;
    }

    students.forEach((student) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between gap-4 p-4";

      const info = document.createElement("div");
      const name = document.createElement("p");
      name.className = "font-semibold text-slate-800";
      name.textContent = student.name;
      const meta = document.createElement("div");
      meta.className = "flex flex-wrap gap-2 text-xs text-slate-500";
      meta.appendChild(makeBadge(student.status === "active" ? "Active" : "Complete", student.status));
      if (student.refusalUsed && student.status === "active") {
        meta.appendChild(makeBadge("Refusal used", "refusal"));
      }
      info.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "flex flex-wrap gap-2 justify-end";

      if (student.status === "completed") {
        const restoreBtn = document.createElement("button");
        restoreBtn.type = "button";
        restoreBtn.className = "text-xs font-semibold text-primary";
        restoreBtn.textContent = "Return to active";
        restoreBtn.addEventListener("click", () => {
          student.status = "active";
          renderRoster();
          updateCounts();
        });
        actions.appendChild(restoreBtn);
      }

      if (student.refusalUsed) {
        const resetRefusalBtn = document.createElement("button");
        resetRefusalBtn.type = "button";
        resetRefusalBtn.className = "text-xs font-semibold text-slate-500 hover:text-primary";
        resetRefusalBtn.textContent = "Reset refusal";
        resetRefusalBtn.addEventListener("click", () => {
          student.refusalUsed = false;
          renderRoster();
          updateCounts();
          roundStatus.textContent = `${student.name}'s refusal has been reset.`;
        });
        actions.appendChild(resetRefusalBtn);
      }

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "text-xs font-semibold text-rose-500 hover:text-rose-600";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        students = students.filter((entry) => entry.id !== student.id);
        if (round.responderId === student.id) round.responderId = null;
        if (round.questionerId === student.id) round.questionerId = null;
        renderRoster();
        updateCounts();
        updateRoundUI();
      });
      actions.appendChild(removeBtn);

      row.append(info, actions);
      rosterList.appendChild(row);
    });

    updateCounts();
    updateSaveButtonState();
  };

  const eligibleStudents = (excludeId = null) =>
    students.filter((student) => student.status === "active" && student.id !== excludeId);

  const resetRole = (role) => {
    if (role === "responder") {
      round.responderId = null;
    } else {
      round.questionerId = null;
    }
  };

  const updateRoleDisplay = (role) => {
    const id = role === "responder" ? round.responderId : round.questionerId;
    const nameEl = role === "responder" ? responderName : questionerName;
    const noteEl = role === "responder" ? responderNote : questionerNote;
    const refuseBtn = role === "responder" ? responderRefuseBtn : questionerRefuseBtn;
    const pickBtn = role === "responder" ? pickResponderBtn : pickQuestionerBtn;
    const otherId = role === "responder" ? round.questionerId : round.responderId;

    if (!id) {
      nameEl.textContent = "Not selected";
      noteEl.textContent = "—";
      refuseBtn.disabled = true;
      pickBtn.disabled = role === "questioner"
        ? round.responderId === null || eligibleStudents(otherId).length === 0
        : students.filter((student) => student.status === "active").length === 0;
      return;
    }

    const student = getStudent(id);
    if (!student) {
      resetRole(role);
      nameEl.textContent = "Not selected";
      noteEl.textContent = "—";
      refuseBtn.disabled = true;
      pickBtn.disabled = false;
      return;
    }

    nameEl.textContent = student.name;
    if (student.refusalUsed) {
      noteEl.textContent = "Refusal already used.";
      refuseBtn.disabled = true;
    } else {
      noteEl.textContent = "Refusal available.";
      refuseBtn.disabled = false;
    }
    pickBtn.disabled = false;
  };

  const updateOutcomeButtons = () => {
    const ready = Boolean(round.responderId && round.questionerId);
    markResponderSuccessBtn.disabled = !ready;
    markQuestionerSuccessBtn.disabled = !ready;
    markNoResultBtn.disabled = !ready;
  };

  const updateRoundUI = () => {
    updateRoleDisplay("responder");
    updateRoleDisplay("questioner");
    updateOutcomeButtons();
    if (!round.responderId && !round.questionerId) {
      roundStatus.textContent = "Awaiting selections.";
    }
  };

  const selectRandomStudent = (role) => {
    const otherId = role === "responder" ? round.questionerId : round.responderId;
    const pool = eligibleStudents(otherId);
    if (!pool.length) {
      roundStatus.textContent =
        "No eligible students available. Check that enough students remain active.";
      return;
    }
    const student = pool[Math.floor(Math.random() * pool.length)];
    if (role === "responder") {
      round.responderId = student.id;
      pickQuestionerBtn.disabled = eligibleStudents(student.id).length === 0;
      questionerNote.textContent =
        eligibleStudents(student.id).length === 0
          ? "Need another active student before selecting."
          : "Ready to select.";
    } else {
      round.questionerId = student.id;
    }
    roundStatus.textContent = `${student.name} selected as ${role}.`;
    updateRoundUI();
  };

  const handleRefusal = (role) => {
    const id = role === "responder" ? round.responderId : round.questionerId;
    if (!id) return;
    const student = getStudent(id);
    if (!student) return;
    if (student.refusalUsed) {
      roundStatus.textContent = `${student.name} has already used their refusal.`;
      updateRoundUI();
      return;
    }
    student.refusalUsed = true;
    roundStatus.textContent = `${student.name} used their one refusal. Selecting a replacement.`;
    updateCounts();
    resetRole(role);
    updateRoundUI();
    selectRandomStudent(role);
  };

  const addHistoryEntry = (result) => {
    const responder = getStudent(result.responderId);
    const questioner = getStudent(result.questionerId);
    if (historyList.firstElementChild?.dataset?.empty === "true") {
      historyList.innerHTML = "";
    }
    const item = document.createElement("li");
    item.innerHTML = `<span class="font-semibold text-slate-700">${
      responder ? responder.name : "Unknown"
    }</span> ↔ <span class="font-semibold text-slate-700">${
      questioner ? questioner.name : "Unknown"
    }</span> • ${result.outcome}`;
    historyList.prepend(item);
  };

  function resetRound() {
    round.responderId = null;
    round.questionerId = null;
    responderNote.textContent = "—";
    questionerNote.textContent = "—";
    updateRoundUI();
  }

  const resolveRound = (winnerRole) => {
    if (!round.responderId || !round.questionerId) return;
    const responder = getStudent(round.responderId);
    const questioner = getStudent(round.questionerId);
    if (!responder || !questioner) {
      resetRound();
      return;
    }

    if (winnerRole === "responder") {
      responder.status = "completed";
      roundStatus.textContent = `${responder.name} succeeded and leaves the rotation. ${questioner.name} returns to the pool.`;
    } else if (winnerRole === "questioner") {
      questioner.status = "completed";
      roundStatus.textContent = `${questioner.name} succeeded and leaves the rotation. ${responder.name} returns to the pool.`;
    } else {
      roundStatus.textContent = "No winner recorded. Both students return to the pool.";
    }

    history.unshift({
      responderId: responder.id,
      questionerId: questioner.id,
      outcome:
        winnerRole === "responder"
          ? `${responder.name} succeeded`
          : winnerRole === "questioner"
          ? `${questioner.name} succeeded`
          : "No winner",
      timestamp: Date.now(),
    });
    addHistoryEntry(history[0]);
    renderRoster();
    updateCounts();
    resetRound();
  };

  const addNamesToRoster = (names) => {
    if (!names.length) {
      setRosterMessage("No names detected. Paste or upload a roster.", true);
      return;
    }
    const seen = new Set(students.map((student) => student.name.toLowerCase()));
    let added = 0;
    names.forEach((name) => {
      if (seen.has(name.toLowerCase())) return;
      students.push({
        id: randomId(),
        name,
        status: "active",
        refusalUsed: false,
      });
      seen.add(name.toLowerCase());
      added += 1;
    });
    if (added) {
      setRosterMessage(`Added ${added} ${added === 1 ? "student" : "students"}.`);
    } else {
      setRosterMessage("All of those names were already listed.");
    }
    renderRoster();
    updateRoundUI();
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const names = parseNames(rosterInput.value);
    rosterInput.value = "";
    addNamesToRoster(names);
  };

  const handleCsvImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      addNamesToRoster(parseNames(text));
    } catch (error) {
      setRosterMessage("Unable to read CSV file.", true);
    } finally {
      csvInput.value = "";
    }
  };

  const clearRoster = () => {
    students = [];
    history = [];
    historyList.innerHTML =
      '<li data-empty="true" class="text-slate-500">No rounds recorded yet.</li>';
    resetRound();
    renderRoster();
    updateCounts();
    setRosterMessage("Roster cleared.");
    roundStatus.textContent = "Awaiting selections.";
  };

  const clearHistory = () => {
    history = [];
    historyList.innerHTML =
      '<li data-empty="true" class="text-slate-500">No rounds recorded yet.</li>';
    roundStatus.textContent = "History cleared.";
  };

  if (classSelect && classLists) {
    populateClassSelect({ shouldLoad: true, skipConfirm: true });

    classSelect.addEventListener("change", () => {
      const newId = classSelect.value;
      if (!newId) {
        lastClassSelection = "";
        updateSaveButtonState();
        return;
      }
      const loaded = loadClassList(newId);
      if (!loaded) {
        classSelect.value = lastClassSelection;
      }
    });

    classSaveBtn?.addEventListener("click", () => {
      const targetId = classSelect.value;
      if (!targetId) {
        setRosterMessage("Select a class list to save into first.", true);
        return;
      }
      const existing = ensureClassListExists(targetId);
      if (!existing) {
        setRosterMessage("Class list no longer exists.", true);
        populateClassSelect();
        return;
      }
      const names = rosterNamesFromState();
      classLists.saveList({
        id: existing.id,
        name: existing.name,
        students: names,
      });
      setRosterMessage(
        `Saved ${names.length} ${names.length === 1 ? "name" : "names"} to "${existing.name}".`,
      );
      updateSaveButtonState();
    });

    window.addEventListener("classlists:changed", () => {
      populateClassSelect();
      updateSaveButtonState();
      const selected = classSelect.value;
      if (!students.length && selected) {
        loadClassList(selected, { silent: true, skipConfirm: true });
      }
    });
  } else {
    updateSaveButtonState();
  }

  // Event wiring
  rosterForm.addEventListener("submit", handleFormSubmit);
  csvInput.addEventListener("change", handleCsvImport);
  clearRosterBtn.addEventListener("click", clearRoster);
  resetRoundBtn.addEventListener("click", () => {
    resetRound();
    roundStatus.textContent = "Round reset. Start by selecting a responder.";
  });
  clearHistoryBtn.addEventListener("click", clearHistory);

  pickResponderBtn.addEventListener("click", () => selectRandomStudent("responder"));
  pickQuestionerBtn.addEventListener("click", () => selectRandomStudent("questioner"));
  responderRefuseBtn.addEventListener("click", () => handleRefusal("responder"));
  questionerRefuseBtn.addEventListener("click", () => handleRefusal("questioner"));

  markResponderSuccessBtn.addEventListener("click", () => resolveRound("responder"));
  markQuestionerSuccessBtn.addEventListener("click", () => resolveRound("questioner"));
  markNoResultBtn.addEventListener("click", () => resolveRound("none"));

  // Initial render
  renderRoster();
  updateRoundUI();
})();
