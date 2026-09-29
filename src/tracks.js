export const TRACKS = [
  {
    id: "metro",
    name: "Metro Midnight",
    tagline: "Dense neon traffic • technical city bends",
    difficulty: "Medium",
    lengthMiles: 1.8,
    traffic: {
      count: 14,
      speedMin: 42,
      speedMax: 96,
      laneChangeRate: 0.34
    },
    handling: {
      curveResponse: 0.58,
      curveDrift: 2.05
    },
    curveSections: [
      { curve: 0.00, duration: 4.5 },
      { curve: 0.48, duration: 6.0 },
      { curve: 0.82, duration: 4.0 },
      { curve: 0.18, duration: 3.0 },
      { curve: -0.64, duration: 6.5 },
      { curve: 0.00, duration: 3.4 },
      { curve: -0.92, duration: 4.2 },
      { curve: -0.35, duration: 3.0 },
      { curve: 0.58, duration: 5.8 },
      { curve: 0.00, duration: 4.0 }
    ],
    theme: {
      sky: 0x050912,
      fog: 0x071019,
      fogDensity: 0.0038,
      ground: 0x07120c,
      road: 0x171a20,
      shoulder: 0x30343a,
      lane: 0xf7f3d9,
      edge: 0x3ce5ff,
      hemiSky: 0x8bbcff,
      hemiGround: 0x111018,
      keyLight: 0xb8d8ff
    }
  },
  {
    id: "coast",
    name: "Coastal Rush",
    tagline: "Fast sweepers • lighter traffic • sunrise coast",
    difficulty: "Fast",
    lengthMiles: 2.2,
    traffic: {
      count: 10,
      speedMin: 55,
      speedMax: 118,
      laneChangeRate: 0.22
    },
    handling: {
      curveResponse: 0.42,
      curveDrift: 1.55
    },
    curveSections: [
      { curve: 0.00, duration: 6.0 },
      { curve: -0.34, duration: 9.0 },
      { curve: -0.62, duration: 6.0 },
      { curve: 0.00, duration: 5.0 },
      { curve: 0.28, duration: 10.0 },
      { curve: 0.68, duration: 6.5 },
      { curve: 0.16, duration: 4.0 },
      { curve: -0.46, duration: 8.0 },
      { curve: 0.00, duration: 5.0 }
    ],
    theme: {
      sky: 0x18283d,
      fog: 0x34475a,
      fogDensity: 0.0032,
      ground: 0x23352d,
      road: 0x24272c,
      shoulder: 0xb09a72,
      lane: 0xfff4cf,
      edge: 0xff9d5c,
      hemiSky: 0xffcf9a,
      hemiGround: 0x25495d,
      keyLight: 0xffc98f
    }
  },
  {
    id: "alpine",
    name: "Alpine Switchback",
    tagline: "Tight mountain turns • aggressive traffic",
    difficulty: "Hard",
    lengthMiles: 2.0,
    traffic: {
      count: 12,
      speedMin: 36,
      speedMax: 86,
      laneChangeRate: 0.42
    },
    handling: {
      curveResponse: 0.72,
      curveDrift: 2.5
    },
    curveSections: [
      { curve: 0.00, duration: 3.5 },
      { curve: 0.72, duration: 4.8 },
      { curve: -0.86, duration: 4.6 },
      { curve: 0.92, duration: 4.4 },
      { curve: -0.42, duration: 3.6 },
      { curve: 0.00, duration: 2.8 },
      { curve: -1.00, duration: 4.2 },
      { curve: 0.84, duration: 4.5 },
      { curve: 0.48, duration: 3.4 },
      { curve: -0.78, duration: 5.0 },
      { curve: 0.00, duration: 3.2 }
    ],
    theme: {
      sky: 0x07101a,
      fog: 0x172431,
      fogDensity: 0.0044,
      ground: 0x101812,
      road: 0x181b1d,
      shoulder: 0x3f4541,
      lane: 0xf4f0dc,
      edge: 0xff5f45,
      hemiSky: 0x9fc8e8,
      hemiGround: 0x10140f,
      keyLight: 0xc9e4ff
    }
  }
];

export const DEFAULT_TRACK_ID = "metro";

export function getTrack(id) {
  return TRACKS.find((track) => track.id === id) ?? TRACKS[0];
}
