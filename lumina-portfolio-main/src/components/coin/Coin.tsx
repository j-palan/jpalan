import type { CSSProperties } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { SLATS, coinCentreHeight } from "./geometry";
import "./coin.css";

const CoinFace = ({ letter, side }: { letter: string; side: "front" | "back" }) => (
  <div className={`coin-face coin-face--${side}`}>
    <span className="coin-layer coin-spokes" />
    <span className="coin-layer coin-mill" />
    <span className="coin-layer coin-shade" />
    <span className="coin-letter">{letter}</span>
  </div>
);

/** Faces and rim, with no transform of its own. */
export const CoinBody = ({ front, back }: { front: string; back: string }) => (
  <>
    <div className="coin-rim">
      {SLATS.map(({ angle, shade }) => (
        <div
          key={angle}
          className="coin-rim-slat"
          style={{ "--slat-a": `${angle}deg`, "--slat-shade": shade } as CSSProperties}
        />
      ))}
    </div>
    <CoinFace letter={front} side="front" />
    <CoinFace letter={back} side="back" />
  </>
);

type CoinProps = {
  /** Vertical rattle, in px along the table normal. */
  airY: MotionValue<number>;
  /** Tilt from vertical: 0 spinning on its edge, 90 lying flat. */
  tilt: MotionValue<number>;
  /** Precession wobble — tips the spin axis sideways. */
  lean: MotionValue<number>;
  /** Spin about the table normal. */
  rotY: MotionValue<number>;
  scale: MotionValue<number>;
  radiusMv: MotionValue<number>;
  front: string;
  back: string;
  /**
   * -1 renders the mirror image. Reflecting through the table plane negates
   * the height and the rotations about the in-plane axes but leaves the spin
   * about the table normal alone, so the reflection is a true mirror rather
   * than a re-rendered guess.
   */
  sign?: 1 | -1;
};

/**
 * The coin lives inside `.coin-world`, whose own rotateX tips the whole scene
 * into a table seen from above. That makes the coin's local frame the table
 * itself: at rotateX(0) it lies flat on it, and rotateX(-90deg) stands it up
 * on its edge to spin.
 */
export const Coin = ({
  airY,
  tilt,
  lean,
  rotY,
  scale,
  radiusMv,
  front,
  back,
  sign = 1,
}: CoinProps) => {
  /* One transform built from raw motion values. Chaining useTransform into a
     useMotionTemplate left the derived values stale — the coin spun but never
     moved — so every input here is a value something else animates directly. */
  const transform = useTransform(
    [airY, tilt, lean, rotY, scale, radiusMv],
    ([air, tiltDeg, leanDeg, spin, s, r]: number[]) => {
      const height = (coinCentreHeight(r, tiltDeg) + air) * sign;
      return [
        `translateZ(${height}px)`,
        `rotateY(${leanDeg * sign}deg)`,
        `rotateZ(${spin}deg)`,
        `rotateX(${(tiltDeg - 90) * sign}deg)`,
        `scale(${s})`,
      ].join(" ");
    },
  );

  return (
    <motion.div className="coin" style={{ transform }}>
      <CoinBody front={front} back={back} />
    </motion.div>
  );
};
