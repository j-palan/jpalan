import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { useShotHit, useShotTarget } from "@/components/shot/shotContext";
import { buildCalendar, type Contribution } from "@/lib/githubCalendar";

type ContributionsResponse = {
  total?: { lastYear?: number };
  contributions: Contribution[];
};

const LEVEL_STYLES = [
  "bg-foreground/[0.08]",
  "bg-foreground/35",
  "bg-foreground/55",
  "bg-foreground/75",
  "bg-foreground",
] as const;

const PLACEHOLDER_DAYS = 53 * 7;

const isContribution = (value: unknown): value is Contribution => {
  if (!value || typeof value !== "object") return false;

  const contribution = value as Partial<Contribution>;
  return (
    typeof contribution.date === "string" &&
    typeof contribution.count === "number" &&
    Number.isInteger(contribution.level) &&
    contribution.level !== undefined &&
    contribution.level >= 0 &&
    contribution.level <= 4
  );
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

type GitHubContributionsProps = {
  username: string;
  href: string;
  raceStarted?: boolean;
};

const ContributionDay = ({ day, index, revealed }: { day: Contribution | null; index: number; revealed: boolean }) => {
  const { shaking, onHit } = useShotHit();
  const ref = useShotTarget<HTMLSpanElement>({ onHit });
  const column = Math.floor(index / 7);
  const row = index % 7;
  const light = (Math.floor(column / 2) + Math.floor(row / 2)) % 2 === 0;

  return (
    <span
      ref={ref}
      aria-hidden="true"
      title={day && revealed ? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}` : undefined}
      style={{ "--flag-color": light ? "hsl(var(--foreground) / 0.72)" : "hsl(var(--foreground) / 0.035)",
        "--cell-delay": `${column * 9}ms` } as CSSProperties}
      className={`github-calendar-cell aspect-square min-w-0 rounded-[1px] ${
        day ? LEVEL_STYLES[day.level] : "bg-transparent"
      } ${shaking ? "shot-shake !bg-foreground" : ""}`}
    />
  );
};

export const GitHubContributions = ({ username, href, raceStarted = true }: GitHubContributionsProps) => {
  const [contributions, setContributions] = useState<Contribution[] | null>(null);
  const [reportedTotal, setReportedTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const prefersReduced = useReducedMotion();
  const revealed = (raceStarted || prefersReduced) && Boolean(contributions || failed);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub activity request failed");
        return response.json() as Promise<ContributionsResponse>;
      })
      .then((data) => {
        if (!Array.isArray(data.contributions)) throw new Error("Invalid GitHub activity data");
        setContributions(data.contributions.filter(isContribution));
        // GitHub's headline total can differ from the sum of its daily cells.
        const total = data.total?.lastYear;
        setReportedTotal(
          typeof total === "number" && Number.isInteger(total) && total >= 0 ? total : null,
        );
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      });

    return () => controller.abort();
  }, [username]);

  const calendar = useMemo(
    () => {
      const days = contributions ? buildCalendar(contributions) : [];
      return days.length ? days : Array<null>(PLACEHOLDER_DAYS).fill(null);
    },
    [contributions],
  );
  const total = reportedTotal ?? contributions?.reduce((sum, day) => sum + day.count, 0);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${username}'s GitHub contribution activity`}
      className="group/github block w-[85%] max-w-[35.7rem] sm:-translate-y-1"
    >
      <span
        role="img"
        aria-label={
          !raceStarted && !prefersReduced
            ? "Checkered flag. GitHub contributions appear when the starting lights go out."
            : failed
            ? "GitHub contribution chart unavailable"
            : total === undefined
              ? "Loading GitHub contribution chart"
              : `${total} GitHub contributions in the last year`
        }
        className="github-calendar-grid"
        data-mode={revealed ? "contributions" : "flag"}
      >
        {calendar.map((day, index) => (
          // Keep the same cells while the data arrives, so the flag morphs
          // into the actual daily levels rather than remounting the grid.
          <ContributionDay key={index} day={day} index={index} revealed={Boolean(revealed)} />
        ))}
      </span>
      <span
        aria-live="polite"
        className="github-calendar-caption mt-2 block min-h-4 font-mono text-[0.6875rem] tabular-nums text-faint"
        data-visible={Boolean(raceStarted || prefersReduced)}
      >
        {!raceStarted && !prefersReduced ? ""
          : failed
          ? "Contributions unavailable"
          : total === undefined
            ? "Loading contributions…"
            : `${total.toLocaleString()} contributions`}
      </span>
    </a>
  );
};
