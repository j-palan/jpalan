type RaceEvent = { defender: number; attacker: number };

// Six-lap programme: a battle, a quieter lap, then a different pair.
// Changes happen on the hidden connecting straight, never mid-corner.
const RACE_EVENTS: readonly (RaceEvent | null)[] = [
  { defender: 2, attacker: 3 }, // Purple passes blue.
  null,
  { defender: 0, attacker: 1 }, // Red passes gold.
  null,
  { defender: 4, attacker: 5 }, // Orange passes cream.
  null,
];

export const getRaceEvent = (lap: number) =>
  RACE_EVENTS[Math.max(0, Math.floor(lap)) % RACE_EVENTS.length];
