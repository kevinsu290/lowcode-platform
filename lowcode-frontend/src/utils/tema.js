export function getTemaGuardado() {
  try { return localStorage.getItem('lc-theme'); } catch { return null; }
}

export function setTemaGuardado(mode /* 'light' | 'dark' | null */) {
  try {
    if (mode) localStorage.setItem('lc-theme', mode);
    else localStorage.removeItem('lc-theme');
  } catch {}
}

export function aplicarTema(mode /* 'light' | 'dark' */) {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light'); // ✅ NO remover atributo
  }
}
    