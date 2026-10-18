const smoothstep = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

/** Integral of a gentle speed ramp, not a position tween. Once up to pace,
 * purple holds a modest advantage instead of surging and braking again. */
const exitAdvantage = (progress: number) => {
  const start = 0.43;
  const end = 0.63;
  const advantage = 0.18;
  if (progress <= start) return 0;
  if (progress >= end) return advantage * (progress - (start + end) / 2);
  const t = (progress - start) / (end - start);
  return advantage * (end - start) * (t ** 3 - 0.5 * t ** 4);
};

// Approach wide, clip the broad apex, and unwind toward the exit.
const cornerLine = (progress: number) =>
  12 - 26 * smoothstep(0.14, 0.38, progress)
    + 18 * smoothstep(0.48, 0.7, progress);

export const blueRacingLine = (progress: number) => ({
  progress,
  lane: cornerLine(progress) - 16 * smoothstep(0.43, 0.65, progress),
});

/** Follow blue through the kerb, then take a wider, faster exit line.
 * Keep separate lines off-screen instead of snapping back after the pass. */
export const purpleOvertake = (progress: number) => ({
  progress: progress + exitAdvantage(progress),
  lane: cornerLine(progress) + 14 * smoothstep(0.36, 0.62, progress),
});
