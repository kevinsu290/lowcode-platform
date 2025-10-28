// lowcode-frontend/src/paginas/Diagnostico.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';

function Progress({ step, total }) {
  const safeTotal = Math.max(1, total || 0);
  const pct = Math.round(((step + 1) / safeTotal) * 100);
  return (
    <div
      style={{
        width: '100%',
        background: 'var(--surface-2)',
        border: 'var(--border)',
        borderRadius: 999,
        overflow: 'hidden',
        height: 10
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--brand), #8b5cf6)',
          height: '100%',
          transition: 'width .25s'
        }}
      />
    </div>
  );
}

function OpcionCard({ id, name, label, checked, disabled, onChange }) {
  return (
    <label
      htmlFor={`${name}-${id}`}
      className="row"
      style={{
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        border: 'var(--border)',
        borderRadius: 12,
        background: checked ? 'rgba(99,102,241,.08)' : 'var(--surface)',
        boxShadow: checked ? 'var(--shadow-1)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .7 : 1
      }}
    >
      <input
        id={`${name}-${id}`}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ transform: 'scale(1.1)' }}
      />
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{label}</span>
    </label>
  );
}

export default function Diagnostico() {
  const wrapRef = useRef(null);

  const [pregs, setPregs] = useState([]);
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState({}); // { [preguntaId]: opcionId }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [enviando, setEnviando] = useState(false);
  const total = pregs.length;

  // Cargar formulario
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const { data } = await cliente.get('/diagnostico/form');
        if (mounted) setPregs(Array.isArray(data?.preguntas) ? data.preguntas : []);
      } catch {
        if (mounted) setErr('No se pudo cargar el diagnóstico.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Bloquear navegación mientras se responde
  useEffect(() => {
    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);

    // Capa que cubre el header para que no se pueda clickear el Nav
    const cover = document.createElement('div');
    cover.setAttribute('id', 'diagnostico-nav-cover');
    Object.assign(cover.style, {
      position: 'fixed', top: 0, left: 0, right: 0, height: '96px',
      zIndex: 9999, background: 'transparent'
    });
    document.body.appendChild(cover);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.getElementById('diagnostico-nav-cover')?.remove();
    };
  }, []);

  const p = pregs[step];
  const completaActual = useMemo(() => {
    if (!p) return false;
    return Boolean(sel[p.id]);
  }, [sel, p]);

  function goPrev() {
    setStep(s => Math.max(0, s - 1));
  }
  function goNext() {
    setStep(s => Math.min(total - 1, s + 1));
  }

  // Navegación con teclado
  useEffect(() => {
    function onKey(e) {
      if (!p || enviando) return;
      const opciones = p.opciones || [];
      const currentIdx = opciones.findIndex(op => op.id === sel[p.id]);

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        // mover selección a la siguiente opción
        e.preventDefault();
        const next = opciones[(currentIdx + 1 + opciones.length) % opciones.length];
        if (next) setSel(prev => ({ ...prev, [p.id]: next.id }));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        // mover selección a la anterior opción
        e.preventDefault();
        const prevOp = opciones[(currentIdx - 1 + opciones.length) % opciones.length];
        if (prevOp) setSel(prev => ({ ...prev, [p.id]: prevOp.id }));
      } else if (e.key === 'Enter') {
        // avanzar si se seleccionó algo, o finalizar si es la última
        if (completaActual) {
          if (step < total - 1) goNext();
          else enviar();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, sel, completaActual, step, total, enviando]);

  async function enviar() {
    if (enviando) return;
    try {
      setEnviando(true);
      setErr('');
      const respuestas = pregs.map(q => ({ preguntaId: q.id, opcionId: sel[q.id] || null }));
      await cliente.post('/diagnostico', { respuestas });
      window.location.assign('/'); // éxito: ir a inicio
    } catch (e) {
      const msg = e?.response?.data?.error || 'No se pudo enviar el diagnóstico.';
      setErr(msg);
    } finally {
      setEnviando(false);
    }
  }

  async function omitir() {
    if (enviando) return;
    const ok = window.confirm('¿Omitir el diagnóstico y asignar el nivel Principiante?');
    if (!ok) return;
    try {
      setEnviando(true);
      setErr('');
      await cliente.post('/diagnostico/omitir');
      window.location.assign('/'); // éxito
    } catch (e) {
      const msg = e?.response?.data?.error || 'No se pudo omitir el diagnóstico.';
      setErr(msg);
    } finally {
      setEnviando(false);
    }
  }

  if (loading && !total) {
    return (
      <>
        <Nav />
        <section className="section">
          <div className="container">
            <div className="badge">Cargando…</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Nav />
      <section className="section" ref={wrapRef}>
        <div className="container" style={{ maxWidth: 860 }}>
          {/* Héroe */}
          <div className="card card--hero">
            <div className="card-body">
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="stack">
                  <div className="row" style={{ alignItems: 'center', gap: 10 }}>
                    <span className="brand-dot"></span>
                    <h2 style={{ margin: 0 }}>Examen de ubicación</h2>
                    <span className="badge badge--gradient">Esto es muy importante!</span>
                  </div>
                  <span className="muted" style={{ maxWidth: 760 }}>
                    Responde estas preguntas rápidas para ubicarte en el nivel adecuado.
                    Toma menos de 2 minutos. Puedes usar el teclado (↑/↓ para elegir, Enter para continuar).
                  </span>
                </div>
                <div style={{ minWidth: 240 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Progreso</div>
                  <Progress step={step} total={Math.max(1, total)} />
                  <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
                    <span className="muted">Pregunta <b>{Math.min(step + 1, total)}</b> / {total || 0}</span>
                    <span className="muted">{total ? `${Math.round(((step + 1) / total) * 100)}%` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {err && (
            <div
              className="badge"
              style={{ borderColor: 'var(--danger)', background: 'rgba(255,107,107,.12)', marginTop: 12 }}
            >
              {err}
            </div>
          )}

          {/* Pregunta */}
          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-body">
              {p ? (
                <>
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>{p.titulo}</h3>
                    <span className="muted">Pregunta {step + 1} de {total}</span>
                  </div>
                  <p className="muted" style={{ marginTop: 8 }}>{p.pregunta}</p>

                  <div className="stack" style={{ marginTop: 12, gap: 10 }}>
                    {p.opciones.map(op => (
                      <OpcionCard
                        key={op.id}
                        id={op.id}
                        name={`q-${p.id}`}
                        label={op.label}
                        checked={sel[p.id] === op.id}
                        disabled={enviando}
                        onChange={() => setSel(prev => ({ ...prev, [p.id]: op.id }))}
                      />
                    ))}
                  </div>

                  <div className="row" style={{ justifyContent: 'space-between', marginTop: 16, gap: 8, flexWrap: 'wrap' }}>
                    <div className="row" style={{ gap: 8 }}>
                      <button
                        className="btn"
                        type="button"
                        onClick={goPrev}
                        disabled={step === 0 || enviando}
                      >
                        Anterior
                      </button>

                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={omitir}
                        disabled={enviando}
                        title="Asignar directamente el nivel Principiante y saltar el cuestionario"
                      >
                        Omitir y asignar Principiante
                      </button>
                    </div>

                    {step < total - 1 ? (
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={goNext}
                        disabled={!completaActual || enviando}
                      >
                        Siguiente
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={enviar}
                        disabled={!completaActual || enviando}
                      >
                        {enviando ? 'Guardando…' : 'Finalizar y asignar nivel'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="muted">Sin preguntas disponibles.</p>
              )}
            </div>
          </div>

          <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
            Nota: este diagnóstico se realiza solo una vez. Más adelante podrás avanzar de nivel al completar ejercicios y encuestas.
          </p>
        </div>
      </section>
    </>
  );
}
