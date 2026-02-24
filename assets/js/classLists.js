"use strict";

(function () {
  const toolkit = window.TeacherToolkit;
  if (!toolkit || !toolkit.classLists) {
    console.warn("TeacherToolkit.classLists is unavailable.");
    return;
  }

  const state = {
    activeId: null,
    lists: [],
  };

  const selectList = (id) => {
    state.activeId = id;
    toolkit.classLists.setLastSelected(id);
    render();
  };

  const modal = document.querySelector("[data-classlists-modal]");
  if (!modal) return;

  const navList = modal.querySelector("[data-classlist-nav]");
  const nameInput = modal.querySelector("[data-classlist-name]");
  const studentsInput = modal.querySelector("[data-classlist-students]");
  const statusText = modal.querySelector("[data-classlist-status]");
  const saveBtn = modal.querySelector("[data-classlist-save]");
  const deleteBtn = modal.querySelector("[data-classlist-delete]");

  const getCurrentList = () => {
    if (!state.activeId) return null;
    return state.lists.find((item) => item.id === state.activeId) || null;
  };

  const showStatus = (message, tone = "neutral") => {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.classList.remove("text-emerald-500", "text-rose-500", "text-slate-400");
    if (tone === "positive") statusText.classList.add("text-emerald-500");
    else if (tone === "negative") statusText.classList.add("text-rose-500");
    else statusText.classList.add("text-slate-400");
  };

  const ensureActive = () => {
    const current = toolkit.classLists.read();
    state.lists = current.lists;
    state.activeId = current.lastSelectedId || state.lists[0]?.id || null;
  };

  const renderListNav = () => {
    if (!navList) return;
    navList.innerHTML = "";
    if (!state.lists.length) {
      const empty = document.createElement("li");
      empty.className = "text-slate-400 text-xs";
      empty.textContent = "No class lists yet. Create your first one.";
      navList.appendChild(empty);
      return;
    }
    state.lists.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "w-full rounded-2xl border px-3 py-2 text-left text-sm transition " +
        (item.id === state.activeId
          ? "border-primary/40 bg-primary/10 text-primary font-semibold"
          : "border-slate-200 hover:border-primary/40");
      button.textContent = item.name;
      button.addEventListener("click", () => selectList(item.id));
      const listItem = document.createElement("li");
      listItem.appendChild(button);
      navList.appendChild(listItem);
    });
  };

  const hydrateDetails = () => {
    if (!nameInput || !studentsInput) return;
    const current = getCurrentList();
    if (!current) {
      nameInput.value = "";
      studentsInput.value = "";
      nameInput.disabled = true;
      studentsInput.disabled = true;
      saveBtn.disabled = true;
      deleteBtn.disabled = true;
      return;
    }
    nameInput.disabled = false;
    studentsInput.disabled = false;
    saveBtn.disabled = false;
    deleteBtn.disabled = false;
    nameInput.value = current.name;
    studentsInput.value = current.students.join("\n");
  };

  const updateCountDisplay = () => {
    const el = document.getElementById("classlist-count");
    if (!el) return;
    const data = toolkit.classLists.read();
    el.textContent = String(data.lists?.length ?? 0);
  };

  const render = () => {
    ensureActive();
    renderListNav();
    hydrateDetails();
    updateCountDisplay();
  };

  let focusHandler = null;
  let lastFocusedElement = null;

  const openModal = () => {
    render();
    showStatus("");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    trapFocus();
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    releaseFocus();
  };

  const openButtons = document.querySelectorAll("[data-open-classlists]");
  openButtons.forEach((btn) =>
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    }),
  );

  modal.querySelectorAll("[data-close-classlists]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  const overlay = modal.querySelector("[data-close-classlists][aria-hidden='true']");
  overlay?.addEventListener("click", closeModal);

  const createList = () => {
    const id =
      typeof window.crypto !== "undefined" && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : `class-${Date.now()}`;
    const next = {
      id,
      name: `New class ${state.lists.length + 1}`,
      students: [],
    };
    toolkit.classLists.saveList(next);
    selectList(id);
    showStatus("New class created. Add students and save.", "positive");
    nameInput?.focus();
  };

  modal.querySelector("[data-classlist-add]")?.addEventListener("click", createList);

  const resetAll = () => {
    if (!window.confirm("Remove all saved class lists from this device?")) return;
    toolkit.classLists.reset();
    render();
    showStatus("All class lists removed.", "negative");
  };

  modal.querySelector("[data-classlist-reset]")?.addEventListener("click", resetAll);

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const current = getCurrentList();
      if (!current) {
        showStatus("Create a class list before saving.", "negative");
        return;
      }
      const names = (studentsInput.value || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const uniqueNames = Array.from(new Set(names));
      toolkit.classLists.saveList({
        id: current.id,
        name: (nameInput.value || "").trim() || "Untitled class",
        students: uniqueNames,
      });
      showStatus("Class list saved.", "positive");
      render();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const current = getCurrentList();
      if (!current) {
        showStatus("Nothing to delete.", "negative");
        return;
      }
      if (!window.confirm(`Delete "${current.name}" from this device?`)) return;
      toolkit.classLists.deleteList(current.id);
      ensureActive();
      render();
      showStatus("Class list deleted.", "negative");
    });
  }

  window.addEventListener("classlists:changed", () => {
    render();
  });

  updateCountDisplay();

  const focusableSelectors =
    'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
  const trapFocus = () => {
    lastFocusedElement = document.activeElement;
    const focusableElements = modal.querySelectorAll(focusableSelectors);
    if (!focusableElements.length) return;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    focusHandler = (event) => {
      if (event.key === "Tab") {
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
    };
    modal.addEventListener("keydown", focusHandler);
    first.focus();
  };

  const releaseFocus = () => {
    if (focusHandler) {
      modal.removeEventListener("keydown", focusHandler);
      focusHandler = null;
    }
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("flex")) {
      closeModal();
    }
  });
})();
