export const ROAD_WIDTH = 15.2;
export const SEGMENT_LENGTH = 20;
export const SEGMENT_COUNT = 28;
export const CURVE_STRENGTH = 0.00028;
export const MAX_SPEED = 165;
export const WORLD_SPEED = 0.34;
export const TRAFFIC_COUNT = 11;
export const LANE_CENTERS = [-ROAD_WIDTH / 3, 0, ROAD_WIDTH / 3];

export const GAMEPLAY = {
  startSpeed: 20,
  acceleration: 44,
  coastDrag: 11,
  braking: 75,
  boostAcceleration: 58,
  boostDrain: 24,
  boostRecharge: 10,
  offRoadDeceleration: 42,
  offRoadDamagePerSecond: 5.5,

  curveMinDuration: 6,
  curveMaxDuration: 12,
  curveResponse: 0.32,
  curveDrift: 1.8,
  straightSectionChance: 0.28,

  collisionDamageMin: 10,
  collisionDamageMax: 36,
  collisionPush: 4.6,
  collisionInvulnerability: 0.65,
  trafficCollisionCooldown: 0.9,

  overtakeScore: 150,
  closePassScore: 75
};
