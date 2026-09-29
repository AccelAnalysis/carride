import { CURVE_STRENGTH } from "./config.js";

const MAX_FORWARD_SAMPLE = 540;

function forwardDistance(z) {
  return Math.min(Math.max(-z, 0), MAX_FORWARD_SAMPLE);
}

/**
 * Horizontal displacement of the road center at a world-space Z position.
 * curve is normalized to roughly -1..1.
 */
export function roadOffsetAtZ(z, curve) {
  const forward = forwardDistance(z);
  return curve * CURVE_STRENGTH * forward * forward;
}

/**
 * Yaw of the road tangent at a world-space Z position.
 * Negative yaw corresponds to a road that bends right from the driver's view.
 */
export function roadYawAtZ(z, curve) {
  const forward = forwardDistance(z);
  return Math.atan(-2 * curve * CURVE_STRENGTH * forward);
}

export function roadFrameAtZ(z, curve) {
  return {
    x: roadOffsetAtZ(z, curve),
    yaw: roadYawAtZ(z, curve)
  };
}
