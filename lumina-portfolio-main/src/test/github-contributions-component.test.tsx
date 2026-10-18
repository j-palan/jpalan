import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GitHubContributions } from "@/components/GitHubContributions";

vi.mock("@/components/shot/shotContext", () => ({
  useShotHit: () => ({ shaking: false, onHit: () => {} }),
  useShotTarget: () => ({ current: null }),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GitHub contribution total", () => {
  it.each([
    { reported: 1732, expected: "1,732" },
    { reported: 0, expected: "0" },
    { reported: undefined, expected: "1,685" },
    { reported: -1, expected: "1,685" },
  ])("shows $expected for reported total $reported", async ({ reported, expected }) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: { lastYear: reported },
        contributions: [{ date: "2026-10-18", count: 1685, level: 4 }],
      }),
    }));

    render(<GitHubContributions username="j-palan" href="https://github.com/j-palan" />);

    expect(await screen.findByText(`${expected} contributions`)).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      `${expected.replaceAll(",", "")} GitHub contributions in the last year`,
    );
  });
});
