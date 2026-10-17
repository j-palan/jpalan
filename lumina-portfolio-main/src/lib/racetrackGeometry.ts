export type TrackPoint = { x: number; y: number };
export type TrackGeometry = {
  length: number;
  pointAt: (distance: number) => TrackPoint;
};

/** Cache native SVG measurements once, then interpolate positions in memory. */
const geometryCache = new Map<string, TrackGeometry>();

export const measureTrack = (path: SVGPathElement): TrackGeometry => {
  const key = path.getAttribute("d") ?? "";
  const cached = geometryCache.get(key);
  if (cached) return cached;
  const length = path.getTotalLength();
  const count = Math.max(1, Math.ceil(length / 3));
  const points = Array.from({ length: count + 1 }, (_, index) => {
    const point = path.getPointAtLength(index * length / count);
    return { x: point.x, y: point.y };
  });
  const geometry = {
    length,
    pointAt: (distance: number) => {
      const position = Math.max(0, Math.min(length, distance)) / length * count;
      const index = Math.min(count - 1, Math.floor(position));
      const fraction = position - index;
      const from = points[index];
      const to = points[index + 1];
      return {
        x: from.x + (to.x - from.x) * fraction,
        y: from.y + (to.y - from.y) * fraction,
      };
    },
  };
  geometryCache.set(key, geometry);
  return geometry;
};
