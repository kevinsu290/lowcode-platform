// lowcode-frontend/src/paginas/Preferencias.jsx
import { useEffect, useRef, useState } from 'react';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';

const DEFAULT_PREFS = {
  escala_fuente: 1.0,       // 0.85 - 1.50
  tipografia: 'system-ui',  // ver opciones del <select> abajo
};

function useDebouncedCallback(cb, delay = 120) {
  const t = useRef(null);
  return (...args) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => cb(...args), delay);
  };
}

/** Carga la fuente si falta (idempotente) */
function applyFontsIfNeeded(tipografia) {
  const head = document.head;
  const ensureLink = (id, href) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    head.appendChild(link);
  };

  switch (tipografia) {
    case 'Atkinson Hyperlegible':
      ensureLink(
        'font-atkinson',
        'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap'
      );
      break;
    case 'OpenDyslexic':
      ensureLink(
        'font-opendyslexic',
        'https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/webfonts/OpenDyslexic.css'
      );
      break;
    case 'Inter':
      ensureLink(
        'font-inter',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
      );
      break;
    case 'Roboto':
      ensureLink(
        'font-roboto',
        'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
      );
      break;
    case 'Source Sans 3':
      ensureLink(
        'font-source-sans-3',
        'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap'
      );
      break;
    case 'Montserrat':
      ensureLink(
        'font-montserrat',
        'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
      );
      break;
    case 'Lexend':
      ensureLink(
        'font-lexend',
        'https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap'
      );
      break;
    case 'Noto Sans':
      ensureLink(
        'font-noto-sans',
        'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap'
      );
      break;
    default:
      // system-ui no necesita carga
      break;
  }
}

function fontStack(tipografia) {
  switch (tipografia) {
    case 'Atkinson Hyperlegible':
      return `'Atkinson Hyperlegible', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
    case 'OpenDyslexic':
      return `'OpenDyslexic', 'OpenDyslexic3', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
    case 'Inter':
      return `'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
    case 'Roboto':
      return `'Roboto', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
    case 'Source Sans 3':
      return `'Source Sans 3', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
    case 'Montserrat':
      return `'Montserrat', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
    case 'Lexend':
      return `'Lexend', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
    case 'Noto Sans':
      return `'Noto Sans', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
    default:
      return `system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif`;
  }
}

/** Aplica SOLO tamaño y tipografía al DOM */
function applyPrefsToDOM(prefs) {
  const { escala_fuente, tipografia } = prefs || DEFAULT_PREFS;
  const body = document.body;

  // Escala de fuente
  const pct = Math.round((escala_fuente || 1) * 100);
  body.style.fontSize = `${pct}%`;

  // Tipografía
  applyFontsIfNeeded(tipografia);
  body.style.fontFamily = fontStack(tipografia);
}

export default function Preferencias() {
  const [f, setF] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const loadedRef = useRef(false);

  // Hidratar rápido desde localStorage para evitar parpadeo
  useEffect(() => {
    try {
      const raw = localStorage.getItem('prefs');
      if (raw) {
        const parsed = JSON.parse(raw);
        const prefs = {
          escala_fuente: Number(parsed.escala_fuente ?? DEFAULT_PREFS.escala_fuente),
          tipografia: parsed.tipografia ?? DEFAULT_PREFS.tipografia,
        };
        setF(prefs);
        applyPrefsToDOM(prefs);
      }
    } catch {}
  }, []);

  // Cargar desde backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setMsg('');
        const { data } = await cliente.get('/usuarios/mis-preferencias');
        const prefs = {
          escala_fuente: Number(data?.escala_fuente ?? DEFAULT_PREFS.escala_fuente),
          tipografia: data?.tipografia ?? DEFAULT_PREFS.tipografia,
        };
        if (mounted) {
          setF(prefs);
          applyPrefsToDOM(prefs);
          localStorage.setItem('prefs', JSON.stringify(prefs));
        }
      } catch {
        // si falla, mantenemos lo ya aplicado (posible localStorage)
      } finally {
        if (mounted) {
          loadedRef.current = true;
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Aplicación en vivo (y persistencia) cuando ya cargó algo
  const debouncedApply = useDebouncedCallback((prefs) => {
    applyPrefsToDOM(prefs);
    localStorage.setItem('prefs', JSON.stringify(prefs));
  }, 60);

  useEffect(() => {
    if (loadedRef.current) debouncedApply(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.escala_fuente, f.tipografia]);

  async function guardar() {
    try {
      setSaving(true);
      setMsg('');
      await cliente.patch('/usuarios/mis-preferencias', f);
      localStorage.setItem('prefs', JSON.stringify(f));
      setMsg('Preferencias guardadas.');
    } catch {
      setMsg('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  function restablecer() {
    setF(DEFAULT_PREFS);
    applyPrefsToDOM(DEFAULT_PREFS);
    localStorage.setItem('prefs', JSON.stringify(DEFAULT_PREFS));
    setMsg('Preferencias restablecidas (sin guardar).');
  }

  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container grid grid-2">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Accesibilidad</h3>

              {loading ? (
                <div className="badge" style={{marginTop:8}}>Cargando…</div>
              ) : (
                <div className="stack" style={{ marginTop: 8 }}>
                  {/* Escala de fuente */}
                  <label className="label">
                    Tamaño de letra <span className="muted">({(f.escala_fuente || 1).toFixed(2)}×)</span>
                  </label>
                  <input
                    className="input"
                    type="range"
                    min={0.85}
                    max={1.5}
                    step={0.05}
                    value={Number(f.escala_fuente)}
                    onChange={(e)=>setF(prev=>({ ...prev, escala_fuente: Number(e.target.value) }))}
                    aria-label="Escala de fuente"
                  />

                  {/* Tipografía */}
                  <label className="label" style={{ marginTop: 8 }}>Tipografía</label>
                  <select
                    className="select"
                    value={f.tipografia}
                    onChange={(e)=>setF(prev=>({ ...prev, tipografia:e.target.value }))}
                    aria-label="Tipografía"
                  >
                    <option>system-ui</option>
                    <option>Atkinson Hyperlegible</option>
                    <option>OpenDyslexic</option>
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Source Sans 3</option>
                    <option>Montserrat</option>
                    <option>Lexend</option>
                    <option>Noto Sans</option>
                  </select>

                  {/* Acciones */}
                  <div className="row" style={{ justifyContent:'flex-end', marginTop: 12, gap:8 }}>
                    <button className="btn" type="button" onClick={restablecer}>Restablecer</button>
                    <button className="btn btn-primary" type="button" onClick={guardar} disabled={saving}>
                      {saving ? 'Guardando…' : 'Guardar'}
                    </button>
                  </div>

                  {msg && (
                    <div
                      className="badge"
                      style={{
                        marginTop:8,
                        borderColor: msg.includes('no se pudo') ? 'var(--danger)' : 'var(--brand)',
                        background: msg.includes('no se pudo') ? 'rgba(255,107,107,.12)' : 'rgba(99,102,241,.10)'
                      }}
                    >
                      {msg}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Vista previa */}
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Vista previa</h3>
              <p className="muted">Así se verá tu interfaz con las preferencias aplicadas.</p>

              <div className="card" style={{ marginTop: 10 }}>
                <div className="card-body">
                  <p style={{ marginBottom: 8 }}>
                    Texto de ejemplo — “Los bloques de código se construyen mejor con buena accesibilidad”.
                  </p>
                  <div className="row" style={{ gap:8 }}>
                    <button className="btn">Botón</button>
                    <button className="btn btn-primary">Primario</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
