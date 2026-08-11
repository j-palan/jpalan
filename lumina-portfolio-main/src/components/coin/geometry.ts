/** Kept in sync with --coin-t in coin.css. */
export const COIN_THICKNESS_RATIO = 0.18;

/** Kept in sync with the divisor in --slat-w in coin.css. */
export const SLAT_COUNT = 56;

/** Where the key light sits, in coin-plane degrees. */
const LIGHT_ANGLE = 140;

/**
 * Rim slats. Static, so built once at module load. Each carries only a shade
 * from its angle to the key light, so the edge reads as one smooth band of
 * polished gold — the milling stays on the face.
 */
export const SLATS = Array.from({ length: SLAT_COUNT }, (_, i) => {
  const angle = (i * 360) / SLAT_COUNT;
  const facing = 0.5 - 0.5 * Math.cos(((angle - LIGHT_ANGLE) * Math.PI) / 180);
  return {
    angle,
    shade: Number((0.45 * facing).toFixed(3)),
  };
});

/**
 * Height of the coin's centre above the table, for a tilt measured from
 * vertical: 0 is standing on its edge, 90 is lying flat.
 *
 * A disc of radius R and thickness t rests on its rim at R·cosθ + (t/2)·sinθ,
 * so it pivots on the corner between rim and face rather than sinking through
 * the table. Deriving the height instead of animating it separately is what
 * keeps the coin in contact for the whole fall.
 *
 * Note the height peaks a shade above R at about 5°: the pivot corner is
 * √(R² + (t/2)²) from the centre, further than the radius. That tiny lift is
 * why a coin can stand on its edge at all.
 */
export const coinCentreHeight = (radius: number, tiltDeg: number) => {
  const rad = (tiltDeg * Math.PI) / 180;
  return radius * (Math.cos(rad) + (COIN_THICKNESS_RATIO / 2) * Math.sin(rad));
};
