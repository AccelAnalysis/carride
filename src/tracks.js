const baseHandling = (curveResponse, curveDrift) => ({
  curveResponse,
  curveDrift
});

const road = (
  seed,
  curveMax,
  straightChance,
  sectionMin,
  sectionMax,
  transitionRate = 0.018,
  maxCurveDelta = 0.82
) => ({
  seed,
  curveMax,
  straightChance,
  sectionMin,
  sectionMax,
  transitionRate,
  maxCurveDelta,
  openingStraight: 170
});

export const TRACKS = [
  {
    id: "metro",
    name: "Metro Midnight",
    tagline: "Dense traffic • downtown bends • wet neon",
    difficulty: "Medium",
    lengthMiles: 1.8,
    environment: "city",
    climate: "urban",
    businessFrequency: 5,
    road: road(1101, 0.82, 0.2, 90, 210, 0.019, 0.72),
    traffic: { count: 14, speedMin: 42, speedMax: 96, laneChangeRate: 0.34 },
    handling: baseHandling(0.58, 2.05),
    theme: {
      sky: 0x050912, fog: 0x071019, fogDensity: 0.0038,
      ground: 0x07120c, road: 0x171a20, shoulder: 0x30343a,
      lane: 0xf7f3d9, edge: 0x3ce5ff, hemiSky: 0x8bbcff,
      hemiGround: 0x111018, keyLight: 0xb8d8ff
    }
  },
  {
    id: "coast",
    name: "Coastal Rush",
    tagline: "Fast sweepers • lighter traffic • ocean sunrise",
    difficulty: "Fast",
    lengthMiles: 2.2,
    environment: "coast",
    climate: "coast",
    businessFrequency: 6,
    road: road(2202, 0.68, 0.3, 130, 270, 0.014, 0.62),
    traffic: { count: 10, speedMin: 55, speedMax: 118, laneChangeRate: 0.22 },
    handling: baseHandling(0.42, 1.55),
    theme: {
      sky: 0x18283d, fog: 0x34475a, fogDensity: 0.0032,
      ground: 0x23352d, road: 0x24272c, shoulder: 0xb09a72,
      lane: 0xfff4cf, edge: 0xff9d5c, hemiSky: 0xffcf9a,
      hemiGround: 0x25495d, keyLight: 0xffc98f
    }
  },
  {
    id: "alpine",
    name: "Alpine Switchback",
    tagline: "Tight mountain turns • aggressive traffic",
    difficulty: "Hard",
    lengthMiles: 2.0,
    environment: "mountain",
    climate: "mountain",
    businessFrequency: 7,
    road: road(3303, 1.0, 0.1, 75, 165, 0.024, 0.95),
    traffic: { count: 12, speedMin: 36, speedMax: 86, laneChangeRate: 0.42 },
    handling: baseHandling(0.72, 2.5),
    theme: {
      sky: 0x07101a, fog: 0x172431, fogDensity: 0.0044,
      ground: 0x101812, road: 0x181b1d, shoulder: 0x3f4541,
      lane: 0xf4f0dc, edge: 0xff5f45, hemiSky: 0x9fc8e8,
      hemiGround: 0x10140f, keyLight: 0xc9e4ff
    }
  },
  {
    id: "desert",
    name: "Desert Interstate",
    tagline: "18-mile haul • broad sweepers • desert services",
    difficulty: "Endurance",
    lengthMiles: 18.0,
    environment: "desert",
    climate: "desert",
    businessFrequency: 4,
    road: road(4404, 0.58, 0.42, 180, 420, 0.011, 0.5),
    traffic: { count: 13, speedMin: 58, speedMax: 122, laneChangeRate: 0.18 },
    handling: baseHandling(0.38, 1.35),
    theme: {
      sky: 0x6f83a3, fog: 0xb0835e, fogDensity: 0.0023,
      ground: 0x9b6f45, road: 0x2c2c2c, shoulder: 0xc29460,
      lane: 0xf4e6ba, edge: 0xffffff, hemiSky: 0xffd6a0,
      hemiGround: 0x6e4930, keyLight: 0xffd39c
    }
  },
  {
    id: "snow",
    name: "Snowy Mountain Highway",
    tagline: "12 miles • icy grades • whiteout challenge",
    difficulty: "Extreme",
    lengthMiles: 12.0,
    environment: "snow",
    climate: "snow",
    businessFrequency: 7,
    road: road(5505, 0.9, 0.18, 95, 230, 0.02, 0.8),
    traffic: { count: 9, speedMin: 32, speedMax: 78, laneChangeRate: 0.2 },
    handling: baseHandling(0.66, 2.35),
    theme: {
      sky: 0x9fb7ca, fog: 0xbecdd7, fogDensity: 0.0042,
      ground: 0xd9e4ea, road: 0x31373b, shoulder: 0xe8f0f4,
      lane: 0xfaf8df, edge: 0x9dd7ff, hemiSky: 0xeaf7ff,
      hemiGround: 0x73808a, keyLight: 0xffffff
    }
  },
  {
    id: "country",
    name: "Rural Country Road",
    tagline: "10 miles • farms • rolling bends • roadside stops",
    difficulty: "Cruise",
    lengthMiles: 10.0,
    environment: "country",
    climate: "country",
    businessFrequency: 5,
    road: road(6606, 0.72, 0.28, 120, 300, 0.015, 0.64),
    traffic: { count: 8, speedMin: 38, speedMax: 84, laneChangeRate: 0.14 },
    handling: baseHandling(0.46, 1.62),
    theme: {
      sky: 0x6f9bc0, fog: 0x91a99a, fogDensity: 0.0027,
      ground: 0x385a30, road: 0x30302e, shoulder: 0x79664c,
      lane: 0xf3e6b7, edge: 0xf6f2e5, hemiSky: 0xcfe8ff,
      hemiGround: 0x304526, keyLight: 0xffe2ad
    }
  },
  {
    id: "island",
    name: "Tropical Island",
    tagline: "9 miles • palms • ocean curves • tropical storms",
    difficulty: "Fast",
    lengthMiles: 9.0,
    environment: "tropical",
    climate: "tropical",
    businessFrequency: 5,
    road: road(7707, 0.74, 0.24, 125, 280, 0.015, 0.68),
    traffic: { count: 9, speedMin: 48, speedMax: 108, laneChangeRate: 0.18 },
    handling: baseHandling(0.44, 1.68),
    theme: {
      sky: 0x4f9bc6, fog: 0x74b8bd, fogDensity: 0.0025,
      ground: 0x2f754b, road: 0x2c3030, shoulder: 0xd9c18c,
      lane: 0xfff6d8, edge: 0x68f4dc, hemiSky: 0xdaf8ff,
      hemiGround: 0x2f5948, keyLight: 0xffe2a8
    }
  },
  {
    id: "city",
    name: "Dense City",
    tagline: "8 miles • traffic walls • short technical sections",
    difficulty: "Technical",
    lengthMiles: 8.0,
    environment: "city",
    climate: "urban",
    businessFrequency: 3,
    road: road(8808, 0.92, 0.12, 75, 180, 0.023, 0.85),
    traffic: { count: 16, speedMin: 28, speedMax: 82, laneChangeRate: 0.48 },
    handling: baseHandling(0.72, 2.3),
    theme: {
      sky: 0x111820, fog: 0x29333c, fogDensity: 0.0046,
      ground: 0x1a1e20, road: 0x1f2225, shoulder: 0x42464a,
      lane: 0xf8edc9, edge: 0xf0d44b, hemiSky: 0xa8c5d9,
      hemiGround: 0x191919, keyLight: 0xe9f2ff
    }
  },
  {
    id: "euro",
    name: "European Mountain Road",
    tagline: "11 miles • narrow-feeling switchbacks • alpine villages",
    difficulty: "Expert",
    lengthMiles: 11.0,
    environment: "mountain",
    climate: "mountain",
    businessFrequency: 6,
    road: road(9909, 1.0, 0.08, 65, 155, 0.026, 0.98),
    traffic: { count: 10, speedMin: 34, speedMax: 88, laneChangeRate: 0.3 },
    handling: baseHandling(0.76, 2.65),
    theme: {
      sky: 0x607487, fog: 0x77848e, fogDensity: 0.0039,
      ground: 0x364533, road: 0x292b2d, shoulder: 0x8d8a7d,
      lane: 0xf5efcf, edge: 0xffffff, hemiSky: 0xd8e9f4,
      hemiGround: 0x334031, keyLight: 0xfff0d0
    }
  },
  {
    id: "race",
    name: "Racetrack",
    tagline: "5 miles • high speed • barriers • grandstands",
    difficulty: "Precision",
    lengthMiles: 5.0,
    environment: "race",
    climate: "race",
    businessFrequency: 8,
    road: road(10110, 0.88, 0.18, 95, 220, 0.021, 0.78),
    traffic: { count: 11, speedMin: 72, speedMax: 142, laneChangeRate: 0.3 },
    handling: baseHandling(0.62, 1.85),
    theme: {
      sky: 0x6aa5cc, fog: 0x8aa6b3, fogDensity: 0.0021,
      ground: 0x305a32, road: 0x202224, shoulder: 0x6f7377,
      lane: 0xffffff, edge: 0xe23434, hemiSky: 0xe7f4ff,
      hemiGround: 0x274128, keyLight: 0xffffff
    }
  },
  {
    id: "apocalypse",
    name: "Post-Apocalyptic Highway",
    tagline: "20 miles • ruins • wrecks • black-storm endurance",
    difficulty: "Survival",
    lengthMiles: 20.0,
    environment: "wasteland",
    climate: "wasteland",
    businessFrequency: 6,
    road: road(11111, 0.7, 0.31, 130, 330, 0.014, 0.62),
    traffic: { count: 12, speedMin: 44, speedMax: 104, laneChangeRate: 0.36 },
    handling: baseHandling(0.5, 1.9),
    theme: {
      sky: 0x332d2a, fog: 0x4f4037, fogDensity: 0.0042,
      ground: 0x463a31, road: 0x252321, shoulder: 0x5b4b3f,
      lane: 0xd6c899, edge: 0xa84c36, hemiSky: 0x8c7464,
      hemiGround: 0x2b2520, keyLight: 0xd79b70
    }
  },
  {
    id: "neon",
    name: "Futuristic Neon City",
    tagline: "14 miles • luminous towers • electric-storm challenge",
    difficulty: "Hyper",
    lengthMiles: 14.0,
    environment: "neon",
    climate: "neon",
    businessFrequency: 3,
    road: road(12112, 0.86, 0.16, 90, 220, 0.021, 0.8),
    traffic: { count: 15, speedMin: 58, speedMax: 132, laneChangeRate: 0.42 },
    handling: baseHandling(0.64, 2.08),
    theme: {
      sky: 0x030411, fog: 0x0b1330, fogDensity: 0.004,
      ground: 0x080814, road: 0x11131c, shoulder: 0x24283b,
      lane: 0xeef7ff, edge: 0xff38d4, hemiSky: 0x4a8cff,
      hemiGround: 0x11051b, keyLight: 0x73f7ff
    }
  }
];

export const DEFAULT_TRACK_ID = "metro";

export function getTrack(id) {
  return TRACKS.find((track) => track.id === id) ?? TRACKS[0];
}
