import { ScrambleText } from "@/components/shot/ScrambleText";
import { useShotHit, useShotTarget } from "@/components/shot/shotContext";
import { experience, type Role } from "@/data/experience";

const Arrow = () => (
  <svg
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="h-3 w-3 translate-y-px text-faint transition-all duration-300 ease-out-expo group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-gold-300"
  >
    <path d="M3.6 8.4 8.4 3.6M4.6 3.6h3.8v3.8" />
  </svg>
);

/* Each row is one grid cell tall and grows to two on hover, so its rule — and
   every rule below it — stays on a grid line. The round passes straight
   through; only the display type turns it. The row still reloads, with the
   wave sweeping year → org → role → dates. */
const ExperienceRow = ({ role }: { role: Role }) => {
  const { hit, shaking, onHit } = useShotHit();
  const ref = useShotTarget<HTMLLIElement>({ onHit });

  return (
    <li
      ref={ref}
      className={`row group/row relative border-t border-line ${shaking ? "shot-shake" : ""}`}
    >
      {/* Timeline marker, centred in the first cell and sitting on the rail. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-[calc(var(--grid)/2)] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-faint transition-colors duration-200 group-hover/row:bg-gold-300 sm:block"
      />

      <a
        href={role.href}
        target="_blank"
        rel="noopener noreferrer"
        className="grid grid-cols-[2.5rem_minmax(0,1fr)_1rem] items-center gap-x-4 gap-y-1 py-4 sm:h-[var(--grid)] sm:grid-cols-[4.5rem_10rem_minmax(0,1fr)_7rem_1rem] sm:gap-x-6 sm:gap-y-0 sm:py-0 sm:pl-7"
      >
        <ScrambleText
          text={role.year}
          trigger={hit}
          className="col-start-1 row-start-1 font-mono text-xs tabular-nums text-faint"
        />

        <ScrambleText
          text={role.org}
          trigger={hit}
          delay={60}
          className="col-start-2 row-start-1 min-w-0 text-[0.95rem] text-foreground transition-colors duration-200 group-hover/row:text-gold-300"
        />

        {/* `contents` at sm+ dissolves this wrapper so role and dates become grid
            cells; below sm they share a second line. It wraps rather than
            overflows — flex items default to min-width:auto, and one row that
            refuses to shrink widens the whole page. */}
        <span className="col-start-2 row-start-2 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:contents">
          <ScrambleText
            text={role.role}
            trigger={hit}
            delay={200}
            className="min-w-0 text-sm text-muted sm:col-start-3 sm:row-start-1"
          />
          <span aria-hidden="true" className="text-faint sm:hidden">
            ·
          </span>
          <ScrambleText
            text={role.dates}
            trigger={hit}
            delay={380}
            className="text-sm tabular-nums text-faint sm:col-start-4 sm:row-start-1"
          />
        </span>

        <span className="col-start-3 row-start-1 justify-self-end sm:col-start-5">
          <Arrow />
        </span>
      </a>

      {/* Indented to the organisation column — 28px of rail gutter, the 4.5rem
          year column and one 1.5rem gap — and centred in the cell the row grew
          into. */}
      {role.note && (
        <p className="row-note pb-3 pl-[3.5rem] pr-2 text-[0.8125rem] leading-snug text-muted sm:flex sm:h-[var(--grid)] sm:items-center sm:pb-0 sm:pl-[7.75rem] sm:pr-32">
          {role.note}
        </p>
      )}
    </li>
  );
};

export const ExperienceTable = () => (
  <ul className="relative border-b border-line">
    {/* The rail sits on a vertical grid line, since the content box is cut to
        a whole number of cells. */}
    <span aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-px bg-line sm:block" />
    {experience.map((role) => (
      <ExperienceRow key={`${role.org}-${role.dates}`} role={role} />
    ))}
  </ul>
);
