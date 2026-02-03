(function () {
  const form = document.getElementById("question-form");
  if (!form) return;

  const questionInput = document.getElementById("question-text");
  const addOptionBtn = document.getElementById("add-option");
  const optionsContainer = document.getElementById("options-container");
  const questionList = document.getElementById("question-list");
  const questionCount = document.getElementById("question-count");
  const builderFeedback = document.getElementById("builder-feedback");
  const exportBtn = document.getElementById("export-btn");
  const exportOutput = document.getElementById("export-output");
  const importFile = document.getElementById("import-file");

  const startSessionBtn = document.getElementById("start-session");
  const nextQuestionBtn = document.getElementById("next-question");
  const sessionStatus = document.getElementById("session-status");
  const sessionCard = document.getElementById("session-card");
  const sessionQuestion = document.getElementById("session-question");
  const sessionOptions = document.getElementById("session-options");
  const sessionIndex = document.getElementById("session-index");
  const sessionTotal = document.getElementById("session-total");
  const sessionFeedback = document.getElementById("session-feedback");
  const sessionScore = document.getElementById("session-score");

  const builderMessage = (message, isError = false) => {
    builderFeedback.textContent = message;
    builderFeedback.classList.remove("hidden");
    builderFeedback.classList.toggle("text-primary", !isError);
    builderFeedback.classList.toggle("text-rose-500", isError);
    window.clearTimeout(builderMessage.timeout);
    builderMessage.timeout = window.setTimeout(() => {
      builderFeedback.classList.add("hidden");
    }, 3500);
  };

  const getStorage = () => {
    const stored = TeacherToolkit.storage.read("quickQuizQuestions", []);
    return Array.isArray(stored) ? stored : [];
  };

  let questions = getStorage();
  const sessionState = {
    active: false,
    index: 0,
    score: 0,
    answered: false,
  };

  const persist = () => {
    TeacherToolkit.storage.write("quickQuizQuestions", questions);
  };

  const createOptionField = (value = "", checked = false) => {
    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center gap-3";
    wrapper.dataset.option = "true";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "correct-option";
    radio.className = "shrink-0 text-primary focus:ring-primary";
    radio.checked = checked;

    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.placeholder = `Choice ${optionsContainer.children.length + 1}`;
    input.className =
      "flex-1 rounded-2xl border-slate-200 focus:border-primary focus:ring-primary";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.className =
      "text-xs font-semibold text-slate-400 hover:text-primary transition";
    removeBtn.addEventListener("click", () => {
      if (optionsContainer.querySelectorAll("[data-option]").length <= 2) {
        builderMessage("At least two answer choices are required.", true);
        return;
      }
      wrapper.remove();
    });

    wrapper.append(radio, input, removeBtn);
    optionsContainer.appendChild(wrapper);
    return wrapper;
  };

  const resetOptionFields = () => {
    optionsContainer.innerHTML = "";
    createOptionField("", true);
    createOptionField("", false);
  };

  const updateQuestionCount = () => {
    const count = questions.length;
    questionCount.textContent = count === 1 ? "1 question saved" : `${count} questions saved`;
    startSessionBtn.disabled = count === 0;
  };

  const renderQuestionList = () => {
    questionList.innerHTML = "";
    if (!questions.length) {
      questionList.innerHTML =
        '<p class="text-slate-500 text-sm">No questions yet. Add your first prompt above.</p>';
      updateQuestionCount();
      refreshScoreDisplay();
      return;
    }

    questions.forEach((question, index) => {
      const card = document.createElement("article");
      card.className = "rounded-2xl border border-slate-200 p-4 space-y-2";

      const heading = document.createElement("p");
      heading.className = "font-semibold text-slate-700";
      heading.textContent = `${index + 1}. ${question.prompt}`;

      const correctAnswer = question.options.find((opt) => opt.correct);
      const correct = document.createElement("p");
      correct.className = "text-xs uppercase tracking-wide text-primary";
      correct.textContent = `Correct: ${correctAnswer ? correctAnswer.text : "Not set"}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className =
        "text-xs font-semibold text-rose-500 hover:text-rose-600";
      deleteBtn.textContent = "Remove question";
      deleteBtn.addEventListener("click", () => {
        questions.splice(index, 1);
        persist();
        renderQuestionList();
      });

      card.append(heading, correct, deleteBtn);
      questionList.appendChild(card);
    });

    updateQuestionCount();
    refreshScoreDisplay();
  };

  const formatQuestionsForExport = () => JSON.stringify(questions, null, 2);

  const validateQuestionSet = (payload) => {
    if (!Array.isArray(payload)) {
      throw new Error("Quiz data must be an array.");
    }
    payload.forEach((q) => {
      if (typeof q.prompt !== "string" || !Array.isArray(q.options)) {
        throw new Error("Each question needs a prompt and options array.");
      }
      if (!q.options.some((opt) => opt.correct)) {
        throw new Error("Every question requires one correct answer.");
      }
    });
    return payload;
  };

  const renderSessionQuestion = () => {
    if (!sessionState.active) {
      sessionCard.classList.add("hidden");
      sessionStatus.textContent = "Start a session to present questions.";
      nextQuestionBtn.disabled = true;
      sessionFeedback.classList.add("hidden");
      return;
    }

    const total = questions.length;
    const current = questions[sessionState.index];
    sessionCard.classList.remove("hidden");
    sessionStatus.textContent = "Prompt the class and log responses below.";
    sessionIndex.textContent = sessionState.index + 1;
    sessionTotal.textContent = total;
    sessionQuestion.textContent = current.prompt;
    sessionOptions.innerHTML = "";
    sessionFeedback.classList.add("hidden");

    current.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "w-full rounded-2xl border border-slate-200 px-4 py-3 text-left font-medium hover:border-primary hover:text-primary";
      button.textContent = option.text;
      button.dataset.correct = option.correct ? "true" : "false";
      button.addEventListener("click", () => handleSessionAnswer(option.correct));
      sessionOptions.appendChild(button);
    });

    sessionState.answered = false;
    nextQuestionBtn.disabled = true;
    nextQuestionBtn.textContent = sessionState.index === total - 1 ? "Finish" : "Next →";
  };

  const refreshScoreDisplay = () => {
    const denominator = sessionState.active
      ? sessionState.index + (sessionState.answered ? 1 : 0)
      : questions.length;
    sessionScore.textContent = `${sessionState.score} / ${denominator || 0} correct`;
  };

  const handleSessionAnswer = (isCorrect) => {
    if (sessionState.answered || !sessionState.active) return;
    sessionState.answered = true;
    if (isCorrect) {
      sessionState.score += 1;
      sessionFeedback.textContent = "Correct! Celebrate the win.";
      sessionFeedback.classList.remove("text-rose-500");
      sessionFeedback.classList.add("text-primary");
    } else {
      sessionFeedback.textContent = "Not quite. Review together, then move on.";
      sessionFeedback.classList.remove("text-primary");
      sessionFeedback.classList.add("text-rose-500");
    }
    sessionFeedback.classList.remove("hidden");
    sessionOptions.querySelectorAll("button").forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.correct === "true") {
        btn.classList.add("border-primary", "text-primary");
      }
    });
    nextQuestionBtn.disabled = false;
    refreshScoreDisplay();
  };

  const startSession = () => {
    if (!questions.length) {
      sessionStatus.textContent = "Add at least one question to begin.";
      return;
    }
    sessionState.active = true;
    sessionState.index = 0;
    sessionState.score = 0;
    sessionState.answered = false;
    refreshScoreDisplay();
    renderSessionQuestion();
  };

  const advanceSession = () => {
    if (!sessionState.active) return;
    if (!sessionState.answered) {
      sessionStatus.textContent = "Log a response before moving on.";
      return;
    }
    if (sessionState.index >= questions.length - 1) {
      sessionStatus.textContent = `Session complete! Score: ${sessionState.score}/${questions.length}`;
      sessionCard.classList.add("hidden");
      sessionState.active = false;
      refreshScoreDisplay();
      nextQuestionBtn.disabled = true;
      return;
    }
    sessionState.index += 1;
    renderSessionQuestion();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const prompt = questionInput.value.trim();
    const optionNodes = Array.from(optionsContainer.querySelectorAll("[data-option]"));

    const options = optionNodes
      .map((node) => {
        const optionText = node.querySelector('input[type="text"]').value.trim();
        const correct = node.querySelector('input[type="radio"]').checked;
        return optionText ? { text: optionText, correct } : null;
      })
      .filter(Boolean);

    if (!prompt) {
      builderMessage("Enter a question prompt.", true);
      return;
    }
    if (options.length < 2) {
      builderMessage("Add at least two answer choices.", true);
      return;
    }
    if (!options.some((opt) => opt.correct)) {
      builderMessage("Select one correct answer.", true);
      return;
    }

    questions.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      prompt,
      options,
    });
    persist();
    renderQuestionList();
    questionInput.value = "";
    resetOptionFields();
    builderMessage("Question saved.");
  });

  addOptionBtn.addEventListener("click", () => {
    createOptionField("", false);
  });

  exportBtn.addEventListener("click", () => {
    const payload = formatQuestionsForExport();
    exportOutput.value = payload;
    if (!questions.length) {
      builderMessage("Add questions before exporting.", true);
      return;
    }
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `teacher-toolkit-quiz-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      builderMessage("Exported quiz JSON. File downloaded.");
    } catch (err) {
      console.error(err);
      builderMessage("Unable to export quiz data.", true);
    }
  });

  importFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = validateQuestionSet(JSON.parse(text));
      questions = parsed;
      persist();
      renderQuestionList();
      builderMessage("Quiz imported successfully.");
    } catch (err) {
      console.error(err);
      builderMessage(err.message || "Import failed.", true);
    } finally {
      importFile.value = "";
    }
  });

  startSessionBtn.addEventListener("click", startSession);
  nextQuestionBtn.addEventListener("click", advanceSession);

  resetOptionFields();
  renderQuestionList();
})();
