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
    maxDisplaySpeed
  });
}

function startGame() {
  running = true;
  speed = GAMEPLAY.startSpeed;
  lateral = 0;
  steerVelocity = 0;
  health = 100;
  score = 0;
  distanceMiles = 0;
  boost = 100;
  invulnerability = 0;
  roadCurve = 0;
  targetCurve = 0;
  curveClock = 0;

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
  input.clear();
  renderHUD();
  ui.showGameOver(score, distanceMiles);
}

function hit(amount, reason) {
  if (invulnerability > 0 || !running) return;

  health = Math.max(0, health - amount);
  invulnerability = 0.8;
  speed *= 0.58;

  ui.damageFlash();
  ui.toast(reason);

  if (health <= 0) {
    endGame();
  }
}

function updateCurve(dt) {
  curveClock -= dt;

  if (curveClock <= 0) {
    curveClock = 5 + Math.random() * 5;
    targetCurve = (Math.random() - 0.5) * 1.8;
  }

  roadCurve = lerp(
    roadCurve,
    targetCurve,
    1 - Math.exp(-0.25 * dt)
  );
}

function updateDriving(dt, time) {
  invulnerability = Math.max(0, invulnerability - dt);

  const accelerating = input.pressed("w", "arrowup");
  const braking = input.pressed("s", "arrowdown");
  const steeringLeft = input.pressed("a", "arrowleft");
  const steeringRight = input.pressed("d", "arrowright");
  const boosting = input.pressed("shift") && boost > 0 && speed > 35;

  speed += (accelerating ? GAMEPLAY.acceleration : -GAMEPLAY.coastDrag) * dt;

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

  lateral += steerVelocity * dt * (0.45 + speed / 85);
  lateral *= Math.pow(0.999, dt * 60);

  updateCurve(dt);

  lateral +=
    roadCurve *
    (speed / MAX_SPEED) *
    0.035 *
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

  world.advance(worldDistance);

  traffic.update({
    dt,
    playerSpeed: speed,
    lateral,
    onCollision: (amount, reason) => {
      hit(amount, reason);
    },
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
    speed
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
