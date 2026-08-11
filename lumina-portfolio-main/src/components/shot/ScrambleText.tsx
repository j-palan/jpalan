import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { GLYPHS, SCRAMBLE_COLORS, pick } from "./glyphs";

/** How far the settle wave advances per character, in ms. */
const WAVE_STEP = 34;
/** How long the first character stays scrambled. */
const HOLD = 260;
/** How often a scrambling character picks a new glyph and colour. */
const REROLL = 55;
/** How long a character keeps churning after the pointer leaves it. */
const HOVER_TAIL = 240;

type Cell = { glyph: string; color: string };

/**
 * Text that reloads when the round goes through it — every character flips to a
 * glyph at once, then settles back left to right — and that churns under the
 * pointer a character at a time.
 *
 * The frame loop only exists while something is actually running. An
 * always-subscribed loop across every span on the page would keep the browser
 * awake for nothing.
 */
export const ScrambleText = ({
  text,
  trigger,
  delay = 0,
  className,
  hover = false,
}: {
  text: string;
  /** Increment to run the settle wave. */
  trigger: number;
  /** Offsets the wave, so a row can sweep across several spans in order. */
  delay?: number;
  className?: string;
  /**
   * Opt in to per-character hover. Off by default: it splits the text into a
   * span per character permanently, which costs the browser's kerning, so only
   * type big enough to be worth touching should carry it.
   */
  hover?: boolean;
}) => {
  const prefersReduced = useReducedMotion();
  const characters = useMemo(() => Array.from(text), [text]);
  const [cells, setCells] = useState<(Cell | null)[] | null>(null);

  const waveStart = useRef<number | null>(null);
  /** Per character: the time it stops churning. Infinity while hovered. */
  const hoverUntil = useRef<number[]>([]);
  const frame = useRef(0);
  const running = useRef(false);

  const waveDuration = delay + HOLD + characters.length * WAVE_STEP;

  const run = useCallback(() => {
    if (running.current || prefersReduced) return;
    running.current = true;
    let lastRoll = -Infinity;

    const step = (now: number) => {
      const started = waveStart.current;
      const waveElapsed = started === null ? Infinity : now - started;
      const waving = waveElapsed <= waveDuration;
      const hovering = hoverUntil.current.some((until) => until > now);

      if (!waving && !hovering) {
        running.current = false;
        setCells(null);
        return;
      }

      if (now - lastRoll >= REROLL) {
        lastRoll = now;
        setCells(
          characters.map((character, index) => {
            if (character === " ") return null;
            const settleAt = delay + HOLD + index * WAVE_STEP;
            const inWave = waving && waveElapsed < settleAt;
            const inHover = (hoverUntil.current[index] ?? 0) > now;
            return inWave || inHover
              ? { glyph: pick(GLYPHS), color: pick(SCRAMBLE_COLORS) }
              : null;
          }),
        );
      }

      frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
  }, [characters, delay, prefersReduced, waveDuration]);

  useEffect(() => {
    if (!trigger || prefersReduced) return;
    waveStart.current = performance.now();
    run();
  }, [trigger, prefersReduced, run]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      running.current = false;
    },
    [],
  );

  const hold = (index: number) => {
    if (prefersReduced) return;
    hoverUntil.current[index] = Infinity;
    run();
  };

  const release = (index: number) => {
    if (prefersReduced) return;
    hoverUntil.current[index] = performance.now() + HOVER_TAIL;
  };

  /* Nothing to hover and nothing running: one span, so the browser can kern. */
  if (!hover && !cells) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {characters.map((character, index) => {
        if (character === " ") return <span key={index}> </span>;
        const cell = cells?.[index] ?? null;

        if (!hover) {
          return (
            <span key={index} style={cell ? { color: cell.color } : undefined}>
              {cell ? cell.glyph : character}
            </span>
          );
        }

        return (
          <span
            key={index}
            className="relative inline-block"
            onPointerEnter={() => hold(index)}
            onPointerLeave={() => release(index)}
          >
            {/* The real character always holds the slot. A wide glyph dropped
                into a narrow letter would otherwise reflow the line — and shift
                the letter out from under the pointer that is hovering it.
                Transparent rather than hidden, so the heading still reads as
                its own text to a screen reader mid-scramble. */}
            <span style={cell ? { color: "transparent" } : undefined}>{character}</span>
            {cell && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
                style={{ color: cell.color }}
              >
                {cell.glyph}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};
