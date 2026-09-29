import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { MAX_SPEED } from "./config.js";
import { createWeather } from "./weather.js";
import { createChunkStream } from "./worldChunks.js";

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

function createGround(scene, color) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 1
  });
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(420, 0.02, 1500),
    material
  );
  ground.position.set(0, -0.06, -330);
  scene.add(ground);
  return material;
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
    520
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

  const keyLight = new THREE.DirectionalLight(
    initialTrack.theme.keyLight,
    1.05
  );
  keyLight.position.set(-8, 14, 4);
  scene.add(keyLight);

  const stars = createStars(scene);
  const groundMaterial = createGround(scene, initialTrack.theme.ground);
  const { cockpit, hood, wheel } = createCockpit(scene, camera);
  const chunks = createChunkStream(scene, initialTrack);
  const weather = createWeather(scene, initialTrack);

  let activeTrack = initialTrack;
  let impactShake = 0;

  function setTrack(track) {
    activeTrack = track;
    const { theme } = track;

    scene.background.setHex(theme.sky);
    scene.fog.color.setHex(theme.fog);
    scene.fog.density = theme.fogDensity;
    groundMaterial.color.setHex(theme.ground);
    hemisphere.color.setHex(theme.hemiSky);
    hemisphere.groundColor.setHex(theme.hemiGround);
    keyLight.color.setHex(theme.keyLight);

    chunks.setTrack(track);
    chunks.reset();
    stars.visible = !["coast", "tropical", "race"].includes(track.environment);
    return weather.apply(track, 0);
  }

  function setWeather(stage) {
    return weather.apply(activeTrack, stage);
  }

  function advance(distance, curve) {
    chunks.advance(distance, curve);
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

    weather.update(dt, speed);
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
    chunks.reset();
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
    setWeather,
    updateView,
    updateIdle,
    pulseImpact,
    resetView,
    render() {
      renderer.render(scene, camera);
    }
  };
}
