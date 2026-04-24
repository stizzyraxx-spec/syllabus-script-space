import React, { createContext, useState } from 'react';

export const GuidanceContext = createContext();

export default function GuidanceProvider({ children }) {
  const [guidanceEnabled, setGuidanceEnabled] = useState(false);

  return (
    <GuidanceContext.Provider value={{ guidanceEnabled, setGuidanceEnabled }}>
      {children}
    </GuidanceContext.Provider>
  );
}