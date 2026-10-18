const smoothstep = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

// Approach wide, clip the broad apex, and unwind toward the exit.
const cornerLine = (progress: number) =>
  12 - 26 * smoothstep(0.14, 0.38, progress)
    + 18 * smoothstep(0.48, 0.7, progress);

export const blueRacingLine = (progress: number) => ({
  progress,
  lane: cornerLine(progress) - 16 * smoothstep(0.5, 0.69, progress),
});

/** Follow blue through the kerb, then take a wider, faster exit line.
 * Keep separate lines off-screen instead of snapping back after the pass. */
export const purpleOvertake = (progress: number) => ({
  progress: progress + 0.11 * smoothstep(0.57, 0.89, progress),
  lane: cornerLine(progress) + 14 * smoothstep(0.5, 0.6, progress),
});
