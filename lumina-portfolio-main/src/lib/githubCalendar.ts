export type Contribution = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

/** Pad the rolling year to complete Sunday-first weeks. This keeps every date
    in the same row it occupies on GitHub, even when the first day is midweek. */
export const buildCalendar = (contributions: Contribution[]) => {
  const ordered = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
  if (ordered.length === 0) return [] as Array<Contribution | null>;

  const firstWeekday = new Date(`${ordered[0].date}T00:00:00Z`).getUTCDay();
  const cells: Array<Contribution | null> = [
    ...Array<null>(firstWeekday).fill(null),
    ...ordered,
  ];

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};
