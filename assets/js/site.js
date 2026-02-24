"use strict";

const TeacherToolkit = (() => {
  const storagePrefix = "teacherToolkit:";

  const storage = {
    read(key, fallback = null) {
      try {
        const raw = window.localStorage.getItem(storagePrefix + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        console.warn("Storage read failed", err);
        return fallback;
      }
    },
    write(key, value) {
      try {
        window.localStorage.setItem(storagePrefix + key, JSON.stringify(value));
      } catch (err) {
        console.warn("Storage write failed", err);
      }
    },
    remove(key) {
      window.localStorage.removeItem(storagePrefix + key);
    },
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const classListKey = "classLists";
  const defaultData = { lists: [], lastSelectedId: null };

  const ensureStructure = (value) => {
    if (!value || typeof value !== "object") {
      return { lists: [], lastSelectedId: null };
    }
    const lists = Array.isArray(value.lists) ? value.lists : [];
    const cleanedLists = lists
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const id = typeof item.id === "string" ? item.id : null;
        const name = typeof item.name === "string" ? item.name : "";
        const students = Array.isArray(item.students) ? item.students : [];
        if (!id || !name) return null;
        return {
          id,
          name,
          students: students.filter((entry) => typeof entry === "string" && entry.trim().length > 0),
        };
      })
      .filter(Boolean);

    const lastSelectedId =
      typeof value.lastSelectedId === "string" &&
      cleanedLists.some((item) => item.id === value.lastSelectedId)
        ? value.lastSelectedId
        : cleanedLists[0]?.id || null;

    return { lists: cleanedLists, lastSelectedId };
  };

  const classLists = {
    read() {
      const raw = storage.read(classListKey, defaultData);
      return ensureStructure(raw);
    },
    write(data) {
      const parsed = ensureStructure(data);
      storage.write(classListKey, parsed);
      window.dispatchEvent(
        new CustomEvent("classlists:changed", {
          detail: parsed,
        }),
      );
      return parsed;
    },
    saveList(list) {
      const current = classLists.read();
      const existingIndex = current.lists.findIndex((entry) => entry.id === list.id);
      const updatedList = {
        ...list,
        name: list.name.trim() || "Untitled class",
        students: Array.isArray(list.students)
          ? list.students.filter((entry) => typeof entry === "string" && entry.trim().length > 0)
          : [],
      };

      if (existingIndex >= 0) {
        current.lists.splice(existingIndex, 1, updatedList);
      } else {
        current.lists.push(updatedList);
      }
      current.lastSelectedId = updatedList.id;
      return classLists.write(current);
    },
    deleteList(id) {
      const current = classLists.read();
      const filtered = current.lists.filter((entry) => entry.id !== id);
      return classLists.write({
        lists: filtered,
        lastSelectedId: filtered.length ? filtered[0].id : null,
      });
    },
    setLastSelected(id) {
      const current = classLists.read();
      const exists = current.lists.some((entry) => entry.id === id);
      if (!exists) return current;
      return classLists.write({ ...current, lastSelectedId: id });
    },
    getSelectedList() {
      const current = classLists.read();
      if (!current.lastSelectedId) return null;
      return current.lists.find((entry) => entry.id === current.lastSelectedId) || null;
    },
    reset() {
      storage.remove(classListKey);
      const fresh = ensureStructure(defaultData);
      window.dispatchEvent(
        new CustomEvent("classlists:changed", {
          detail: fresh,
        }),
      );
      return fresh;
    },
  };

  return { storage, formatTime, classLists };
})();

window.TeacherToolkit = TeacherToolkit;

const initNav = () => {
  const toggleBtn = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav-menu]");

  if (!toggleBtn || !nav) return;

  toggleBtn.addEventListener("click", () => {
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("hidden");
  });
};

const initThemeToggle = () => {
  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  if (!themeButtons.length) return;

  const getStoredTheme = () => {
    try {
      return window.localStorage.getItem("teacherToolkit:theme");
    } catch (err) {
      return null;
    }
  };

  const setStoredTheme = (value) => {
    try {
      window.localStorage.setItem("teacherToolkit:theme", value);
    } catch (err) {
      console.warn("Theme storage failed", err);
    }
  };

  const applyTheme = (mode) => {
    const theme = mode === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    setStoredTheme(theme);
    const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    themeButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      const labelEl = btn.querySelector("[data-theme-label]");
      if (labelEl) {
        labelEl.textContent = label;
      } else {
        btn.textContent = label;
      }
    });
  };

  const current = getStoredTheme() || "light";
  applyTheme(current);

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  });
};

const CONSENT_KEY = "teacherToolkit:cookieConsent";

const initCookieBanner = () => {
  const banner = document.querySelector("[data-cookie-banner]");
  const acceptBtn = document.querySelector("[data-cookie-accept]");
  if (!banner || !acceptBtn) return;

  const hasConsent = () => {
    try {
      return window.localStorage.getItem(CONSENT_KEY) === "true";
    } catch {
      return false;
    }
  };

  const setConsent = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "true");
    } catch (err) {
      console.warn("Could not store cookie consent", err);
    }
  };

  const hideBanner = () => {
    banner.classList.add("hidden");
  };

  if (hasConsent()) {
    hideBanner();
    return;
  }

  banner.classList.remove("hidden");

  acceptBtn.addEventListener("click", () => {
    setConsent();
    hideBanner();
  });
};

const initClasslistCount = () => {
  const el = document.getElementById("classlist-count");
  if (!el) return;
  const toolkit = window.TeacherToolkit;
  if (!toolkit?.classLists) return;

  const update = () => {
    const data = toolkit.classLists.read();
    el.textContent = String(data.lists?.length ?? 0);
  };

  update();
  window.addEventListener("classlists:changed", update);
};

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initThemeToggle();
  initCookieBanner();
  initClasslistCount();
});
