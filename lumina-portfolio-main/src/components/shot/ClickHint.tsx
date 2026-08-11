import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ScrambleText } from "./ScrambleText";

/** How often the label reshuffles itself. */
const SHUFFLE_MS = 4000;

/**
 * Sits directly under the coin mark and points back up at it. Anchored to the
 * mark's own box rather than to viewport coordinates, so it stays centred if
 * the mark ever moves.
 */
export const ClickHint = () => {
  const prefersReduced = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;
    const id = window.setInterval(() => setTick((count) => count + 1), SHUFFLE_MS);
    return () => window.clearInterval(id);
  }, [prefersReduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-full mt-1.5 hidden -translate-x-1/2 flex-col items-center gap-1 sm:flex"
    >
      <svg
        viewBox="0 0 14 16"
        className="h-4 w-3.5 text-faint/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 15 L7 3" />
        <path d="M2.5 7.5 L7 2 L11.5 7.5" />
      </svg>

      {/* The negative margin cancels the trailing letter-space, which would
          otherwise pull the centred label off the coin's axis. */}
      <ScrambleText
        text="click me"
        trigger={tick}
        className="-mr-[0.2em] whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-[0.2em] text-faint"
      />
    </div>
  );
};
