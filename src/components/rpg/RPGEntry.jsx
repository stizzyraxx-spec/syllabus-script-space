import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function RPGEntry({ onEnter }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Mouse-tracking glowing orb */}
      <motion.div
        className="absolute w-40 h-40 pointer-events-none"
        style={{
          x: mousePos.x - 80,
          y: mousePos.y - 80,
        }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
      >
        <motion.div
          className="absolute inset-0 bg-white rounded-full blur-3xl"
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="relative w-full h-full bg-white rounded-full shadow-2xl shadow-white/60" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="font-display text-6xl md:text-7xl font-bold text-white mb-4">
          The Condition of Man
        </h1>
        <p className="text-white/60 text-lg md:text-xl font-body">
          Walk the path of faith, test your convictions, discover your morality
        </p>
      </motion.div>

      {/* Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEnter}
        className="px-8 py-4 rounded-lg bg-white text-black font-display font-bold text-xl hover:shadow-2xl hover:shadow-white/50 transition-all relative z-10"
      >
        Enter the Realm
      </motion.button>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}