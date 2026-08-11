import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrambleText } from "@/components/shot/ScrambleText";
import { GLYPHS } from "@/components/shot/glyphs";

/* Drive the frame loop by hand so the assertions are about the component and
   not about how fast the test machine happens to be. */
let clock = 0;
let queued: FrameRequestCallback[] = [];

/* act(), because the loop sets state from inside the frame callback and the
   DOM would otherwise not have flushed by the time we assert. */
const advance = (ms: number) =>
  act(() => {
    clock += ms;
    const due = queued;
    queued = [];
    due.forEach((cb) => cb(clock));
  });

beforeEach(() => {
  clock = 0;
  queued = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => queued.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.stubGlobal("performance", { now: () => clock });
});

afterEach(() => vi.unstubAllGlobals());

const TEXT = "Hey Jai";

describe("ScrambleText", () => {
  it("gives every non-space character its own hover target", () => {
    const { container } = render(<ScrambleText text={TEXT} trigger={0} />);
    const targets = container.querySelectorAll("span.inline-block");
    expect(targets).toHaveLength(TEXT.replace(/ /g, "").length);
  });

  it("reads as plain text when nothing is running", () => {
    const { container } = render(<ScrambleText text={TEXT} trigger={0} />);
    expect(container.textContent).toBe(TEXT);
  });

  /* The overlay is decorative and the real character stays put underneath, so
     the heading never announces itself as a line of symbols. */
  it("keeps the real characters in the accessible tree mid-scramble", () => {
    const { container } = render(<ScrambleText text={TEXT} trigger={1} />);
    advance(0);
    advance(60);

    const overlays = container.querySelectorAll("span[aria-hidden='true']");
    expect(overlays.length).toBeGreaterThan(0);
    overlays.forEach((node) => expect(GLYPHS).toContain(node.textContent));

    overlays.forEach((node) => node.remove());
    expect(container.textContent).toBe(TEXT);
  });

  /* A wide glyph in a narrow letter must not reflow the line, or the letter
     would shift out from under the pointer that is hovering it. */
  it("leaves the character in the box that sets the width", () => {
    const { container } = render(<ScrambleText text={TEXT} trigger={1} />);
    advance(0);
    advance(60);

    const scrambling = container.querySelector("span.inline-block > span[style]");
    expect(scrambling?.getAttribute("style")).toContain("transparent");
    expect(scrambling?.textContent).toHaveLength(1);
  });

  it("stops the frame loop once the wave has settled", () => {
    render(<ScrambleText text={TEXT} trigger={1} />);
    advance(0);
    advance(2000);
    advance(0);
    expect(queued).toHaveLength(0);
  });
});
