const TOUCH_BINDINGS = [
  ["leftBtn", "arrowleft"],
  ["rightBtn", "arrowright"],
  ["gasBtn", "arrowup"],
  ["brakeBtn", "arrowdown"],
  ["boostBtn", "shift"]
];

const PREVENT_DEFAULT_KEYS = new Set([
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  " "
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function createInput() {
  const keys = Object.create(null);
  let tiltEnabled = false;
  let tiltValue = 0;
  let tiltNeutral = null;

  function keyDown(event) {
    const key = event.key.toLowerCase();
    keys[key] = true;
    if (PREVENT_DEFAULT_KEYS.has(key)) event.preventDefault();
  }

  function keyUp(event) {
    keys[event.key.toLowerCase()] = false;
  }

  function orientationValue(event) {
    const angle =
      window.screen?.orientation?.angle ??
      (typeof window.orientation === "number" ? window.orientation : 0);

    if (Math.abs(angle) === 90) {
      const beta = Number(event.beta) || 0;
      return angle === 90 ? beta : -beta;
    }

    return Number(event.gamma) || 0;
  }

  function onOrientation(event) {
    if (!tiltEnabled) return;

    const raw = orientationValue(event);
    if (tiltNeutral === null) tiltNeutral = raw;

    tiltValue = clamp((raw - tiltNeutral) / 28, -1, 1);
  }

  async function enableTilt() {
    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") return false;
      }

      tiltEnabled = true;
      tiltNeutral = null;
      tiltValue = 0;
      document.body.classList.add("tilt-active");
      return true;
    } catch {
      return false;
    }
  }

  function disableTilt() {
    tiltEnabled = false;
    tiltValue = 0;
    tiltNeutral = null;
    document.body.classList.remove("tilt-active");
  }

  function clear() {
    Object.keys(keys).forEach((key) => {
      keys[key] = false;
    });

    document.querySelectorAll(".touchBtn.on").forEach((button) => {
      button.classList.remove("on");
    });

    tiltNeutral = null;
    tiltValue = 0;
  }

  function bindTouch(id, key) {
    const element = document.getElementById(id);
    if (!element) return;

    const press = (event) => {
      event.preventDefault();
      keys[key] = true;
      element.classList.add("on");
    };

    const release = (event) => {
      event.preventDefault();
      keys[key] = false;
      element.classList.remove("on");
    };

    element.addEventListener("pointerdown", press);
    element.addEventListener("pointerup", release);
    element.addEventListener("pointercancel", release);
    element.addEventListener("pointerleave", release);
  }

  window.addEventListener("keydown", keyDown, { passive: false });
  window.addEventListener("keyup", keyUp);
  window.addEventListener("deviceorientation", onOrientation, { passive: true });

  TOUCH_BINDINGS.forEach(([id, key]) => bindTouch(id, key));

  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });

  return {
    keys,
    clear,
    enableTilt,
    disableTilt,
    pressed(...names) {
      return names.some((name) => Boolean(keys[name]));
    },
    steering() {
      const digital =
        (keys.d || keys.arrowright ? 1 : 0) -
        (keys.a || keys.arrowleft ? 1 : 0);

      if (digital !== 0) return digital;
      return tiltEnabled ? tiltValue : 0;
    },
    get tiltEnabled() {
      return tiltEnabled;
    }
  };
}
