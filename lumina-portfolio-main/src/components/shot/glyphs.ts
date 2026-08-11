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
  "#f0d27a",
  "#8ad7b0",
  "#7fb4f5",
  "#e58fc0",
  "#c9a3f5",
  "#f2a65a",
  "#6fd6d0",
];

export const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
