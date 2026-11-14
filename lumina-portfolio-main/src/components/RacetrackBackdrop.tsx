import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { measureTrack, type TrackGeometry } from "@/lib/racetrackGeometry";
import { blueRacingLine, purpleOvertake } from "@/lib/racingOvertake";
import { buildRacingTrajectory } from "@/lib/racingTrajectory";
import { gapAhead } from "@/lib/raceTiming";
import { getRaceEvent } from "@/lib/raceEvents";

// Both visible sections run in race order; the connecting straights are off-screen.
const LOWER_TRACK = "M-180 540C100 560 330 670 280 810C250 900 160 990 100 1100";
// Overscan the ends so the full road width exits cleanly on wider viewports.
// Matching tangents at each join keep the S-bends rounded on both road edges.
const UPPER_TRACK = "M1800 690L1650 690C1410 690 1270 580 1270 420C1270 260 1460 200 1460 40L1460-160";
// Four seconds on the lower bend, two away, 4.5 on the upper sweep, four away.
const LAP_SECONDS = 14.5;
const START_LIGHT_DELAY = 0.85;
const START_LIGHT_INTERVAL = 0.48;
const LIGHTS_OUT_SECONDS = START_LIGHT_DELAY + 5 * START_LIGHT_INTERVAL + 0.6;
const CARS = [
  { color: "#e7c96c", delay: 0, upperDelay: 0, lane: -8, raceLane: 0 },
  { color: "#df7065", delay: 0.42, upperDelay: 0.42, lane: 8, raceLane: 0 },
  { color: "#9dcce2", delay: 0.9, upperDelay: 0.9, lane: -8, raceLane: 0 },
  { color: "#d2b3e7", delay: 1.38, upperDelay: 1.08, lane: 8, raceLane: 0 },
  { color: "#f1eee1", delay: 1.96, upperDelay: 1.96, lane: -8, raceLane: -18 },
  { color: "#edaa6a", delay: 2.5, upperDelay: 2.08, lane: 8, raceLane: 18 },
];

/** Integrate travel time along the road, braking for curvature. Smoothing the
 * speed over neighboring samples creates gradual braking and acceleration. */
const buildPace = (geometry: TrackGeometry, entryBoost = 0, exitBoost = 0, cornerDrag = 10, entryHold = 0) => {
  const { length, pointAt } = geometry;
  const samples = 400;
  const step = length / samples;
  const speeds = Array.from({ length: samples + 1 }, (_, index) => {
    const distance = index * step;
    const before = pointAt(distance - 10);
    const here = pointAt(distance);
    const after = pointAt(distance + 10);
    // Use one-sided curvature at the endpoints instead of a zero tangent.
    // Hold the upper straight's boost until the car is actually on-screen,
    // then blend down through the approach instead of spending it off-screen.
    const brakingProgress = Math.max(0, Math.min(1, (distance / length - entryHold) / 0.2));
    const entryEnvelope = entryHold > 0
      ? 1 - brakingProgress * brakingProgress * (3 - 2 * brakingProgress)
      : Math.exp(-distance / 160);
    const entrySpeed = 1 + entryBoost * entryEnvelope;
    // Accelerate out of the first sweeping bend onto the diagonal section.
    const exitProgress = Math.max(0, Math.min(1, (distance / length - 0.43) / 0.17));
    const exitSpeed = 1 + exitBoost * exitProgress * exitProgress * (3 - 2 * exitProgress);
    const straightSpeed = entrySpeed * exitSpeed;
    if (index < 5 || index > samples - 5) return straightSpeed;
    const incoming = Math.atan2(here.y - before.y, here.x - before.x);
    const outgoing = Math.atan2(after.y - here.y, after.x - here.x);
    const angle = Math.abs(Math.atan2(Math.sin(outgoing - incoming), Math.cos(outgoing - incoming)));
    return Math.max(0.34, 1 / (1 + angle * cornerDrag)) * straightSpeed;
  });
  const smooth = speeds.map((_, index) => {
    let weighted = 0;
    let weights = 0;
    for (let offset = -18; offset <= 18; offset++) {
      const weight = 19 - Math.abs(offset);
      weighted += speeds[Math.max(0, Math.min(samples, index + offset))] * weight;
      weights += weight;
    }
    return weighted / weights;
  });
  const times = [0];
  for (let index = 1; index <= samples; index++) {
    times.push(times[index - 1] + step / ((smooth[index - 1] + smooth[index]) / 2));
  }
  return {
    length,
    distanceAt: (progress: number) => {
      const target = Math.max(0, Math.min(1, progress)) * times[samples];
      let low = 0;
      let high = samples;
      while (high - low > 1) {
        const middle = Math.floor((low + high) / 2);
        if (times[middle] <= target) low = middle;
        else high = middle;
      }
      return step * (low + (target - times[low]) / (times[high] - times[low]));
    },
  };
};

/** Stripe the actual offset edges by arc length, avoiding stretched wedges
 * from dashing a road-wide stroke. Curvature controls the soft corner fades. */
const drawKerbs = (geometry: TrackGeometry, group: SVGGElement, sensitivity = 1) => {
  const { length, pointAt } = geometry;
  // Combine pieces by color and fade level, including all fully bright pieces
  // in two paths. Never create DOM nodes for invisible pieces.
  const batches = new Map<string, { red: boolean; opacity: number; parts: string[] }>();
  const samples = Array.from({ length: Math.ceil(length / 3) + 1 }, (_, index) => {
    const distance = Math.min(length, index * 3);
    const before = pointAt(distance - 10);
    const point = pointAt(distance);
    const after = pointAt(distance + 10);
    const angle = Math.atan2(after.y - before.y, after.x - before.x);
    const incoming = Math.atan2(point.y - before.y, point.x - before.x);
    const outgoing = Math.atan2(after.y - point.y, after.x - point.x);
    const curvature = distance < 10 || distance > length - 10 ? 0 :
      Math.abs(Math.atan2(Math.sin(outgoing - incoming), Math.cos(outgoing - incoming)));
    return { point, angle, curvature };
  });
  const fades = samples.map((_, index) => {
    let curvature = 0;
    let weights = 0;
    for (let offset = -12; offset <= 12; offset++) {
      const weight = 13 - Math.abs(offset);
      curvature += samples[Math.max(0, Math.min(samples.length - 1, index + offset))].curvature * weight;
      weights += weight;
    }
    const t = Math.max(0, Math.min(1, (curvature / weights * sensitivity - 0.045) / 0.095));
    return t * t * (3 - 2 * t);
  });
  // Treat a bend as one continuous kerb band. Bridge short curvature dips so
  // stripe brightness stays constant inside it and fades only at the ends.
  const bands: { start: number; end: number }[] = [];
  for (let index = 0; index < fades.length; index++) {
    if (fades[index] < 0.12) continue;
    const previous = bands[bands.length - 1];
    if (previous && index - previous.end <= 60) previous.end = index;
    else bands.push({ start: index, end: index });
  }
  fades.fill(0);
  for (const band of bands) {
    const start = Math.max(0, band.start - 12);
    const end = Math.min(fades.length - 1, band.end + 12);
    for (let index = start; index <= end; index++) {
      const t = Math.max(0, Math.min(1, (index - start) / 16, (end - index) / 16));
      fades[index] = Math.max(fades[index], t * t * (3 - 2 * t));
    }
  }
  for (const side of [-1, 1]) {
    let edgeDistance = 0;
    for (let index = 1; index < samples.length; index++) {
      const edge = (sample: typeof samples[number]) => ({
        x: sample.point.x - Math.sin(sample.angle) * side * 37.5,
        y: sample.point.y + Math.cos(sample.angle) * side * 37.5,
      });
      const from = edge(samples[index - 1]);
      const to = edge(samples[index]);
      const segmentLength = Math.hypot(to.x - from.x, to.y - from.y);
      let consumed = 0;
      while (consumed < segmentLength - 0.001) {
        const stripe = Math.floor((edgeDistance + 0.001) / 11);
        const part = Math.min(segmentLength - consumed, (stripe + 1) * 11 - edgeDistance);
        const start = consumed / segmentLength;
        const end = (consumed + part) / segmentLength;
        const opacity = Math.round((fades[index - 1] + fades[index]) / 2 * 16) / 16;
        if (opacity > 0) {
          const red = Boolean(stripe % 2);
          const key = `${red}:${opacity}`;
          let batch = batches.get(key);
          if (!batch) {
            batch = { red, opacity, parts: [] };
            batches.set(key, batch);
          }
          batch.parts.push(`M${(from.x + (to.x - from.x) * start).toFixed(2)} ${(from.y + (to.y - from.y) * start).toFixed(2)}L${(from.x + (to.x - from.x) * end).toFixed(2)} ${(from.y + (to.y - from.y) * end).toFixed(2)}`);
        }
        consumed += part;
        edgeDistance += part;
      }
    }
  }
  const fragment = document.createDocumentFragment();
  for (const batch of batches.values()) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", batch.parts.join(""));
    line.setAttribute("class", batch.red ? "race-kerb race-kerb--red" : "race-kerb race-kerb--cream");
    line.setAttribute("opacity", String(batch.opacity));
    fragment.appendChild(line);
  }
  group.appendChild(fragment);
};

export const RacetrackBackdrop = ({ active, onRaceStart }: { active: boolean; onRaceStart?: () => void }) => {
  const onRaceStartRef = useRef(onRaceStart);
  useEffect(() => { onRaceStartRef.current = onRaceStart; }, [onRaceStart]);
  const svgRef = useRef<SVGSVGElement>(null);
  const startLightsRef = useRef<HTMLDivElement>(null);
  const timingRef = useRef<HTMLDivElement>(null);
  const timingCarRef = useRef<HTMLSpanElement>(null);
  const timingGapRef = useRef<HTMLSpanElement>(null);
  const focusedCarRef = useRef<number | null>(null);
  const lowerRef = useRef<SVGPathElement>(null);
  const upperRef = useRef<SVGPathElement>(null);
  const carsRef = useRef<(SVGGElement | null)[]>([]);
  const brakeLightsRef = useRef<(SVGGElement | null)[]>([]);
  const skidsRef = useRef<SVGGElement>(null);
  const kerbsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!active) return;
    const lower = lowerRef.current;
    const upper = upperRef.current;
    const skids = skidsRef.current;
    const kerbs = kerbsRef.current;
    if (!lower || !upper || !skids || !kerbs) return;
    const lowerGeometry = measureTrack(lower);
    const upperGeometry = measureTrack(upper);
    // Both sections use broad radii; preserve visible corner kerbs without
    // carrying the stripes along the straights.
    drawKerbs(lowerGeometry, kerbs, 1.8);
    drawKerbs(upperGeometry, kerbs, 1.8);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowerPace = buildPace(lowerGeometry, 1.2);
    // Carry full speed through the wide upper sweep without braking.
    const upperPace = buildPace(upperGeometry, 0, 0.35, 0);
    const trajectories = [blueRacingLine, purpleOvertake].map((line) =>
      buildRacingTrajectory((time) => {
        const state = line(time);
        const distance = upperPace.distanceAt(state.progress);
        const point = upperGeometry.pointAt(distance);
        const ahead = upperGeometry.pointAt(distance + 12);
        const behind = upperGeometry.pointAt(distance - 12);
        const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
        return { x: point.x - Math.sin(angle) * state.lane,
          y: point.y + Math.cos(angle) * state.lane };
      }),
    );
    let frame = 0;
    let elapsed = 0;
    let startElapsed = 0;
    let previousLightCount = -1;
    let startComplete = false;
    let raceReleased = false;
    startLightsRef.current?.setAttribute("data-complete", "false");
    startLightsRef.current?.setAttribute("data-count", "0");
    let previous = 0;
    let lastMark = 0;
    let lastTiming = -1;
    const braking = CARS.map(() => ({
      previous: null as { x: number; y: number } | null,
      section: "", speed: 0, deceleration: 0, glow: 0,
    }));
    let selected = -1;
    let candidate = -1;
    let candidateSince = 0;
    let lastSeen = 0;
    let tooltipPosition: { x: number; y: number } | null = null;
    let dismissed = false;
    let pointer: { x: number; y: number } | null = null;
    let viewport = { width: window.innerWidth, height: window.innerHeight };
    let screenMatrix = svgRef.current?.getScreenCTM();
    const positions: ({ x: number; y: number } | null)[] = CARS.map(() => null);
    const phases = CARS.map(() => 0);
    const hideTiming = () => {
      timingRef.current?.setAttribute("data-visible", "false");
      timingRef.current?.setAttribute("aria-hidden", "true");
      if (selected >= 0) carsRef.current[selected]?.removeAttribute("data-timing-active");
      selected = -1;
      tooltipPosition = null;
    };
    const movePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      // Never interfere with the page's links, coin, or other controls.
      const target = event.target as Element | null;
      pointer = target?.closest("a, button, input, textarea, select, [role='button']")
        ? null : { x: event.clientX, y: event.clientY };
      dismissed = false;
    };
    const leavePointer = () => { pointer = null; };
    const dismissTiming = (event: KeyboardEvent) => {
      if (event.key === "Escape") { dismissed = true; hideTiming(); }
    };
    const resize = () => {
      viewport = { width: window.innerWidth, height: window.innerHeight };
      screenMatrix = svgRef.current?.getScreenCTM();
      hideTiming();
    };
    window.addEventListener("pointermove", movePointer, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("keydown", dismissTiming);
    window.addEventListener("blur", leavePointer);
    document.addEventListener("pointerleave", leavePointer);
    const marks: { element: SVGLineElement; created: number }[] = [];

    const tick = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      if (!document.hidden && !reducedMotion.matches) {
        startElapsed += delta;
        // The lights and the cars share one clock, including tab suspension.
        elapsed += Math.max(0, Math.min(delta, startElapsed - LIGHTS_OUT_SECONDS));
      }
      if (!startComplete) {
        if (!raceReleased && startElapsed >= LIGHTS_OUT_SECONDS) {
          raceReleased = true;
          onRaceStartRef.current?.();
        }
        const count = startElapsed >= LIGHTS_OUT_SECONDS ? 0
          : Math.max(0, Math.min(5, Math.floor((startElapsed - START_LIGHT_DELAY) / START_LIGHT_INTERVAL)));
        if (count !== previousLightCount) {
          startLightsRef.current?.setAttribute("data-count", String(count));
          previousLightCount = count;
        }
        if (startElapsed >= LIGHTS_OUT_SECONDS + 0.35) {
          startLightsRef.current?.setAttribute("data-complete", "true");
          startComplete = true;
        }
      }
      const drawMarks = elapsed - lastMark > 0.08 && !reducedMotion.matches;
      // Pick the next battle while all cars are on the hidden connector.
      // The complete visible upper-road sequence uses the same event.
      const raceEvent = getRaceEvent(Math.floor((elapsed - 6) / LAP_SECONDS));
      CARS.forEach((car, index) => {
        const lapTime = ((elapsed - car.delay) % LAP_SECONDS + LAP_SECONDS) % LAP_SECONDS;
        // Bring a battling pair close together off-screen. On quieter laps,
        // purple returns to its usual gap; the last two keep their paired run.
        const upperDelay = raceEvent?.attacker === index
          ? CARS[raceEvent.defender].upperDelay + 0.18
          : index === 3 ? car.delay : car.upperDelay;
        const upperTime = ((elapsed - upperDelay) % LAP_SECONDS + LAP_SECONDS) % LAP_SECONDS;
        const onLower = lapTime < 4;
        const racingLine = onLower ? null
          : index === raceEvent?.defender ? blueRacingLine
          : index === raceEvent?.attacker ? purpleOvertake : null;
        phases[index] = lapTime < 6 ? lapTime : upperTime;
        if (upperTime >= 6 && upperTime < 10.5 && !onLower) {
          const time = (upperTime - 6) / 4.5;
          phases[index] = 6 + 4.5 * (racingLine ? racingLine(time).progress : time);
        }
        positions[index] = null;
        const visible = onLower || (upperTime >= 6 && upperTime < 10.5);
        const element = carsRef.current[index];
        element?.setAttribute("visibility", visible ? "visible" : "hidden");
        if (!visible) {
          braking[index].previous = null;
          braking[index].glow = 0;
          brakeLightsRef.current[index]?.setAttribute("opacity", "0");
          return;
        }
        const geometry = onLower ? lowerGeometry : upperGeometry;
        const pace = onLower ? lowerPace : upperPace;
        const baseProgress = onLower ? lapTime / 4 : (upperTime - 6) / 4.5;
        const pass = racingLine?.(baseProgress);
        const progress = pass?.progress ?? baseProgress;
        if (progress >= 1) {
          element?.setAttribute("visibility", "hidden");
          return;
        }
        const distance = pace.distanceAt(progress);
        const { pointAt } = geometry;
        const point = pointAt(distance);
        const ahead = pointAt(distance + 5);
        const behind = pointAt(distance - 5);
        const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
        const lane = onLower ? car.lane : (pass?.lane ?? car.raceLane);
        const laneX = -Math.sin(angle) * lane;
        const laneY = Math.cos(angle) * lane;
        const pose = racingLine ? trajectories[index === raceEvent?.defender ? 0 : 1](baseProgress)
          : { x: point.x + laneX, y: point.y + laneY, heading: angle };
        // Track-space deceleration, not screen size or simply entering a bend.
        // Smooth measurements and fade the glow rather than flickering it.
        const brake = braking[index];
        const section = onLower ? "lower" : "upper";
        if (brake.previous && brake.section === section && delta > 0) {
          const measured = Math.hypot(pose.x - brake.previous.x, pose.y - brake.previous.y) / delta;
          const speed = brake.speed + (measured - brake.speed) * (1 - Math.exp(-delta / 0.1));
          brake.deceleration += ((brake.speed - speed) / delta - brake.deceleration)
            * (1 - Math.exp(-delta / 0.08));
          brake.speed = speed;
          const intensity = Math.max(0, Math.min(1, (brake.deceleration - 18) / 160));
          brake.glow += (intensity - brake.glow)
            * (1 - Math.exp(-delta / (intensity > brake.glow ? 0.055 : 0.2)));
        } else {
          brake.speed = 0;
          brake.deceleration = 0;
          brake.glow = 0;
        }
        brake.previous = pose;
        brake.section = section;
        brakeLightsRef.current[index]?.setAttribute("opacity", brake.glow.toFixed(3));
        if (screenMatrix) {
          const x = screenMatrix.a * pose.x + screenMatrix.c * pose.y + screenMatrix.e;
          const y = screenMatrix.b * pose.x + screenMatrix.d * pose.y + screenMatrix.f;
          if (x > 0 && x < viewport.width && y > 0 && y < viewport.height) {
            positions[index] = { x, y };
          }
        }
        element?.setAttribute("tabindex", positions[index] ? "0" : "-1");
        carsRef.current[index]?.setAttribute("transform", `translate(${pose.x} ${pose.y}) rotate(${pose.heading * 180 / Math.PI})`);
        const beforeAngle = Math.atan2(point.y - behind.y, point.x - behind.x);
        const afterAngle = Math.atan2(ahead.y - point.y, ahead.x - point.x);
        const turn = Math.atan2(Math.sin(afterAngle - beforeAngle), Math.cos(afterAngle - beforeAngle));
        // Light, short rear-wheel traces on bends, fading over 3.5 seconds.
        if (drawMarks && Math.abs(turn) > 0.023) {
          for (const side of [-1, 1]) {
            const start = pointAt(distance - 9);
            const end = pointAt(distance - 5);
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            const nx = -Math.sin(angle) * side * 6 + laneX;
            const ny = Math.cos(angle) * side * 6 + laneY;
            line.setAttribute("x1", String(start.x + nx));
            line.setAttribute("y1", String(start.y + ny));
            line.setAttribute("x2", String(end.x + nx));
            line.setAttribute("y2", String(end.y + ny));
            skids.appendChild(line);
            marks.push({ element: line, created: elapsed });
          }
        }
      });
      // Reuse the race's existing frame loop. Only update text ten times a
      // second while inspecting a car; no React renders or layout reads.
      if (elapsed - lastTiming >= 0.1) {
        lastTiming = elapsed;
        let hovered = focusedCarRef.current ?? -1;
        if (hovered < 0 && pointer) {
          let nearest = 34;
          positions.forEach((position, index) => {
            if (!position) return;
            const distance = Math.hypot(position.x - pointer.x, position.y - pointer.y);
            if (distance < nearest) { nearest = distance; hovered = index; }
          });
        }
        // Once selected, follow the car rather than requiring the user to
        // chase it. A brief dwell prevents passing cars from stealing focus.
        if (hovered !== candidate) { candidate = hovered; candidateSince = elapsed; }
        if (hovered >= 0 && positions[hovered] && !dismissed &&
          (selected < 0 || focusedCarRef.current !== null || elapsed - candidateSince >= 0.18)) {
          if (selected !== hovered) {
            hideTiming();
            selected = hovered;
            carsRef.current[hovered]?.setAttribute("data-timing-active", "true");
          }
          lastSeen = elapsed;
        }
        if (selected >= 0 && positions[selected]) lastSeen = elapsed;
        if (dismissed || reducedMotion.matches || (selected >= 0 && elapsed - lastSeen > 1)) hideTiming();
        if (selected >= 0) {
          const { ahead, seconds } = gapAhead(phases, selected, LAP_SECONDS);
          const tooltip = timingRef.current;
          if (tooltip && timingCarRef.current && timingGapRef.current) {
            tooltip.style.setProperty("--timing-color", CARS[selected].color);
            timingCarRef.current.textContent = `CAR ${String(selected + 1).padStart(2, "0")}`;
            timingGapRef.current.textContent = `+${seconds.toFixed(2)}s to #${String(ahead + 1).padStart(2, "0")}`;
            tooltip.setAttribute("data-visible", "true");
            tooltip.setAttribute("aria-hidden", "false");
          }
        }
      }
      // Follow at the animation's full frame rate, independently of the 10Hz
      // timing text. Frame-rate-independent easing removes visible stepping.
      const trackedPosition = positions[selected];
      if (selected >= 0 && trackedPosition && timingRef.current) {
        const target = {
          x: Math.max(12, Math.min(viewport.width - 188, trackedPosition.x + 25)),
          y: Math.max(12, Math.min(viewport.height - 92, trackedPosition.y - 88)),
        };
        if (!tooltipPosition) tooltipPosition = target;
        const blend = 1 - Math.exp(-16 * delta);
        tooltipPosition.x += (target.x - tooltipPosition.x) * blend;
        tooltipPosition.y += (target.y - tooltipPosition.y) * blend;
        timingRef.current.style.transform = `translate3d(${tooltipPosition.x}px, ${tooltipPosition.y}px, 0)`;
      }
      if (drawMarks) lastMark = elapsed;
      while (marks.length && elapsed - marks[0].created > 3.5) marks.shift()?.element.remove();
      for (const mark of marks) mark.element.setAttribute("opacity", String(0.45 * (1 - (elapsed - mark.created) / 3.5)));
      frame = requestAnimationFrame(tick);
    };
    const syncPlayback = () => {
      cancelAnimationFrame(frame);
      hideTiming();
      previous = 0;
      if (reducedMotion.matches && !raceReleased) {
        raceReleased = true;
        onRaceStartRef.current?.();
      }
      braking.forEach((brake) => { brake.previous = null; });
      if (!document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    syncPlayback();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      window.removeEventListener("pointermove", movePointer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", dismissTiming);
      window.removeEventListener("blur", leavePointer);
      document.removeEventListener("pointerleave", leavePointer);
      hideTiming();
      skids.replaceChildren();
      kerbs.replaceChildren();
    };
  }, [active]);

  return (
    <>
    {active && (
      <div ref={startLightsRef} className="race-start-lights" data-count="0" data-complete="false" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <span key={index} />)}
      </div>
    )}
    {createPortal(
      <div ref={timingRef} id="race-live-timing" role="tooltip" aria-hidden="true" className="race-live-timing" data-visible="false">
        <div className="race-live-timing-heading"><span className="race-live-timing-dot" /><span ref={timingCarRef}>CAR 01</span><span className="race-live-timing-live">LIVE</span></div>
        <span className="race-live-timing-label">GAP AHEAD</span>
        <span ref={timingGapRef} className="race-live-timing-gap" />
      </div>, document.body,
    )}
    <svg ref={svgRef} role="group" aria-label="Background race. Focus a car to view live timing." className="race-backdrop" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="race-brake-glow">
          <stop offset="0" stopColor="#ff382e" stopOpacity="0.8" />
          <stop offset="0.4" stopColor="#f02c25" stopOpacity="0.3" />
          <stop offset="1" stopColor="#f02c25" stopOpacity="0" />
        </radialGradient>
        {/* A small pool of warm reflected light, without blur filters or an
            additional animation loop. It inherits each car's exact motion. */}
        <radialGradient id="race-track-light" cx="58%" cy="50%" r="50%">
          <stop offset="0" stopColor="hsl(var(--foreground))" stopOpacity="0.18" />
          <stop offset="0.45" stopColor="hsl(var(--foreground))" stopOpacity="0.07" />
          <stop offset="1" stopColor="hsl(var(--foreground))" stopOpacity="0" />
        </radialGradient>
        <path id="race-lower" ref={lowerRef} d={LOWER_TRACK} />
        <path id="race-upper" ref={upperRef} d={UPPER_TRACK} />
        <g id="race-circuit">
          <use href="#race-lower" />
          <use href="#race-upper" />
        </g>
      </defs>
      <use href="#race-circuit" className="race-road-edge" />
      <use href="#race-circuit" className="race-road-bed" />
      <g ref={kerbsRef} />
      <g ref={skidsRef} className="race-skids" />
      {CARS.map((car, index) => (
        <g key={car.color} ref={(element) => { carsRef.current[index] = element; }} className="race-car" visibility="hidden" style={{ color: car.color }}
          role="img" aria-label={`Race car ${index + 1}`} aria-describedby="race-live-timing" tabIndex={-1}
          onFocus={() => { focusedCarRef.current = index; }}
          onBlur={() => { focusedCarRef.current = null; }}>
          <ellipse aria-hidden="true" cx="4" cy="0" rx="35" ry="21" fill="url(#race-track-light)" stroke="none" />
          {/* Nose points along +X to match the path tangent. */}
          <g className="race-car-tires">
            <rect x="5" y="-9" width="7" height="4" rx="1" />
            <rect x="5" y="5" width="7" height="4" rx="1" />
            <rect x="-12" y="-9" width="8" height="4.5" rx="1" />
            <rect x="-12" y="4.5" width="8" height="4.5" rx="1" />
          </g>
          <g className="race-car-body">
            <path d="M-11-3-5-5 2-4 6-2 14-1.3 14 1.3 6 2 2 4-5 5-11 3Z" />
            <rect x="12" y="-8" width="2.5" height="16" rx="0.6" />
            <rect x="-14" y="-8" width="3" height="16" rx="0.6" />
          </g>
          <ellipse className="race-car-cockpit" cx="-2" cy="0" rx="3.5" ry="2" />
          <path d="M-4 0H2" stroke="#fff8e7" strokeOpacity="0.55" strokeWidth="0.8" />
          <g ref={(element) => { brakeLightsRef.current[index] = element; }} opacity="0" aria-hidden="true">
            <ellipse cx="-17" cy="0" rx="12" ry="8" fill="url(#race-brake-glow)" stroke="none" />
            <rect x="-16" y="-2" width="2.5" height="4" rx="0.7" fill="#ff5146" stroke="none" />
            <rect x="-16" y="-1" width="1" height="2" rx="0.4" fill="#ffb0a0" stroke="none" />
          </g>
        </g>
      ))}
    </svg>
    </>
  );
};
