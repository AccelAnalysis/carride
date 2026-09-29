const $ = (id) => document.getElementById(id);

export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds - minutes * 60;
  return `${minutes}:${remaining.toFixed(1).padStart(4, "0")}`;
}

export function createUI() {
  const refs = {
    score: $("score"),
    health: $("health"),
    speed: $("speedValue"),
    speedFill: $("speedFill"),
    boost: $("boostValue"),
    boostFill: $("boostFill"),
    progress: $("progressValue"),
    progressFill: $("raceProgressFill"),
    timer: $("timer"),
    trackName: $("trackName"),
    combo: $("comboValue"),
    comboBadge: $("comboBadge"),
    draftBadge: $("draftBadge"),
    start: $("startScreen"),
    pause: $("pauseScreen"),
    gameOver: $("gameOver"),
    finalTrack: $("finalTrack"),
    finalScore: $("finalScore"),
    finalTime: $("finalTime"),
    bestTime: $("bestTime"),
    resultTitle: $("resultTitle"),
    resultEyebrow: $("resultEyebrow"),
    mission: $("missionText"),
    flash: $("damageFlash"),
    toast: $("toast"),
    startButton: $("startBtn"),
    restartButton: $("restartBtn"),
    trackButton: $("trackBtn"),
    pauseButton: $("pauseBtn"),
    resumeButton: $("resumeBtn"),
    fullscreenButton: $("fsBtn"),
    trackButtons: Array.from(document.querySelectorAll("[data-track]"))
  };

  let toastTimer;

  function toast(text, duration = 900) {
    refs.toast.textContent = text;
    refs.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => refs.toast.classList.remove("show"), duration);
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
    health,
    speed,
    boost,
    progress,
    elapsed,
    offRoad,
    roadCurve,
    track,
    drafting,
    combo,
    maxDisplaySpeed
  }) {
    const progressPercent = Math.max(0, Math.min(progress * 100, 100));

    refs.score.textContent = Math.floor(score).toLocaleString();
    refs.health.textContent = Math.ceil(health);
    refs.speed.textContent = Math.round(speed);
    refs.trackName.textContent = track.name;
    refs.progress.textContent = Math.floor(progressPercent);
    refs.progressFill.style.width = `${progressPercent.toFixed(2)}%`;
    refs.timer.textContent = formatTime(elapsed);

    refs.speedFill.style.width =
      `${(Math.min(speed / maxDisplaySpeed, 1) * 100).toFixed(1)}%`;
    refs.boost.textContent = `${Math.round(boost)}%`;
    refs.boostFill.style.width = `${Math.max(0, Math.min(boost, 100)).toFixed(1)}%`;

    refs.health.style.color = health < 35 ? "var(--danger)" : "";
    refs.combo.textContent = `${combo.toFixed(2)}×`;
    refs.comboBadge.classList.toggle("show", combo > 1.01);
    refs.draftBadge.classList.toggle("show", drafting);

    if (offRoad) {
      refs.mission.textContent = "Return to the road!";
    } else if (drafting) {
      refs.mission.textContent = "Slipstream — boost charging fast.";
    } else if (boost < 18) {
      refs.mission.textContent = "Boost low — draft traffic to recharge.";
    } else if (Math.abs(roadCurve) > 0.58) {
      refs.mission.textContent =
        roadCurve > 0
          ? "Hard right — brake before the apex."
          : "Hard left — brake before the apex.";
    } else if (combo > 1.5) {
      refs.mission.textContent = `Keep it clean — ${combo.toFixed(2)}× combo.`;
    } else {
      refs.mission.textContent = "Pass cleanly. Draft. Build the combo.";
    }
  }

  function updateBestTimes(bestTimes) {
    for (const [trackId, time] of Object.entries(bestTimes)) {
      const element = $(`best-${trackId}`);
      if (element) element.textContent = formatTime(time);
    }
  }

  function selectTrack(trackId) {
    refs.trackButtons.forEach((button) => {
      const selected = button.dataset.track === trackId;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function showResult({
    completed,
    score,
    elapsed,
    track,
    bestTime,
    isNewBest
  }) {
    refs.resultEyebrow.textContent = completed
      ? isNewBest
        ? "New personal best"
        : "Track complete"
      : "Run ended";
    refs.resultTitle.textContent = completed
      ? "Finish line."
      : "Vehicle disabled.";
    refs.finalTrack.textContent = track.name;
    refs.finalScore.textContent = Math.floor(score).toLocaleString();
    refs.finalTime.textContent = formatTime(elapsed);
    refs.bestTime.textContent = formatTime(bestTime);
    refs.gameOver.style.display = "grid";
  }

  function hideGameOver() {
    refs.gameOver.style.display = "none";
  }

  function hideStart() {
    refs.start.style.display = "none";
  }

  function showStart() {
    refs.start.style.display = "grid";
  }

  function showPause() {
    refs.pause.style.display = "grid";
  }

  function hidePause() {
    refs.pause.style.display = "none";
  }

  return {
    refs,
    toast,
    damageFlash,
    update,
    updateBestTimes,
    selectTrack,
    showResult,
    hideGameOver,
    hideStart,
    showStart,
    showPause,
    hidePause
  };
}
