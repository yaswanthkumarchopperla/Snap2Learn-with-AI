import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId =
  | 'neon-prism'
  | 'cyber-cyan'
  | 'cosmic-violet'
  | 'emerald-matrix'
  | 'luxury-gold'
  | 'crimson-eclipse';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  label: string;
  accentColor: string;
  gradient: string;
  badge: string;
  description: string;
}

export const UNIQUE_THEMES: ThemeMeta[] = [
  {
    id: 'neon-prism',
    name: 'Obsidian Prism',
    label: 'Prism Multi-Neon',
    accentColor: '#38BDF8',
    gradient: 'from-cyan-400 via-indigo-400 to-purple-400',
    badge: 'Multi-Neon',
    description: 'Pure black canvas with multi-color glowing edge highlighters'
  },
  {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    label: 'Electric Tron Cyan',
    accentColor: '#06B6D4',
    gradient: 'from-cyan-400 to-blue-500',
    badge: 'Laser Cyan',
    description: 'Pure black canvas with radiant electric cyan edge glow'
  },
  {
    id: 'cosmic-violet',
    name: 'Cosmic Violet',
    label: 'Royal Nebula Violet',
    accentColor: '#A855F7',
    gradient: 'from-purple-400 via-violet-400 to-fuchsia-500',
    badge: 'Royal Violet',
    description: 'Pure black canvas with ultraviolet and magenta aura'
  },
  {
    id: 'emerald-matrix',
    name: 'Matrix Emerald',
    label: 'Quantum Emerald',
    accentColor: '#10B981',
    gradient: 'from-emerald-400 to-teal-400',
    badge: 'Quantum Green',
    description: 'Pure black canvas with vibrant cyber emerald edge accents'
  },
  {
    id: 'luxury-gold',
    name: 'Imperial Gold',
    label: 'Obsidian Gold',
    accentColor: '#F59E0B',
    gradient: 'from-amber-400 via-yellow-400 to-amber-500',
    badge: 'Champagne Gold',
    description: 'Pure black canvas with warm champagne gold edge highlights'
  },
  {
    id: 'crimson-eclipse',
    name: 'Crimson Eclipse',
    label: 'Viper Ruby Red',
    accentColor: '#F43F5E',
    gradient: 'from-rose-500 to-red-500',
    badge: 'Ruby Crimson',
    description: 'Pure black canvas with fiery ruby crimson edge accents'
  }
];

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: ThemeMeta[];
  themeMeta: ThemeMeta;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'neon-prism',
  setTheme: () => {},
  themes: UNIQUE_THEMES,
  themeMeta: UNIQUE_THEMES[0],
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('snap2learn_theme_id');
    const valid = UNIQUE_THEMES.find(t => t.id === saved);
    return valid ? (saved as ThemeId) : 'neon-prism';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Always enforce dark background - remove any light class
    root.classList.remove('light');
    root.classList.add('dark');
    root.setAttribute('data-theme', currentTheme);

    // Clean up legacy keys
    localStorage.removeItem('snap2learn_theme');
    localStorage.setItem('snap2learn_theme_id', currentTheme);
  }, [currentTheme]);

  const activeMeta = UNIQUE_THEMES.find(t => t.id === currentTheme) || UNIQUE_THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme: setCurrentTheme,
        themes: UNIQUE_THEMES,
        themeMeta: activeMeta,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
