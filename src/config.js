export const ROAD_WIDTH = 15.2;
export const SEGMENT_LENGTH = 20;
export const SEGMENT_COUNT = 30;
export const CURVE_STRENGTH = 0.00028;
export const MAX_SPEED = 172;
export const WORLD_SPEED = 0.34;
export const MAX_TRAFFIC_COUNT = 16;
export const LANE_CENTERS = [-ROAD_WIDTH / 3, 0, ROAD_WIDTH / 3];

export const GAMEPLAY = {
  startSpeed: 28,
  acceleration: 48,
  coastDrag: 9,
  braking: 82,
  boostAcceleration: 64,
  boostDrain: 23,
  boostRecharge: 8,
  draftBoostRecharge: 24,
  offRoadDeceleration: 48,
  offRoadDamagePerSecond: 6.5,

  collisionDamageMin: 10,
  collisionDamageMax: 36,
  collisionPush: 4.8,
  collisionInvulnerability: 0.7,
  trafficCollisionCooldown: 0.95,

  overtakeScore: 150,
  closePassScore: 90,
  draftScorePerSecond: 18,
  comboWindow: 5,
  comboStep: 0.25,
  comboMax: 4,

  checkpointCount: 4
};
