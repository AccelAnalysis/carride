const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function hashSeed(value) {
  if (Number.isFinite(value)) return value >>> 0;

  const text = String(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createProceduralRoad(initialTrack) {
  let track = initialTrack;
  let random = Math.random;
  let currentCurve = 0;
  let targetCurve = 0;
  let sectionRemaining = 0;
  let sectionIndex = 0;

  function reset() {
    const settings = track.road ?? {};
    random = mulberry32(hashSeed(settings.seed ?? track.id));
    currentCurve = 0;
    targetCurve = 0;
    sectionIndex = 0;
    sectionRemaining = settings.openingStraight ?? 150;
  }

  function chooseSection() {
    const settings = track.road ?? {};
    const minLength = settings.sectionMin ?? 95;
    const maxLength = settings.sectionMax ?? 230;
    const curveMax = settings.curveMax ?? 0.72;
    const straightChance = settings.straightChance ?? 0.2;
    const maxDelta = settings.maxCurveDelta ?? 0.85;

    sectionRemaining =
      minLength + random() * Math.max(1, maxLength - minLength);

    if (random() < straightChance) {
      targetCurve = 0;
    } else {
      let candidate = (random() * 2 - 1) * curveMax;

      if (Math.abs(candidate) < 0.14) {
        candidate = Math.sign(candidate || (random() - 0.5)) * 0.14;
      }

      targetCurve = clamp(
        candidate,
        currentCurve - maxDelta,
        currentCurve + maxDelta
      );
    }

    sectionIndex += 1;
  }

  function advance(distance) {
    let remainingDistance = Math.max(0, distance);
    const transitionRate = track.road?.transitionRate ?? 0.018;

    while (remainingDistance > 0) {
      if (sectionRemaining <= 0) chooseSection();

      const step = Math.min(remainingDistance, sectionRemaining);
      const response = 1 - Math.exp(-transitionRate * step);
      currentCurve += (targetCurve - currentCurve) * response;
      sectionRemaining -= step;
      remainingDistance -= step;
    }

    return currentCurve;
  }

  function setTrack(nextTrack) {
    track = nextTrack;
    reset();
  }

  reset();

  return {
    advance,
    reset,
    setTrack,
    get curve() {
      return currentCurve;
    },
    get sectionIndex() {
      return sectionIndex;
    }
  };
}
