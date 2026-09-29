import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export const WEATHER_STAGE_COUNT = 4;

const CLEAR = {
  name: "Clear",
  kind: "none",
  fogMultiplier: 1,
  grip: 1,
  brakingGrip: 1,
  driftMultiplier: 1,
  opacity: 0,
  rate: 0,
  wind: 0,
  color: 0xffffff
};

const sequences = {
  urban: [
    CLEAR,
    { name: "Drizzle", kind: "rain", fogMultiplier: 1.25, grip: 0.94, brakingGrip: 0.94, driftMultiplier: 1.08, opacity: 0.35, rate: 19, wind: 1, color: 0xaed8ff },
    { name: "Heavy Rain", kind: "rain", fogMultiplier: 1.65, grip: 0.84, brakingGrip: 0.84, driftMultiplier: 1.22, opacity: 0.58, rate: 31, wind: 2.5, color: 0xb7dcff },
    { name: "Thunderstorm", kind: "rain", fogMultiplier: 2.2, grip: 0.72, brakingGrip: 0.72, driftMultiplier: 1.42, opacity: 0.82, rate: 43, wind: 5.5, color: 0xd7ebff }
  ],
  coast: [
    CLEAR,
    { name: "Sea Mist", kind: "mist", fogMultiplier: 1.7, grip: 0.97, brakingGrip: 0.97, driftMultiplier: 1.04, opacity: 0, rate: 0, wind: 1, color: 0xe8f2ff },
    { name: "Rain Squall", kind: "rain", fogMultiplier: 1.9, grip: 0.84, brakingGrip: 0.86, driftMultiplier: 1.24, opacity: 0.6, rate: 34, wind: 4, color: 0xd7ecff },
    { name: "Coastal Storm", kind: "rain", fogMultiplier: 2.45, grip: 0.72, brakingGrip: 0.74, driftMultiplier: 1.48, opacity: 0.86, rate: 48, wind: 7, color: 0xe4f4ff }
  ],
  mountain: [
    CLEAR,
    { name: "Cloud Bank", kind: "mist", fogMultiplier: 1.75, grip: 0.95, brakingGrip: 0.95, driftMultiplier: 1.08, opacity: 0, rate: 0, wind: 1, color: 0xffffff },
    { name: "Cold Rain", kind: "rain", fogMultiplier: 2, grip: 0.8, brakingGrip: 0.82, driftMultiplier: 1.3, opacity: 0.58, rate: 29, wind: 3.5, color: 0xdcecff },
    { name: "Sleet Storm", kind: "snow", fogMultiplier: 2.5, grip: 0.66, brakingGrip: 0.68, driftMultiplier: 1.58, opacity: 0.78, rate: 18, wind: 6, color: 0xffffff }
  ],
  desert: [
    CLEAR,
    { name: "Crosswind", kind: "dust", fogMultiplier: 1.22, grip: 0.96, brakingGrip: 0.98, driftMultiplier: 1.06, opacity: 0.22, rate: 7, wind: 4, color: 0xd9bd82 },
    { name: "Dust Storm", kind: "dust", fogMultiplier: 1.9, grip: 0.84, brakingGrip: 0.87, driftMultiplier: 1.25, opacity: 0.55, rate: 11, wind: 8, color: 0xc79b58 },
    { name: "Sandstorm", kind: "dust", fogMultiplier: 2.8, grip: 0.72, brakingGrip: 0.76, driftMultiplier: 1.48, opacity: 0.82, rate: 15, wind: 12, color: 0xe0b56f }
  ],
  snow: [
    { ...CLEAR, name: "Cold Clear" },
    { name: "Light Snow", kind: "snow", fogMultiplier: 1.3, grip: 0.88, brakingGrip: 0.88, driftMultiplier: 1.18, opacity: 0.44, rate: 8, wind: 1, color: 0xffffff },
    { name: "Heavy Snow", kind: "snow", fogMultiplier: 1.9, grip: 0.72, brakingGrip: 0.74, driftMultiplier: 1.48, opacity: 0.7, rate: 14, wind: 3, color: 0xffffff },
    { name: "Whiteout", kind: "snow", fogMultiplier: 3.2, grip: 0.58, brakingGrip: 0.6, driftMultiplier: 1.82, opacity: 0.95, rate: 22, wind: 7, color: 0xffffff }
  ],
  country: [
    CLEAR,
    { name: "Light Rain", kind: "rain", fogMultiplier: 1.2, grip: 0.94, brakingGrip: 0.94, driftMultiplier: 1.08, opacity: 0.35, rate: 18, wind: 1, color: 0xcfe7ff },
    { name: "Downpour", kind: "rain", fogMultiplier: 1.75, grip: 0.82, brakingGrip: 0.84, driftMultiplier: 1.28, opacity: 0.64, rate: 34, wind: 3, color: 0xdceeff },
    { name: "Severe Storm", kind: "rain", fogMultiplier: 2.45, grip: 0.68, brakingGrip: 0.7, driftMultiplier: 1.55, opacity: 0.9, rate: 48, wind: 7, color: 0xf0f7ff }
  ],
  tropical: [
    CLEAR,
    { name: "Island Shower", kind: "rain", fogMultiplier: 1.2, grip: 0.92, brakingGrip: 0.93, driftMultiplier: 1.1, opacity: 0.38, rate: 22, wind: 2, color: 0xd4efff },
    { name: "Monsoon", kind: "rain", fogMultiplier: 1.9, grip: 0.78, brakingGrip: 0.8, driftMultiplier: 1.34, opacity: 0.72, rate: 39, wind: 5, color: 0xe3f5ff },
    { name: "Tropical Storm", kind: "rain", fogMultiplier: 2.65, grip: 0.64, brakingGrip: 0.66, driftMultiplier: 1.65, opacity: 0.96, rate: 52, wind: 9, color: 0xffffff }
  ],
  race: [
    { ...CLEAR, name: "Dry" },
    { name: "Damp", kind: "rain", fogMultiplier: 1.1, grip: 0.94, brakingGrip: 0.95, driftMultiplier: 1.07, opacity: 0.2, rate: 12, wind: 0.5, color: 0xdcecff },
    { name: "Wet", kind: "rain", fogMultiplier: 1.45, grip: 0.82, brakingGrip: 0.84, driftMultiplier: 1.25, opacity: 0.5, rate: 29, wind: 1.5, color: 0xe6f3ff },
    { name: "Torrential", kind: "rain", fogMultiplier: 2.1, grip: 0.69, brakingGrip: 0.71, driftMultiplier: 1.52, opacity: 0.88, rate: 47, wind: 4, color: 0xffffff }
  ],
  wasteland: [
    { ...CLEAR, name: "Still Air" },
    { name: "Ashfall", kind: "ash", fogMultiplier: 1.35, grip: 0.95, brakingGrip: 0.96, driftMultiplier: 1.08, opacity: 0.35, rate: 5, wind: 1.5, color: 0x9f9b93 },
    { name: "Dust Gale", kind: "dust", fogMultiplier: 2.05, grip: 0.8, brakingGrip: 0.84, driftMultiplier: 1.32, opacity: 0.65, rate: 12, wind: 8, color: 0x9f7655 },
    { name: "Black Storm", kind: "ash", fogMultiplier: 3, grip: 0.66, brakingGrip: 0.7, driftMultiplier: 1.6, opacity: 0.92, rate: 18, wind: 10, color: 0x6d6660 }
  ],
  neon: [
    { ...CLEAR, name: "Clear Night" },
    { name: "Neon Drizzle", kind: "rain", fogMultiplier: 1.25, grip: 0.93, brakingGrip: 0.94, driftMultiplier: 1.09, opacity: 0.38, rate: 21, wind: 1.5, color: 0x9feaff },
    { name: "Neon Downpour", kind: "rain", fogMultiplier: 1.7, grip: 0.81, brakingGrip: 0.83, driftMultiplier: 1.29, opacity: 0.7, rate: 38, wind: 3.5, color: 0xd0a8ff },
    { name: "Electric Storm", kind: "rain", fogMultiplier: 2.3, grip: 0.67, brakingGrip: 0.7, driftMultiplier: 1.58, opacity: 0.95, rate: 52, wind: 7, color: 0x8ff5ff }
  ]
};

export function getWeatherProfile(track, stage = 0) {
  const sequence = sequences[track.climate] ?? sequences.urban;
  const clampedStage = Math.max(
    0,
    Math.min(WEATHER_STAGE_COUNT - 1, Math.floor(stage))
  );

  return {
    ...sequence[clampedStage],
    stage: clampedStage,
    maxStage: WEATHER_STAGE_COUNT - 1
  };
}

export function createWeather(scene, initialTrack) {
  const particleCount = 760;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  function resetParticle(index, fullDepth = true) {
    const i = index * 3;
    positions[i] = (Math.random() - 0.5) * 42;
    positions[i + 1] = -1 + Math.random() * 22;
    positions[i + 2] = fullDepth
      ? -6 - Math.random() * 95
      : -70 - Math.random() * 30;
  }

  for (let i = 0; i < particleCount; i += 1) {
    resetParticle(i, true);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(geometry, material);
  particles.frustumCulled = false;
  scene.add(particles);

  let track = initialTrack;
  let profile = getWeatherProfile(track, 0);

  function apply(nextTrack, stage = 0) {
    track = nextTrack;
    profile = getWeatherProfile(track, stage);

    scene.fog.density = track.theme.fogDensity * profile.fogMultiplier;
    material.color.setHex(profile.color);
    material.opacity = profile.opacity;
    material.size =
      profile.kind === "snow"
        ? 0.32
        : profile.kind === "dust" || profile.kind === "ash"
          ? 0.26
          : 0.14;
    particles.visible =
      profile.kind !== "none" && profile.kind !== "mist" && profile.opacity > 0;

    return profile;
  }

  function update(dt, speed) {
    if (!particles.visible) return;

    const speedPush = Math.min(36, speed * 0.14);
    const isSnow = profile.kind === "snow";
    const isDust = profile.kind === "dust" || profile.kind === "ash";
    const fall = isSnow ? profile.rate * 0.7 : isDust ? profile.rate * 0.18 : profile.rate;
    const forward = isDust ? profile.rate * 1.25 + speedPush : profile.rate * 1.8 + speedPush;
    const wind = profile.wind * (isDust ? 1.8 : 0.55);

    for (let i = 0; i < particleCount; i += 1) {
      const p = i * 3;
      positions[p] += wind * dt;
      positions[p + 1] -= fall * dt;
      positions[p + 2] += forward * dt;

      if (
        positions[p + 1] < -2 ||
        positions[p + 2] > 8 ||
        Math.abs(positions[p]) > 28
      ) {
        resetParticle(i, false);
        positions[p] -= wind > 0 ? 12 : -12;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  }

  apply(initialTrack, 0);

  return {
    apply,
    update,
    get profile() {
      return profile;
    }
  };
}
