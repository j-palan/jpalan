import { useRef, type CSSProperties } from "react";
import { useFireShot } from "@/components/shot/shotContext";
import { CoinBody } from "./Coin";
import "./coin.css";

export const MARK_SLOT_ID = "coin-mark-slot";

const MARK_RADIUS = 16;

/**
 * Where the intro coin comes to rest. It is the same object at a sixth of the
 * size — hover it and it turns over to the P side; click it and it fires.
 */
export const CoinMark = ({ visible }: { visible: boolean }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const fire = useFireShot();

  const shoot = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    fire({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <button
      ref={ref}
      id={MARK_SLOT_ID}
      type="button"
      onClick={shoot}
      className="coin-mark"
      aria-label="Jai Palan — fire a round"
      style={
        {
          "--coin-r": `${MARK_RADIUS}px`,
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms ease",
        } as CSSProperties
      }
    >
      <span className="coin-mark-inner">
        <CoinBody front="J" back="P" />
      </span>
    </button>
  );
};
