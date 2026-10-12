/**
 * Gbot — bibliothèque d'animation du bot canvas.
 * Usage: Gbot.init(options) then Gbot.setMode(mode, opts) / Gbot.stopMode()
 * v0.8.0
 */
(function (global) {
  "use strict";

  const MODE_IDS = new Set([
    "search", "work", "think", "read", "play", "happy",
    "struggle", "rest", "chat", "focus", "pride"
  ]);

  function createGbot(userOptions) {
    const defaults = {
      canvas: "#bot",
      status: "#status",
      colorStyle: "vibrant",
      color: "blue",
      effect3d: false,
      shape: "round",
      zoom: 100,
      faceSize: 21,
      welcomePhrase: null,
      ui: true
    };
    const opts = { ...defaults, ...userOptions };

    function resolveEl(target) {
      if (!target) return null;
      if (typeof target === "string") return document.querySelector(target);
      return target;
    }

    const canvas = resolveEl(opts.canvas);
    const botZoomInput = document.getElementById("bot-zoom");
    const faceSizeInput = document.getElementById("face-size");
    const botNameEl = document.getElementById("bot-name");
    const botNameInput = document.getElementById("bot-name-input");
    const statusEl = resolveEl(opts.status);
    if (!canvas || !statusEl) {
      throw new Error("Gbot: canvas or status element not found.");
    }
    const ctx = canvas.getContext("2d");
    const modeButtons = [...document.querySelectorAll(".controls button")];
    const colorButtons = [...document.querySelectorAll(".color-chip")];
    const shapeButtons = [...document.querySelectorAll(".shape-chip")];
    const accessoryButtons = [...document.querySelectorAll(".accessory-chip")];
    const colorStyleSelect = document.getElementById("color-style");
    const effect3dInput = document.getElementById("effect-3d");

    const stylePresets = {
      vibrant: {
        blue: { deep: [18, 98, 185], body: [42, 157, 255], glow: [190, 228, 255] },
        yellow: { deep: [168, 118, 8], body: [255, 209, 25], glow: [255, 244, 170] },
        red: { deep: [168, 28, 24], body: [255, 61, 53], glow: [255, 196, 188] },
        green: { deep: [12, 128, 62], body: [31, 214, 106], glow: [188, 255, 214] },
        orange: { deep: [168, 72, 8], body: [255, 138, 24], glow: [255, 214, 168] },
        violet: { deep: [78, 28, 168], body: [145, 75, 255], glow: [220, 196, 255] },
        gray: { deep: [68, 78, 92], body: [127, 139, 154], glow: [214, 222, 232] },
        pink: { deep: [168, 38, 98], body: [255, 92, 168], glow: [255, 196, 228] },
        cyan: { deep: [8, 118, 128], body: [38, 212, 204], glow: [188, 255, 250] },
        peach: { deep: [168, 88, 58], body: [255, 168, 128], glow: [255, 224, 204] },
        mint: { deep: [18, 118, 88], body: [88, 232, 178], glow: [210, 255, 236] },
        coral: { deep: [168, 48, 48], body: [255, 118, 108], glow: [255, 204, 196] }
      },
      pastel: {
        blue: { deep: [148, 184, 220], body: [168, 214, 255], glow: [236, 246, 255] },
        yellow: { deep: [232, 210, 138], body: [255, 238, 176], glow: [255, 250, 228] },
        red: { deep: [232, 176, 168], body: [255, 196, 188], glow: [255, 236, 232] },
        green: { deep: [148, 212, 176], body: [178, 236, 202], glow: [236, 252, 242] },
        orange: { deep: [240, 196, 152], body: [255, 214, 176], glow: [255, 244, 230] },
        violet: { deep: [196, 176, 232], body: [214, 196, 255], glow: [244, 238, 255] },
        gray: { deep: [188, 194, 204], body: [208, 214, 224], glow: [244, 246, 250] },
        pink: { deep: [232, 176, 204], body: [255, 204, 228], glow: [255, 240, 248] },
        cyan: { deep: [148, 214, 214], body: [186, 244, 240], glow: [232, 252, 250] },
        peach: { deep: [240, 204, 184], body: [255, 224, 204], glow: [255, 244, 236] },
        mint: { deep: [168, 228, 204], body: [204, 246, 228], glow: [240, 255, 248] },
        coral: { deep: [240, 184, 176], body: [255, 208, 200], glow: [255, 236, 232] }
      },
      normal: {
        blue: { deep: [28, 78, 128], body: [52, 138, 205], glow: [168, 206, 238] },
        yellow: { deep: [118, 84, 10], body: [218, 176, 44], glow: [255, 238, 168] },
        red: { deep: [118, 30, 28], body: [208, 68, 58], glow: [255, 188, 178] },
        green: { deep: [20, 86, 46], body: [48, 156, 86], glow: [172, 232, 192] },
        orange: { deep: [128, 60, 16], body: [228, 126, 46], glow: [255, 208, 158] },
        violet: { deep: [70, 36, 116], body: [128, 86, 208], glow: [208, 188, 255] },
        gray: { deep: [46, 52, 60], body: [116, 124, 136], glow: [208, 214, 222] },
        pink: { deep: [128, 38, 78], body: [218, 88, 148], glow: [255, 188, 218] },
        cyan: { deep: [18, 98, 108], body: [48, 168, 162], glow: [168, 232, 228] },
        peach: { deep: [138, 78, 52], body: [228, 148, 108], glow: [255, 210, 188] },
        mint: { deep: [28, 98, 72], body: [72, 178, 138], glow: [188, 240, 218] },
        coral: { deep: [138, 48, 42], body: [228, 98, 88], glow: [255, 188, 178] }
      }
    };

    const chipByStyle = {
      vibrant: {
        blue: "#2a9dff",
        yellow: "#ffd119",
        red: "#ff3d35",
        green: "#1fd66a",
        orange: "#ff8a18",
        violet: "#914bff",
        gray: "#7f8b9a",
        pink: "#ff5ca8",
        cyan: "#26d4cc",
        peach: "#ffa880",
        mint: "#58e8b0",
        coral: "#ff7668"
      },
      pastel: {
        blue: "#a8d6ff",
        yellow: "#ffeeb0",
        red: "#ffc4bc",
        green: "#b2ecc8",
        orange: "#ffd6b0",
        violet: "#d6c4ff",
        gray: "#d0d6e0",
        pink: "#ffcce4",
        cyan: "#baefe8",
        peach: "#ffe0cc",
        mint: "#ccf5e4",
        coral: "#ffd0c8"
      },
      normal: {
        blue: "#3a8fd0",
        yellow: "#e8b830",
        red: "#e05850",
        green: "#42a068",
        orange: "#e88838",
        violet: "#8a68d8",
        gray: "#8a939e",
        pink: "#da5c94",
        cyan: "#30a8a0",
        peach: "#e49468",
        mint: "#48b48a",
        coral: "#e46860"
      }
    };

    let colorStyle = "vibrant";
    let selectedColor = "blue";
    let effect3d = false;
    let botShape = "round";

    if (botShape === "house" || botShape === "drop") {
      botShape = "round";
    }
    const activeAccessories = new Set();

    const modeAccessories = {
      search: ["magnify"],
      work: ["hammer"],
      think: ["coffee"],
      read: ["book"],
      play: ["joystick"],
      happy: ["hat"],
      struggle: ["star"],
      rest: [],
      chat: [],
      focus: ["glasses"],
      pride: []
    };

    const accessoryCatalog = {
      glasses: { x: 0, y: 0.05, z: 0.92, size: 1.05, followGaze: true },
      hat: { x: 0, y: 0.74, z: 0.78, size: 0.95 },
      magnify: { x: 0.42, y: 0.02, z: 0.74, size: 1.02, followGaze: true },
      coffee: { x: 0, y: -0.24, z: 0.88, size: 0.92 },
      joystick: { x: 0, y: -0.52, z: 0.76, size: 0.8, angle: 0.08 },
      star: { x: 0.36, y: 0.32, z: 0.82, size: 0.62 },
      book: { x: 0.02, y: -0.5, z: 0.84, size: 1.1, angle: 0.12 },
      hammer: { x: 0.56, y: -0.56, z: 0.6, size: 1.05, angle: -0.95 }
    };

    const cssSize = 168;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.round(cssSize * dpr);
    canvas.width = size;
    canvas.height = size;

    const EYE_RADIUS_RATIO = 0.36;

    let sphereRadiusRatio = 0.21;
    const center = (size - 1) / 2;
    let radius = size * sphereRadiusRatio;
    const eyeSize = size * EYE_RADIUS_RATIO;

    const eyeSlots = [
      { x: -0.22, y: 0.06 },
      { x: 0.22, y: 0.06 }
    ];

    const gaze = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const maxGaze = 0.2;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = reducedMotion ? 1 : 0.18;

    let sphere = paintSphere(size, getCurrentPalette(), effect3d, 0, botShape);

    updateChipStyles();
    syncShapeControlsFor3d();

    function getCurrentPalette() {
      return stylePresets[colorStyle][selectedColor];
    }

    function updateChipStyles() {
      const chips = chipByStyle[colorStyle];
      colorButtons.forEach((button) => {
        button.style.setProperty("--chip", chips[button.dataset.color]);
      });
    }

    function refreshSphereCache() {
      sphere = paintSphere(size, getCurrentPalette(), effect3d, 0, botShape);
    }

    function applyBotZoom() {
      const scale = Number(botZoomInput.value) / 100;
      canvas.style.transform = scale === 1 ? "" : `scale(${scale})`;
      botZoomInput.setAttribute("aria-valuenow", botZoomInput.value);
    }

    function applyFaceSize() {
      sphereRadiusRatio = Number(faceSizeInput.value) / 100;
      radius = size * sphereRadiusRatio;
      faceSizeInput.setAttribute("aria-valuenow", faceSizeInput.value);
      refreshSphereCache();
    }

    botZoomInput.addEventListener("input", applyBotZoom);
    faceSizeInput.addEventListener("input", applyFaceSize);
    applyBotZoom();

    function syncAccessoryButtons() {
      accessoryButtons.forEach((button) => {
        const id = button.dataset.accessory;
        button.setAttribute("aria-pressed", activeAccessories.has(id) ? "true" : "false");
      });
    }

    function applyModeAccessories(nextMode) {
      activeAccessories.clear();
      const preset = modeAccessories[nextMode];
      if (preset) {
        preset.forEach((id) => activeAccessories.add(id));
      }
      syncAccessoryButtons();
    }

    function syncShapeControlsFor3d() {
      shapeButtons.forEach((button) => {
        button.disabled = false;
      });
    }

    const modes = {
      idle: { label: "I'm watching you." },
      search: { label: "Searching for files…" },
      work: { label: "Working on the current task." },
      think: { label: "Thinking about the best approach." },
      read: { label: "Reading, line by line." },
      play: { label: "Playing for a moment!" },
      happy: { label: "All good — I'm happy." },
      struggle: { label: "This task is difficult." },
      rest: { label: "Taking a short rest." },
      chat: { label: "Chatting and explaining…" },
      focus: { label: "Focused on the task." },
      pride: { label: "Proud of what we did!" }
    };

    const TRANSITION_SEC = reducedMotion ? 0 : 0.72;

    let idlePhrase = modes.idle.label;
    let modeScheduleId = null;
    const RESPONSE_DISPLAY_MS = 3000;
    const INACTIVITY_REST_MS = 15000;
    let inactivityTimer = null;
    let restFromInactivity = false;

    function clearModeSchedule() {
      if (modeScheduleId != null) {
        clearTimeout(modeScheduleId);
        modeScheduleId = null;
      }
    }

    function syncModeButtons(activeMode) {
      modeButtons.forEach((item) => {
        const pressed = activeMode !== "idle" && item.dataset.mode === activeMode;
        item.setAttribute("aria-pressed", pressed ? "true" : "false");
      });
    }

    function normalizeMode(name) {
      if (!name || name === "idle" || name === "normal" || name === "default") {
        return "idle";
      }
      if (!MODE_IDS.has(name)) {
        throw new Error(`Gbot: unknown mode "${name}".`);
      }
      return name;
    }

    function enterMode(nextMode, options = {}) {
      const next = normalizeMode(nextMode);
      if (next === "idle") {
        stopMode();
        return;
      }
      const now = performance.now();
      const sameMode = mode === next;
      const restart = options.restartAnimation ?? !sameMode;

      if (!sameMode || restart) {
        blendFromAnim = lastAnim
          ? { ...lastAnim, look: { ...lastAnim.look }, eyeScale: { ...lastAnim.eyeScale } }
          : null;
        blendUntil = now + TRANSITION_SEC * 1000;
        mode = next;
        if (!sameMode) {
          modeSince = now;
        }
        surprisedUntil = 0;
        applyModeAccessories(next);
        syncModeButtons(next);
      }

      if (options.phrase != null) {
        statusEl.textContent = options.phrase;
      } else if (!sameMode) {
        statusEl.textContent = modes[next].label;
      }

      clearModeSchedule();
      let duration = options.duration;
      if ((duration == null || duration <= 0) && next === "chat" && options.phrase != null) {
        duration = RESPONSE_DISPLAY_MS;
      }
      if (duration != null && duration > 0) {
        modeScheduleId = setTimeout(() => {
          modeScheduleId = null;
          stopMode();
        }, duration);
      }
    }

    function clearInactivityTimer() {
      if (inactivityTimer != null) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }
    }

    function scheduleInactivityRest() {
      clearInactivityTimer();
      inactivityTimer = setTimeout(() => {
        inactivityTimer = null;
        if (mode === "idle") {
          restFromInactivity = true;
          enterMode("rest", { restartAnimation: true });
        }
      }, INACTIVITY_REST_MS);
    }

    function noteUserActivity() {
      if (mode === "rest" && restFromInactivity) {
        restFromInactivity = false;
        const now = performance.now();
        blendFromAnim = lastAnim
          ? { ...lastAnim, look: { ...lastAnim.look }, eyeScale: { ...lastAnim.eyeScale } }
          : null;
        blendUntil = now + TRANSITION_SEC * 1000;
        mode = "idle";
        modeSince = now;
        surprisedUntil = 0;
        statusEl.textContent = idlePhrase;
        syncModeButtons("idle");
        applyModeAccessories("idle");
      }
      scheduleInactivityRest();
    }

    function stopMode() {
      clearModeSchedule();
      returnToIdle(performance.now());
    }

    function setPhrase(text) {
      statusEl.textContent = text;
    }

    function getMode() {
      return mode === "idle" ? "idle" : mode;
    }

    function applyConfig(cfg) {
      if (cfg.colorStyle != null) {
        colorStyle = cfg.colorStyle;
        if (colorStyleSelect) colorStyleSelect.value = colorStyle;
        updateChipStyles();
        refreshSphereCache();
      }
      if (cfg.color != null) {
        selectedColor = cfg.color;
        colorButtons.forEach((item) => {
          item.setAttribute("aria-pressed", item.dataset.color === selectedColor ? "true" : "false");
        });
        refreshSphereCache();
      }
      if (cfg.effect3d != null) {
        effect3d = Boolean(cfg.effect3d);
        if (effect3dInput) effect3dInput.checked = effect3d;
        syncShapeControlsFor3d();
        refreshSphereCache();
      }
      if (cfg.shape != null) {
        botShape = cfg.shape === "house" || cfg.shape === "drop" ? "round" : cfg.shape;
        shapeButtons.forEach((item) => {
          item.setAttribute("aria-pressed", item.dataset.shape === botShape ? "true" : "false");
        });
        refreshSphereCache();
      }
      if (cfg.zoom != null && botZoomInput) {
        botZoomInput.value = String(cfg.zoom);
        applyBotZoom();
      }
      if (cfg.faceSize != null && faceSizeInput) {
        faceSizeInput.value = String(cfg.faceSize);
        applyFaceSize();
      }
      if (cfg.welcomePhrase != null) {
        idlePhrase = cfg.welcomePhrase;
        if (mode === "idle") {
          statusEl.textContent = idlePhrase;
        }
      }
    }

    let mode = "idle";
    let modeSince = performance.now();
    let surprisedUntil = 0;
    let blinkPhase = 0;
    let sessionYaw = 0;
    let sessionRoll = 0;
    let appearanceStart = 0;
    let appearanceUntil = 0;
    let appearanceOriginYaw = 0;
    let blendUntil = 0;
    let blendFromAnim = null;
    let lastAnim = null;

    if (botNameEl && botNameInput) {
      botNameEl.addEventListener("click", () => {
        botNameInput.value = botNameEl.textContent;
        botNameEl.hidden = true;
        botNameInput.hidden = false;
        botNameInput.focus();
        botNameInput.select();
      });

      botNameInput.addEventListener("blur", () => {
        const name = botNameInput.value.trim() || "Bot";
        botNameEl.textContent = name;
        botNameInput.hidden = true;
        botNameEl.hidden = false;
        canvas.setAttribute("aria-label", `${name}, interactive GBot`);
      });

      botNameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          botNameInput.blur();
        }
        if (event.key === "Escape") {
          botNameInput.value = botNameEl.textContent;
          botNameInput.blur();
        }
      });
    } else {
      canvas.setAttribute("aria-label", "Interactive GBot");
    }

    window.addEventListener("pointermove", (event) => {
      noteUserActivity();
      if (mode !== "idle" || performance.now() < surprisedUntil) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const range = 190;
      target.x = clamp(dx / range, -1, 1) * maxGaze;
      target.y = clamp(-dy / range, -1, 1) * maxGaze * 0.85;
    });

    document.documentElement.addEventListener("pointerleave", () => {
      if (mode === "idle") {
        target.x = 0;
        target.y = 0;
      }
    });

    canvas.addEventListener("click", () => {
      restFromInactivity = false;
      returnToIdle(performance.now());
    });

    ["pointerdown", "keydown", "click", "touchstart"].forEach((type) => {
      document.addEventListener(type, noteUserActivity, { passive: true });
    });

    function returnToIdle(now) {
      clearModeSchedule();
      restFromInactivity = false;
      blendFromAnim = lastAnim
        ? { ...lastAnim, look: { ...lastAnim.look }, eyeScale: { ...lastAnim.eyeScale } }
        : null;
      blendUntil = now + TRANSITION_SEC * 1000;
      mode = "idle";
      modeSince = now;
      surprisedUntil = now + (reducedMotion ? 120 : 700);
      statusEl.textContent = idlePhrase;
      syncModeButtons("idle");
      applyModeAccessories("idle");
      startAppearance(now);
      scheduleInactivityRest();
    }

    colorStyleSelect.addEventListener("change", () => {
      colorStyle = colorStyleSelect.value;
      updateChipStyles();
      refreshSphereCache();
    });

    effect3dInput.addEventListener("change", () => {
      effect3d = effect3dInput.checked;
      syncShapeControlsFor3d();
      refreshSphereCache();
    });

    shapeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) {
          return;
        }
        botShape = button.dataset.shape;
        refreshSphereCache();
        shapeButtons.forEach((item) => {
          item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
      });
    });

    colorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedColor = button.dataset.color;
        refreshSphereCache();
        colorButtons.forEach((item) => {
          item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
      });
    });

    accessoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.accessory;
        if (activeAccessories.has(id)) {
          activeAccessories.delete(id);
        } else {
          activeAccessories.add(id);
        }
        syncAccessoryButtons();
      });
    });

    modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        enterMode(button.dataset.mode, { restartAnimation: true });
      });
    });

    idlePhrase = opts.welcomePhrase ?? modes.idle.label;
    applyConfig(opts);
    statusEl.textContent = idlePhrase;

    startAppearance(performance.now());
    scheduleInactivityRest();
    requestAnimationFrame(frame);

    function startAppearance(now) {
      if (reducedMotion) {
        return;
      }
      appearanceOriginYaw = sessionYaw;
      appearanceStart = now;
      appearanceUntil = now + 1850;
    }

    function isAppearance(now) {
      return now < appearanceUntil;
    }

    function appearanceYawAt(now) {
      const elapsed = (now - appearanceStart) / 1000;
      if (elapsed >= 1.75) {
        return appearanceOriginYaw + Math.PI * 6;
      }
      if (elapsed < 0.28) {
        return appearanceOriginYaw + Math.PI * 2 * easeInOutCubic(elapsed / 0.28);
      }
      if (elapsed < 0.56) {
        const p = (elapsed - 0.28) / 0.28;
        return appearanceOriginYaw + Math.PI * 2 + Math.PI * 2 * easeInOutCubic(p);
      }
      const p = (elapsed - 0.56) / 1.19;
      return appearanceOriginYaw + Math.PI * 4 + Math.PI * 2 * easeOutCubic(clamp(p, 0, 1));
    }

    function thinkAnimAt(t) {
      if (reducedMotion) {
        return { blink: 1, coffeeSip: 0 };
      }

      let blink = 1;
      const blinkPause = 5.2;
      const blinkActive = 0.5;
      const blinkLocal = t % (blinkPause + blinkActive);
      if (blinkLocal >= blinkPause) {
        const u = (blinkLocal - blinkPause) / blinkActive;
        const close = 0.085;
        const gap = 0.11;

        function oneBlink(offset) {
          const phase = u - offset;
          if (phase < 0 || phase > close * 2) {
            return null;
          }
          if (phase < close) {
            return 1 - easeInOutCubic(phase / close) * 0.92;
          }
          return 0.08 + easeInOutCubic((phase - close) / close) * 0.92;
        }

        const first = oneBlink(0);
        if (first !== null) {
          blink = first;
        } else {
          const second = oneBlink(close * 2 + gap);
          if (second !== null) {
            blink = second;
          }
        }
      }

      let coffeeSip = 0;
      const sipPause = 10.8;
      const sipActive = 2.4;
      const sipLocal = t % (sipPause + sipActive);
      if (sipLocal >= sipPause) {
        const u = (sipLocal - sipPause) / sipActive;
        if (u < 0.2) {
          coffeeSip = easeInOutCubic(u / 0.2);
          if (u > 0.06) {
            blink = Math.min(blink, 0.07);
          }
        } else if (u < 0.78) {
          coffeeSip = 1;
          blink = Math.min(blink, 0.06);
        } else {
          coffeeSip = 1 - easeInOutCubic((u - 0.78) / 0.22);
          if (u < 0.9) {
            blink = Math.min(blink, 0.08);
          }
        }
      }

      return { blink, coffeeSip };
    }

    function searchAnimAt(t) {
      if (reducedMotion) {
        return { focus: 0, freezeT: t };
      }
      const scanPause = 7.2;
      const focusActive = 2.2;
      const local = t % (scanPause + focusActive);
      if (local < scanPause) {
        return { focus: 0, freezeT: scanPause };
      }
      const u = (local - scanPause) / focusActive;
      let focus = 0;
      if (u < 0.2) {
        focus = easeInOutCubic(u / 0.2);
      } else if (u < 0.7) {
        focus = 1;
      } else {
        focus = 1 - easeInOutCubic((u - 0.7) / 0.3);
      }
      return { focus, freezeT: scanPause };
    }

    function workAnimAt(t) {
      if (reducedMotion) {
        return { breath: 0, breathT: 0, freezeT: t };
      }
      const workPause = 8.4;
      const breathActive = 2.65;
      const local = t % (workPause + breathActive);
      if (local < workPause) {
        return { breath: 0, breathT: 0, freezeT: workPause };
      }
      const breathT = local - workPause;
      const u = breathT / breathActive;
      let breath = 0;
      if (u < 0.14) {
        breath = easeInOutCubic(u / 0.14);
      } else if (u < 0.78) {
        breath = 1;
      } else {
        breath = 1 - easeInOutCubic((u - 0.78) / 0.22);
      }
      return { breath, breathT, freezeT: workPause };
    }

    function readAnimAt(t) {
      if (reducedMotion) {
        return { pageTurn: 0, lower: 0, flip: 0, freezeT: t };
      }
      const readPause = 11.8;
      const pageActive = 2.4;
      const local = t % (readPause + pageActive);
      if (local < readPause) {
        return { pageTurn: 0, lower: 0, flip: 0, freezeT: readPause };
      }
      const pageT = local - readPause;
      const u = pageT / pageActive;
      let pageTurn = 0;
      if (u < 0.12) {
        pageTurn = easeInOutCubic(u / 0.12);
      } else if (u < 0.88) {
        pageTurn = 1;
      } else {
        pageTurn = 1 - easeInOutCubic((u - 0.88) / 0.12);
      }

      let lower = 0;
      if (u < 0.2) {
        lower = easeInOutCubic(u / 0.2);
      } else if (u < 0.8) {
        lower = 1;
      } else {
        lower = 1 - easeInOutCubic((u - 0.8) / 0.2);
      }

      let flip = 0;
      if (u >= 0.24 && u < 0.72) {
        flip = easeInOutCubic((u - 0.24) / 0.48);
      } else if (u >= 0.72) {
        flip = 1;
      }

      return { pageTurn, lower, flip, freezeT: readPause };
    }

    function struggleAnimAt(t) {
      if (reducedMotion) {
        return {
          starVisible: 1,
          bulb: 0,
          furrowBrows: true,
          headShake: 0,
          rejectRoll: 0,
          lookUp: 0,
          struggleIntensity: 1
        };
      }
      const pause = 11.6;
      const active = 4.35;
      const local = t % (pause + active);
      if (local < pause) {
        return {
          starVisible: 1,
          bulb: 0,
          furrowBrows: true,
          headShake: 0,
          rejectRoll: 0,
          lookUp: 0,
          struggleIntensity: 1
        };
      }
      const u = (local - pause) / active;
      const rejectT = local - pause - active * 0.58;
      let starVisible = 1;
      let bulb = 0;
      let furrowBrows = true;
      let headShake = 0;
      let lookUp = 0;
      let struggleIntensity = 1;

      if (u < 0.14) {
        const p = u / 0.14;
        starVisible = 1 - easeInOutCubic(p);
        furrowBrows = false;
        lookUp = 0.16 * p;
        struggleIntensity = 1 - p * 0.5;
      } else if (u < 0.48) {
        starVisible = 0;
        furrowBrows = false;
        lookUp = 0.18;
        bulb = easeInOutCubic((u - 0.14) / 0.34);
        struggleIntensity = 0.35;
      } else if (u < 0.6) {
        starVisible = 0;
        furrowBrows = false;
        lookUp = 0.12;
        bulb = 1 - easeInOutCubic((u - 0.48) / 0.12);
        struggleIntensity = 0.4;
      } else if (u < 0.84) {
        starVisible = 0;
        furrowBrows = false;
        bulb = 0;
        headShake = 1;
        lookUp = 0.05;
        struggleIntensity = 0.45;
      } else {
        const p = (u - 0.84) / 0.16;
        starVisible = easeInOutCubic(p);
        furrowBrows = p > 0.45;
        headShake = 1 - p;
        lookUp = 0.05 * (1 - p);
        struggleIntensity = 0.45 + p * 0.55;
      }

      const rejectRoll = headShake > 0.05
        ? Math.sin(Math.max(0, rejectT) * 15.5) * 0.34 * headShake
        : 0;

      return {
        starVisible,
        bulb,
        furrowBrows,
        headShake,
        rejectRoll,
        lookUp,
        struggleIntensity
      };
    }

    function restAnimAt(t) {
      if (reducedMotion) {
        return { sleep: 0.6, snore: 0.4, jerk: 0, blink: 0.09 };
      }
      const pause = 7.8;
      const nap = 3.6;
      const local = t % (pause + nap);
      if (local < pause) {
        return { sleep: 0.55, snore: 0.45, jerk: 0, blink: 0.09 };
      }
      const u = (local - pause) / nap;
      let sleep = 1;
      let snore = 0;
      let jerk = 0;
      let blink = 0.07;
      if (u < 0.7) {
        snore = easeInOutCubic(Math.min(1, u / 0.25));
      } else if (u < 0.88) {
        snore = 1;
        jerk = easeInOutCubic((u - 0.7) / 0.18);
        blink = 0.35 + jerk * 0.4;
      } else {
        const p = (u - 0.88) / 0.12;
        snore = 1 - p;
        sleep = 1 - p;
        blink = 0.12 + p * 0.08;
      }
      return { sleep, snore, jerk, blink };
    }

    function chatAnimAt(t) {
      if (reducedMotion) {
        return { bubble: 1, tilt: 0, talking: 1, pause: 0 };
      }
      const talk = 9.4;
      const pauseActive = 1.35;
      const local = t % (talk + pauseActive);
      if (local < talk) {
        return {
          bubble: 1,
          tilt: 0.1 + Math.sin(t * 5.5) * 0.045,
          talking: 1,
          pause: 0
        };
      }
      const u = (local - talk) / pauseActive;
      let bubble = 0;
      if (u < 0.22) {
        bubble = 1 - easeInOutCubic(u / 0.22);
      } else if (u < 0.72) {
        bubble = 0;
      } else {
        bubble = easeInOutCubic((u - 0.72) / 0.28);
      }
      return {
        bubble,
        tilt: bubble * 0.05,
        talking: bubble,
        pause: 1 - bubble
      };
    }

    function focusNodAt(t, rub) {
      if (rub > 0.08) {
        return 0;
      }
      const every = 5.4;
      const duration = 0.52;
      const local = t % every;
      if (local < every - duration) {
        return 0;
      }
      const p = (local - (every - duration)) / duration;
      return Math.sin(p * Math.PI) * 0.1;
    }

    function focusAnimAt(t) {
      if (reducedMotion) {
        return { glassesLift: 0, focusWink: 0, blink: 1, nod: 0 };
      }
      const pause = 10;
      const breakActive = 2.55;
      const local = t % (pause + breakActive);
      if (local < pause) {
        return {
          glassesLift: 0,
          focusWink: 0,
          blink: 1,
          nod: focusNodAt(t, 0)
        };
      }
      const u = (local - pause) / breakActive;
      let glassesLift = 0;
      let focusWink = 0;
      if (u < 0.2) {
        glassesLift = easeInOutCubic(u / 0.2);
        focusWink = glassesLift > 0.35 ? 1 : 0;
      } else if (u < 0.68) {
        glassesLift = 1;
        focusWink = 1;
      } else {
        const p = (u - 0.68) / 0.32;
        glassesLift = 1 - easeInOutCubic(p);
        focusWink = p < 0.45 ? 1 : 0;
      }
      return {
        glassesLift,
        focusWink,
        blink: 1,
        nod: focusNodAt(t, focusWink)
      };
    }

    function prideAnimAt(t) {
      if (reducedMotion) {
        return { cheer: 0.2, jump: 0, confetti: 0 };
      }
      const interval = 2.8;
      const burst = 2.45;
      const local = t % interval;
      const cheerBase = 0.1;
      if (local >= burst) {
        return { cheer: cheerBase, jump: 0, confetti: 0 };
      }
      const u = local / burst;
      const peak = u < 0.32
        ? easeOutCubic(u / 0.32)
        : 1 - easeInOutCubic((u - 0.32) / 0.68);
      return {
        cheer: cheerBase + peak * 0.9,
        jump: peak * Math.sin(Math.min(1, u / 0.38) * Math.PI),
        confetti: peak
      };
    }

    function happyYawAt(t) {
      if (reducedMotion) {
        return 0;
      }
      const pause = 6.2;
      const spinDur = 1.55;
      const cycle = pause + spinDur;
      const local = t % cycle;
      const laps = Math.floor(t / cycle);
      if (local < pause) {
        return laps * Math.PI * 2;
      }
      const u = (local - pause) / spinDur;
      return laps * Math.PI * 2 + easeInOutCubic(clamp(u, 0, 1)) * Math.PI * 2;
    }

    function playRollAt(t) {
      const step = 0.62;
      const spinStep = 1.05;
      const swingsBeforeSpin = 7;

      let elapsed = 0;
      let swingIndex = 0;
      let roll = 0;

      while (elapsed < t) {
        const spinning = swingIndex === swingsBeforeSpin;
        const duration = spinning ? spinStep : step;
        const inSegment = t - elapsed;

        if (inSegment < duration) {
          const progress = easeInOutCubic(inSegment / duration);
          if (spinning) {
            return roll + Math.PI * 2 * progress;
          }
          if (swingIndex === 0) {
            return roll + (Math.PI / 4) * progress;
          }
          const delta = swingIndex % 2 === 1 ? -Math.PI / 2 : Math.PI / 2;
          return roll + delta * progress;
        }

        if (spinning) {
          roll += Math.PI * 2;
          swingIndex = 1;
        } else if (swingIndex === 0) {
          roll = Math.PI / 4;
          swingIndex = 1;
        } else {
          roll += swingIndex % 2 === 1 ? -Math.PI / 2 : Math.PI / 2;
          swingIndex += 1;
        }
        elapsed += duration;
      }

      return roll;
    }

    function frame(now) {
      const t = (now - modeSince) / 1000;
      const surprised = now < surprisedUntil;
      let anim = buildAnimation(now, t, surprised);

      if (isAppearance(now) && !reducedMotion) {
        sessionYaw = appearanceYawAt(now);
        sessionRoll += (0 - sessionRoll) * 0.2;
      } else if (mode === "play" && !reducedMotion) {
        sessionRoll = playRollAt(t);
        const goal = faceYaw(sessionYaw);
        sessionYaw += shortestDelta(sessionYaw, goal) * 0.14;
      } else if (mode === "struggle" && !reducedMotion && (anim.struggleReject || 0) > 0.05) {
        sessionRoll = anim.rejectRoll || 0;
        const goal = faceYaw(sessionYaw);
        sessionYaw += shortestDelta(sessionYaw, goal) * 0.12;
      } else if (mode === "chat" && !reducedMotion) {
        sessionRoll = anim.chatTilt || 0;
        const goal = faceYaw(sessionYaw);
        sessionYaw += shortestDelta(sessionYaw, goal) * 0.1;
      } else if (mode === "happy" && !reducedMotion) {
        sessionYaw = happyYawAt(t);
        sessionRoll += (0 - sessionRoll) * 0.14;
      } else if (!reducedMotion) {
        sessionRoll += (0 - sessionRoll) * 0.14;
        const goal = faceYaw(sessionYaw);
        const turning = now < blendUntil ? 0.16 : 0.1;
        sessionYaw += shortestDelta(sessionYaw, goal) * turning;
      }

      anim.yaw = sessionYaw;
      anim.roll = sessionRoll;

      if (blendFromAnim && now < blendUntil) {
        const raw = 1 - (blendUntil - now) / (TRANSITION_SEC * 1000);
        anim = mixAnim(blendFromAnim, anim, easeOutCubic(clamp(raw, 0, 1)));
        anim.yaw = sessionYaw;
        anim.roll = sessionRoll;
      }

      lastAnim = {
        ...anim,
        look: { ...anim.look },
        eyeScale: { ...anim.eyeScale }
      };

      gaze.x += (anim.look.x - gaze.x) * ease;
      gaze.y += (anim.look.y - gaze.y) * ease;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(0, anim.bobY * dpr);
      drawShadow(ctx, center, center + radius * 0.92 + anim.bobY * dpr, radius);

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(anim.roll || 0);
      ctx.translate(-center, -center);

      const body = effect3d && Math.abs(anim.yaw) > 0.002
        ? paintSphere(size, getCurrentPalette(), true, anim.yaw, botShape)
        : sphere;
      ctx.drawImage(body, 0, 0);

      const placed = eyeSlots
        .map((slot, index) => placeEye(slot, gaze, anim, index))
        .filter(Boolean)
        .sort((a, b) => a.z - b.z);

      for (const eye of placed) {
        const eyeAnim = mode === "focus" && (anim.focusWink || 0) > 0.2 && eye.side > 0
          ? { ...anim, blink: 0.26 }
          : anim;
        const cheer = eyeAnim.cheerMix ?? (eyeAnim.eyeStyle === "cheer" ? 1 : 0);
        if (mode === "pride") {
          if (cheer > 0.42) {
            drawCheerEye(ctx, eye, eyeAnim, 1);
          } else {
            drawPillEye(ctx, eye, eyeAnim, 1);
          }
        } else if (cheer > 0.94) {
          drawCheerEye(ctx, eye, eyeAnim, 1);
        } else if (cheer < 0.06) {
          drawPillEye(ctx, eye, eyeAnim, 1);
        } else {
          drawPillEye(ctx, eye, eyeAnim, 1 - cheer);
          drawCheerEye(ctx, eye, eyeAnim, cheer);
        }
        if (anim.furrowBrows) {
          drawFurrowedBrow(ctx, eye);
        }
      }

      drawAccessories(ctx, anim, now);
      if (mode === "work" && (anim.workBreath || 0) > 0.2) {
        drawWorkBreath(ctx, anim, t);
      }
      ctx.restore();
      ctx.restore();

      if (mode === "pride" && (anim.prideConfetti || 0) > 0.05) {
        ctx.save();
        ctx.translate(0, anim.bobY * dpr);
        drawPrideConfetti(ctx, anim, t);
        ctx.restore();
      }

      if (mode === "chat" && (anim.chatBubble || 0) > 0.05) {
        ctx.save();
        ctx.translate(0, anim.bobY * dpr);
        drawChatBubble(ctx, anim, t);
        ctx.restore();
      }

      if (mode === "rest") {
        ctx.save();
        ctx.translate(0, anim.bobY * dpr);
        drawRestSnores(ctx, anim, t);
        ctx.restore();
      }

      requestAnimationFrame(frame);
    }

    function buildAnimation(now, t, surprised) {
      if (surprised) {
        const pulse = 1 + Math.sin((1 - (surprisedUntil - now) / 700) * Math.PI) * 0.04;
        return {
          look: { x: 0, y: 0.02 },
          bobY: -2 * dpr * pulse,
          eyeScale: { w: 1.45, h: 1.75 },
          eyeGap: 1.08,
          shake: 0,
          blink: 1,
          yaw: 0,
          eyeStyle: "pill"
        };
      }

      switch (mode) {
        case "search": {
          const search = searchAnimAt(t);
          const scanT = search.focus > 0 ? search.freezeT : t;
          const focus = search.focus;
          return {
            look: { x: Math.sin(scanT * 3.2) * 0.26, y: Math.sin(scanT * 1.7) * 0.05 },
            bobY: Math.sin(t * 4.5) * 0.8 * dpr * (1 - focus * 0.88),
            eyeScale: { w: 1 + focus * 0.06, h: 1.05 + focus * 0.14 },
            eyeGap: 1,
            shake: 0,
            blink: 1,
            magnifyFocus: focus,
            yaw: 0,
            eyeStyle: "pill"
          };
        }
        case "work": {
          const work = workAnimAt(t);
          const breath = work.breath;
          const wt = breath > 0 ? work.freezeT : t;
          if (breath > 0.12) {
            blinkPhase = 0.88 + Math.sin(work.breathT * 2.6) * 0.1 * breath;
          } else {
            blinkPhase = (Math.sin(wt * 5.5) + 1) / 2;
          }
          const workingBob = Math.sin(t * 8) * 0.35;
          const breathBob = Math.sin(work.breathT * 2.5) * 2.4 * breath;
          return {
            look: { x: 0.04, y: -0.12 + breath * 0.05 },
            bobY: (breath > 0 ? breathBob : workingBob) * dpr,
            eyeScale: breath > 0.12
              ? { w: 0.94, h: 0.62 + Math.sin(work.breathT * 2.5) * 0.1 * breath }
              : { w: 0.92, h: 0.55 + blinkPhase * 0.45 },
            eyeGap: 0.96,
            shake: 0,
            blink: breath > 0.12 ? blinkPhase : blinkPhase,
            workBreath: breath,
            yaw: 0,
            eyeStyle: "pill"
          };
        }
        case "think": {
          const think = thinkAnimAt(t);
          blinkPhase = think.blink;
          const sip = think.coffeeSip;
          return {
            look: {
              x: Math.sin(t * 0.9) * 0.06 * (1 - sip * 0.7),
              y: 0.22 + sip * 0.1
            },
            bobY: (Math.sin(t * 1.4) * 1.1 + sip * Math.sin(t * 14) * 0.35) * dpr,
            eyeScale: { w: 0.88, h: 1.12 },
            eyeGap: 1,
            shake: 0,
            blink: blinkPhase,
            coffeeSip: sip,
            yaw: 0,
            eyeStyle: "pill"
          };
        }
        case "read": {
          const read = readAnimAt(t);
          const turning = read.pageTurn > 0.08;
          const scanT = turning ? read.freezeT : t;
          const lineDuration = 2.7;
          const jumpDuration = 0.15;
          const cycle = lineDuration + jumpDuration;
          const phase = scanT % cycle;
          const left = -0.24;
          const right = 0.24;
          let lookX = right;
          let lookY = -0.2;
          if (turning) {
            lookX = 0.04 + read.flip * 0.05;
            lookY = -0.1 + read.lower * 0.04;
          } else if (phase < lineDuration) {
            const progress = phase / lineDuration;
            lookX = right + (left - right) * progress;
          } else {
            const jump = (phase - lineDuration) / jumpDuration;
            lookX = left + (right - left) * jump;
          }
          const readBob = Math.sin(t * 1.8) * 0.45 * (1 - read.pageTurn * 0.85);
          return {
            look: { x: lookX, y: lookY },
            bobY: readBob * dpr,
            eyeScale: { w: 0.94, h: 0.88 },
            eyeGap: 0.98,
            shake: 0,
            blink: 1,
            bookLower: read.lower,
            bookFlip: read.flip,
            yaw: 0,
            eyeStyle: "pill"
          };
        }
        case "play":
          return {
            look: { x: 0, y: 0 },
            bobY: Math.sin(t * 5.5) * 1.6 * dpr,
            eyeScale: { w: 1.02, h: 1.08 },
            eyeGap: 1,
            shake: 0,
            blink: 1,
            yaw: 0,
            roll: 0,
            eyeStyle: "pill"
          };
        case "happy":
          return {
            look: { x: 0, y: 0.04 },
            bobY: Math.sin(t * 3) * 2 * dpr,
            eyeScale: { w: 1, h: 1 },
            eyeGap: 1,
            shake: 0,
            blink: 1,
            yaw: 0,
            eyeStyle: "cheer"
          };
        case "struggle": {
          const struggle = struggleAnimAt(t);
          const wobble = struggle.headShake > 0.05 ? 0 : Math.sin(t * 2.4) * 0.04;
          const intensity = struggle.struggleIntensity;
          return {
            look: { x: wobble, y: 0.04 + struggle.lookUp },
            bobY: Math.sin(t * 5) * 1 * intensity * dpr,
            eyeScale: {
              w: struggle.bulb > 0.2 ? 1.06 : 1,
              h: struggle.bulb > 0.2 ? 1.12 : 1
            },
            eyeGap: 1.02,
            shake: Math.sin(t * 10) * 1.4 * intensity * dpr,
            blink: 1,
            yaw: 0,
            eyeStyle: "pill",
            furrowBrows: struggle.furrowBrows,
            starVisible: struggle.starVisible,
            struggleBulb: struggle.bulb,
            struggleReject: struggle.headShake,
            rejectRoll: struggle.rejectRoll
          };
        }
        case "rest": {
          const rest = restAnimAt(t);
          return {
            look: { x: 0, y: 0.06 + rest.jerk * -0.12 },
            bobY: (Math.sin(t * 1.1) * 0.6 * (1 - rest.sleep * 0.7) + rest.jerk * 2.8) * dpr,
            eyeScale: { w: 1.02, h: 0.88 },
            eyeGap: 1,
            shake: 0,
            blink: Math.min(rest.blink, 0.12),
            yaw: 0,
            eyeStyle: "pill",
            restSnore: rest.snore,
            restSleep: rest.sleep
          };
        }
        case "chat": {
          const chat = chatAnimAt(t);
          const talk = chat.talking > 0.5;
          const nod = talk
            ? Math.sin(t * 6.2) * 0.045
            : Math.sin(t * 1.4) * 0.01;
          return {
            look: { x: nod, y: 0.02 + (talk ? Math.sin(t * 7) * 0.02 : 0) },
            bobY: (talk ? Math.sin(t * 5.8) * 1.15 : Math.sin(t * 1.2) * 0.25) * dpr,
            eyeScale: { w: 1, h: talk ? 1.04 + Math.sin(t * 8) * 0.03 : 1.02 },
            eyeGap: 1,
            shake: talk ? Math.sin(t * 11) * 0.35 * dpr : 0,
            blink: talk ? 0.9 + Math.sin(t * 4) * 0.08 : 0.96,
            yaw: 0,
            eyeStyle: "pill",
            chatBubble: chat.bubble,
            chatTilt: chat.tilt,
            chatTalking: chat.talking
          };
        }
        case "focus": {
          const focus = focusAnimAt(t);
          return {
            look: {
              x: 0.03 * (1 - focus.focusWink * 0.35),
              y: -0.07 + focus.focusWink * 0.03 + focus.nod
            },
            bobY: (Math.sin(t * 1.15) * 0.32 + focus.nod * 2.2) * dpr,
            eyeScale: { w: 0.94, h: 0.96 },
            eyeGap: 0.98,
            shake: 0,
            blink: focus.blink,
            yaw: 0,
            eyeStyle: "pill",
            glassesLift: focus.glassesLift,
            focusWink: focus.focusWink
          };
        }
        case "pride": {
          const pride = prideAnimAt(t);
          const jumpKick = pride.jump * Math.sin(pride.jump * Math.PI) * 5.2;
          return {
            look: { x: 0, y: 0.03 },
            bobY: (Math.sin(t * 2.4) * 1.1 - jumpKick) * dpr,
            eyeScale: { w: 1, h: 1 },
            eyeGap: 1.04,
            shake: 0,
            blink: 1,
            yaw: 0,
            eyeStyle: "pill",
            cheerMix: pride.cheer,
            prideConfetti: pride.confetti
          };
        }
        default:
          return {
            look: { x: target.x, y: target.y },
            bobY: 0,
            eyeScale: { w: 1, h: 1 },
            eyeGap: 1,
            shake: 0,
            blink: 1,
            yaw: 0,
            eyeStyle: "pill"
          };
      }
    }

    function mixAnim(from, to, progress) {
      const cheerFrom = from.eyeStyle === "cheer" ? 1 : 0;
      const cheerTo = to.eyeStyle === "cheer" ? 1 : 0;
      return {
        look: {
          x: lerp(from.look.x, to.look.x, progress),
          y: lerp(from.look.y, to.look.y, progress)
        },
        bobY: lerp(from.bobY, to.bobY, progress),
        eyeScale: {
          w: lerp(from.eyeScale.w, to.eyeScale.w, progress),
          h: lerp(from.eyeScale.h, to.eyeScale.h, progress)
        },
        eyeGap: lerp(from.eyeGap, to.eyeGap, progress),
        shake: lerp(from.shake, to.shake, progress),
        blink: lerp(from.blink, to.blink, progress),
        coffeeSip: lerp(from.coffeeSip || 0, to.coffeeSip || 0, progress),
        magnifyFocus: lerp(from.magnifyFocus || 0, to.magnifyFocus || 0, progress),
        workBreath: lerp(from.workBreath || 0, to.workBreath || 0, progress),
        bookLower: lerp(from.bookLower || 0, to.bookLower || 0, progress),
        bookFlip: lerp(from.bookFlip || 0, to.bookFlip || 0, progress),
        roll: lerp(from.roll || 0, to.roll || 0, progress),
        yaw: to.yaw,
        eyeStyle: progress < 0.55 ? from.eyeStyle : to.eyeStyle,
        cheerMix: lerp(from.cheerMix ?? cheerFrom, to.cheerMix ?? cheerTo, progress),
        furrowBrows: progress < 0.55 ? Boolean(from.furrowBrows) : Boolean(to.furrowBrows),
        starVisible: lerp(from.starVisible ?? 1, to.starVisible ?? 1, progress),
        struggleBulb: lerp(from.struggleBulb || 0, to.struggleBulb || 0, progress),
        chatBubble: lerp(from.chatBubble || 0, to.chatBubble || 0, progress),
        chatTilt: lerp(from.chatTilt || 0, to.chatTilt || 0, progress),
        restSnore: lerp(from.restSnore || 0, to.restSnore || 0, progress),
        glassesLift: lerp(from.glassesLift || 0, to.glassesLift || 0, progress),
        focusWink: lerp(from.focusWink || 0, to.focusWink || 0, progress),
        prideConfetti: lerp(from.prideConfetti || 0, to.prideConfetti || 0, progress)
      };
    }

    function faceYaw(yaw) {
      const tau = Math.PI * 2;
      const wrapped = ((yaw % tau) + tau) % tau;
      if (wrapped <= Math.PI) {
        return yaw - wrapped;
      }
      return yaw + (tau - wrapped);
    }

    function shortestDelta(from, to) {
      let delta = to - from;
      const tau = Math.PI * 2;
      while (delta > Math.PI) {
        delta -= tau;
      }
      while (delta < -Math.PI) {
        delta += tau;
      }
      return delta;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function drawAccessories(context, anim, now) {
      if (activeAccessories.size === 0) {
        return;
      }

      const yaw = anim.yaw || 0;
      const layers = [];

      for (const id of activeAccessories) {
        const item = accessoryCatalog[id];
        if (!item) {
          continue;
        }
        const anchor = accessoryAnchor(item, anim, yaw);
        if (!anchor) {
          continue;
        }
        layers.push({ id, item, anchor });
      }

      layers.sort((a, b) => a.anchor.z - b.anchor.z);

      if (mode === "read") {
        const bookIndex = layers.findIndex((layer) => layer.id === "book");
        if (bookIndex >= 0) {
          layers.push(layers.splice(bookIndex, 1)[0]);
        }
      }

      for (const layer of layers) {
        if (layer.id === "star" && mode === "struggle" && (anim.starVisible ?? 1) < 0.04) {
          continue;
        }
        drawAccessoryArt(context, layer.id, layer.item, layer.anchor, now, anim);
      }

      if (mode === "struggle" && (anim.struggleBulb || 0) > 0.03) {
        drawIdeaBulb(context, anim, yaw);
      }
    }

    function hammerSwingAngle(nowMs, anim) {
      if (reducedMotion) {
        return 0;
      }
      if (mode === "work" && (anim?.workBreath || 0) > 0.06) {
        return -0.22;
      }
      const t = (nowMs - modeSince) / 1000;
      const phase = t % 1.45;
      if (phase < 0.32) {
        return 0.42 * Math.sin((phase / 0.32) * Math.PI * 0.5);
      }
      if (phase < 0.46) {
        return 0.42 - 1.12 * ((phase - 0.32) / 0.14);
      }
      if (phase < 0.62) {
        return -0.7 + 0.48 * ((phase - 0.46) / 0.16);
      }
      return -0.22;
    }

    function accessoryAnchor(item, anim, yaw) {
      let x = item.x + anim.shake / (radius * 3.2);
      let y = item.y;
      if (item.followGaze) {
        x += gaze.x * 0.9;
        y += gaze.y * 0.9;
      }
      const limit = 0.56;
      const magnitude = Math.hypot(x, y);
      if (magnitude > limit) {
        x = (x / magnitude) * limit;
        y = (y / magnitude) * limit;
      }
      const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
      const turned = rotateYaw(x, y, z, yaw);
      if (turned.z < 0.07) {
        return null;
      }
      return turned;
    }

    function drawAccessoryArt(context, id, item, anchor, now, anim) {
      const depth = anchor.z;
      const sx = center + anchor.x * radius;
      const sy = center - anchor.y * radius;
      let unit = radius * item.size * (0.82 + 0.18 * depth);
      const squash = Math.max(0.5, depth);
      const roll = Math.atan2(-anchor.x, Math.max(0.18, anchor.z)) * 0.42;
      const swing = id === "hammer" ? hammerSwingAngle(now, anim) : 0;
      const magnifyZoom = id === "magnify" ? 1 + (anim?.magnifyFocus || 0) * 0.72 : 1;

      context.save();
      context.translate(sx, sy);
      context.rotate(roll + (item.angle || 0));
      if (id === "glasses" && mode === "focus") {
        const lift = anim?.glassesLift || 0;
        context.translate(0, -lift * radius * 0.34);
      }
      unit *= magnifyZoom;
      context.scale(unit * squash, unit);
      let alpha = 0.9 + 0.1 * depth;
      if (id === "star" && typeof anim?.starVisible === "number") {
        alpha *= clamp(anim.starVisible, 0, 1);
      }
      context.globalAlpha = alpha;
      context.lineCap = "round";
      context.lineJoin = "round";

      const stroke = "#141414";
      const line = 0.09;

      switch (id) {
        case "glasses":
          drawGlassesArt(context, stroke, line);
          break;
        case "hat":
          drawHatArt(context, stroke, line);
          break;
        case "magnify":
          drawMagnifyArt(context, stroke, line, anim?.magnifyFocus || 0);
          break;
        case "coffee":
          drawCoffeeArt(context, stroke, line, anim?.coffeeSip || 0);
          break;
        case "joystick":
          drawJoystickArt(context, stroke, line);
          break;
        case "star":
          drawStarArt(context, stroke, line);
          break;
        case "book":
          drawBookArt(context, stroke, line, anim?.bookLower || 0, anim?.bookFlip || 0);
          break;
        case "hammer":
          drawHammerArt(context, stroke, line, swing);
          break;
        default:
          break;
      }

      context.restore();
    }

    function drawGlassesArt(context, stroke, line) {
      context.lineWidth = line;
      context.strokeStyle = stroke;
      context.fillStyle = "rgba(255, 255, 255, 0.55)";
      context.beginPath();
      roundRect(context, -0.62, -0.14, 0.42, 0.28, 0.1);
      context.fill();
      context.stroke();
      context.beginPath();
      roundRect(context, 0.2, -0.14, 0.42, 0.28, 0.1);
      context.fill();
      context.stroke();
      context.beginPath();
      context.moveTo(-0.2, -0.02);
      context.lineTo(0.2, -0.02);
      context.stroke();
      context.beginPath();
      context.moveTo(-0.62, -0.02);
      context.lineTo(-0.78, -0.02);
      context.moveTo(0.62, -0.02);
      context.lineTo(0.78, -0.02);
      context.stroke();
    }

    function drawHatArt(context, stroke, line) {
      context.save();
      context.translate(0, -0.2);
      context.fillStyle = "#242424";
      context.strokeStyle = stroke;
      context.lineWidth = line;
      context.beginPath();
      context.ellipse(0, 0.2, 0.82, 0.18, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.beginPath();
      roundRect(context, -0.34, -0.62, 0.68, 0.72, 0.06);
      context.fill();
      context.stroke();
      context.fillStyle = "#3a3a3a";
      context.beginPath();
      roundRect(context, -0.38, 0.02, 0.76, 0.12, 0.04);
      context.fill();
      context.restore();
    }

    function drawMagnifyArt(context, stroke, line, focus = 0) {
      if (focus > 0.02) {
        context.translate(-0.06 * focus, 0.04 * focus);
      }
      context.strokeStyle = stroke;
      context.lineWidth = line * (1 + focus * 0.35);
      context.fillStyle = `rgba(210, 230, 255, ${0.65 + focus * 0.22})`;
      context.beginPath();
      context.arc(-0.1, -0.1, 0.36, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.beginPath();
      context.moveTo(0.16, 0.16);
      context.lineTo(0.56, 0.56);
      context.stroke();
    }

    function drawJoystickArt(context, stroke, line) {
      context.translate(0, 0.2);
      context.strokeStyle = stroke;
      context.lineWidth = line;
      context.fillStyle = "#4a5058";
      context.beginPath();
      context.ellipse(0, 0.14, 0.46, 0.2, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.strokeStyle = stroke;
      context.lineWidth = line * 1.1;
      context.beginPath();
      context.moveTo(0, 0.06);
      context.lineTo(0, -0.22);
      context.stroke();
      context.fillStyle = "#e53935";
      context.strokeStyle = stroke;
      context.lineWidth = line;
      context.beginPath();
      context.arc(0, -0.34, 0.15, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = "#2f3339";
      context.beginPath();
      context.arc(0, 0.02, 0.09, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }

    function drawCoffeeArt(context, stroke, line, sip = 0) {
      const lift = sip * 0.42;
      const tilt = sip * -1.18;
      context.translate(-sip * 0.12, 0.2 - lift);
      context.rotate(tilt);
      context.strokeStyle = stroke;
      context.lineWidth = line;
      context.fillStyle = "#f4f4f4";
      context.beginPath();
      context.moveTo(-0.36, -0.24);
      context.lineTo(0.36, -0.24);
      context.lineTo(0.28, 0.34);
      context.lineTo(-0.28, 0.34);
      context.closePath();
      context.fill();
      context.stroke();
      context.fillStyle = "#6b3f2a";
      context.fillRect(-0.28, -0.1, 0.56, 0.16);
      context.beginPath();
      context.arc(0.42, 0.02, 0.18, -Math.PI * 0.45, Math.PI * 0.45);
      context.stroke();
      context.beginPath();
      context.moveTo(-0.06, -0.4);
      context.quadraticCurveTo(0, -0.56, 0.06, -0.4);
      context.stroke();
    }

    function drawStarArt(context, stroke, line) {
      context.fillStyle = "#ffd54a";
      context.strokeStyle = stroke;
      context.lineWidth = line * 0.85;
      context.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
        const outerX = Math.cos(angle) * 0.34;
        const outerY = Math.sin(angle) * 0.34;
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * 0.14;
        const innerY = Math.sin(innerAngle) * 0.14;
        if (i === 0) {
          context.moveTo(outerX, outerY);
        } else {
          context.lineTo(outerX, outerY);
        }
        context.lineTo(innerX, innerY);
      }
      context.closePath();
      context.fill();
      context.stroke();
    }

    function drawBookArt(context, stroke, line, lower = 0, flip = 0) {
      const flatMix = Math.max(lower, flip * 0.85);
      context.translate(0, 0.06 + lower * 0.18);
      context.rotate(flatMix * 0.26);
      context.scale(1 + flatMix * 0.05, 0.9 - flatMix * 0.34);
      context.strokeStyle = stroke;
      context.lineWidth = line;

      const pageW = 0.45;
      const pageTop = -0.34;
      const pageBottom = 0.34;

      context.fillStyle = "#2f4f72";
      context.beginPath();
      roundRect(context, -0.07, -0.4, 0.14, 0.8, 0.02);
      context.fill();
      context.stroke();

      context.fillStyle = "#4f8ec8";
      context.beginPath();
      context.moveTo(-0.07, -0.4);
      context.lineTo(-0.58, -0.3);
      context.lineTo(-0.52, 0.34);
      context.lineTo(-0.07, 0.4);
      context.closePath();
      context.fill();
      context.stroke();

      context.beginPath();
      context.moveTo(0.07, -0.4);
      context.lineTo(0.58, -0.3);
      context.lineTo(0.52, 0.34);
      context.lineTo(0.07, 0.4);
      context.closePath();
      context.fill();
      context.stroke();

      context.fillStyle = "#e8edf2";
      context.beginPath();
      context.moveTo(-0.07, pageTop);
      context.lineTo(-0.5, pageTop + 0.04);
      context.lineTo(-0.48, pageBottom - 0.04);
      context.lineTo(-0.07, pageBottom);
      context.closePath();
      context.fill();

      const turning = flip > 0.02;
      if (!turning) {
        context.beginPath();
        context.moveTo(0.07, pageTop);
        context.lineTo(0.07 + pageW, pageTop + 0.04);
        context.lineTo(0.07 + pageW - 0.02, pageBottom - 0.04);
        context.lineTo(0.07, pageBottom);
        context.closePath();
        context.fill();
      } else {
        const angle = flip * Math.PI;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        context.save();
        context.translate(0.07, 0);
        context.transform(cos, -sin * 0.1, 0, 1 - Math.abs(sin) * 0.06, 0, 0);
        context.fillStyle = cos >= 0 ? "#f2f6fa" : "#e4eaf0";
        context.beginPath();
        context.moveTo(0, pageTop);
        context.lineTo(pageW, pageTop + 0.04);
        context.lineTo(pageW - 0.02, pageBottom - 0.04);
        context.lineTo(0, pageBottom);
        context.closePath();
        context.fill();
        if (Math.abs(cos) > 0.08) {
          context.strokeStyle = stroke;
          context.lineWidth = line * 0.75;
          context.stroke();
        }
        context.restore();
      }
    }

    function drawIdeaBulb(context, anim, yaw) {
      const item = { x: 0, y: 0.94, z: 0.46, size: 0.68 };
      const anchor = accessoryAnchor(item, anim, yaw);
      if (!anchor) {
        return;
      }
      const glow = anim.struggleBulb || 0;
      const sx = center + anchor.x * radius;
      const sy = center - anchor.y * radius - radius * 0.32;
      const unit = radius * item.size * (0.82 + 0.18 * anchor.z);
      context.save();
      context.translate(sx, sy);
      context.scale(unit, unit);
      context.translate(0, -0.2);
      context.globalAlpha = 0.85 + glow * 0.15;
      context.fillStyle = `rgba(255, 236, 120, ${0.25 + glow * 0.35})`;
      context.beginPath();
      context.arc(0, -0.08, 0.42, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#141414";
      context.lineWidth = 0.09;
      context.fillStyle = "#fff6b8";
      context.beginPath();
      context.arc(0, -0.08, 0.28, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = "#8a8f98";
      context.beginPath();
      roundRect(context, -0.12, 0.18, 0.24, 0.14, 0.04);
      context.fill();
      context.stroke();
      context.restore();
    }

    function drawRestSnores(context, anim, t) {
      const strength = clamp(
        (anim.restSleep || 0) * 0.55 + (anim.restSnore || 0) * 0.55 + 0.4,
        0.45,
        1
      );
      const glyphs = ["z", "z", "Z"];
      const originX = center + radius * 0.78;
      const originY = center - radius * 0.62;
      const slots = [
        { dx: 0, dy: 0, scale: 0.22 },
        { dx: 0.14, dy: -0.1, scale: 0.27 },
        { dx: 0.28, dy: -0.22, scale: 0.34 }
      ];
      for (let i = 0; i < 3; i += 1) {
        const drift = Math.sin(t * 1.15 + i * 0.9) * radius * 0.01;
        const rise = ((t * 0.35 + i * 0.2) % 1) * radius * 0.05 * (anim.restSnore || 0.5);
        const px = originX + radius * slots[i].dx + drift;
        const py = originY + radius * slots[i].dy - rise;
        const fontPx = Math.round(radius * slots[i].scale);
        context.save();
        context.globalAlpha = 0.55 * strength + (i === 2 ? 0.15 : 0);
        context.fillStyle = "#8fa8be";
        context.font = `600 ${fontPx}px system-ui, sans-serif`;
        context.fillText(glyphs[i], px, py);
        context.restore();
      }
    }

    function drawChatBubble(context, anim, t) {
      const b = anim.chatBubble || 0;
      if (b < 0.04) {
        return;
      }
      const bx = center + radius * 1.05;
      const by = center - radius * 0.26;
      const w = radius * 1.28;
      const h = radius * 0.72;
      const talking = (anim.chatTalking ?? b) > 0.45;
      context.save();
      context.globalAlpha = 0.94 * b;
      context.fillStyle = "#ffffff";
      context.strokeStyle = "#141414";
      context.lineWidth = Math.max(1.4, radius * 0.016);
      context.beginPath();
      roundRect(context, bx - w / 2, by - h / 2, w, h, radius * 0.08);
      context.fill();
      context.stroke();
      context.beginPath();
      context.moveTo(bx - w * 0.44, by + h * 0.06);
      context.lineTo(bx - w * 0.54, by + h * 0.22);
      context.lineTo(bx - w * 0.3, by + h * 0.1);
      context.closePath();
      context.fill();
      context.stroke();
      context.strokeStyle = "#2a2a2a";
      context.lineWidth = Math.max(1.1, radius * 0.013);
      context.lineCap = "round";
      context.lineJoin = "round";
      const lineCount = talking ? 4 : 2;
      const reveal = talking ? Math.floor(t * 5.5) % (lineCount + 1) : 1;
      const scribbleWidth = w * 0.72;
      const left = bx - scribbleWidth / 2;
      for (let i = 0; i < lineCount; i += 1) {
        const visible = talking ? i < reveal : i < 2;
        context.globalAlpha = (visible ? 0.88 : 0.18) * b;
        const y = by - h * 0.18 + i * radius * 0.17;
        const wobble = Math.sin(t * 3.1 + i * 1.7) * radius * 0.008;
        context.beginPath();
        context.moveTo(left, y + wobble);
        const segments = 7;
        for (let s = 1; s <= segments; s += 1) {
          const x = left + (scribbleWidth * s) / segments;
          const jag = Math.sin(s * 2.3 + i * 0.9 + t * 2) * radius * 0.022;
          const jag2 = Math.cos(s * 1.4 + i) * radius * 0.012;
          context.lineTo(x, y + jag + jag2 + wobble);
        }
        context.stroke();
        if (talking && i === lineCount - 1 && reveal >= lineCount) {
          context.beginPath();
          context.moveTo(left + scribbleWidth * 0.72, y - radius * 0.02);
          context.quadraticCurveTo(
            left + scribbleWidth * 0.82,
            y + radius * 0.05,
            left + scribbleWidth * 0.9,
            y - radius * 0.01
          );
          context.stroke();
        }
      }
      context.restore();
    }

    function drawPrideConfetti(context, anim, t) {
      const strength = anim.prideConfetti || 0;
      if (strength < 0.05) {
        return;
      }
      const burstT = t % 2.8;
      const colors = ["#ff4d4d", "#ffcc00", "#3ecf6e", "#3d8bff", "#ff6ec7", "#9b59ff"];
      const pieceW = radius * 0.12;
      const pieceH = radius * 0.052;
      for (let i = 0; i < 28; i += 1) {
        const seed = i * 1.37;
        const phase = (burstT * 1.35 + seed * 0.09) % 1;
        const angle = seed * 2.1 - Math.PI / 2;
        const dist = radius * (0.1 + phase * 0.82) * (0.7 + strength * 0.3);
        const px = center + Math.cos(angle) * dist * 1.05;
        const py = center - radius * 0.62 + Math.sin(angle) * dist * 0.38 - phase * radius * 0.14;
        context.save();
        context.globalAlpha = Math.min(1, (1 - phase * 0.55) * strength * 1.15);
        context.translate(px, py);
        context.rotate(seed * 1.3 + t * 3.5 + phase * 4);
        context.fillStyle = colors[i % colors.length];
        context.fillRect(-pieceW / 2, -pieceH / 2, pieceW, pieceH);
        context.restore();
      }
    }

    function drawWorkBreath(context, anim, t) {
      const strength = clamp((anim.workBreath - 0.2) / 0.8, 0, 1);
      if (strength < 0.02) {
        return;
      }
      for (let i = 0; i < 3; i += 1) {
        const phase = (t * 1.5 + i * 0.5) % 1;
        const alpha = (1 - phase) * 0.38 * strength;
        if (alpha < 0.03) {
          continue;
        }
        const px = center + (i - 1) * radius * 0.11;
        const py = center + radius * 0.2 - phase * radius * 0.16;
        const puffR = radius * (0.04 + phase * 0.035) * strength;
        context.save();
        context.globalAlpha = alpha;
        context.fillStyle = "#d4e6f2";
        context.beginPath();
        context.arc(px, py, puffR, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    function drawHammerArt(context, stroke, line, swing = 0) {
      context.translate(0.06, 0.58);
      context.rotate(swing);
      context.strokeStyle = stroke;
      context.lineWidth = line;
      context.fillStyle = "rgba(40, 40, 40, 0.32)";
      context.beginPath();
      context.ellipse(0, 0, 0.12, 0.08, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#c58a52";
      context.beginPath();
      roundRect(context, -0.1, 0.02, 0.2, 0.56, 0.06);
      context.fill();
      context.stroke();
      context.fillStyle = "#8a939e";
      context.beginPath();
      roundRect(context, -0.5, -0.42, 0.54, 0.36, 0.05);
      context.fill();
      context.stroke();
      context.fillStyle = "#9aa3ad";
      context.beginPath();
      roundRect(context, 0.06, -0.42, 0.2, 0.36, 0.04);
      context.fill();
      context.stroke();
    }

    function rotateYaw(x, y, z, yaw) {
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      return {
        x: x * c + z * s,
        y,
        z: -x * s + z * c
      };
    }

    function placeEye(slot, look, anim, index) {
      const side = index === 0 ? -1 : 1;
      let x = slot.x * anim.eyeGap + look.x + anim.shake / (radius * 4);
      let y = slot.y + look.y;
      const limit = 0.55;
      const magnitude = Math.hypot(x, y);
      if (magnitude > limit) {
        x = (x / magnitude) * limit;
        y = (y / magnitude) * limit;
      }
      const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
      const turned = rotateYaw(x, y, z, anim.yaw || 0);
      if (turned.z < 0.06) {
        return null;
      }
      return { x: turned.x, y: turned.y, z: turned.z, side, slot };
    }

    function drawCheerEye(context, eye, anim, alpha = 1) {
      const sx = center + eye.x * radius;
      const sy = center - eye.y * radius;
      const depth = Math.max(0.5, eye.z);
      const depthScale = 0.9 + 0.1 * depth;
      const wing = eyeSize * 0.088 * depthScale;
      const peak = eyeSize * 0.056 * depthScale;

      context.save();
      context.globalAlpha = alpha;
      context.translate(sx, sy + eyeSize * 0.01 * depthScale);
      context.strokeStyle = "#101010";
      context.lineWidth = eyeSize * 0.044 * depthScale;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      context.moveTo(-wing, 0);
      context.quadraticCurveTo(0, -peak, wing, 0);
      context.stroke();
      context.restore();
    }

    function drawFurrowedBrow(context, eye) {
      const sx = center + eye.x * radius;
      const sy = center - eye.y * radius;
      const depth = Math.max(0.5, eye.z);
      const depthScale = 0.9 + 0.1 * depth;
      const wing = eyeSize * 0.11 * depthScale;

      context.save();
      context.translate(sx, sy - eyeSize * 0.13 * depthScale);
      context.rotate(eye.side * 0.42);
      context.strokeStyle = "#141414";
      context.lineWidth = eyeSize * 0.04 * depthScale;
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(-wing, eyeSize * 0.015 * depthScale);
      context.lineTo(wing, -eyeSize * 0.045 * depthScale);
      context.stroke();
      context.restore();
    }

    function drawPillEye(context, eye, anim, alpha = 1) {
      const sx = center + eye.x * radius;
      const sy = center - eye.y * radius;
      const depth = Math.max(0.5, eye.z);
      const depthScale = 0.9 + 0.1 * depth;
      const baseW = eyeSize * 0.072;
      const baseH = eyeSize * 0.158;
      const pillW = baseW * anim.eyeScale.w * depthScale;
      const pillH = baseH * anim.eyeScale.h * anim.blink * depthScale;

      context.save();
      context.globalAlpha = alpha;
      context.translate(sx, sy);
      context.beginPath();
      roundRect(context, -pillW / 2, -pillH / 2, pillW, pillH, pillW * 0.48);
      context.fillStyle = "#101010";
      context.fill();
      context.restore();
    }

    function roundRect(context, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      context.moveTo(x + r, y);
      context.arcTo(x + width, y, x + width, y + height, r);
      context.arcTo(x + width, y + height, x, y + height, r);
      context.arcTo(x, y + height, x, y, r);
      context.arcTo(x, y, x + width, y, r);
      context.closePath();
    }

    function drawShadow(context, x, y, sphereRadius) {
      context.save();
      context.translate(x, y);
      context.scale(1, 0.2);
      context.beginPath();
      context.arc(0, 0, sphereRadius * 0.68, 0, Math.PI * 2);
      const gradient = context.createRadialGradient(
        0, 0, sphereRadius * 0.15,
        0, 0, sphereRadius * 0.68
      );
      gradient.addColorStop(0, "rgba(48, 58, 74, 0.18)");
      gradient.addColorStop(1, "rgba(48, 58, 74, 0)");
      context.fillStyle = gradient;
      context.fill();
      context.restore();
    }

    function paintSphere(pixels, colors, use3d = false, yaw = 0, shape = "round") {
      const layer = document.createElement("canvas");
      layer.width = pixels;
      layer.height = pixels;
      const shade = layer.getContext("2d");
      const sphereRadius = pixels * sphereRadiusRatio;
      const origin = (pixels - 1) / 2;

      if (!use3d) {
        const outline = Math.max(2.5, pixels * 0.017);
        const [red, green, blue] = colors.body;
        shade.beginPath();
        traceBodyShape(shade, origin, origin, sphereRadius - outline * 0.4, shape);
        shade.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        shade.fill();
        shade.lineWidth = outline;
        shade.lineJoin = "round";
        shade.strokeStyle = "#121212";
        shade.stroke();
        return layer;
      }

      const image = shade.createImageData(pixels, pixels);
      const data = image.data;
      const deep = colors.deep;
      const body = colors.body;
      const glow = colors.glow;

      let lx = -0.3;
      let ly = 0.45;
      let lz = 0.84;
      const lightLength = Math.hypot(lx, ly, lz);
      lx /= lightLength;
      ly /= lightLength;
      lz /= lightLength;

      let hx = lx;
      let hy = ly;
      let hz = lz + 1;
      const halfLength = Math.hypot(hx, hy, hz);
      hx /= halfLength;
      hy /= halfLength;
      hz /= halfLength;

      if (yaw) {
        const c = Math.cos(yaw);
        const s = Math.sin(yaw);
        const lx2 = lx * c - lz * s;
        const lz2 = lx * s + lz * c;
        lx = lx2;
        lz = lz2;
        const hx2 = hx * c - hz * s;
        const hz2 = hx * s + hz * c;
        hx = hx2;
        hz = hz2;
      }

      for (let y = 0; y < pixels; y++) {
        for (let x = 0; x < pixels; x++) {
          const px = x - origin;
          const py = origin - y;
          const coverage = shapeCoverage(px, py, sphereRadius, shape);
          const offset = (y * pixels + x) * 4;
          if (coverage <= 0) {
            data[offset + 3] = 0;
            continue;
          }

          let ux = px / sphereRadius;
          let uy = py / sphereRadius;
          if (yaw && shape !== "round") {
            const c = Math.cos(yaw);
            const s = Math.sin(yaw);
            const guess = shapeSurfaceNormal(ux, uy, shape);
            const uz = guess ? guess.nz : 0.45;
            ux = ux * c + uz * s;
          }

          const surface = shapeSurfaceNormal(ux, uy, shape);
          if (!surface) {
            data[offset + 3] = 0;
            continue;
          }

          let nx = surface.nx;
          let ny = surface.ny;
          let nz = surface.nz;
          if (yaw) {
            const c = Math.cos(yaw);
            const s = Math.sin(yaw);
            const rx = nx * c + nz * s;
            const rz = -nx * s + nz * c;
            nx = rx;
            nz = rz;
          }

          const ndotl = Math.max(0, nx * lx + ny * ly + nz * lz);
          const spec = Math.pow(Math.max(0, nx * hx + ny * hy + nz * hz), shape === "round" ? 42 : 28);
          const light = Math.pow(ndotl, 0.92);

          let red = deep[0] + (body[0] - deep[0]) * (0.35 + 0.65 * light);
          let green = deep[1] + (body[1] - deep[1]) * (0.35 + 0.65 * light);
          let blue = deep[2] + (body[2] - deep[2]) * (0.35 + 0.65 * light);

          const hot = Math.pow(ndotl, 2.8);
          red += (glow[0] - red) * hot * 0.14;
          green += (glow[1] - green) * hot * 0.14;
          blue += (glow[2] - blue) * hot * 0.14;

          red += (255 - red) * spec * 0.16;
          green += (255 - green) * spec * 0.16;
          blue += (255 - blue) * spec * 0.16;

          const ao = 0.86 + 0.14 * clamp(nz * 0.55 + ny * 0.15 + 0.28, 0, 1);
          red *= ao;
          green *= ao;
          blue *= ao;

          data[offset] = clamp(red, 0, 255);
          data[offset + 1] = clamp(green, 0, 255);
          data[offset + 2] = clamp(blue, 0, 255);
          data[offset + 3] = Math.round(coverage * 255);
        }
      }

      shade.putImageData(image, 0, 0);
      return layer;
    }

    function traceBodyShape(context, cx, cy, r, shape) {
      const s = r * 0.92;
      switch (shape) {
        case "square":
          roundRect(context, cx - s, cy - s, s * 2, s * 2, s * 0.14);
          break;
        case "triangle":
          context.moveTo(cx, cy - s * 1.04);
          context.lineTo(cx + s * 1.06, cy + s * 0.9);
          context.lineTo(cx - s * 1.06, cy + s * 0.9);
          context.closePath();
          break;
        case "hexagon":
          appendFlatTopHexagonPath(context, cx, cy, s * 0.95);
          break;
        case "pill":
          roundRect(context, cx - s * 0.48, cy - s * 1.02, s * 0.96, s * 2.04, s * 0.48);
          break;
        default:
          context.arc(cx, cy, r, 0, Math.PI * 2);
          break;
      }
    }

    function appendFlatTopHexagonPath(context, cx, cy, radius) {
      const side = radius;
      const flatHalf = side * 0.5;
      const vHalf = side * (8 / 9);
      context.moveTo(cx - flatHalf, cy - vHalf);
      context.lineTo(cx + flatHalf, cy - vHalf);
      context.lineTo(cx + side, cy);
      context.lineTo(cx + flatHalf, cy + vHalf);
      context.lineTo(cx - flatHalf, cy + vHalf);
      context.lineTo(cx - side, cy);
      context.closePath();
    }

    function flatTopHexagonVerts(scale = 0.95 * 0.92) {
      const side = scale;
      const flatHalf = side * 0.5;
      const vHalf = side * (8 / 9);
      return [
        [-flatHalf, vHalf],
        [flatHalf, vHalf],
        [side, 0],
        [flatHalf, -vHalf],
        [-flatHalf, -vHalf],
        [-side, 0],
      ];
    }

    function pointInPolygon(x, y, verts) {
      let inside = false;
      for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
        const [xi, yi] = verts[i];
        const [xj, yj] = verts[j];
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) {
          inside = !inside;
        }
      }
      return inside;
    }

    function polygonInteriorDistance(x, y, verts) {
      let minDist = Infinity;
      for (let i = 0; i < verts.length; i++) {
        const j = (i + 1) % verts.length;
        const d = pointSegmentDistance(x, y, verts[i][0], verts[i][1], verts[j][0], verts[j][1]);
        minDist = Math.min(minDist, d);
      }
      return minDist;
    }

    const PILL_HALF_W = 0.48 * 0.92;
    const PILL_HALF_H = 1.02 * 0.92;

    function pillSignedDistance(x, y) {
      const capR = PILL_HALF_W;
      const cylHalf = PILL_HALF_H - capR;
      const px = Math.abs(x);
      const py = Math.max(Math.abs(y) - cylHalf, 0);
      return Math.hypot(px, py) - capR;
    }

    function shapeCoverage(px, py, r, shape) {
      const x = px / r;
      const y = py / r;
      if (!isInsideBody(x, y, shape)) {
        return 0;
      }
      if (shape === "round") {
        const dist = Math.hypot(px, py);
        return clamp(r - dist + 0.65, 0, 1);
      }
      const inset = shapeInteriorDistance(x, y, shape);
      return clamp(inset / 0.07, 0, 1);
    }

    function pointSegmentDistance(px, py, x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq < 1e-8) {
        return Math.hypot(px - x1, py - y1);
      }
      let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
      t = clamp(t, 0, 1);
      return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
    }

    function shapeInteriorDistance(x, y, shape) {
      if (!isInsideBody(x, y, shape)) {
        return 0;
      }
      switch (shape) {
        case "square":
          return Math.min(0.9 - Math.abs(x), 0.9 - Math.abs(y));
        case "triangle": {
          const yTip = 1.02;
          const yBase = -0.92;
          const xBase = (1.0 - yBase) * 0.58;
          return Math.min(
            pointSegmentDistance(x, y, 0, yTip, -xBase, yBase),
            pointSegmentDistance(x, y, 0, yTip, xBase, yBase),
            yTip - y
          );
        }
        case "hexagon":
          return polygonInteriorDistance(x, y, flatTopHexagonVerts());
        case "pill": {
          const sdf = pillSignedDistance(x, y);
          return sdf < 0 ? -sdf : 0;
        }
        default:
          return 1 - Math.hypot(x, y);
      }
    }

    function shapeDomeStrength(shape) {
      switch (shape) {
        case "square":
          return 1.05;
        case "triangle":
          return 0.92;
        case "hexagon":
          return 0.98;
        case "pill":
          return 0.78;
        default:
          return 1;
      }
    }

    function shapeSurfaceNormal(x, y, shape) {
      if (shape === "round") {
        const r2 = x * x + y * y;
        if (r2 > 1) {
          return null;
        }
        const nz = Math.sqrt(Math.max(0, 1 - r2));
        return { nx: x, ny: y, nz };
      }
      if (!isInsideBody(x, y, shape)) {
        return null;
      }
      const eps = 0.012;
      const d0 = shapeInteriorDistance(x, y, shape);
      const ddx = shapeInteriorDistance(x + eps, y, shape);
      const ddy = shapeInteriorDistance(x, y + eps, shape);
      const dome = shapeDomeStrength(shape);
      const h0 = dome * Math.sqrt(Math.max(0, d0));
      const hx = dome * Math.sqrt(Math.max(0, ddx));
      const hy = dome * Math.sqrt(Math.max(0, ddy));
      const gx = (hx - h0) / eps;
      const gy = (hy - h0) / eps;
      let nx = -gx;
      let ny = -gy;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      if (len < 1e-6) {
        return { nx: 0, ny: 0, nz: 1 };
      }
      return { nx: nx / len, ny: ny / len, nz: nz / len };
    }

    function isInsideBody(x, y, shape) {
      switch (shape) {
        case "square":
          return Math.abs(x) <= 0.9 && Math.abs(y) <= 0.9;
        case "triangle":
          return y >= -0.92 && y <= 1.02 && Math.abs(x) <= (1.0 - y) * 0.58;
        case "hexagon":
          return pointInPolygon(x, y, flatTopHexagonVerts());
        case "pill":
          return pillSignedDistance(x, y) <= 0;
        default:
          return x * x + y * y <= 1;
      }
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }


    return {
      setMode: enterMode,
      stopMode,
      setPhrase,
      getMode,
      configure: applyConfig,
      destroy() {
        clearModeSchedule();
      }
    };
  }

  let activeInstance = null;

  const Gbot = {
    init(options) {
      activeInstance = createGbot(options || {});
      return activeInstance;
    },
    setMode(mode, options) {
      if (!activeInstance) {
        throw new Error("Gbot: call Gbot.init() before setMode().");
      }
      return activeInstance.setMode(mode, options);
    },
    stopMode() {
      if (!activeInstance) return;
      return activeInstance.stopMode();
    },
    setPhrase(text) {
      if (!activeInstance) {
        throw new Error("Gbot: call Gbot.init() before setPhrase().");
      }
      return activeInstance.setPhrase(text);
    },
    getMode() {
      return activeInstance ? activeInstance.getMode() : "idle";
    },
    configure(options) {
      if (!activeInstance) {
        throw new Error("Gbot: call Gbot.init() before configure().");
      }
      return activeInstance.configure(options);
    }
  };

  global.Gbot = Gbot;
})(typeof globalThis !== "undefined" ? globalThis : window);
