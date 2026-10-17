import { useEffect, useRef } from "react";
import { measureTrack, type TrackGeometry } from "@/lib/racetrackGeometry";

// Both visible sections run in race order; the connecting straights are off-screen.
const LOWER_TRACK = "M-180 540C100 560 330 670 280 810C250 900 160 990 100 1100";
// Overscan the ends so the full road width exits cleanly on wider viewports.
// Matching tangents at each join keep the S-bends rounded on both road edges.
const UPPER_TRACK = "M1800 690L1650 690C1410 690 1270 580 1270 420C1270 260 1460 200 1460 40L1460-160";
// Four seconds on the lower bend, two away, 4.5 on the upper sweep, four away.
const LAP_SECONDS = 14.5;
const CARS = [
  { color: "#e7c96c", delay: 0, upperDelay: 0, lane: -8, raceLane: 0 },
  { color: "#df7065", delay: 0.42, upperDelay: 0.42, lane: 8, raceLane: 0 },
  { color: "#9dcce2", delay: 0.9, upperDelay: 0.9, lane: -8, raceLane: 0 },
  { color: "#d2b3e7", delay: 1.38, upperDelay: 1.38, lane: 8, raceLane: 0 },
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

export const RacetrackBackdrop = ({ active }: { active: boolean }) => {
  const lowerRef = useRef<SVGPathElement>(null);
  const upperRef = useRef<SVGPathElement>(null);
  const carsRef = useRef<(SVGGElement | null)[]>([]);
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
    let frame = 0;
    let elapsed = 0;
    let previous = 0;
    let lastMark = 0;
    const marks: { element: SVGLineElement; created: number }[] = [];

    const tick = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      if (!document.hidden && !reducedMotion.matches) elapsed += delta;
      const drawMarks = elapsed - lastMark > 0.08 && !reducedMotion.matches;
      CARS.forEach((car, index) => {
        const lapTime = ((elapsed - car.delay) % LAP_SECONDS + LAP_SECONDS) % LAP_SECONDS;
        // The last two cars pull alongside one another off-screen.
        const upperTime = ((elapsed - car.upperDelay) % LAP_SECONDS + LAP_SECONDS) % LAP_SECONDS;
        const onLower = lapTime < 4;
        const visible = onLower || (upperTime >= 6 && upperTime < 10.5);
        const element = carsRef.current[index];
        element?.setAttribute("visibility", visible ? "visible" : "hidden");
        if (!visible) return;
        const geometry = onLower ? lowerGeometry : upperGeometry;
        const pace = onLower ? lowerPace : upperPace;
        const progress = onLower ? lapTime / 4 : (upperTime - 6) / 4.5;
        const distance = pace.distanceAt(progress);
        const { pointAt } = geometry;
        const point = pointAt(distance);
        const ahead = pointAt(distance + 5);
        const behind = pointAt(distance - 5);
        const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
        const lane = onLower ? car.lane : car.raceLane;
        const laneX = -Math.sin(angle) * lane;
        const laneY = Math.cos(angle) * lane;
        carsRef.current[index]?.setAttribute("transform", `translate(${point.x + laneX} ${point.y + laneY}) rotate(${angle * 180 / Math.PI})`);
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
      if (drawMarks) lastMark = elapsed;
      while (marks.length && elapsed - marks[0].created > 3.5) marks.shift()?.element.remove();
      for (const mark of marks) mark.element.setAttribute("opacity", String(0.45 * (1 - (elapsed - mark.created) / 3.5)));
      frame = requestAnimationFrame(tick);
    };
    const syncPlayback = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    syncPlayback();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      skids.replaceChildren();
      kerbs.replaceChildren();
    };
  }, [active]);

  return (
    <svg aria-hidden="true" className="race-backdrop" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
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
        <g key={car.color} ref={(element) => { carsRef.current[index] = element; }} className="race-car" visibility="hidden" style={{ color: car.color }}>
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
        </g>
      ))}
    </svg>
  );
};
