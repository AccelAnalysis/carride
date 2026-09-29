import {
  GAMEPLAY,
  MAX_SPEED,
  ROAD_WIDTH,
  WORLD_SPEED
} from "./config.js";
import { createAudio } from "./audio.js";
import { createInput } from "./input.js";
import { createTraffic } from "./traffic.js";
import { DEFAULT_TRACK_ID, getTrack } from "./tracks.js";
import { createUI } from "./ui.js";
import { createWorld } from "./world.js";

const BEST_TIMES_KEY = "nightline-driver-best-times-v2";

const ui = createUI();
const input = createInput();
const audio = createAudio();

let selectedTrack = getTrack(DEFAULT_TRACK_ID);
const world = createWorld(document.getElementById("game"), selectedTrack);
const traffic = createTraffic(world.scene, selectedTrack);

let running = false;
let paused = false;
let speed = 0;
let lateral = 0;
let steerVelocity = 0;
let impactVelocity = 0;
let health = 100;
let score = 0;
let distanceMiles = 0;
let elapsed = 0;
let boost = 100;
let invulnerability = 0;
let combo = 1;
let comboClock = 0;
let drafting = false;
let nextCheckpoint = 1;

let roadCurve = 0;
let targetCurve = 0;
let curveSectionIndex = 0;
let curveClock = 0;
let lastTime = performance.now();

const roadLimit = ROAD_WIDTH / 2 - 1.1;
const maxDisplaySpeed = MAX_SPEED + 34;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

function loadBestTimes() {
  try {
    return JSON.parse(localStorage.getItem(BEST_TIMES_KEY) || "{}");
  } catch {
    return {};
  }
}

let bestTimes = loadBestTimes();
ui.updateBestTimes(bestTimes);
ui.selectTrack(selectedTrack.id);

function saveBestTime(trackId, time) {
  const current = Number(bestTimes[trackId]);
  if (Number.isFinite(current) && current <= time) return false;

  bestTimes = { ...bestTimes, [trackId]: time };

  try {
    localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(bestTimes));
  } catch {
    // Local storage is optional; the run still completes if unavailable.
  }

  ui.updateBestTimes(bestTimes);
  return true;
}

function getProgress() {
  return clamp(distanceMiles / selectedTrack.lengthMiles, 0, 1);
}

function renderHUD() {
  ui.update({
    score,
    health,
    speed,
    boost,
    progress: getProgress(),
    elapsed,
    offRoad: Math.abs(lateral) > roadLimit,
    roadCurve,
    track: selectedTrack,
    drafting,
    combo,
    maxDisplaySpeed
  });
}

function resetCurveSequence() {
  curveSectionIndex = 0;
  const section = selectedTrack.curveSections[0];
  roadCurve = section.curve;
  targetCurve = section.curve;
  curveClock = section.duration;
}

function advanceCurveSequence(dt) {
  curveClock -= dt;

  while (curveClock <= 0) {
    curveSectionIndex =
      (curveSectionIndex + 1) % selectedTrack.curveSections.length;
    const section = selectedTrack.curveSections[curveSectionIndex];
    targetCurve = section.curve;
    curveClock += section.duration;
  }

  roadCurve = lerp(
    roadCurve,
    targetCurve,
    1 - Math.exp(-selectedTrack.handling.curveResponse * dt)
  );
}

function startGame() {
  running = true;
  paused = false;
  speed = GAMEPLAY.startSpeed;
  lateral = 0;
  steerVelocity = 0;
  impactVelocity = 0;
  health = 100;
  score = 0;
  distanceMiles = 0;
  elapsed = 0;
  boost = 100;
  invulnerability = 0;
  combo = 1;
  comboClock = 0;
  drafting = false;
  nextCheckpoint = 1;

  resetCurveSequence();

  input.clear();
  world.setTrack(selectedTrack);
  world.resetView();
  traffic.setTrack(selectedTrack);

  ui.hideStart();
  ui.hideGameOver();
  ui.hidePause();
  ui.toast(selectedTrack.name.toUpperCase(), 1000);
  audio.start();
  renderHUD();

  lastTime = performance.now();
}

function finishRun(completed) {
  if (!running) return;

  running = false;
  paused = false;
  speed = 0;
  impactVelocity = 0;
  drafting = false;
  input.clear();
  audio.pause();

  let isNewBest = false;
  if (completed) {
    isNewBest = saveBestTime(selectedTrack.id, elapsed);
    audio.finish();
  }

  renderHUD();

  ui.showResult({
    completed,
    score,
    elapsed,
    track: selectedTrack,
    bestTime: Number(bestTimes[selectedTrack.id]),
    isNewBest
  });
}

function togglePause(force) {
  if (!running) return;

  const next = typeof force === "boolean" ? force : !paused;
  if (next === paused) return;

  paused = next;
  input.clear();

  if (paused) {
    audio.pause();
    ui.showPause();
  } else {
    ui.hidePause();
    audio.start();
    lastTime = performance.now();
  }
}

function award(points, label, comboStep = GAMEPLAY.comboStep) {
  const earned = Math.round(points * combo);
  score += earned;
  combo = Math.min(GAMEPLAY.comboMax, combo + comboStep);
  comboClock = GAMEPLAY.comboWindow;
  ui.toast(`${label} +${earned} • ${combo.toFixed(2)}×`);
  audio.reward();
}

function applyCollision({
  damage,
  push,
  speedRetention,
  otherSpeed,
  reason,
  hard
}) {
  if (invulnerability > 0 || !running || paused) {
    return false;
  }

  health = Math.max(0, health - damage);
  invulnerability = GAMEPLAY.collisionInvulnerability;

  const retainedSpeed = speed * speedRetention;
  const trafficSpeedFloor = Math.min(otherSpeed * 0.82, speed);
  speed = Math.max(retainedSpeed, trafficSpeedFloor);

  impactVelocity += push;
  steerVelocity *= 0.45;
  combo = 1;
  comboClock = 0;

  world.pulseImpact(hard ? 1.45 : 0.9);
  audio.collision(hard);
  ui.damageFlash();
  ui.toast(reason);

  if (health <= 0) {
    finishRun(false);
  }

  return true;
}

function updateCheckpoints(progress) {
  while (
    nextCheckpoint < GAMEPLAY.checkpointCount &&
    progress >= nextCheckpoint / GAMEPLAY.checkpointCount
  ) {
    const checkpointBonus = Math.round(250 * combo);
    score += checkpointBonus;
    boost = Math.min(100, boost + 12);
    ui.toast(
      `CHECKPOINT ${nextCheckpoint}/${GAMEPLAY.checkpointCount} +${checkpointBonus}`,
      1100
    );
    audio.reward();
    nextCheckpoint += 1;
  }
}

function updateDriving(dt, time) {
  elapsed += dt;
  invulnerability = Math.max(0, invulnerability - dt);

  if (comboClock > 0) {
    comboClock = Math.max(0, comboClock - dt);
  } else {
    combo = Math.max(1, combo - 0.7 * dt);
  }

  const accelerating = input.pressed("w", "arrowup");
  const braking = input.pressed("s", "arrowdown");
  const steeringLeft = input.pressed("a", "arrowleft");
  const steeringRight = input.pressed("d", "arrowright");
  const boosting = input.pressed("shift") && boost > 0 && speed > 35;

  speed +=
    (accelerating ? GAMEPLAY.acceleration : -GAMEPLAY.coastDrag) * dt;

  if (braking) {
    speed -= GAMEPLAY.braking * dt;
  }

  if (boosting) {
    speed += GAMEPLAY.boostAcceleration * dt;
    boost -= GAMEPLAY.boostDrain * dt;
  } else {
    boost = Math.min(100, boost + GAMEPLAY.boostRecharge * dt);
  }

  speed = clamp(
    speed,
    0,
    MAX_SPEED + (boosting ? 34 : 0)
  );

  const steerInput =
    (steeringRight ? 1 : 0) -
    (steeringLeft ? 1 : 0);

  const speedRatio = Math.min(speed / MAX_SPEED, 1);
  const steerRate = lerp(7.1, 3.25, speedRatio);

  steerVelocity = lerp(
    steerVelocity,
    steerInput * steerRate,
    1 - Math.exp(-7.5 * dt)
  );

  lateral +=
    steerVelocity *
    dt *
    (0.45 + speed / 85);

  lateral += impactVelocity * dt;
  impactVelocity *= Math.exp(-4.8 * dt);
  lateral *= Math.pow(0.999, dt * 60);

  advanceCurveSequence(dt);

  lateral -=
    roadCurve *
    selectedTrack.handling.curveDrift *
    speedRatio *
    speedRatio *
    dt;

  const offRoad = Math.abs(lateral) > roadLimit;

  if (offRoad) {
    speed -= GAMEPLAY.offRoadDeceleration * dt;
    health -= GAMEPLAY.offRoadDamagePerSecond * dt;
    steerVelocity *= Math.exp(-0.8 * dt);
    combo = Math.max(1, combo - 1.15 * dt);
    comboClock = 0;

    if (Math.random() < dt * 1.7) {
      ui.damageFlash();
    }

    if (health <= 0) {
      health = 0;
      finishRun(false);
      return;
    }
  }

  lateral = clamp(
    lateral,
    -ROAD_WIDTH / 2 - 3,
    ROAD_WIDTH / 2 + 3
  );

  const worldDistance = speed * WORLD_SPEED * dt;
  distanceMiles += speed * dt / 3600;
  score += speed * dt * 0.13 * combo;

  world.advance(worldDistance, roadCurve);

  const progress = getProgress();
  const trafficState = traffic.update({
    dt,
    playerSpeed: speed,
    lateral,
    roadCurve,
    progress,
    onCollision: applyCollision,
    onOvertake: (points) => award(points, "OVERTAKE", 0.2),
    onClosePass: (points) => award(points, "CLOSE PASS", 0.35)
  });

  drafting = trafficState.drafting;

  if (drafting && !boosting) {
    boost = Math.min(
      100,
      boost + GAMEPLAY.draftBoostRecharge * dt
    );
    score += GAMEPLAY.draftScorePerSecond * dt * combo;
  }

  updateCheckpoints(progress);

  audio.update(speed, boosting, offRoad);

  world.updateView({
    dt,
    time,
    lateral,
    steerVelocity,
    speed,
    curve: roadCurve,
    boosting
  });

  if (progress >= 1) {
    distanceMiles = selectedTrack.lengthMiles;
    finishRun(true);
    return;
  }

  renderHUD();
}

function update(dt, time) {
  if (!running || paused) {
    world.updateIdle(time);
    return;
  }

  updateDriving(dt, time);
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  update(dt, time);
  world.render();

  requestAnimationFrame(loop);
}

ui.refs.trackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (running) return;
    selectedTrack = getTrack(button.dataset.track);
    ui.selectTrack(selectedTrack.id);
    world.setTrack(selectedTrack);
    world.resetView();
    traffic.setTrack(selectedTrack);
    renderHUD();
  });
});

ui.refs.startButton.addEventListener("click", startGame);
ui.refs.restartButton.addEventListener("click", startGame);
ui.refs.pauseButton.addEventListener("click", () => togglePause());
ui.refs.resumeButton.addEventListener("click", () => togglePause(false));

ui.refs.trackButton.addEventListener("click", () => {
  ui.hideGameOver();
  ui.showStart();
  world.setTrack(selectedTrack);
  world.resetView();
  traffic.setTrack(selectedTrack);
  renderHUD();
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;

  const key = event.key.toLowerCase();
  if (key === "p" || key === "escape") {
    togglePause();
  }

  if (key === "m") {
    const enabled = audio.toggle();
    ui.toast(enabled ? "SOUND ON" : "SOUND OFF");
    if (enabled && running && !paused) audio.start();
  }
});

ui.refs.fullscreenButton.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    // Fullscreen is optional; the game remains playable if denied.
  }
});

renderHUD();
requestAnimationFrame(loop);
