import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuidanceContext } from '@/lib/GuidanceContext';

export default function GuidedSection({ description, children, label }) {
  const { guidanceEnabled } = useContext(GuidanceContext);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className={guidanceEnabled ? 'relative group' : ''}
      onMouseEnter={() => guidanceEnabled && setShowTooltip(true)}
      onMouseLeave={() => guidanceEnabled && setShowTooltip(false)}
      onMouseMove={handleMouseMove}
    >
      {guidanceEnabled && (
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent z-10 opacity-50" />
      )}
      {children}
      <AnimatePresence>
        {showTooltip && guidanceEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-accent text-accent-foreground px-4 py-3 rounded-lg text-sm font-body max-w-xs whitespace-normal pointer-events-none shadow-lg"
            style={{
              left: `${mousePos.x + 16}px`,
              top: `${mousePos.y + 16}px`,
            }}
          >
            <p className="font-semibold mb-1">{label}</p>
            {description}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}