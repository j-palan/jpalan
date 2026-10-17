import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { CoinStage } from "./CoinStage";
import { MARK_SLOT_ID } from "./CoinMark";
import { SKIP_TIMING, TIMING, useCoinTimeline } from "./useCoinTimeline";

type ResolveSchedule = {
  reveal: number;
  flip: number;
  flipDuration: number;
  handoff: number;
  end: number;
};

type CoinIntroProps = {
  /** Table dissolves; page content rises in; scrolling is released. */
  onReveal: () => void;
  /** Flying coin has arrived — the corner mark takes over. */
  onHandoff: () => void;
  /** Intro overlay has unmounted; background motion can start. */
  onComplete: () => void;
};

export const CoinIntro = ({ onReveal, onHandoff, onComplete }: CoinIntroProps) => {
  const prefersReduced = useReducedMotion();
  const play = !prefersReduced;

  const { radius, radiusMv, airY, rotY, tilt, lean, scale, skip } = useCoinTimeline(play);

  const backdropOpacity = useMotionValue(1);
  const coinOpacity = useMotionValue(1);
  const bulletOpacity = useMotionValue(1);
  const flyX = useMotionValue(0);
  const flyY = useMotionValue(0);
  const flyScale = useMotionValue(1);

  const flyRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  /* Callbacks live in refs so the timeline effect runs exactly once. */
  const revealRef = useRef(onReveal);
  const handoffRef = useRef(onHandoff);
  const completeRef = useRef(onComplete);
  revealRef.current = onReveal;
  handoffRef.current = onHandoff;
  completeRef.current = onComplete;

  useEffect(() => {
    if (!play) {
      revealRef.current();
      handoffRef.current();
      setGone(true);
      completeRef.current();
      return;
    }

    /* A refresh partway down the page should not fight the intro. */
    window.scrollTo(0, 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      document.body.style.overflow = previousOverflow;
    };

    let timers: number[] = [];
    const at = (seconds: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, seconds * 1000));
    };

    const flyToMark = (duration: number) => {
      const ease = [0.6, 0, 0.32, 1] as const;
      const layer = flyRef.current;
      const anchor = anchorRef.current;
      const mark = document.getElementById(MARK_SLOT_ID);

      if (layer && anchor && mark) {
        /* The anchor is the zero-size world origin, so its rect is exactly the
           point where the coin meets the table — already projected through the
           camera. A coin lying flat sits half its thickness above that, which
           the cross-fade below more than covers. */
        const from = anchor.getBoundingClientRect();
        const to = mark.getBoundingClientRect();
        const cx = from.left + from.width / 2;
        const cy = from.top + from.height / 2;
        layer.style.transformOrigin = `${cx}px ${cy}px`;

        animate(flyX, to.left + to.width / 2 - cx, { duration, ease });
        animate(flyY, to.top + to.height / 2 - cy, { duration, ease });
        animate(flyScale, to.width / (2 * radiusMv.get()), { duration, ease });
      }

      /* Cross-fade covers the last of the distance, so a pixel of drift between
         the flying coin and the static mark is never visible. */
      animate(coinOpacity, 0, {
        duration: duration * 0.5,
        delay: duration * 0.5,
        ease: "easeIn",
      });
    };

    const resolve = (schedule: ResolveSchedule) => {
      at(schedule.reveal, () => {
        animate(backdropOpacity, 0, { duration: 0.6, ease: "easeInOut" });
        release();
        revealRef.current();
      });
      at(schedule.flip, () => flyToMark(schedule.flipDuration));
      at(schedule.handoff, () => handoffRef.current());
      at(schedule.end, () => {
        setGone(true);
        completeRef.current();
      });
    };

    let skipped = false;
    const skipAll = () => {
      if (skipped) return;
      skipped = true;
      timers.forEach(clearTimeout);
      timers = [];
      bulletOpacity.set(0);
      skip();
      resolve(SKIP_TIMING);
    };

    resolve(TIMING);

    /* Outside `timers` so skipping cannot clear the last line of defence. */
    const failsafe = window.setTimeout(() => {
      release();
      revealRef.current();
      handoffRef.current();
      setGone(true);
      completeRef.current();
    }, TIMING.failsafe * 1000);

    const options: AddEventListenerOptions = { passive: true };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((event) => window.addEventListener(event, skipAll, options));

    return () => {
      events.forEach((event) => window.removeEventListener(event, skipAll, options));
      timers.forEach(clearTimeout);
      clearTimeout(failsafe);
      release();
    };
  }, [play, backdropOpacity, bulletOpacity, coinOpacity, flyScale, flyX, flyY, radiusMv, skip]);

  if (gone || !play) return null;

  return (
    <div className="intro-overlay" aria-hidden="true">
      <CoinStage
        radius={radius}
        radiusMv={radiusMv}
        airY={airY}
        rotY={rotY}
        tilt={tilt}
        lean={lean}
        scale={scale}
        front="J"
        back="P"
        backdropOpacity={backdropOpacity}
        flyX={flyX}
        flyY={flyY}
        flyScale={flyScale}
        coinOpacity={coinOpacity}
        bulletOpacity={bulletOpacity}
        flyRef={flyRef}
        anchorRef={anchorRef}
      />
    </div>
  );
};
