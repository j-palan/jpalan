/** Deflections allowed. On the next border contact the round leaves. */
export const MAX_BOUNCES = 4;

/** How far past the edge the round travels before the shot is retired. */
const EXIT_MARGIN = 320;

/** Seconds a target is ignored after it has just deflected the round. Without
    it, a target tucked into a corner and the two walls beside it trade the
    round back and forth and swallow the whole bounce budget on the spot. */
const DEFLECT_COOLDOWN = 0.18;

export type Bounds = { left: number; right: number; top: number; bottom: number };

export type StepTarget = {
  id: string;
  /** Solid targets deflect the round; the rest let it pass but still register. */
  solid: boolean;
  rect: Bounds | null;
};

export type Flight = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounces: number;
  /** Seconds since the round was fired. */
  age: number;
  /** Targets currently overlapped, so one pass fires one hit. */
  inside: Set<string>;
  /** Target id -> the age at which it may deflect the round again. */
  cooldown: Map<string, number>;
};

export type StepResult = {
  /** Targets entered this frame, in registration order. */
  hits: string[];
  /** True once the round is gone and the shot should be retired. */
  spent: boolean;
};

/** Whether the round's path this frame crosses a target. Small targets such as
    contribution cells can be narrower than one frame of travel, so checking
    only the final point would visibly skip them. */
function segmentIntersectsRect(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  rect: Bounds,
) {
  let entry = 0;
  let exit = 1;

  const clipAxis = (start: number, delta: number, min: number, max: number) => {
    if (delta === 0) return start >= min && start <= max;

    let near = (min - start) / delta;
    let far = (max - start) / delta;
    if (near > far) [near, far] = [far, near];
    entry = Math.max(entry, near);
    exit = Math.min(exit, far);
    return entry <= exit;
  };

  return (
    clipAxis(fromX, toX - fromX, rect.left, rect.right) &&
    clipAxis(fromY, toY - fromY, rect.top, rect.bottom)
  );
}

/**
 * Advances the round one frame: move, resolve target contacts, then walls.
 *
 * Pure and viewport-agnostic so the bounce budget and the pass-through rules
 * can be tested without a browser — they are the parts most likely to break
 * silently, since a round that tunnels through a target still looks plausible.
 */
export function stepShot(
  shot: Flight,
  deltaSeconds: number,
  targets: readonly StepTarget[],
  viewport: { width: number; height: number },
  jitter: () => number = Math.random,
): StepResult {
  const hits: string[] = [];
  const previousX = shot.x;
  const previousY = shot.y;
  /* At most one deflection per frame. Without this a target sitting against an
     edge deflects the round out of bounds, the wall check immediately turns it
     back into the same target, and two of the three bounces vanish in a
     single frame. */
  let deflected = false;

  shot.age += deltaSeconds;
  shot.x += shot.vx * deltaSeconds;
  shot.y += shot.vy * deltaSeconds;

  for (const target of targets) {
    const rect = target.rect;
    if (!rect) continue;

    const endsInside =
      shot.x >= rect.left && shot.x <= rect.right && shot.y >= rect.top && shot.y <= rect.bottom;
    const overlapping =
      endsInside || segmentIntersectsRect(previousX, previousY, shot.x, shot.y, rect);

    if (!overlapping) {
      shot.inside.delete(target.id);
      continue;
    }
    if (shot.inside.has(target.id)) {
      /* A swept segment can begin inside and end beyond the far edge. Clear
         the flag now so a later re-entry is allowed to register. */
      if (!endsInside) shot.inside.delete(target.id);
      continue;
    }
    if (shot.age < (shot.cooldown.get(target.id) ?? 0)) continue;

    if (endsInside) shot.inside.add(target.id);
    else shot.inside.delete(target.id);
    hits.push(target.id);

    if (target.solid && shot.bounces < MAX_BOUNCES && !deflected) {
      shot.bounces += 1;
      deflected = true;
      /* Which face was crossed is read from where the round was last frame.
         It is then parked just outside that face and sent away from it, rather
         than rewound to where it was, so it keeps travelling along the edge
         instead of retracing its own path. */
      const clearance = 0.5;
      if (previousX < rect.left) {
        shot.x = rect.left - clearance;
        shot.vx = -Math.abs(shot.vx);
      } else if (previousX > rect.right) {
        shot.x = rect.right + clearance;
        shot.vx = Math.abs(shot.vx);
      } else if (previousY < rect.top) {
        shot.y = rect.top - clearance;
        shot.vy = -Math.abs(shot.vy);
      } else {
        shot.y = rect.bottom + clearance;
        shot.vy = Math.abs(shot.vy);
      }
      shot.cooldown.set(target.id, shot.age + DEFLECT_COOLDOWN);
      shot.inside.delete(target.id);
    }
  }

  const { width, height } = viewport;

  if (shot.bounces >= MAX_BOUNCES) {
    const gone =
      shot.x < -EXIT_MARGIN ||
      shot.x > width + EXIT_MARGIN ||
      shot.y < -EXIT_MARGIN ||
      shot.y > height + EXIT_MARGIN;
    return { hits, spent: gone };
  }

  if (!deflected && (shot.x <= 0 || shot.x >= width || shot.y <= 0 || shot.y >= height)) {
    shot.bounces += 1;
    if (shot.x <= 0) {
      shot.x = 0;
      shot.vx = Math.abs(shot.vx);
    } else if (shot.x >= width) {
      shot.x = width;
      shot.vx = -Math.abs(shot.vx);
    }
    if (shot.y <= 0) {
      shot.y = 0;
      shot.vy = Math.abs(shot.vy);
    } else if (shot.y >= height) {
      shot.y = height;
      shot.vy = -Math.abs(shot.vy);
    }
    /* A nudge off the perfect reflection, so it never falls into a loop. */
    const angle = ((jitter() - 0.5) * 14 * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const { vx, vy } = shot;
    shot.vx = vx * cos - vy * sin;
    shot.vy = vx * sin + vy * cos;
  }

  return { hits, spent: false };
}
