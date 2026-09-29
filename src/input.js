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

export function createInput() {
  const keys = Object.create(null);

  function keyDown(event) {
    const key = event.key.toLowerCase();
    keys[key] = true;
    if (PREVENT_DEFAULT_KEYS.has(key)) event.preventDefault();
  }

  function keyUp(event) {
    keys[event.key.toLowerCase()] = false;
  }

  function clear() {
    Object.keys(keys).forEach((key) => {
      keys[key] = false;
    });

    document.querySelectorAll(".touchBtn.on").forEach((button) => {
      button.classList.remove("on");
    });
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

  TOUCH_BINDINGS.forEach(([id, key]) => bindTouch(id, key));

  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });

  return {
    keys,
    clear,
    pressed(...names) {
      return names.some((name) => Boolean(keys[name]));
    }
  };
}
