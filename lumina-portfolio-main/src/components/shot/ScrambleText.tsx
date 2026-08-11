import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { GLYPHS, SCRAMBLE_COLORS, pick } from "./glyphs";

/** How far the settle wave advances per character, in ms. */
const WAVE_STEP = 34;
/** How long the first character stays scrambled. */
const HOLD = 260;
/** How often a scrambling character picks a new glyph and colour. */
const REROLL = 55;

type Cell = { glyph: string; color: string };

/**
 * Text that reloads when the round goes through it: every character flips to a
 * glyph at once, then settles back left to right.
 *
 * The frame loop only exists while an effect is running — an always-subscribed
 * loop across every span on the page would keep the browser awake for nothing.
 */
export const ScrambleText = ({
  text,
  trigger,
  delay = 0,
  className,
}: {
  text: string;
  /** Increment to run the effect. */
  trigger: number;
  /** Offsets the wave, so a row can sweep across several spans in order. */
  delay?: number;
  className?: string;
}) => {
  const prefersReduced = useReducedMotion();
  const [cells, setCells] = useState<(Cell | null)[] | null>(null);

  useEffect(() => {
    if (!trigger || prefersReduced) return;

    const duration = delay + HOLD + text.length * WAVE_STEP;
    const start = performance.now();
    let lastRoll = -Infinity;
    let raf = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      if (elapsed > duration) {
        setCells(null);
        return;
      }
      if (now - lastRoll >= REROLL) {
        lastRoll = now;
        setCells(
          Array.from(text, (character, index) => {
            if (character === " ") return null;
            const settleAt = delay + HOLD + index * WAVE_STEP;
            return elapsed >= settleAt ? null : { glyph: pick(GLYPHS), color: pick(SCRAMBLE_COLORS) };
          }),
        );
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      setCells(null);
    };
  }, [trigger, delay, text, prefersReduced]);

  if (!cells) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {Array.from(text, (character, index) => {
        const cell = cells[index];
        return (
          <span key={`${index}-${character}`} style={cell ? { color: cell.color } : undefined}>
            {cell ? cell.glyph : character}
          </span>
        );
      })}
    </span>
  );
};
