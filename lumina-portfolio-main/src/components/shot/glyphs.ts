/**
 * Glyphs a character can flicker through while it reloads. Deliberately drawn
 * from ranges every system font covers — geometric shapes, arrows, Greek and
 * maths operators — so nothing renders as a tofu box, and all of roughly Latin
 * width so a scrambling line does not visibly reflow.
 */
export const GLYPHS = [
  "△", "▽", "◇", "○", "□", "◈", "◉", "◊", "◐", "◑", "◒", "◓", "⬡", "⬢",
  "✦", "✧", "⊹", "⌖", "⌬", "⏣", "⎔", "∴", "∵", "≋", "⋔", "⌇", "⍜", "⍚",
  "λ", "α", "β", "δ", "θ", "ξ", "π", "σ", "φ", "ψ", "ω", "Σ", "Ω", "Δ",
  "╱", "╲", "╳", "┼", "╬", "▚", "▞", "▨", "▩",
];

/** Colours a scrambling glyph can take before it settles. */
export const SCRAMBLE_COLORS = [
  "#fff8e7",
  "#f2ead5",
  "#d9d0b5",
  "#b8cdbf",
  "#f0d27a",
  "#d8b65a",
  "#c7d8ca",
];

export const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
