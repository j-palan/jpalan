import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, [contenteditable]";

export const CustomCursor = () => {
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { damping: 26, stiffness: 420, mass: 0.35 });
  const ringY = useSpring(y, { damping: 26, stiffness: 420, mass: 0.35 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    setActive(true);
    document.body.setAttribute("data-custom-cursor", "");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest?.(INTERACTIVE)));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      document.body.removeAttribute("data-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  if (!active) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 h-1 w-1 rounded-full bg-gold-300"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: hovering ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 rounded-full border border-gold-300/60"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 34 : 20,
          height: hovering ? 34 : 20,
          opacity: pressed ? 0.45 : 0.85,
          scale: pressed ? 0.85 : 1,
        }}
        transition={{ type: "spring", damping: 22, stiffness: 320 }}
      />
    </>
  );
};
