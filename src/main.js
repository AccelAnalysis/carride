import {
  GAMEPLAY,
  MAX_SPEED,
  ROAD_WIDTH,
  WORLD_SPEED
} from "./config.js";
import { createInput } from "./input.js";
import { createTraffic } from "./traffic.js";
import { createUI } from "./ui.js";
import { createWorld } from "./world.js";

const ui = createUI();
const input = createInput();
const world = createWorld(document.getElementById("game"));
const traffic = createTraffic(world.scene);

let running = false;
let speed = 0;
let lateral = 0;
let steerVelocity = 0;
let impactVelocity = 0;
let health = 100;
let score = 0;
let distanceMiles = 0;
let boost = 100;
let invulnerability = 0;

let roadCurve = 0;
let targetCurve = 0;
let curveClock = 0;
let lastTime = performance.now();

const roadLimit = ROAD_WIDTH / 2 - 1.1;
const maxDisplaySpeed = MAX_SPEED + 28;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

function renderHUD() {
  ui.update({
    score,
    distanceMiles,
    health,
    speed,
    boost,
    offRoad: Math.abs(lateral) > roadLimit,
    roadCurve,
    maxDisplaySpeed
  });
}

function chooseNextCurve() {
  curveClock =
    GAMEPLAY.curveMinDuration +
    Math.random() *
      (GAMEPLAY.curveMaxDuration - GAMEPLAY.curveMinDuration);

  if (Math.random() < GAMEPLAY.straightSectionChance) {
    targetCurve = 0;
    return;
  }

  const direction = Math.random() < 0.5 ? -1 : 1;
  const intensity = 0.35 + Math.random() * 0.65;
  targetCurve = direction * intensity;
}

function startGame() {
  running = true;
  speed = GAMEPLAY.startSpeed;
  lateral = 0;
  steerVelocity = 0;
  impactVelocity = 0;
  health = 100;
  score = 0;
  distanceMiles = 0;
  boost = 100;
  invulnerability = 0;
  roadCurve = 0;
  targetCurve = 0;
  curveClock = 2.5;

  input.clear();
  world.resetView();
  traffic.resetAll();

  ui.hideStart();
  ui.hideGameOver();
  ui.toast("GO");
  renderHUD();

  lastTime = performance.now();
}

function endGame() {
  if (!running) return;

  running = false;
  speed = 0;
  impactVelocity = 0;
  input.clear();
  renderHUD();
  ui.showGameOver(score, distanceMiles);
}

function applyCollision({
  damage,
  push,
  speedRetention,
  otherSpeed,
  reason
}) {
  if (invulnerability > 0 || !running) {
    return false;
  }

  health = Math.max(0, health - damage);
  invulnerability = GAMEPLAY.collisionInvulnerability;

  const retainedSpeed = speed * speedRetention;
  const trafficSpeedFloor = Math.min(otherSpeed * 0.82, speed);
  speed = Math.max(retainedSpeed, trafficSpeedFloor);

  impactVelocity += push;
  steerVelocity *= 0.45;

  ui.damageFlash();
  ui.toast(reason);

  if (health <= 0) {
    endGame();
  }

  return true;
}

function updateCurve(dt) {
  curveClock -= dt;

  if (curveClock <= 0) {
    chooseNextCurve();
  }

  roadCurve = lerp(
    roadCurve,
    targetCurve,
    1 - Math.exp(-GAMEPLAY.curveResponse * dt)
  );
}

function updateDriving(dt, time) {
  invulnerability = Math.max(0, invulnerability - dt);

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
    MAX_SPEED + (boosting ? 28 : 0)
  );

  const steerInput =
    (steeringRight ? 1 : 0) -
    (steeringLeft ? 1 : 0);

  const steerRate = lerp(
    6.8,
    3.2,
    Math.min(speed / MAX_SPEED, 1)
  );

  steerVelocity = lerp(
    steerVelocity,
    steerInput * steerRate,
    1 - Math.exp(-7 * dt)
  );

  lateral +=
    steerVelocity *
    dt *
    (0.45 + speed / 85);

  lateral += impactVelocity * dt;
  impactVelocity *= Math.exp(-4.8 * dt);

  lateral *= Math.pow(0.999, dt * 60);

  updateCurve(dt);

  const speedRatio = Math.min(speed / MAX_SPEED, 1);
  lateral -=
    roadCurve *
    GAMEPLAY.curveDrift *
    speedRatio *
    speedRatio *
    dt;

  const offRoad = Math.abs(lateral) > roadLimit;

  if (offRoad) {
    speed -= GAMEPLAY.offRoadDeceleration * dt;
    health -= GAMEPLAY.offRoadDamagePerSecond * dt;

    if (Math.random() < dt * 1.8) {
      ui.damageFlash();
    }

    if (health <= 0) {
      health = 0;
      endGame();
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
  score += speed * dt * 0.13;

  world.advance(worldDistance, roadCurve);

  traffic.update({
    dt,
    playerSpeed: speed,
    lateral,
    roadCurve,
    onCollision: applyCollision,
    onOvertake: (points) => {
      score += points;
      ui.toast(`OVERTAKE +${points}`);
    },
    onClosePass: (points) => {
      score += points;
      ui.toast(`CLOSE PASS +${points}`);
    }
  });

  world.updateView({
    dt,
    time,
    lateral,
    steerVelocity,
    speed,
    curve: roadCurve
  });

  renderHUD();
}

function update(dt, time) {
  if (!running) {
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

ui.refs.startButton.addEventListener("click", startGame);
ui.refs.restartButton.addEventListener("click", startGame);

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
