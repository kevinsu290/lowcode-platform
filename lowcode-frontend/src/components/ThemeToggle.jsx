import { useEffect, useState } from 'react';
import { aplicarTema, getTemaGuardado, setTemaGuardado } from '../utils/tema.js';

const Sun = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M6.76 4.84 5.34 3.41 3.41 5.34l1.41 1.41 1.94-1.91zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.66 2.34 1.41-1.41-1.93-1.93-1.41 1.41 1.93 1.93zM17 13h3v-2h-3v2zM6.76 19.16l-1.94 1.93 1.41 1.41 1.94-1.93-1.41-1.41zM11 23h2v-3h-2v3zM3.41 18.66 5.34 17l-1.41-1.41-1.93 1.93 1.41 1.14zM12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/>
  </svg>
);

const Moon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function ThemeToggle({ className = '' }) {
  const [mode, setMode] = useState('light'); // 'light' | 'dark'

  useEffect(() => {
    const saved = getTemaGuardado();
    if (saved === 'dark') {
      setMode('dark'); aplicarTema('dark');
    } else if (saved === 'light') {
      setMode('light'); aplicarTema('light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const m = prefersDark ? 'dark' : 'light';
      setMode(m); aplicarTema(m);
    }
  }, []);

  function toggle() {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    aplicarTema(next);
    setTemaGuardado(next);
  }

  return (
    <button
      className={`pill-toggle ${className}`}
      onClick={toggle}
      type="button"
      aria-label={mode === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
    >
      <span className={`pill-thumb ${mode === 'dark' ? 'is-right' : 'is-left'}`} />
      <span className="pill-icons">
        <Sun style={{opacity: mode === 'light' ? 1 : .5}}/>
        <Moon style={{opacity: mode === 'dark' ? 1 : .5}}/>
      </span>
      <span className="pill-label">{mode === 'dark' ? 'Oscuro' : 'Claro'}</span>
    </button>
  );
}
