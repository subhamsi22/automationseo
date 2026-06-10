// ─── PRESETS ─────────────────────────────────────────────────────────────────

const PRESETS = {
  preset1: {
    name: "Banao Technologies",
    links: [
      "https://www.google.com/search?q=banao+technologies",
      "https://banao.tech/",
      "https://www.google.com/search?q=interview+god",
      "https://www.interviewgod.ai/",
      "https://www.google.com/search?q=banao+technologies",
      "https://banao.tech/",
      "https://www.google.com/search?q=vidya&sourceid=chrome",
      "https://vidya.online/",
      "https://www.google.com/search?q=vikaas",
      "https://vikaas.ai/",
      "https://www.google.com/search?q=axonhq.+ai",
      "https://axonhq.ai/",
    ],
  },
  preset2: {
    name: "Banao Tech Generative AI SEO",
    links: [
      "https://www.google.com/search?q=generative+ai+solutions+in+india",
      "https://banao.tech/services/generative-ai",
      "https://www.google.com/search?q=Generative+AI+Solutions+in+dubai",
      "https://banao.tech/ae/generative-ai-development-dubai-uae",
      "https://www.google.com/search?q=generative+ai+solutions+in+usa",
      "https://banao.tech/en-us/generative-ai-development-new-york-usa",
      "https://www.google.com/search?q=Generative+AI+chatbot+development",
      "https://www.google.com/search?q=generative+ai+chatbot+development+in+dubai",
      "https://banao.tech/services/ai-ml-development",
      "https://www.google.com/search?q=generative+ai+chatbot+development+in+usa",
      "https://www.google.com/search?q=progressive+web+app+development+company+india",
      "https://banao.tech/services/pwa-development",
    ],
  },
  preset3: {
    name: "Interview God AI SEO",
    links: [
      "https://www.google.com/search?q=ai+interview+company+in+india",
      "https://www.interviewgod.ai/",
      "https://www.google.com/search?q=AI+Call+Screening+in+usa",
      "https://www.interviewgod.ai/feature/ai-call-screening",
      "https://www.google.com/search?q=AI+Assessments+dubai",
      "https://www.interviewgod.ai/feature/ai-assessment",
      "https://www.google.com/search?q=AI+driven+skill+evaluation+in+india",
      "https://interviewgod.ai/services/ai-interviewing",
      "https://www.google.com/search?q=AI+based+candidate+screening+in+dubai",
      "https://www.interviewgod.ai/feature/resume-screening",
      "https://www.google.com/search?q=AI+hiring+service+for+Manufacturing+Industry+in+usa",
      "https://www.interviewgod.ai/industries/manufacturing",
    ],
  },
  custom: {
    name: "Custom Links",
    links: [],
  },
};

// ─── STATE ────────────────────────────────────────────────────────────────────

const state = {
  status: "idle", // idle | running | paused | completed
  links: [],
  loopCount: 3,
  intervalMs: 7000,
  currentLoop: 0,
  currentIndex: 0,
  totalOpened: 0,
  totalLinks: 0,
  queue: [],
  queuePosition: 0,
  timerId: null,
  countdownTimerId: null,
  countdownStart: 0,
};

// ─── DOM REFERENCES ───────────────────────────────────────────────────────────

const els = {
  statusBadge: document.getElementById("status-badge"),
  statusDot: document.getElementById("status-dot"),
  statusText: document.getElementById("status-text"),
  btnStart: document.getElementById("btn-start"),
  btnPause: document.getElementById("btn-pause"),
  btnStop: document.getElementById("btn-stop"),
  btnTestPopup: document.getElementById("btn-test-popup"),
  loopInput: document.getElementById("loop-count"),
  intervalInput: document.getElementById("interval-delay"),
  presetSelect: document.getElementById("preset-select"),
  linkCountTag: document.getElementById("link-count-tag"),
  linkTextarea: document.getElementById("link-textarea"),
  statLoop: document.getElementById("stat-loop"),
  statLink: document.getElementById("stat-link"),
  statOpened: document.getElementById("stat-opened"),
  statTotal: document.getElementById("stat-total"),
  progressFill: document.getElementById("progress-fill"),
  progressLabel: document.getElementById("progress-label"),
  timerFill: document.getElementById("timer-fill"),
  timerValue: document.getElementById("timer-value"),
  consoleBody: document.getElementById("console-body"),
  btnClearLog: document.getElementById("btn-clear-log"),
  btnSaveCustom: document.getElementById("btn-save-custom"),
};

// ─── LOGGING ──────────────────────────────────────────────────────────────────

function log(message, type = "info") {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = `<span class="log-time">[${time}]</span><span class="log-text log-${type}">${message}</span>`;
  els.consoleBody.appendChild(entry);
  els.consoleBody.scrollTop = els.consoleBody.scrollHeight;
}

function clearLog() {
  els.consoleBody.innerHTML = "";
  log("Console cleared.", "info");
}

// ─── PRESET MANAGEMENT ────────────────────────────────────────────────────────

function loadCustomFromStorage() {
  try {
    const saved = localStorage.getItem("seo-custom-links");
    if (saved) {
      PRESETS.custom.links = JSON.parse(saved);
    }
  } catch (e) {}
}

function saveCustomToStorage() {
  const lines = els.linkTextarea.value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l.startsWith("http"));
  PRESETS.custom.links = lines;
  localStorage.setItem("seo-custom-links", JSON.stringify(lines));
  log(`✔ Saved ${lines.length} custom links to storage.`, "success");
  updateLinkCountTag();
}

function loadPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return;
  state.links = [...preset.links];
  els.linkTextarea.value = preset.links.join("\n");
  updateLinkCountTag();
  log(`Loaded preset: <strong>${preset.name}</strong> (${preset.links.length} links)`, "info-highlight");
}

function updateLinkCountTag() {
  const count = els.linkTextarea.value
    .split("\n")
    .filter((l) => l.trim().startsWith("http")).length;
  els.linkCountTag.textContent = `${count} links`;
}

// ─── STATS UPDATE ─────────────────────────────────────────────────────────────

function updateStats() {
  els.statLoop.textContent = `${state.currentLoop} / ${state.loopCount}`;
  els.statLink.textContent = `${state.currentIndex} / ${state.links.length}`;
  els.statOpened.textContent = state.totalOpened;
  els.statTotal.textContent = state.totalLinks;

  const pct = state.totalLinks > 0 ? Math.round((state.totalOpened / state.totalLinks) * 100) : 0;
  els.progressFill.style.width = pct + "%";
  els.progressLabel.textContent = pct + "%";
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  idle: { label: "Idle", cls: "status-idle" },
  running: { label: "Running", cls: "status-running" },
  paused: { label: "Paused", cls: "status-paused" },
  completed: { label: "Completed", cls: "status-completed" },
};

function setStatus(s) {
  state.status = s;
  const cfg = STATUS_CONFIG[s];
  els.statusBadge.className = `status-badge ${cfg.cls}`;
  els.statusText.textContent = cfg.label;
}

// ─── BUTTON STATE ─────────────────────────────────────────────────────────────

function refreshButtons() {
  const isRunning = state.status === "running";
  const isPaused = state.status === "paused";
  const isIdle = state.status === "idle" || state.status === "completed";

  els.btnStart.disabled = isRunning || isPaused;
  els.btnPause.disabled = isIdle;
  els.btnStop.disabled = isIdle;
  els.btnPause.textContent = isPaused ? "Resume" : "Pause";
  els.btnPause.className = `btn ${isPaused ? "btn-success" : "btn-warning"}`;
}

// ─── COUNTDOWN TIMER ──────────────────────────────────────────────────────────

function startCountdown() {
  clearInterval(state.countdownTimerId);
  state.countdownStart = Date.now();
  const delay = state.intervalMs;

  function tick() {
    const elapsed = Date.now() - state.countdownStart;
    const remaining = Math.max(0, delay - elapsed);
    const pct = ((delay - remaining) / delay) * 100;
    const secs = (remaining / 1000).toFixed(1);
    els.timerFill.style.width = pct + "%";
    els.timerValue.textContent = remaining > 0 ? `${secs}s` : "Opening…";
  }

  tick();
  state.countdownTimerId = setInterval(tick, 100);
}

function stopCountdown() {
  clearInterval(state.countdownTimerId);
  els.timerFill.style.width = "0%";
  els.timerValue.textContent = "—";
}

// ─── QUEUE BUILDER ────────────────────────────────────────────────────────────

function buildQueue() {
  const queue = [];
  for (let loop = 1; loop <= state.loopCount; loop++) {
    state.links.forEach((url, idx) => {
      queue.push({ url, loop, linkIndex: idx + 1 });
    });
  }
  return queue;
}

// ─── OPEN NEXT LINK ───────────────────────────────────────────────────────────

function openNextLink() {
  if (state.status !== "running") return;
  if (state.queuePosition >= state.queue.length) {
    finishAutomation();
    return;
  }

  const item = state.queue[state.queuePosition];
  state.queuePosition++;
  state.currentLoop = item.loop;
  state.currentIndex = item.linkIndex;
  state.totalOpened++;

  log(`Loop ${item.loop}/${state.loopCount} · Link ${item.linkIndex}/${state.links.length} → <span style="color:#60a5fa">${item.url}</span>`, "info");

  const win = window.open(item.url, "_blank");
  if (!win) {
    log("⚠ Popup was blocked! Please allow popups for this site in your browser.", "danger");
  }

  updateStats();

  if (state.queuePosition < state.queue.length) {
    startCountdown();
    state.timerId = setTimeout(openNextLink, state.intervalMs);
  } else {
    stopCountdown();
    state.timerId = setTimeout(finishAutomation, 100);
  }
}

// ─── CONTROL: START ───────────────────────────────────────────────────────────

function startAutomation() {
  // Read config
  const loopCount = parseInt(els.loopInput.value, 10) || 3;
  const intervalSec = parseFloat(els.intervalInput.value) || 7;

  // Get links from textarea
  const links = els.linkTextarea.value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("http"));

  if (links.length === 0) {
    log("✖ No valid links found. Please load a preset or enter links.", "danger");
    return;
  }

  // Configure state
  state.links = links;
  state.loopCount = loopCount;
  state.intervalMs = intervalSec * 1000;
  state.currentLoop = 0;
  state.currentIndex = 0;
  state.totalOpened = 0;
  state.totalLinks = links.length * loopCount;
  state.queue = buildQueue();
  state.queuePosition = 0;

  setStatus("running");
  refreshButtons();
  updateStats();
  log(`▶ Starting — ${links.length} links × ${loopCount} loops = ${state.totalLinks} total tabs, every ${intervalSec}s`, "success");

  openNextLink();
}

// ─── CONTROL: PAUSE / RESUME ──────────────────────────────────────────────────

function togglePause() {
  if (state.status === "running") {
    clearTimeout(state.timerId);
    clearInterval(state.countdownTimerId);
    setStatus("paused");
    refreshButtons();
    log("⏸ Paused.", "warning");
  } else if (state.status === "paused") {
    setStatus("running");
    refreshButtons();
    log("▶ Resumed.", "success");
    startCountdown();
    state.timerId = setTimeout(openNextLink, state.intervalMs);
  }
}

// ─── CONTROL: STOP ────────────────────────────────────────────────────────────

function stopAutomation() {
  clearTimeout(state.timerId);
  stopCountdown();
  setStatus("idle");
  refreshButtons();
  log(`■ Stopped. ${state.totalOpened} of ${state.totalLinks} tabs opened.`, "warning");
  updateStats();
}

// ─── CONTROL: FINISH ─────────────────────────────────────────────────────────

function finishAutomation() {
  stopCountdown();
  setStatus("completed");
  refreshButtons();
  updateStats();
  log(`✅ All done! ${state.totalOpened} tabs opened across ${state.loopCount} loops.`, "success");
}

// ─── PRESET SELECTOR CHANGE ───────────────────────────────────────────────────

els.presetSelect.addEventListener("change", () => {
  const key = els.presetSelect.value;
  if (key !== "custom") {
    loadPreset(key);
  } else {
    els.linkTextarea.value = PRESETS.custom.links.join("\n");
    updateLinkCountTag();
    log("Switched to Custom Links. Edit the textarea and Save.", "info");
  }
});

// ─── TEXTAREA CHANGE ──────────────────────────────────────────────────────────

els.linkTextarea.addEventListener("input", updateLinkCountTag);

// ─── BUTTON LISTENERS ─────────────────────────────────────────────────────────

els.btnStart.addEventListener("click", startAutomation);
els.btnPause.addEventListener("click", togglePause);
els.btnStop.addEventListener("click", stopAutomation);
els.btnClearLog.addEventListener("click", clearLog);
els.btnSaveCustom.addEventListener("click", saveCustomToStorage);

els.btnTestPopup.addEventListener("click", () => {
  const win = window.open("about:blank", "_blank");
  if (win) {
    win.close();
    log("✔ Popup test passed! Browser popups are allowed.", "success");
  } else {
    log("✖ Popup was blocked. Click 'Allow' in your browser's address bar.", "danger");
  }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────

(function init() {
  loadCustomFromStorage();
  loadPreset("preset1");
  setStatus("idle");
  refreshButtons();
  updateStats();
  log("🚀 SEO Link Streamer Pro ready. Load a preset and hit Start.", "info-highlight");
})();
