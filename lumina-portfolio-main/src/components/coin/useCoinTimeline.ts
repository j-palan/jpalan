import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, type AnimationPlaybackControls } from "framer-motion";

/* ── Timing, in seconds ──────────────────────────────────────────────────── */

export const TIMING = {
  /** The round strikes. Nothing about the coin moves before this. */
  impact: 0.24,
  /** How long the coin's own animation runs, measured from impact. */
  spin: 2.4,
  /** The coin has stopped moving. */
  atRest: 2.64,
  /** Roughly where the topple becomes obvious. Informational. */
  topple: 1.7,
  /** Table dissolves and page content rises — deliberately overlaps the fall. */
  reveal: 2.35,
  /** Coin lifts off for the corner. */
  flip: 2.64,
  flipDuration: 0.62,
  /** Corner mark takes over from the flying coin. */
  handoff: 3.04,
  /** Overlay is unmounted. */
  end: 3.34,
  /** Hard ceiling: the page unlocks by now no matter what the animation does. */
  failsafe: 3.95,
} as const;

/** Compressed schedule used when the visitor skips. */
export const SKIP_TIMING = {
  reveal: 0,
  flip: 0.14,
  flipDuration: 0.34,
  handoff: 0.32,
  end: 0.58,
} as const;

/** Flat on the table. The camera looks down at the table, so a coin that lands
    truly flat reads as a circle rather than disappearing edge-on. */
export const REST_TILT = 90;

/** Whole turns. A multiple of 360 is what lands the J face up. */
const TURNS = 11;

/** Total spin. Must stay a multiple of 360 — see the test. */
export const TOTAL_ROTATION = TURNS * 360;

function computeRadius() {
  if (typeof window === "undefined") return 88;
  const { innerWidth: vw, innerHeight: vh } = window;
  return Math.max(46, Math.min(98, vw * 0.13, vh * 0.19));
}

/**
 * A coin spun flat on a desk: it holds itself upright while it is turning
 * fast, loses the fight with gravity as it slows, and topples with the
 * contact point racing round the rim — quick, small wobbles at the end rather
 * than slow, big ones at the start.
 */
export function useCoinTimeline(play: boolean) {
  const [radius, setRadius] = useState(computeRadius);

  const radiusMv = useMotionValue(radius);
  const airY = useMotionValue(0);
  const rotY = useMotionValue(0);
  const tilt = useMotionValue(play ? 2 : REST_TILT);
  const lean = useMotionValue(0);
  const scale = useMotionValue(play ? 0.94 : 1);

  const controlsRef = useRef<AnimationPlaybackControls[]>([]);
  const startedRef = useRef(false);

  useEffect(() => {
    const onResize = () => {
      const next = computeRadius();
      setRadius(next);
      radiusMv.set(next);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [radiusMv]);

  useEffect(() => {
    if (!play || startedRef.current) return;
    startedRef.current = true;

    const R = radiusMv.get();

    const controls = [
      animate(scale, 1, { duration: 0.45, delay: TIMING.impact, ease: [0.16, 1, 0.3, 1] }),

      /* Fast and near-constant, then a clear deceleration into the fall. */
      animate(rotY, [0, 1500, 2500, 3150, 3560, 3810, 3930, TOTAL_ROTATION], {
        duration: TIMING.spin,
        delay: TIMING.impact,
        times: [0, 0.3, 0.52, 0.68, 0.8, 0.89, 0.955, 1],
        ease: ["linear", "linear", "linear", "linear", "linear", "linear", "easeOut"],
      }),

      /* Monotonic, not oscillating: a real disc keeps getting flatter. The
         drama is in how sharply it accelerates near the end. */
      animate(tilt, [2, 3, 6, 12, 21, 35, 51, 67, 81, REST_TILT], {
        duration: TIMING.spin,
        delay: TIMING.impact,
        times: [0, 0.24, 0.42, 0.56, 0.67, 0.76, 0.84, 0.9, 0.95, 1],
        ease: ["linear", "easeIn", "easeIn", "easeIn", "linear", "linear", "linear", "linear", "easeOut"],
      }),

      /* Precession. Amplitude peaks as it goes over, then dies; the intervals
         shorten throughout, which is the rattle you hear on a real desk. */
      animate(lean, [0, 1.2, -2.2, 3.4, -4.8, 6.2, -7.4, 8, -7.2, 5.6, -3.8, 2.2, -1, 0], {
        duration: TIMING.spin,
        delay: TIMING.impact,
        times: [
          0, 0.22, 0.38, 0.5, 0.6, 0.685, 0.755, 0.815, 0.865, 0.905, 0.94, 0.965, 0.985, 1,
        ],
        ease: "easeInOut",
      }),

      /* The rim slapping the table on the way down. */
      animate(airY, [0, 0, -R * 0.035, 0, -R * 0.022, 0, -R * 0.012, 0, 0], {
        duration: TIMING.spin,
        delay: TIMING.impact,
        times: [0, 0.88, 0.905, 0.93, 0.95, 0.968, 0.982, 0.992, 1],
        ease: ["linear", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "linear"],
      }),
    ];

    controlsRef.current = controls;
    return () => controls.forEach((c) => c.stop());
  }, [play, airY, lean, radiusMv, rotY, scale, tilt]);

  /** Jump to the settled pose. Safe to call more than once. */
  const skip = useCallback(() => {
    controlsRef.current.forEach((c) => c.complete());
    controlsRef.current = [];
    airY.set(0);
    rotY.set(TOTAL_ROTATION);
    tilt.set(REST_TILT);
    lean.set(0);
    scale.set(1);
  }, [airY, lean, rotY, scale, tilt]);

  return { radius, radiusMv, airY, rotY, tilt, lean, scale, skip };
}
