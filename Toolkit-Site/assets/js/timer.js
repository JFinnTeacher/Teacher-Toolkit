(function () {
  const display = document.getElementById("timer-display");
  const statusEl = document.getElementById("timer-status");
  const progressCircle = document.getElementById("timer-progress");
  const presetButtons = document.querySelectorAll("[data-preset]");
  const customInput = document.getElementById("custom-minutes");
  const applyCustomBtn = document.getElementById("apply-custom");
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const chimeToggle = document.getElementById("chime-toggle");

  if (!display) return;

  const circumference = 2 * Math.PI * 90;
  progressCircle.style.strokeDasharray = `${circumference}`;

  let totalSeconds = TeacherToolkit.storage.read("timerDuration", 300);
  totalSeconds = Math.max(10, Number(totalSeconds) || 300);
  let remainingSeconds = totalSeconds;
  let intervalId = null;
  let audioCtx = null;

  const setStatus = (message) => {
    statusEl.textContent = message;
  };

  const updateDisplay = () => {
    display.textContent = TeacherToolkit.formatTime(remainingSeconds);
    const ratio = remainingSeconds / totalSeconds;
    progressCircle.style.strokeDashoffset = String(
      circumference - circumference * Math.max(0, Math.min(1, ratio))
    );
  };

  const stopTimer = (message) => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    if (message) {
      setStatus(message);
    }
  };

  const completeTimer = () => {
    stopTimer("Time's up! Reset or set a new duration.");
    remainingSeconds = 0;
    updateDisplay();
    if (chimeToggle.checked) {
      playChime();
    }
  };

  const tick = () => {
    if (remainingSeconds <= 0) {
      completeTimer();
      return;
    }
    remainingSeconds -= 1;
    updateDisplay();
    if (remainingSeconds <= 0) {
      completeTimer();
    }
  };

  const startTimer = () => {
    if (intervalId) return;
    if (remainingSeconds <= 0) {
      remainingSeconds = totalSeconds;
    }
    setStatus("Timer running...");
    intervalId = window.setInterval(tick, 1000);
    tick();
  };

  const pauseTimer = () => {
    stopTimer("Paused. Resume when you're ready.");
  };

  const resetTimer = () => {
    stopTimer("Timer reset.");
    remainingSeconds = totalSeconds;
    updateDisplay();
  };

  const setDuration = (seconds) => {
    totalSeconds = Math.max(10, seconds);
    remainingSeconds = totalSeconds;
    TeacherToolkit.storage.write("timerDuration", totalSeconds);
    updateDisplay();
    setStatus("Duration updated. Press start when ready.");
  };

  const parseInputMinutes = () => {
    const mins = Number(customInput.value);
    if (Number.isFinite(mins) && mins > 0) {
      return Math.min(mins, 180) * 60;
    }
    return null;
  };

  const playChime = () => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.002, now);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 2);
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start(now);
      oscillator.stop(now + 2);
    } catch (err) {
      console.warn("Unable to play chime", err);
    }
  };

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const seconds = Number(button.dataset.preset);
      setDuration(seconds);
    });
  });

  applyCustomBtn.addEventListener("click", () => {
    const seconds = parseInputMinutes();
    if (!seconds) {
      setStatus("Enter a valid duration between 1 and 180 minutes.");
      customInput.focus();
      return;
    }
    setDuration(seconds);
  });

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && intervalId) {
      // Keep interval but ensure display stays accurate
      updateDisplay();
    }
  });

  updateDisplay();
})();
