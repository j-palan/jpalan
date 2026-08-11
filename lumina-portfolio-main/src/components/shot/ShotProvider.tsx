import { useCallback, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { stepShot, type Flight } from "./physics";
import { ShotContext, type ShotApi, type ShotTarget } from "./shotContext";
import "../coin/coin.css";
import "./shot.css";

const SPEED = 1750;

const radians = (deg: number) => (deg * Math.PI) / 180;

/**
 * Owns the frame loop. Mounted only while a round is in the air, so the
 * browser is not kept awake between shots.
 */
const ShotFlight = ({
  flight,
  targets,
  onSpent,
}: {
  flight: MutableRefObject<Flight | null>;
  targets: MutableRefObject<Map<string, ShotTarget>>;
  onSpent: () => void;
}) => {
  const x = useMotionValue(flight.current?.x ?? 0);
  const y = useMotionValue(flight.current?.y ?? 0);
  const rotate = useMotionValue(
    flight.current ? (Math.atan2(flight.current.vy, flight.current.vx) * 180) / Math.PI : 0,
  );

  useAnimationFrame((_, deltaMs) => {
    const shot = flight.current;
    if (!shot) return;

    const live = [...targets.current.values()];
    const snapshot = live.map((target) => ({
      id: target.id,
      solid: target.solid,
      rect: target.getRect(),
    }));

    /* Clamped so a backgrounded tab does not resume with one huge step that
       tunnels the round straight through every target. */
    const { hits, spent } = stepShot(shot, Math.min(deltaMs, 32) / 1000, snapshot, {
      width: window.innerWidth,
      height: window.innerHeight,
    });

    for (const id of hits) targets.current.get(id)?.onHit();

    if (spent) {
      flight.current = null;
      onSpent();
      return;
    }

    x.set(shot.x);
    y.set(shot.y);
    rotate.set((Math.atan2(shot.vy, shot.vx) * 180) / Math.PI);
  });

  return (
    <div className="shot-layer" aria-hidden="true">
      <motion.div className="bullet" style={{ x, y, rotate }}>
        <span className="bullet-trail bullet-trail--short" />
        <span className="bullet-head" />
      </motion.div>
    </div>
  );
};

export const ShotProvider = ({ children }: { children: ReactNode }) => {
  const prefersReduced = useReducedMotion();
  const targets = useRef(new Map<string, ShotTarget>());
  const flight = useRef<Flight | null>(null);
  const [live, setLive] = useState(false);

  const register = useCallback((target: ShotTarget) => {
    targets.current.set(target.id, target);
    return () => {
      targets.current.delete(target.id);
    };
  }, []);

  const fire = useCallback(
    (origin: { x: number; y: number }) => {
      if (prefersReduced) return;
      /* Wide enough that some shots go straight into the display type — from
         the mark it only subtends about 20 degrees — and others drop into the
         table below it. */
      const angle = radians(12 + Math.random() * 52);
      flight.current = {
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        bounces: 0,
        age: 0,
        inside: new Set(),
        cooldown: new Map(),
      };
      setLive(true);
    },
    [prefersReduced],
  );

  const api = useMemo<ShotApi>(() => ({ register, fire }), [register, fire]);

  return (
    <ShotContext.Provider value={api}>
      {children}
      {live && <ShotFlight flight={flight} targets={targets} onSpent={() => setLive(false)} />}
    </ShotContext.Provider>
  );
};
