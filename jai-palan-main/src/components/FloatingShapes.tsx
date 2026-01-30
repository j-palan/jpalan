import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

const FloatingShapes = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 100 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      mouseX.set((clientX - innerWidth / 2) / 50);
      mouseY.set((clientY - innerHeight / 2) / 50);
      setMousePosition({ x: clientX, y: clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const shapes = [
    // Soft gradient orbs — liquid glass ambient
    {
      size: 400,
      x: '70%',
      y: '20%',
      gradient: 'radial-gradient(circle, hsl(199 89% 48% / 0.08) 0%, transparent 70%)',
      blur: 80,
      animationDelay: 0,
      parallaxFactor: 1.5,
    },
    {
      size: 300,
      x: '20%',
      y: '60%',
      gradient: 'radial-gradient(circle, hsl(263 55% 55% / 0.06) 0%, transparent 70%)',
      blur: 70,
      animationDelay: 2,
      parallaxFactor: 1,
    },
    {
      size: 200,
      x: '80%',
      y: '70%',
      gradient: 'radial-gradient(circle, hsl(199 89% 48% / 0.05) 0%, transparent 70%)',
      blur: 50,
      animationDelay: 4,
      parallaxFactor: 2,
    },
    {
      size: 150,
      x: '10%',
      y: '20%',
      gradient: 'radial-gradient(circle, hsl(263 55% 55% / 0.04) 0%, transparent 70%)',
      blur: 40,
      animationDelay: 1,
      parallaxFactor: 0.5,
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            background: shape.gradient,
            filter: `blur(${shape.blur}px)`,
            x: useTransform(mouseXSpring, (v) => v * shape.parallaxFactor),
            y: useTransform(mouseYSpring, (v) => v * shape.parallaxFactor),
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: shape.animationDelay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle glass orbs — no geometric clutter */}
      <motion.div
        className="absolute w-20 h-20 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.06]"
        style={{
          left: '18%',
          top: '28%',
          x: useTransform(mouseXSpring, (v) => v * 2),
          y: useTransform(mouseYSpring, (v) => v * 2),
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-14 h-14 rounded-full backdrop-blur-xl bg-white/[0.02] border border-white/[0.05]"
        style={{
          right: '22%',
          top: '38%',
          x: useTransform(mouseXSpring, (v) => -v * 1.5),
          y: useTransform(mouseYSpring, (v) => -v * 1.5),
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default FloatingShapes;
