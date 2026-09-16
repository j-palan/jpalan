import { useEffect, useMemo, useState } from "react";
import { useShotHit, useShotTarget } from "@/components/shot/shotContext";
import { buildCalendar, type Contribution } from "@/lib/githubCalendar";

type ContributionsResponse = {
  contributions: Contribution[];
};

const LEVEL_STYLES = [
  "bg-foreground/10",
  "bg-foreground/25",
  "bg-foreground/45",
  "bg-foreground/70",
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
};

const ContributionDay = ({ day }: { day: Contribution }) => {
  const { shaking, onHit } = useShotHit();
  const ref = useShotTarget<HTMLSpanElement>({ onHit });

  return (
    <span
      ref={ref}
      aria-hidden="true"
      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`}
      className={`aspect-square min-w-0 rounded-[1px] transition-colors duration-200 ${
        LEVEL_STYLES[day.level]
      } ${shaking ? "shot-shake !bg-foreground" : ""}`}
    />
  );
};

export const GitHubContributions = ({ username, href }: GitHubContributionsProps) => {
  const [contributions, setContributions] = useState<Contribution[] | null>(null);
  const [failed, setFailed] = useState(false);

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
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      });

    return () => controller.abort();
  }, [username]);

  const calendar = useMemo(
    () => (contributions ? buildCalendar(contributions) : Array<null>(PLACEHOLDER_DAYS).fill(null)),
    [contributions],
  );
  const total = contributions?.reduce((sum, day) => sum + day.count, 0);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${username}'s GitHub contribution activity`}
      className="group/github block w-[85%] max-w-[35.7rem]"
    >
      <span
        role="img"
        aria-label={
          failed
            ? "GitHub contribution chart unavailable"
            : total === undefined
              ? "Loading GitHub contribution chart"
              : `${total} GitHub contributions in the last year`
        }
        className={`github-calendar-grid ${contributions || failed ? "" : "animate-pulse"}`}
      >
        {calendar.map((day, index) =>
          day ? (
            <ContributionDay key={day.date} day={day} />
          ) : (
            <span
              // Padded cells have no date, so their position is the stable key.
              key={`empty-${index}`}
              aria-hidden="true"
              className={`aspect-square min-w-0 rounded-[1px] ${
                contributions ? "bg-transparent" : "bg-foreground/10"
              }`}
            />
          ),
        )}
      </span>
    </a>
  );
};
