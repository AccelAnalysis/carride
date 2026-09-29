import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ROAD_WIDTH, SEGMENT_COUNT, SEGMENT_LENGTH } from "./config.js";

function addBox(width, height, depth, material, x, y, z, parent) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function createStars(scene) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 900; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 120 + Math.random() * 220;
    const y = 18 + Math.random() * 120;

    positions.push(
      Math.cos(angle) * radius,
      y,
      -Math.abs(Math.sin(angle) * radius) - 20
    );
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xcce7ff,
    size: 0.45,
    sizeAttenuation: true,
    opacity: 0.85,
    transparent: true
  });

  scene.add(new THREE.Points(geometry, material));
}

function createCockpit(scene, camera) {
  const cockpit = new THREE.Group();
  camera.add(cockpit);
  scene.add(camera);

  const dashboardMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b1118,
    roughness: 0.62,
    metalness: 0.35
  });

  const dashboard = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.55, 1),
    dashboardMaterial
  );
  dashboard.position.set(0, -1.02, -0.52);
  dashboard.rotation.x = -0.08;
  cockpit.add(dashboard);

  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.18, 2),
    new THREE.MeshStandardMaterial({
      color: 0x141c28,
      roughness: 0.32,
      metalness: 0.72
    })
  );
  hood.position.set(0, -1, -2.05);
  hood.rotation.x = -0.03;
  cockpit.add(hood);

  const wheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.065, 12, 30),
    new THREE.MeshStandardMaterial({
      color: 0x111722,
      roughness: 0.55
    })
  );
  wheel.rotation.x = Math.PI / 2;
  wheel.rotation.z = 0.04;
  wheel.position.set(-0.72, -0.64, -1.28);
  cockpit.add(wheel);

  const spoke = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.055, 0.06),
    dashboardMaterial
  );
  spoke.position.copy(wheel.position);
  spoke.rotation.z = 0.04;
  cockpit.add(spoke);

  const windshieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x090d13,
    roughness: 0.5
  });

  const leftPillar = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 2.3, 0.12),
    windshieldMaterial
  );
  leftPillar.position.set(-1.83, 0.14, -1.15);
  leftPillar.rotation.z = -0.17;
  cockpit.add(leftPillar);

  const rightPillar = leftPillar.clone();
  rightPillar.position.x = 1.83;
  rightPillar.rotation.z = 0.17;
  cockpit.add(rightPillar);

  const roofBar = new THREE.Mesh(
    new THREE.BoxGeometry(3.72, 0.11, 0.12),
    windshieldMaterial
  );
  roofBar.position.set(0, 1.12, -1.17);
  cockpit.add(roofBar);

  return { cockpit, hood, wheel };
}

function createRoad(scene) {
  const roadGroup = new THREE.Group();
  scene.add(roadGroup);

  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x171a20,
    roughness: 0.95,
    metalness: 0.02
  });
  const shoulderMaterial = new THREE.MeshStandardMaterial({
    color: 0x30343a,
    roughness: 1
  });
  const laneMaterial = new THREE.MeshBasicMaterial({ color: 0xf7f3d9 });
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x3ce5ff });
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x07120c,
    roughness: 1
  });

  const segments = [];

  for (let i = 0; i < SEGMENT_COUNT; i += 1) {
    const segment = new THREE.Group();
    segment.position.z = -i * SEGMENT_LENGTH;

    addBox(ROAD_WIDTH, 0.08, SEGMENT_LENGTH, roadMaterial, 0, 0, 0, segment);
    addBox(2, 0.06, SEGMENT_LENGTH, shoulderMaterial, -ROAD_WIDTH / 2 - 1, 0.01, 0, segment);
    addBox(2, 0.06, SEGMENT_LENGTH, shoulderMaterial, ROAD_WIDTH / 2 + 1, 0.01, 0, segment);
    addBox(90, 0.02, SEGMENT_LENGTH, grassMaterial, -ROAD_WIDTH / 2 - 47, 0, 0, segment);
    addBox(90, 0.02, SEGMENT_LENGTH, grassMaterial, ROAD_WIDTH / 2 + 47, 0, 0, segment);
    addBox(0.11, 0.025, SEGMENT_LENGTH, edgeMaterial, -ROAD_WIDTH / 2 + 0.12, 0.08, 0, segment);
    addBox(0.11, 0.025, SEGMENT_LENGTH, edgeMaterial, ROAD_WIDTH / 2 - 0.12, 0.08, 0, segment);

    for (const laneX of [-ROAD_WIDTH / 6, ROAD_WIDTH / 6]) {
      for (
        let z = -SEGMENT_LENGTH / 2 + 4;
        z < SEGMENT_LENGTH / 2;
        z += 8
      ) {
        addBox(0.11, 0.03, 4.2, laneMaterial, laneX, 0.075, z, segment);
      }
    }

    roadGroup.add(segment);
    segments.push(segment);
  }

  return { roadGroup, segments };
}

function createRoadside(scene) {
  const roadside = new THREE.Group();
  scene.add(roadside);

  const buildingMaterials = [
    new THREE.MeshStandardMaterial({
      color: 0x111a28,
      roughness: 0.82,
      metalness: 0.08,
      emissive: 0x06101f,
      emissiveIntensity: 0.7
    }),
    new THREE.MeshStandardMaterial({
      color: 0x171520,
      roughness: 0.85,
      emissive: 0x160717,
      emissiveIntensity: 0.45
    }),
    new THREE.MeshStandardMaterial({
      color: 0x101d1e,
      roughness: 0.9,
      emissive: 0x071514,
      emissiveIntensity: 0.4
    })
  ];

  const emissiveMaterials = [
    0x40d9ff,
    0xff5ca8,
    0xffd65c,
    0x7dff9c
  ].map((color) => new THREE.MeshBasicMaterial({ color }));

  const objects = [];

  function makeRoadsideObject(z) {
    const holder = new THREE.Group();
    holder.position.z = z;

    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (12 + Math.random() * 30);
    const height = 8 + Math.random() * 34;
    const width = 5 + Math.random() * 11;
    const depth = 5 + Math.random() * 9;

    addBox(
      width,
      height,
      depth,
      buildingMaterials[(Math.random() * buildingMaterials.length) | 0],
      x,
      height / 2 - 0.05,
      0,
      holder
    );

    const rows = Math.max(2, Math.floor(height / 5));
    for (let row = 0; row < rows; row += 1) {
      if (Math.random() < 0.45) continue;

      const glow = addBox(
        Math.max(1.2, width * 0.55),
        0.17,
        0.05,
        emissiveMaterials[(Math.random() * emissiveMaterials.length) | 0],
        x,
        height - 2 - row * 4,
        side < 0 ? depth / 2 + 0.04 : -depth / 2 - 0.04,
        holder
      );
      glow.rotation.y = side < 0 ? 0 : Math.PI;
    }

    const reflectorX = side * (ROAD_WIDTH / 2 + 2.3);
    addBox(
      0.12,
      1,
      0.12,
      new THREE.MeshStandardMaterial({ color: 0x858b91 }),
      reflectorX,
      0.5,
      0,
      holder
    );
    addBox(
      0.22,
      0.16,
      0.05,
      emissiveMaterials[0],
      reflectorX,
      0.86,
      side < 0 ? 0.08 : -0.08,
      holder
    );

    roadside.add(holder);
    objects.push(holder);
  }

  for (let i = 0; i < 40; i += 1) {
    makeRoadsideObject(-20 - i * 18);
  }

  return { roadside, objects };
}

export function createWorld(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050912);
  scene.fog = new THREE.FogExp2(0x071019, 0.0038);

  const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.1,
    450
  );
  camera.position.set(0, 1.45, 3.35);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0x8bbcff, 0x111018, 1.35));

  const moon = new THREE.DirectionalLight(0xb8d8ff, 1.05);
  moon.position.set(-8, 14, 4);
  scene.add(moon);

  createStars(scene);

  const { cockpit, hood, wheel } = createCockpit(scene, camera);
  const { segments } = createRoad(scene);
  const { objects } = createRoadside(scene);

  function advance(distance) {
    for (const segment of segments) {
      segment.position.z += distance;

      if (segment.position.z > SEGMENT_LENGTH) {
        segment.position.z -= SEGMENT_LENGTH * SEGMENT_COUNT;
      }
    }

    for (const object of objects) {
      object.position.z += distance;

      if (object.position.z > 35) {
        object.position.z -= 40 * 18;
        const scale = 0.8 + Math.random() * 0.5;
        object.scale.set(scale, scale, scale);
      }
    }
  }

  function updateView({ dt, time, lateral, steerVelocity, speed }) {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      lateral,
      1 - Math.exp(-8 * dt)
    );
    camera.position.y =
      1.45 + Math.sin(time * 0.018) * Math.min(speed / 5000, 0.012);

    camera.rotation.z = THREE.MathUtils.lerp(
      camera.rotation.z,
      -steerVelocity * 0.022,
      1 - Math.exp(-6 * dt)
    );
    camera.rotation.y = THREE.MathUtils.lerp(
      camera.rotation.y,
      -steerVelocity * 0.012,
      1 - Math.exp(-5 * dt)
    );

    wheel.rotation.z = 0.04 - steerVelocity * 0.12;
    hood.position.y =
      -1 + Math.sin(time * 0.022) * Math.min(speed / 9000, 0.009);
  }

  function updateIdle(time) {
    cockpit.rotation.z = Math.sin(time * 0.00035) * 0.003;
    wheel.rotation.z = 0.04 + Math.sin(time * 0.0005) * 0.02;
  }

  function resetView() {
    camera.position.set(0, 1.45, 3.35);
    camera.rotation.set(0, 0, 0);
    cockpit.rotation.set(0, 0, 0);
    wheel.rotation.z = 0.04;
    hood.position.y = -1;
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  }

  window.addEventListener("resize", resize);

  return {
    scene,
    camera,
    renderer,
    advance,
    updateView,
    updateIdle,
    resetView,
    render() {
      renderer.render(scene, camera);
    }
  };
}
