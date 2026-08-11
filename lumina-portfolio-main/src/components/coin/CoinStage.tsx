import { useRef, type CSSProperties, type RefObject } from "react";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { Bullet } from "./Bullet";
import { Coin } from "./Coin";
import { REST_TILT } from "./useCoinTimeline";

/** Degrees per second at which the coin starts to smear, and how far it goes.
    Kept to a hint: just enough to take the strobe off the fastest frames, well
    short of losing the metal. */
const BLUR_FLOOR = 900;
const BLUR_DIVISOR = 380;
const BLUR_MAX = 2.5;

type CoinStageProps = {
  radius: number;
  radiusMv: MotionValue<number>;
  airY: MotionValue<number>;
  rotY: MotionValue<number>;
  tilt: MotionValue<number>;
  lean: MotionValue<number>;
  scale: MotionValue<number>;
  front: string;
  back: string;
  /** Table, key light, reflection and shadow all dissolve together. */
  backdropOpacity: MotionValue<number>;
  /** Set while the coin flies to the corner mark. */
  flyX: MotionValue<number>;
  flyY: MotionValue<number>;
  flyScale: MotionValue<number>;
  coinOpacity: MotionValue<number>;
  /** Hidden outright when the visitor skips mid-flight. */
  bulletOpacity: MotionValue<number>;
  /** The flying layer — transform-origin is set on it at hand-off time. */
  flyRef: RefObject<HTMLDivElement>;
  /** The world origin, i.e. where the coin meets the table. */
  anchorRef: RefObject<HTMLDivElement>;
};

export const CoinStage = ({
  radius,
  radiusMv,
  airY,
  rotY,
  tilt,
  lean,
  scale,
  front,
  back,
  backdropOpacity,
  flyX,
  flyY,
  flyScale,
  coinOpacity,
  bulletOpacity,
  flyRef,
  anchorRef,
}: CoinStageProps) => {
  /* The coin never leaves the table, so what sells the fall is the contact
     shadow spreading from a sliver under a coin on its edge to a full disc
     under a fallen one. */
  const flat = useTransform(tilt, [0, REST_TILT], [0, 1], { clamp: true });
  const shadowTransform = useTransform(
    flat,
    (f) => `scale(${(0.26 + f * 0.74).toFixed(3)}, ${(0.72 + f * 0.28).toFixed(3)})`,
  );
  const shadowOpacity = useTransform(flat, [0, 1], [0.45, 0.62]);

  const reflectionOpacity = useTransform(flat, [0, 1], [0.3, 0.2]);
  const reflectionFilter = useTransform(
    flat,
    (f) => `blur(${(2.5 + f * 2).toFixed(1)}px) brightness(0.5) saturate(0.85)`,
  );

  /* Real motion blur, not a fake. Without it a fast spin strobes: at 5 rev/s
     the face lands somewhere different every frame and the eye reads a
     flickering cutout rather than a spinning object. Horizontal only, because
     the coin turns about the table normal. */
  const spinVelocity = useVelocity(rotY);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  useMotionValueEvent(spinVelocity, "change", (v) => {
    const amount = Math.min(BLUR_MAX, Math.max(0, (Math.abs(v) - BLUR_FLOOR) / BLUR_DIVISOR));
    blurRef.current?.setAttribute("stdDeviation", `${amount.toFixed(2)} 0`);
  });

  const coinProps = { airY, rotY, tilt, lean, scale, radiusMv, front, back };

  return (
    <div className="stage" style={{ "--coin-r": `${radius}px` } as CSSProperties}>
      <svg className="stage-defs" aria-hidden="true" focusable="false">
        <filter id="coin-spin-blur" x="-15%" y="-10%" width="130%" height="120%">
          <feGaussianBlur ref={blurRef} stdDeviation="0 0" />
        </filter>
      </svg>

      <motion.div className="stage-backdrop" style={{ opacity: backdropOpacity }}>
        <div className="stage-key" />

        <div className="coin-scene">
          <div className="coin-world">
            <div className="world-table" />
            <motion.div
              className="world-shadow"
              style={{ transform: shadowTransform, opacity: shadowOpacity }}
            />
          </div>
        </div>

        {/* Mirror through the table plane. Same world, same camera, so this is
            a real reflection rather than a second guess at one. */}
        <motion.div
          className="coin-reflection"
          style={{ opacity: reflectionOpacity, filter: reflectionFilter }}
        >
          <div className="coin-scene">
            <div className="coin-world">
              <Coin sign={-1} {...coinProps} />
            </div>
          </div>
        </motion.div>

        <div className="stage-vignette" />
      </motion.div>

      <motion.div
        ref={flyRef}
        className="stage-coin-layer"
        style={{ x: flyX, y: flyY, scale: flyScale, opacity: coinOpacity }}
      >
        <div className="coin-scene">
          <div className="coin-world" ref={anchorRef}>
            <Coin {...coinProps} />
          </div>
        </div>
      </motion.div>

      <Bullet opacity={bulletOpacity} />
    </div>
  );
};
