import React, { createContext, useState, useEffect } from "react";

export const MouseContext = createContext({ x: 0, y: 0 });

export function MouseProvider({ children }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <MouseContext.Provider value={mousePos}>
      {children}
    </MouseContext.Provider>
  );
}