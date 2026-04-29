import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/api/supabaseClient";

const ThemeContext = createContext();

// Convert hex color to HSL string like "43 96% 48%"
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyAccentColor(hex) {
  if (!hex) return;
  const hsl = hexToHsl(hex);
  document.documentElement.style.setProperty("--accent", hsl);
  document.documentElement.style.setProperty("--ring", hsl);
  document.documentElement.style.setProperty("--sidebar-primary", hsl);
  document.documentElement.style.setProperty("--chart-1", hsl);
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return false;
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem("accentColor") || "#F5A623";
  });

  // Load accent color from user profile on mount
  useEffect(() => {
    const loadAccentColorFromProfile = async () => {
      try {
        const isAuthed = await db.auth.isAuthenticated();
        if (isAuthed) {
          const user = await db.auth.me();
          const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
          if (profiles.length > 0 && profiles[0].accent_color) {
            setAccentColorState(profiles[0].accent_color);
            localStorage.setItem("accentColor", profiles[0].accent_color);
          }
        }
      } catch (error) {
        console.error("Failed to load accent color from profile:", error);
      }
    };
    loadAccentColorFromProfile();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  const setAccentColor = async (hex) => {
    setAccentColorState(hex);
    localStorage.setItem("accentColor", hex);
    // Save to user profile if authenticated
    try {
      const isAuthed = await db.auth.isAuthenticated();
      if (isAuthed) {
        const user = await db.auth.me();
        const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
        if (profiles.length > 0) {
          await db.entities.UserProfile.update(profiles[0].id, { accent_color: hex });
        }
      }
    } catch (error) {
      console.error("Failed to save accent color to profile:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark((d) => !d), accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}