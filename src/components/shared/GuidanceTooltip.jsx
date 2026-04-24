import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuidanceContext } from '@/lib/GuidanceContext';

export default function GuidanceTooltip({ description, children }) {
  const { guidanceEnabled } = useContext(GuidanceContext);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!guidanceEnabled) {
    return children;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-accent text-accent-foreground px-3 py-2 rounded-lg text-xs font-body max-w-xs whitespace-normal pointer-events-none"
          >
            {description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-accent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}