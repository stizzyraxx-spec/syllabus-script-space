import React, { createContext, useState, useEffect } from 'react';

export const GuidanceContext = createContext();

const STORAGE_KEY = 'tcom-guidance-enabled';

export default function GuidanceProvider({ children }) {
  const [guidanceEnabled, setGuidanceEnabledState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  // Persist + toggle a body class so global CSS / observers can react
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, guidanceEnabled ? '1' : '0'); } catch {}
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('guidance-on', guidanceEnabled);
    }
  }, [guidanceEnabled]);

  // When guidance is on, hovering anything with [data-guidance] shows a floating tooltip.
  useEffect(() => {
    if (!guidanceEnabled) return;
    let tip = null;

    const onOver = (e) => {
      const el = e.target.closest('[data-guidance]');
      if (!el) return;
      if (tip) tip.remove();
      tip = document.createElement('div');
      tip.textContent = el.getAttribute('data-guidance');
      tip.style.cssText = `
        position: fixed; z-index: 9999;
        background: #fbbf24; color: #111;
        padding: 6px 10px; border-radius: 8px;
        font-size: 12px; font-family: ui-sans-serif, system-ui;
        max-width: 260px; pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        white-space: normal; line-height: 1.3;
      `;
      document.body.appendChild(tip);
      const r = el.getBoundingClientRect();
      const tipR = tip.getBoundingClientRect();
      let left = r.left + r.width / 2 - tipR.width / 2;
      let top = r.bottom + 8;
      if (left < 8) left = 8;
      if (left + tipR.width > window.innerWidth - 8) left = window.innerWidth - tipR.width - 8;
      if (top + tipR.height > window.innerHeight - 8) top = r.top - tipR.height - 8;
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    };
    const onOut = (e) => {
      if (!e.target.closest || !e.target.closest('[data-guidance]')) return;
      if (tip) { tip.remove(); tip = null; }
    };

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      if (tip) tip.remove();
    };
  }, [guidanceEnabled]);

  const setGuidanceEnabled = (v) => setGuidanceEnabledState(typeof v === 'function' ? v(guidanceEnabled) : v);

  return (
    <GuidanceContext.Provider value={{ guidanceEnabled, setGuidanceEnabled }}>
      {children}
    </GuidanceContext.Provider>
  );
}
