/* eslint-disable react-refresh/only-export-components */
/**
 * ThemeContext.jsx
 * Contexto global para el sistema de temas (claro / oscuro).
 *
 * Uso en cualquier componente:
 *   import { useTheme } from '../../context/ThemeContext';
 *   const { isDark, toggleTheme, c } = useTheme();
 *   // c.surface, c.text, c.primary, etc.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

/* ─── Paleta de colores ─────────────────────────────────────────── */
const light = {
  // Fondos
  bg:            '#f0f2f5',
  surface:       '#ffffff',
  surfaceAlt:    '#f8f9fa',
  // Texto
  text:          '#1a1a1a',
  textMuted:     '#6c757d',
  textInverted:  '#ffffff',
  // Marca
  primary:       '#DB0000',
  primaryDark:   '#8B0000',
  primaryAlpha:  'rgba(219,0,0,0.08)',
  // Bordes / sombras
  border:        'rgba(0,0,0,0.09)',
  shadow:        '0 2px 14px rgba(0,0,0,0.07)',
  shadowHover:   '0 12px 32px rgba(0,0,0,0.13)',
  // Inputs
  inputBg:       '#ffffff',
  inputBorder:   '#e0e0e0',
  inputFocus:    '#DB0000',
  // Sidebar
  sidebarBg:     'rgba(12,12,12,0.97)',
  sidebarText:   '#ffffff',
  sidebarBtn:    'rgba(219,0,0,0.75)',
  // Navbar
  navbarBg:      'linear-gradient(135deg,#c00000 0%,#8a0000 100%)',
  // Gradientes
  gradPrimary:   'linear-gradient(135deg,#DB0000,#8B0000)',
  gradDark:      'linear-gradient(135deg,#1a1a1a,#2e2e2e)',
  gradHero:      'linear-gradient(160deg,#b80000 0%,#6b0000 60%,#3a0000 100%)',
  // Tabla
  tableHead:     '#212529',
  tableHeadText: '#ffffff',
  tableRowAlt:   'rgba(0,0,0,0.025)',
  // Toast
  toastBg:       '#ffffff',
  toastText:     '#1a1a1a',
  // Spinner
  spinnerTrack:  '#f0f0f0',
};

const dark = {
  // Fondos
  bg:            '#0c0c0c',
  surface:       '#1a1a1a',
  surfaceAlt:    '#222222',
  // Texto
  text:          '#e8e8e8',
  textMuted:     '#9ca3af',
  textInverted:  '#ffffff',
  // Marca (rojo un poco más brillante en oscuro)
  primary:       '#ff3535',
  primaryDark:   '#cc1010',
  primaryAlpha:  'rgba(255,53,53,0.12)',
  // Bordes / sombras
  border:        'rgba(255,255,255,0.09)',
  shadow:        '0 2px 14px rgba(0,0,0,0.40)',
  shadowHover:   '0 12px 32px rgba(0,0,0,0.55)',
  // Inputs
  inputBg:       '#252525',
  inputBorder:   'rgba(255,255,255,0.12)',
  inputFocus:    '#ff3535',
  // Sidebar
  sidebarBg:     'rgba(4,4,4,0.98)',
  sidebarText:   '#e8e8e8',
  sidebarBtn:    'rgba(200,0,0,0.72)',
  // Navbar
  navbarBg:      'linear-gradient(135deg,#8a0000 0%,#5a0000 100%)',
  // Gradientes
  gradPrimary:   'linear-gradient(135deg,#b80000,#6b0000)',
  gradDark:      'linear-gradient(135deg,#2a2a2a,#3e3e3e)',
  gradHero:      'linear-gradient(160deg,#8a0000 0%,#4a0000 60%,#1e0000 100%)',
  // Tabla
  tableHead:     '#111111',
  tableHeadText: '#e8e8e8',
  tableRowAlt:   'rgba(255,255,255,0.03)',
  // Toast
  toastBg:       '#1e1e1e',
  toastText:     '#e8e8e8',
  // Spinner
  spinnerTrack:  'rgba(255,255,255,0.12)',
};

/* ─── Contexto ──────────────────────────────────────────────────── */
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('celuaccel-theme');
    if (saved) return saved === 'dark';
    // Respeta la preferencia del sistema operativo si no hay preferencia guardada
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme',    isDark ? 'dark' : 'light');
    root.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('celuaccel-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(v => !v);
  const c = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, c }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
};

export default ThemeContext;
