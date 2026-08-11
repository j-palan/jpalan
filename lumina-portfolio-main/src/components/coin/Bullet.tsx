import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { TIMING } from "./useCoinTimeline";

/** How long the ricochet stays on screen after the strike. */
const RICOCHET = 0.34;

const degrees = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI;

/**
 * The round that starts the spin. It comes in low from the left, strikes the
 * coin, and glances away over the top-left — a white tracer and the flash are
 * the only evidence; there is no gun.
 */
export const Bullet = ({ opacity }: { opacity: MotionValue<number> }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const trail = useMotionValue(0);
  const head = useMotionValue(0);
  const flash = useMotionValue(0);
  const ring = useMotionValue(0);

  const ringScale = useTransform(ring, [0, 1], [0.2, 7.5]);
  const ringOpacity = useTransform(ring, [0, 0.15, 1], [0, 0.75, 0]);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const from = { x: -vw * 0.62, y: vh * 0.6 };
    const to = { x: -vw * 0.3, y: -vh * 0.72 };

    const inbound = degrees(-from.x, -from.y);
    const outbound = degrees(to.x, to.y);
    const total = TIMING.impact + RICOCHET;
    const strike = TIMING.impact / total;

    x.set(from.x);
    y.set(from.y);
    rotate.set(inbound);

    /* Position, heading and trail each get a single animation covering both
       legs. A second animate() on the same value would cancel the first the
       moment it was queued rather than when its delay ran out. */
    const controls = [
      animate(x, [from.x, 0, to.x], {
        duration: total,
        times: [0, strike, 1],
        ease: ["linear", [0.15, 0.75, 0.4, 1]],
      }),
      animate(y, [from.y, 0, to.y], {
        duration: total,
        times: [0, strike, 1],
        ease: ["linear", [0.15, 0.75, 0.4, 1]],
      }),
      /* Snaps to the new heading on contact rather than curving into it. */
      animate(rotate, [inbound, inbound, outbound, outbound], {
        duration: total,
        times: [0, strike, strike + 0.001, 1],
        ease: "linear",
      }),
      animate(trail, [0, 1, 1, 0.7, 0], {
        duration: total,
        times: [0, 0.28, strike, strike + 0.3, 1],
        ease: "linear",
      }),
      animate(head, [0, 1, 1, 1, 0], {
        duration: total,
        times: [0, 0.12, strike, strike + 0.45, 1],
        ease: "linear",
      }),
      animate(flash, [0, 1, 0], {
        duration: 0.3,
        delay: TIMING.impact,
        times: [0, 0.1, 1],
        ease: "easeOut",
      }),
      animate(ring, [0, 1], {
        duration: 0.45,
        delay: TIMING.impact,
        ease: [0.1, 0.8, 0.3, 1],
      }),
    ];

    return () => controls.forEach((c) => c.stop());
  }, [flash, head, ring, rotate, trail, x, y]);

  return (
    <motion.div className="bullet-layer" style={{ opacity }} aria-hidden="true">
      <motion.div className="bullet-flash" style={{ opacity: flash }} />
      <motion.div className="bullet-ring" style={{ scale: ringScale, opacity: ringOpacity }} />
      <motion.div className="bullet" style={{ x, y, rotate }}>
        <motion.span className="bullet-trail" style={{ scaleX: trail, opacity: trail }} />
        <motion.span className="bullet-head" style={{ opacity: head }} />
      </motion.div>
    </motion.div>
  );
};
