/** Nearest car ahead on the repeating circuit, including across the lap seam. */
export const gapAhead = (phases: number[], selected: number, lapSeconds: number) => {
  let ahead = -1;
  let seconds = lapSeconds;
  phases.forEach((phase, index) => {
    if (index === selected) return;
    const gap = ((phase - phases[selected]) % lapSeconds + lapSeconds) % lapSeconds;
    if (gap < seconds) {
      ahead = index;
      seconds = gap;
    }
  });
  return { ahead, seconds };
};
