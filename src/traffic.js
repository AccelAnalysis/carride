import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {
  GAMEPLAY,
  LANE_CENTERS,
  MAX_TRAFFIC_COUNT,
  WORLD_SPEED
} from "./config.js";
import { roadOffsetAtZ, roadYawAtZ } from "./road.js";

const CAR_COLORS = [
  0xdd3146,
  0x1f74d1,
  0xf3f3f3,
  0x18a77d,
  0xe19d21,
  0x6c55d7,
  0x25272a,
  0xd8e04a
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function addBox(width, height, depth, material, x, y, z, parent) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function buildCar() {
  const car = new THREE.Group();
  const color = CAR_COLORS[(Math.random() * CAR_COLORS.length) | 0];

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.55,
    roughness: 0.32
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.85, 4.2),
    bodyMaterial
  );
  body.position.y = 0.52;
  car.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.72, 1.9),
    new THREE.MeshStandardMaterial({
      color: 0x15222d,
      metalness: 0.2,
      roughness: 0.2
    })
  );
  cabin.position.set(0, 1.15, -0.15);
  car.add(cabin);

  const wheelGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12);
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x08090b,
    roughness: 1
  });

  for (const sideX of [-1, 1]) {
    for (const sideZ of [-1, 1]) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(sideX * 1.08, 0.37, sideZ * 1.35);
      car.add(wheel);
    }
  }

  const tailLight = new THREE.MeshBasicMaterial({ color: 0xff334b });
  const headLight = new THREE.MeshBasicMaterial({ color: 0xe8f6ff });

  addBox(0.45, 0.18, 0.06, tailLight, -0.62, 0.57, 2.12, car);
  addBox(0.45, 0.18, 0.06, tailLight, 0.62, 0.57, 2.12, car);
  addBox(0.45, 0.18, 0.06, headLight, -0.62, 0.57, -2.12, car);
  addBox(0.45, 0.18, 0.06, headLight, 0.62, 0.57, -2.12, car);

  return car;
}

function resetCar(car, track, zMin = -450, zMax = -85) {
  const laneIndex = (Math.random() * LANE_CENTERS.length) | 0;
  car.userData.laneIndex = laneIndex;
  car.userData.laneX =
    LANE_CENTERS[laneIndex] + (Math.random() - 0.5) * 0.24;
  car.userData.targetLaneX = car.userData.laneX;
  car.userData.nudgeVelocity = 0;
  car.userData.speed =
    track.traffic.speedMin +
    Math.random() * (track.traffic.speedMax - track.traffic.speedMin);
  car.userData.passed = false;
  car.userData.near = false;
  car.userData.collisionCooldown = 0;
  car.userData.laneChangeClock = 2.5 + Math.random() * 6;

  car.position.set(
    car.userData.laneX,
    0.04,
    zMin + Math.random() * (zMax - zMin)
  );
  car.rotation.y = 0;
}

function updateCarRoadPosition(car, curve) {
  car.position.x = roadOffsetAtZ(car.position.z, curve) + car.userData.laneX;
  car.rotation.y = roadYawAtZ(car.position.z, curve);
}

export function createTraffic(scene, initialTrack) {
  let track = initialTrack;
  const cars = [];

  for (let i = 0; i < MAX_TRAFFIC_COUNT; i += 1) {
    const car = buildCar();
    resetCar(car, track, -520, -80);
    car.visible = i < track.traffic.count;
    scene.add(car);
    cars.push(car);
  }

  function setTrack(nextTrack) {
    track = nextTrack;
    resetAll();
  }

  function resetAll() {
    cars.forEach((car, index) => {
      car.visible = index < track.traffic.count;
      resetCar(car, track, -520 - index * 9, -95);
    });
  }

  function update({
    dt,
    playerSpeed,
    lateral,
    roadCurve,
    progress,
    onCollision,
    onOvertake,
    onClosePass
  }) {
    let drafting = false;

    for (const car of cars) {
      if (!car.visible) continue;

      car.userData.collisionCooldown = Math.max(
        0,
        car.userData.collisionCooldown - dt
      );

      car.userData.laneChangeClock -= dt;
      if (car.userData.laneChangeClock <= 0 && car.position.z < -12) {
        car.userData.laneChangeClock = 3.2 + Math.random() * 6;

        if (Math.random() < track.traffic.laneChangeRate * (0.85 + progress * 0.5)) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          const nextIndex = clamp(
            car.userData.laneIndex + direction,
            0,
            LANE_CENTERS.length - 1
          );

          if (nextIndex !== car.userData.laneIndex) {
            car.userData.laneIndex = nextIndex;
            car.userData.targetLaneX =
              LANE_CENTERS[nextIndex] + (Math.random() - 0.5) * 0.2;
          }
        }
      }

      car.userData.laneX = lerp(
        car.userData.laneX,
        car.userData.targetLaneX,
        1 - Math.exp(-1.15 * dt)
      );

      car.userData.laneX += car.userData.nudgeVelocity * dt;
      car.userData.nudgeVelocity *= Math.exp(-5.5 * dt);

      const trafficSpeed = car.userData.speed + progress * 7;
      const relativeSpeed = (playerSpeed - trafficSpeed) * WORLD_SPEED;

      car.position.z += relativeSpeed * dt;
      updateCarRoadPosition(car, roadCurve);

      const deltaX = car.userData.laneX - lateral;

      if (
        car.position.z > -19 &&
        car.position.z < -5 &&
        Math.abs(deltaX) < 1.25 &&
        playerSpeed > trafficSpeed + 4
      ) {
        drafting = true;
      }

      if (car.position.z > 7) {
        if (!car.userData.passed) {
          car.userData.passed = true;
          onOvertake(GAMEPLAY.overtakeScore);
        }

        resetCar(car, track, -520, -255);
        updateCarRoadPosition(car, roadCurve);
        continue;
      }

      if (car.position.z < -570) {
        resetCar(car, track, -235, -85);
        updateCarRoadPosition(car, roadCurve);
        continue;
      }

      const overlappingLongitudinally =
        car.position.z > -2.4 && car.position.z < 4.4;

      if (
        car.userData.collisionCooldown <= 0 &&
        Math.abs(deltaX) < 1.72 &&
        overlappingLongitudinally
      ) {
        const relativeMph = Math.abs(playerSpeed - trafficSpeed);
        const impact = clamp(0.35 + relativeMph / 105, 0.35, 1);
        const damage =
          GAMEPLAY.collisionDamageMin +
          (GAMEPLAY.collisionDamageMax - GAMEPLAY.collisionDamageMin) *
            impact;

        const pushDirection = deltaX >= 0 ? -1 : 1;
        const playerPush =
          pushDirection *
          GAMEPLAY.collisionPush *
          (0.75 + impact * 0.45);

        const accepted = onCollision({
          damage,
          push: playerPush,
          speedRetention: 0.72 - impact * 0.16,
          otherSpeed: trafficSpeed,
          reason: impact > 0.72 ? "HARD COLLISION" : "COLLISION",
          hard: impact > 0.72
        });

        if (accepted !== false) {
          car.userData.collisionCooldown = GAMEPLAY.trafficCollisionCooldown;
          car.userData.nudgeVelocity =
            -pushDirection * (2.2 + impact * 1.6);
          car.position.z -= 0.7 + relativeMph * 0.018;
          updateCarRoadPosition(car, roadCurve);
        }

        continue;
      }

      if (
        car.userData.collisionCooldown <= 0 &&
        !car.userData.near &&
        Math.abs(deltaX) < 2.3 &&
        Math.abs(deltaX) > 1.72 &&
        car.position.z > -1 &&
        car.position.z < 3
      ) {
        car.userData.near = true;
        onClosePass(GAMEPLAY.closePassScore);
      }

      if (car.position.z < -20) {
        car.userData.near = false;
      }
    }

    return { drafting };
  }

  return {
    cars,
    setTrack,
    resetAll,
    update
  };
}
