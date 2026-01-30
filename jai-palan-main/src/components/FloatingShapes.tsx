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
    // Large gradient sphere
    {
      size: 400,
      x: '70%',
      y: '20%',
      gradient: 'radial-gradient(circle, hsl(199 89% 48% / 0.15) 0%, transparent 70%)',
      blur: 60,
      animationDelay: 0,
      parallaxFactor: 1.5,
    },
    // Secondary sphere
    {
      size: 300,
      x: '20%',
      y: '60%',
      gradient: 'radial-gradient(circle, hsl(263 70% 50% / 0.12) 0%, transparent 70%)',
      blur: 50,
      animationDelay: 2,
      parallaxFactor: 1,
    },
    // Small accent
    {
      size: 200,
      x: '80%',
      y: '70%',
      gradient: 'radial-gradient(circle, hsl(199 89% 48% / 0.1) 0%, transparent 70%)',
      blur: 40,
      animationDelay: 4,
      parallaxFactor: 2,
    },
    // Top left accent
    {
      size: 150,
      x: '10%',
      y: '20%',
      gradient: 'radial-gradient(circle, hsl(263 70% 50% / 0.08) 0%, transparent 70%)',
      blur: 30,
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

      {/* Geometric shapes */}
      <motion.div
        className="absolute w-16 h-16 border border-primary/20 rounded-lg"
        style={{
          left: '15%',
          top: '30%',
          x: useTransform(mouseXSpring, (v) => v * 2),
          y: useTransform(mouseYSpring, (v) => v * 2),
        }}
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute w-12 h-12 border border-secondary/20 rounded-full"
        style={{
          right: '20%',
          top: '40%',
          x: useTransform(mouseXSpring, (v) => -v * 1.5),
          y: useTransform(mouseYSpring, (v) => -v * 1.5),
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-8 h-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg"
        style={{
          left: '60%',
          bottom: '30%',
          x: useTransform(mouseXSpring, (v) => v * 3),
          y: useTransform(mouseYSpring, (v) => v * 3),
        }}
        animate={{
          rotate: [0, -45, 0, 45, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Dot grid pattern */}
      <motion.div
        className="absolute w-32 h-32"
        style={{
          left: '75%',
          top: '15%',
          x: useTransform(mouseXSpring, (v) => v * 0.5),
          y: useTransform(mouseYSpring, (v) => v * 0.5),
        }}
      >
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/20"
              animate={{
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingShapes;
