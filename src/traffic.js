import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {
  GAMEPLAY,
  LANE_CENTERS,
  TRAFFIC_COUNT,
  WORLD_SPEED
} from "./config.js";

const CAR_COLORS = [
  0xdd3146,
  0x1f74d1,
  0xf3f3f3,
  0x18a77d,
  0xe19d21,
  0x6c55d7,
  0x25272a
];

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

function resetCar(car, zMin = -450, zMax = -85) {
  car.position.x =
    LANE_CENTERS[(Math.random() * LANE_CENTERS.length) | 0] +
    (Math.random() - 0.5) * 0.35;
  car.position.z = zMin + Math.random() * (zMax - zMin);
  car.position.y = 0.04;

  car.userData.speed = 35 + Math.random() * 65;
  car.userData.passed = false;
  car.userData.near = false;
}

export function createTraffic(scene) {
  const cars = [];

  for (let i = 0; i < TRAFFIC_COUNT; i += 1) {
    const car = buildCar();
    resetCar(car, -520, -80);
    scene.add(car);
    cars.push(car);
  }

  function resetAll() {
    cars.forEach((car, index) => {
      resetCar(car, -520 - index * 11, -95);
    });
  }

  function update({
    dt,
    playerSpeed,
    lateral,
    onCollision,
    onOvertake,
    onClosePass
  }) {
    for (const car of cars) {
      const relativeSpeed =
        (playerSpeed - car.userData.speed) * WORLD_SPEED;

      car.position.z += relativeSpeed * dt;

      if (car.position.z > 7) {
        if (!car.userData.passed) {
          car.userData.passed = true;
          onOvertake(GAMEPLAY.overtakeScore);
        }

        resetCar(car, -520, -250);
        continue;
      }

      if (car.position.z < -560) {
        resetCar(car, -220, -80);
        continue;
      }

      const deltaX = car.position.x - lateral;

      if (
        Math.abs(deltaX) < 1.72 &&
        car.position.z > -2.1 &&
        car.position.z < 4.3
      ) {
        onCollision(GAMEPLAY.collisionDamage, "COLLISION");
        car.position.z = -180 - Math.random() * 180;
        continue;
      }

      if (
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
  }

  return {
    cars,
    resetAll,
    update
  };
}
