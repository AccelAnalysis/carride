import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ROAD_WIDTH, SEGMENT_LENGTH } from "./config.js";
import { roadFrameAtZ } from "./road.js";

const CHUNK_SEGMENTS = 4;
const CHUNK_LENGTH = CHUNK_SEGMENTS * SEGMENT_LENGTH;
const CHUNK_COUNT = 12;
const BUSINESS_TYPES = ["GAS", "EATS", "GARAGE", "MOTEL"];

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

export function createChunkStream(scene, initialTrack) {
  const root = new THREE.Group();
  scene.add(root);

  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitCone = new THREE.ConeGeometry(1, 1, 7);
  const unitRock = new THREE.DodecahedronGeometry(1, 0);

  const roadMaterial = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0.02 });
  const shoulderMaterial = new THREE.MeshStandardMaterial({ roughness: 1 });
  const laneMaterial = new THREE.MeshBasicMaterial();
  const edgeMaterial = new THREE.MeshBasicMaterial();

  const materialCache = new Map();
  const signMaterialCache = new Map();

  function standardMaterial(color, emissive = 0x000000, emissiveIntensity = 0) {
    const key = `${color}:${emissive}:${emissiveIntensity}`;
    if (!materialCache.has(key)) {
      materialCache.set(
        key,
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.9,
          metalness: 0.05,
          emissive,
          emissiveIntensity
        })
      );
    }
    return materialCache.get(key);
  }

  function basicMaterial(color) {
    const key = `basic:${color}`;
    if (!materialCache.has(key)) {
      materialCache.set(key, new THREE.MeshBasicMaterial({ color }));
    }
    return materialCache.get(key);
  }

  function box(parent, material, sx, sy, sz, x, y, z) {
    const mesh = new THREE.Mesh(unitBox, material);
    mesh.scale.set(sx, sy, sz);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function cone(parent, material, sx, sy, sz, x, y, z) {
    const mesh = new THREE.Mesh(unitCone, material);
    mesh.scale.set(sx, sy, sz);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function rock(parent, material, scale, x, y, z) {
    const mesh = new THREE.Mesh(unitRock, material);
    mesh.scale.set(scale, scale * 0.62, scale);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function signMaterial(label) {
    if (signMaterialCache.has(label)) return signMaterialCache.get(label);

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    const palettes = {
      GAS: ["#0d5db8", "#ffffff"],
      EATS: ["#c63d27", "#fff3c8"],
      GARAGE: ["#262a30", "#ffcf45"],
      MOTEL: ["#7132a8", "#ffffff"]
    };
    const [background, foreground] = palettes[label] ?? ["#222", "#fff"];

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    ctx.fillStyle = foreground;
    ctx.font = "800 44px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    signMaterialCache.set(label, material);
    return material;
  }

  function createRoadSegment(parent, localZ) {
    const segment = new THREE.Group();
    segment.position.z = localZ;
    segment.userData.localZ = localZ;

    box(segment, roadMaterial, ROAD_WIDTH, 0.08, SEGMENT_LENGTH, 0, 0, 0);
    box(segment, shoulderMaterial, 2, 0.06, SEGMENT_LENGTH, -ROAD_WIDTH / 2 - 1, 0.01, 0);
    box(segment, shoulderMaterial, 2, 0.06, SEGMENT_LENGTH, ROAD_WIDTH / 2 + 1, 0.01, 0);
    box(segment, edgeMaterial, 0.11, 0.025, SEGMENT_LENGTH, -ROAD_WIDTH / 2 + 0.12, 0.08, 0);
    box(segment, edgeMaterial, 0.11, 0.025, SEGMENT_LENGTH, ROAD_WIDTH / 2 - 0.12, 0.08, 0);

    for (const laneX of [-ROAD_WIDTH / 6, ROAD_WIDTH / 6]) {
      for (let z = -SEGMENT_LENGTH / 2 + 2; z < SEGMENT_LENGTH / 2; z += 8) {
        box(segment, laneMaterial, 0.11, 0.03, 4.2, laneX, 0.075, z);
      }
    }

    parent.add(segment);
    return segment;
  }

  function createBusiness(parent, type, side, random) {
    const x = side * (ROAD_WIDTH / 2 + 9 + random() * 5);
    const bodyColors = {
      GAS: 0xe7edf3,
      EATS: 0xb95036,
      GARAGE: 0x777d83,
      MOTEL: 0xd5c6e6
    };

    const building = standardMaterial(bodyColors[type] ?? 0xbfc6cc);
    const roof = standardMaterial(0x252a30);
    const pole = standardMaterial(0x8d949a);
    const width = type === "MOTEL" ? 9 : 7;
    const height = type === "MOTEL" ? 4.6 : 3.6;

    box(parent, building, width, height, 7, x, height / 2, -4);
    box(parent, roof, width + 0.5, 0.3, 7.5, x, height + 0.12, -4);

    const signX = x - side * (width / 2 + 2.2);
    box(parent, pole, 0.18, 4.3, 0.18, signX, 2.15, 1);
    box(parent, signMaterial(type), 3.4, 1.35, 0.18, signX, 4.4, 1);

    if (type === "GAS") {
      const pump = standardMaterial(0x2d70b7);
      box(parent, pump, 0.75, 1.35, 0.75, x - side * 2, 0.68, 1.5);
      box(parent, pump, 0.75, 1.35, 0.75, x + side * 0.2, 0.68, 1.5);
    }

    if (type === "GARAGE") {
      const door = standardMaterial(0x30343a);
      box(parent, door, 3.4, 2.6, 0.2, x, 1.55, -0.45);
    }

    if (type === "MOTEL") {
      const glow = basicMaterial(0xff6fb4);
      for (let floor = 0; floor < 2; floor += 1) {
        for (let room = -2; room <= 2; room += 1) {
          box(parent, glow, 0.75, 0.38, 0.1, x + room * 1.45, 1.45 + floor * 1.8, -0.42);
        }
      }
    }
  }

  function addPine(parent, x, z, snow = false) {
    const trunk = standardMaterial(0x4a3527);
    const needles = standardMaterial(snow ? 0x365044 : 0x173b2d);
    box(parent, trunk, 0.35, 3.2, 0.35, x, 1.6, z);
    cone(parent, needles, 2.1, 5.8, 2.1, x, 5.0, z);
    if (snow) {
      cone(parent, standardMaterial(0xdbe9ef), 1.65, 1.6, 1.65, x, 7.0, z);
    }
  }

  function addPalm(parent, x, z) {
    const trunk = standardMaterial(0x6f5134);
    const leaf = standardMaterial(0x236b48);
    box(parent, trunk, 0.38, 5.2, 0.38, x, 2.6, z);
    for (let i = 0; i < 4; i += 1) {
      const frond = box(parent, leaf, 3.2, 0.18, 0.65, x, 5.5, z);
      frond.rotation.y = (Math.PI / 2) * i;
      frond.rotation.z = i % 2 ? 0.08 : -0.08;
    }
  }

  function addCity(parent, random, neon = false) {
    const palette = neon
      ? [0x101326, 0x171130, 0x0d2030]
      : [0x242a31, 0x30343a, 0x20262c];

    for (const side of [-1, 1]) {
      const x = side * (14 + random() * 21);
      const height = 7 + random() * 26;
      const width = 5 + random() * 7;
      const mat = standardMaterial(
        palette[(random() * palette.length) | 0],
        neon ? 0x07111d : 0x000000,
        neon ? 0.45 : 0
      );
      box(parent, mat, width, height, 7 + random() * 5, x, height / 2, -10 + random() * 20);

      if (neon || random() > 0.45) {
        const glow = basicMaterial(neon ? (random() > 0.5 ? 0x29e7ff : 0xff4ac8) : 0xffd16a);
        box(parent, glow, width * 0.55, 0.18, 0.12, x, Math.max(2.4, height - 2), 3.6);
      }
    }
  }

  function addScenery(parent, track, random) {
    const environment = track.environment ?? "city";
    const side = random() > 0.5 ? 1 : -1;
    const x = side * (ROAD_WIDTH / 2 + 5 + random() * 22);
    const z = -30 + random() * 60;

    if (environment === "city") {
      addCity(parent, random, false);
      return;
    }

    if (environment === "neon") {
      addCity(parent, random, true);
      return;
    }

    if (environment === "desert") {
      const cactus = standardMaterial(0x3c714e);
      const stone = standardMaterial(0x9b7352);
      if (random() > 0.34) {
        box(parent, cactus, 0.6, 4.2, 0.6, x, 2.1, z);
        box(parent, cactus, 1.8, 0.45, 0.45, x + side * 0.7, 2.5, z);
      } else {
        rock(parent, stone, 1.8 + random() * 2.5, x, 1.1, z);
      }
      return;
    }

    if (environment === "snow") {
      addPine(parent, x, z, true);
      if (random() > 0.6) {
        rock(parent, standardMaterial(0x85929a), 2 + random() * 2, -x * 1.25, 1.2, z - 12);
      }
      return;
    }

    if (environment === "mountain") {
      addPine(parent, x, z, false);
      if (random() > 0.45) {
        const mountain = standardMaterial(0x62686b);
        cone(parent, mountain, 8 + random() * 6, 18 + random() * 12, 8 + random() * 6, -x * 1.55, 9, z - 18);
      }
      return;
    }

    if (environment === "country") {
      const trunk = standardMaterial(0x5a422e);
      const leaf = standardMaterial(0x2e6b37);
      box(parent, trunk, 0.45, 3.4, 0.45, x, 1.7, z);
      cone(parent, leaf, 2.4, 4.4, 2.4, x, 5.0, z);
      if (random() > 0.72) {
        const barn = standardMaterial(0xa83d32);
        box(parent, barn, 7, 4.5, 7, -x * 1.2, 2.25, z - 10);
      }
      return;
    }

    if (environment === "tropical" || environment === "coast") {
      addPalm(parent, x, z);
      if (random() > 0.6) {
        rock(parent, standardMaterial(0x867d70), 1.5 + random() * 2, -x, 1, z - 14);
      }
      return;
    }

    if (environment === "race") {
      const barrier = standardMaterial(random() > 0.5 ? 0xe7e7e7 : 0xd33b3b);
      box(parent, barrier, 16, 0.8, 0.8, side * (ROAD_WIDTH / 2 + 1.5), 0.4, z);
      if (random() > 0.6) {
        const stand = standardMaterial(0x4c555e);
        box(parent, stand, 12, 5, 8, side * 24, 2.5, z - 8);
      }
      return;
    }

    if (environment === "wasteland") {
      const rust = standardMaterial(0x72513d);
      const concrete = standardMaterial(0x55514d);
      box(parent, concrete, 7 + random() * 7, 2 + random() * 5, 5, x, 1.5, z);
      box(parent, rust, 3.8, 1.1, 1.9, -x * 0.8, 0.55, z - 12);
    }
  }

  let track = initialTrack;
  const chunks = [];

  function createChunk(index) {
    const chunk = new THREE.Group();
    chunk.position.z = -index * CHUNK_LENGTH;
    chunk.userData.ordinal = index;

    const roadSegments = [];
    for (let i = 0; i < CHUNK_SEGMENTS; i += 1) {
      roadSegments.push(createRoadSegment(chunk, -i * SEGMENT_LENGTH));
    }

    const decor = new THREE.Group();
    chunk.add(decor);
    chunk.userData.roadSegments = roadSegments;
    chunk.userData.decor = decor;
    root.add(chunk);
    chunks.push(chunk);
  }

  for (let i = 0; i < CHUNK_COUNT; i += 1) createChunk(i);

  function decorateChunk(chunk) {
    const decor = chunk.userData.decor;
    decor.clear();

    const ordinal = chunk.userData.ordinal;
    const seed = ((track.road?.seed ?? 1) * 2654435761 + ordinal * 1013904223) >>> 0;
    const random = seededRandom(seed);

    const sceneryCount = 2 + ((random() * 3) | 0);
    for (let i = 0; i < sceneryCount; i += 1) {
      addScenery(decor, track, random);
    }

    const frequency = Math.max(3, track.businessFrequency ?? 5);
    if (((ordinal + (track.road?.seed ?? 0)) % frequency + frequency) % frequency === 0) {
      const type = BUSINESS_TYPES[Math.abs(ordinal + (track.road?.seed ?? 0)) % BUSINESS_TYPES.length];
      const side = random() > 0.5 ? 1 : -1;
      createBusiness(decor, type, side, random);
    }
  }

  function applyTheme(nextTrack) {
    roadMaterial.color.setHex(nextTrack.theme.road);
    shoulderMaterial.color.setHex(nextTrack.theme.shoulder);
    laneMaterial.color.setHex(nextTrack.theme.lane);
    edgeMaterial.color.setHex(nextTrack.theme.edge);
  }

  function applyRoadFrames(curve) {
    for (const chunk of chunks) {
      for (const segment of chunk.userData.roadSegments) {
        const worldZ = chunk.position.z + segment.userData.localZ;
        const frame = roadFrameAtZ(worldZ, curve);
        segment.position.x = frame.x;
        segment.rotation.y = frame.yaw;
      }

      const decorFrame = roadFrameAtZ(chunk.position.z - CHUNK_LENGTH * 0.45, curve);
      chunk.userData.decor.position.x = decorFrame.x;
      chunk.userData.decor.rotation.y = decorFrame.yaw;
    }
  }

  function setTrack(nextTrack) {
    track = nextTrack;
    applyTheme(track);
    for (const chunk of chunks) decorateChunk(chunk);
    applyRoadFrames(0);
  }

  function reset() {
    chunks.forEach((chunk, index) => {
      chunk.position.set(0, 0, -index * CHUNK_LENGTH);
      chunk.userData.ordinal = index;
      decorateChunk(chunk);
    });
    applyRoadFrames(0);
  }

  function advance(distance, curve) {
    for (const chunk of chunks) {
      chunk.position.z += distance;

      if (chunk.position.z > CHUNK_LENGTH) {
        chunk.position.z -= CHUNK_LENGTH * CHUNK_COUNT;
        chunk.userData.ordinal += CHUNK_COUNT;
        decorateChunk(chunk);
      }
    }

    applyRoadFrames(curve);
  }

  setTrack(initialTrack);

  return {
    advance,
    reset,
    setTrack,
    get chunkCount() {
      return CHUNK_COUNT;
    },
    get streamedDistance() {
      return CHUNK_COUNT * CHUNK_LENGTH;
    }
  };
}
