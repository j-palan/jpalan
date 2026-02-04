import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
}

export const MagneticButton = ({
  children,
  className = "",
  onClick,
  href,
  target,
}: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.3;
    const y = (clientY - top - height / 2) * 0.3;
    setPosition({ x, y });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const content = (
    <motion.div
      ref={ref}
      className={`magnetic inline-flex items-center ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
    >
      {children}
    </motion.div>
  );

  if (href) {
    // Auto-detect external links and open in new tab
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    const linkTarget = target ?? (isExternal ? "_blank" : undefined);
    
    return (
      <a 
        href={href} 
        target={linkTarget} 
        rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
        className="inline-block no-underline"
      >
        {content}
      </a>
    );
  }

  return <div onClick={onClick} className="inline-block">{content}</div>;
};
