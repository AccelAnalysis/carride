import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { MAX_SPEED, ROAD_WIDTH, SEGMENT_COUNT, SEGMENT_LENGTH } from "./config.js";
import { roadFrameAtZ } from "./road.js";

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
    opacity: 0.82,
    transparent: true
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
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

function createGround(scene) {
  const material = new THREE.MeshStandardMaterial({
    color: 0x07120c,
    roughness: 1
  });
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(360, 0.02, 1250),
    material
  );
  ground.position.set(0, -0.04, -285);
  scene.add(ground);
  return { ground, material };
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

  const segments = [];

  for (let i = 0; i < SEGMENT_COUNT; i += 1) {
    const segment = new THREE.Group();
    segment.position.z = -i * SEGMENT_LENGTH;

    addBox(ROAD_WIDTH, 0.08, SEGMENT_LENGTH, roadMaterial, 0, 0, 0, segment);
    addBox(
      2,
      0.06,
      SEGMENT_LENGTH,
      shoulderMaterial,
      -ROAD_WIDTH / 2 - 1,
      0.01,
      0,
      segment
    );
    addBox(
      2,
      0.06,
      SEGMENT_LENGTH,
      shoulderMaterial,
      ROAD_WIDTH / 2 + 1,
      0.01,
      0,
      segment
    );

    addBox(
      0.11,
      0.025,
      SEGMENT_LENGTH,
      edgeMaterial,
      -ROAD_WIDTH / 2 + 0.12,
      0.08,
      0,
      segment
    );
    addBox(
      0.11,
      0.025,
      SEGMENT_LENGTH,
      edgeMaterial,
      ROAD_WIDTH / 2 - 0.12,
      0.08,
      0,
      segment
    );

    for (const laneX of [-ROAD_WIDTH / 6, ROAD_WIDTH / 6]) {
      for (
        let z = -SEGMENT_LENGTH / 2 + 2;
        z < SEGMENT_LENGTH / 2;
        z += 8
      ) {
        addBox(0.11, 0.03, 4.2, laneMaterial, laneX, 0.075, z, segment);
      }
    }

    roadGroup.add(segment);
    segments.push(segment);
  }

  return {
    segments,
    materials: { roadMaterial, shoulderMaterial, laneMaterial, edgeMaterial }
  };
}

function makeHolder(group, z) {
  const holder = new THREE.Group();
  holder.position.z = z;
  holder.userData.startZ = z;
  group.add(holder);
  return holder;
}

function createCityEnvironment(scene) {
  const group = new THREE.Group();
  const objects = [];
  scene.add(group);

  const buildingMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x111a28, roughness: 0.82, emissive: 0x06101f, emissiveIntensity: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0x171520, roughness: 0.85, emissive: 0x160717, emissiveIntensity: 0.45 }),
    new THREE.MeshStandardMaterial({ color: 0x101d1e, roughness: 0.9, emissive: 0x071514, emissiveIntensity: 0.4 })
  ];
  const glows = [0x40d9ff, 0xff5ca8, 0xffd65c, 0x7dff9c]
    .map((color) => new THREE.MeshBasicMaterial({ color }));

  for (let i = 0; i < 40; i += 1) {
    const holder = makeHolder(group, -20 - i * 18);
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
      height / 2,
      0,
      holder
    );

    if (Math.random() > 0.25) {
      addBox(
        Math.max(1.4, width * 0.55),
        0.2,
        0.08,
        glows[(Math.random() * glows.length) | 0],
        x,
        height - 2.2,
        side < 0 ? depth / 2 + 0.05 : -depth / 2 - 0.05,
        holder
      );
    }

    objects.push(holder);
  }

  return { group, objects };
}

function createCoastEnvironment(scene) {
  const group = new THREE.Group();
  const objects = [];
  scene.add(group);

  const trunk = new THREE.MeshStandardMaterial({ color: 0x5e4934, roughness: 1 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x1f5f48, roughness: 0.92 });
  const rock = new THREE.MeshStandardMaterial({ color: 0x867d70, roughness: 1 });
  const lamp = new THREE.MeshBasicMaterial({ color: 0xffd39a });

  for (let i = 0; i < 38; i += 1) {
    const holder = makeHolder(group, -24 - i * 19);
    const side = i % 3 === 0 ? -1 : 1;
    const x = side * (11 + Math.random() * 20);

    if (i % 4 === 0) {
      const boulder = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2 + Math.random() * 2.5, 0),
        rock
      );
      boulder.position.set(x, 1.1, 0);
      boulder.scale.y = 0.62;
      holder.add(boulder);
    } else {
      addBox(0.45, 5.8, 0.45, trunk, x, 2.9, 0, holder);
      for (let j = 0; j < 4; j += 1) {
        const crown = new THREE.Mesh(
          new THREE.ConeGeometry(1.4, 3.2, 7),
          leaf
        );
        crown.position.set(x + (j - 1.5) * 0.45, 6.2, (j % 2 ? 0.5 : -0.5));
        crown.rotation.z = (j - 1.5) * 0.22;
        holder.add(crown);
      }
    }

    if (i % 3 === 0) {
      addBox(0.12, 2.4, 0.12, rock, side * (ROAD_WIDTH / 2 + 2.5), 1.2, 0, holder);
      addBox(0.3, 0.2, 0.08, lamp, side * (ROAD_WIDTH / 2 + 2.5), 2.3, 0, holder);
    }

    objects.push(holder);
  }

  return { group, objects };
}

function createAlpineEnvironment(scene) {
  const group = new THREE.Group();
  const objects = [];
  scene.add(group);

  const trunk = new THREE.MeshStandardMaterial({ color: 0x3c3027, roughness: 1 });
  const pine = new THREE.MeshStandardMaterial({ color: 0x173326, roughness: 1 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x4d5356, roughness: 1 });
  const snow = new THREE.MeshStandardMaterial({ color: 0xcad8df, roughness: 0.95 });

  for (let i = 0; i < 42; i += 1) {
    const holder = makeHolder(group, -20 - i * 17);
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (11 + Math.random() * 24);

    addBox(0.42, 3.4, 0.42, trunk, x, 1.7, 0, holder);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(2.2, 7.2, 8), pine);
    crown.position.set(x, 5.0, 0);
    holder.add(crown);

    if (i % 5 === 0) {
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(8 + Math.random() * 7, 18 + Math.random() * 18, 7),
        stone
      );
      mountain.position.set(side * (34 + Math.random() * 34), 9, -7);
      holder.add(mountain);

      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(3.5, 5.5, 7),
        snow
      );
      cap.position.set(mountain.position.x, 20, -7);
      holder.add(cap);
    }

    objects.push(holder);
  }

  return { group, objects };
}

function applyRoadFrame(object, curve) {
  const frame = roadFrameAtZ(object.position.z, curve);
  object.position.x = frame.x;
  object.rotation.y = frame.yaw;
}

export function createWorld(container, initialTrack) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(initialTrack.theme.sky);
  scene.fog = new THREE.FogExp2(
    initialTrack.theme.fog,
    initialTrack.theme.fogDensity
  );

  const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.1,
    460
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

  const hemisphere = new THREE.HemisphereLight(
    initialTrack.theme.hemiSky,
    initialTrack.theme.hemiGround,
    1.35
  );
  scene.add(hemisphere);

  const keyLight = new THREE.DirectionalLight(initialTrack.theme.keyLight, 1.05);
  keyLight.position.set(-8, 14, 4);
  scene.add(keyLight);

  const stars = createStars(scene);
  const { material: groundMaterial } = createGround(scene);
  const { cockpit, hood, wheel } = createCockpit(scene, camera);
  const { segments, materials } = createRoad(scene);

  const environments = {
    metro: createCityEnvironment(scene),
    coast: createCoastEnvironment(scene),
    alpine: createAlpineEnvironment(scene)
  };

  let activeEnvironment = environments[initialTrack.id] ?? environments.metro;
  let impactShake = 0;

  function setTrack(track) {
    const { theme } = track;
    scene.background.setHex(theme.sky);
    scene.fog.color.setHex(theme.fog);
    scene.fog.density = theme.fogDensity;
    groundMaterial.color.setHex(theme.ground);
    materials.roadMaterial.color.setHex(theme.road);
    materials.shoulderMaterial.color.setHex(theme.shoulder);
    materials.laneMaterial.color.setHex(theme.lane);
    materials.edgeMaterial.color.setHex(theme.edge);
    hemisphere.color.setHex(theme.hemiSky);
    hemisphere.groundColor.setHex(theme.hemiGround);
    keyLight.color.setHex(theme.keyLight);

    Object.entries(environments).forEach(([id, environment]) => {
      environment.group.visible = id === track.id;
    });

    activeEnvironment = environments[track.id] ?? environments.metro;
    stars.visible = track.id !== "coast";

    for (const object of activeEnvironment.objects) {
      object.position.z = object.userData.startZ;
      object.scale.set(1, 1, 1);
    }
  }

  function advance(distance, curve) {
    for (const segment of segments) {
      segment.position.z += distance;

      if (segment.position.z > SEGMENT_LENGTH) {
        segment.position.z -= SEGMENT_LENGTH * SEGMENT_COUNT;
      }

      applyRoadFrame(segment, curve);
    }

    for (const object of activeEnvironment.objects) {
      object.position.z += distance;

      if (object.position.z > 38) {
        object.position.z -= activeEnvironment.objects.length * 18;
        const scale = 0.86 + Math.random() * 0.3;
        object.scale.set(scale, scale, scale);
      }

      applyRoadFrame(object, curve);
    }
  }

  function updateView({
    dt,
    time,
    lateral,
    steerVelocity,
    speed,
    curve,
    boosting
  }) {
    impactShake *= Math.exp(-8 * dt);
    const shakeX = (Math.random() - 0.5) * impactShake * 0.13;
    const shakeY = (Math.random() - 0.5) * impactShake * 0.08;

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      lateral + shakeX,
      1 - Math.exp(-8 * dt)
    );

    camera.position.y =
      1.45 +
      Math.sin(time * 0.018) * Math.min(speed / 5000, 0.012) +
      shakeY;

    const speedRatio = Math.min(speed / MAX_SPEED, 1);

    camera.rotation.z = THREE.MathUtils.lerp(
      camera.rotation.z,
      -steerVelocity * 0.024 - curve * speedRatio * 0.015,
      1 - Math.exp(-6 * dt)
    );

    camera.rotation.y = THREE.MathUtils.lerp(
      camera.rotation.y,
      -steerVelocity * 0.013 - curve * speedRatio * 0.011,
      1 - Math.exp(-5 * dt)
    );

    const targetFov = 72 + speedRatio * 6 + (boosting ? 3 : 0);
    camera.fov = THREE.MathUtils.lerp(
      camera.fov,
      targetFov,
      1 - Math.exp(-4 * dt)
    );
    camera.updateProjectionMatrix();

    wheel.rotation.z = 0.04 - steerVelocity * 0.12;
    hood.position.y =
      -1 + Math.sin(time * 0.022) * Math.min(speed / 9000, 0.009);
  }

  function pulseImpact(amount = 1) {
    impactShake = Math.max(impactShake, amount);
  }

  function updateIdle(time) {
    cockpit.rotation.z = Math.sin(time * 0.00035) * 0.003;
    wheel.rotation.z = 0.04 + Math.sin(time * 0.0005) * 0.02;
  }

  function resetView() {
    camera.position.set(0, 1.45, 3.35);
    camera.rotation.set(0, 0, 0);
    camera.fov = 72;
    camera.updateProjectionMatrix();
    cockpit.rotation.set(0, 0, 0);
    wheel.rotation.z = 0.04;
    hood.position.y = -1;
    impactShake = 0;

    segments.forEach((segment, index) => {
      segment.position.set(0, 0, -index * SEGMENT_LENGTH);
      segment.rotation.y = 0;
    });

    Object.values(environments).forEach((environment) => {
      environment.objects.forEach((object) => {
        object.position.set(0, 0, object.userData.startZ);
        object.rotation.y = 0;
        object.scale.set(1, 1, 1);
      });
    });
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  }

  window.addEventListener("resize", resize);
  setTrack(initialTrack);

  return {
    scene,
    camera,
    renderer,
    advance,
    setTrack,
    updateView,
    updateIdle,
    pulseImpact,
    resetView,
    render() {
      renderer.render(scene, camera);
    }
  };
}
