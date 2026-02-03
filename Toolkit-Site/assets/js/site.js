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

  return { storage, formatTime };
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

document.addEventListener("DOMContentLoaded", () => {
  initNav();
});
