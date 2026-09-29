const $ = (id) => document.getElementById(id);

export function createUI() {
  const refs = {
    score: $("score"),
    distance: $("distance"),
    health: $("health"),
    speed: $("speedValue"),
    speedFill: $("speedFill"),
    start: $("startScreen"),
    gameOver: $("gameOver"),
    finalScore: $("finalScore"),
    finalDistance: $("finalDistance"),
    mission: $("missionText"),
    flash: $("damageFlash"),
    toast: $("toast"),
    startButton: $("startBtn"),
    restartButton: $("restartBtn"),
    fullscreenButton: $("fsBtn")
  };

  let toastTimer;

  function toast(text) {
    refs.toast.textContent = text;
    refs.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => refs.toast.classList.remove("show"), 900);
  }

  function damageFlash() {
    refs.flash.style.opacity = "1";
    setTimeout(() => {
      refs.flash.style.opacity = "0";
    }, 90);

    if (navigator.vibrate) navigator.vibrate(65);
  }

  function update({
    score,
    distanceMiles,
    health,
    speed,
    boost,
    offRoad,
    roadCurve,
    maxDisplaySpeed
  }) {
    refs.score.textContent = Math.floor(score).toLocaleString();
    refs.distance.textContent = distanceMiles.toFixed(2);
    refs.health.textContent = Math.ceil(health);
    refs.speed.textContent = Math.round(speed);
    refs.speedFill.style.width =
      `${(Math.min(speed / maxDisplaySpeed, 1) * 100).toFixed(1)}%`;
    refs.health.style.color = health < 35 ? "var(--danger)" : "";

    if (offRoad) {
      refs.mission.textContent = "Return to the road!";
    } else if (boost < 18) {
      refs.mission.textContent = "Boost recharging…";
    } else if (Math.abs(roadCurve) > 0.42) {
      refs.mission.textContent =
        roadCurve > 0
          ? "Right curve — steer with the bend."
          : "Left curve — steer with the bend.";
    } else {
      refs.mission.textContent = "Stay on the road. Pass traffic.";
    }
  }

  function showGameOver(score, distanceMiles) {
    refs.finalScore.textContent = Math.floor(score).toLocaleString();
    refs.finalDistance.textContent = `${distanceMiles.toFixed(2)} mi`;
    refs.gameOver.style.display = "grid";
  }

  function hideGameOver() {
    refs.gameOver.style.display = "none";
  }

  function hideStart() {
    refs.start.style.display = "none";
  }

  return {
    refs,
    toast,
    damageFlash,
    update,
    showGameOver,
    hideGameOver,
    hideStart
  };
}
