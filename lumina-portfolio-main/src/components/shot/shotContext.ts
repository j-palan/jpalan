import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";

export type ShotTarget = {
  id: string;
  /** Solid targets deflect the round; the rest let it pass but still register. */
  solid: boolean;
  getRect: () => DOMRect | null;
  onHit: () => void;
};

export type ShotApi = {
  register: (target: ShotTarget) => () => void;
  fire: (origin: { x: number; y: number }) => void;
};

export const ShotContext = createContext<ShotApi | null>(null);

/** Returns a no-op fire outside a provider, so callers never need to guard. */
export function useFireShot() {
  const api = useContext(ShotContext);
  return api?.fire ?? (() => {});
}

/**
 * Marks an element as something the round can hit. `solid` deflects it — the
 * display type and the icon row — while everything else lets it through and
 * only reacts.
 */
export function useShotTarget<T extends HTMLElement>(options: {
  solid?: boolean;
  onHit: () => void;
}) {
  const { solid = false, onHit } = options;
  const ref = useRef<T>(null);
  const api = useContext(ShotContext);
  const id = useId();

  /* Held in a ref so the target does not re-register every render. */
  const onHitRef = useRef(onHit);
  onHitRef.current = onHit;

  useEffect(() => {
    if (!api) return;
    return api.register({
      id,
      solid,
      getRect: () => ref.current?.getBoundingClientRect() ?? null,
      onHit: () => onHitRef.current(),
    });
  }, [api, id, solid]);

  return ref;
}

/**
 * Hit bookkeeping for a target: a token to hand to ScrambleText, and a short
 * jolt while the text reloads.
 */
export function useShotHit() {
  const [hit, setHit] = useState(0);
  const [shaking, setShaking] = useState(false);
  const timer = useRef(0);

  const onHit = useCallback(() => {
    setHit((count) => count + 1);
    setShaking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShaking(false), 400);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { hit, shaking, onHit };
}
