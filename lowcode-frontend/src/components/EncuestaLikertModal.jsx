// lowcode-frontend/src/components/EncuestaLikertModal.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import cliente from '../api/cliente.js';

export default function EncuestaLikertModal({ open, onClose, ejercicioId, nivelId }) {
  const [motivacion, setMotivacion] = useState(3);
  const [compromiso, setCompromiso] = useState(3);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  // Si no está abierta, no renderizamos
  if (!open) return null;

  // Foco inicial en la primera opción/textarea
  useEffect(() => {
    setError('');
    setOk(false);
    // Opcional: foco al primer control significativo
    const t = setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [open]);

  // ESC para cerrar (si no está enviando)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !enviando) {
        onClose?.();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enviando, onClose]);

  async function enviar() {
    try {
      setEnviando(true);
      setError('');
      await cliente.post('/encuestas/likert', {
        ejercicio_id: ejercicioId,
        nivel_id: nivelId,
        motivacion,
        compromiso,
        comentario: comentario.trim() || null,
      });
      setOk(true);
      // Cierra suave tras un pequeño delay
      setTimeout(() => onClose?.(), 900);
    } catch (e) {
      setError('No se pudo enviar la encuesta. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  const chars = comentario.length;
  const maxChars = 300;
  const restante = useMemo(() => Math.max(0, maxChars - chars), [chars]);

  function Likert({ label, value, state, onChange, name }) {
    const selected = state === value;
    return (
      <button
        type="button"
        className={`likert-btn ${selected ? 'is-selected' : ''}`}
        aria-pressed={selected}
        onClick={() => onChange(value)}
        disabled={enviando}
      >
        {value}
      </button>
    );
  }

  return (
    <div className="lk-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="lk-title">
      <div className="lk-modal">
        <h3 id="lk-title" className="lk-title">Encuesta rápida</h3>
        <p className="lk-muted" style={{ marginTop: -6 }}>
          ¡Gracias por completar el ejercicio! Cuéntanos cómo te sientes:
        </p>

        <div className="lk-stack">
          <div className="lk-block">
            <b>Motivación para seguir usando la plataforma</b>
            <div className="likert-row" role="radiogroup" aria-label="Motivación">
              {[1,2,3,4,5].map(n => (
                <Likert
                  key={n}
                  name="motivacion"
                  value={n}
                  state={motivacion}
                  onChange={setMotivacion}
                />
              ))}
            </div>
            <div className="likert-legend">
              <span className="lk-muted">Baja</span>
              <span className="lk-muted">Alta</span>
            </div>
          </div>

          <div className="lk-block">
            <b>Compromiso de continuar practicando</b>
            <div className="likert-row" role="radiogroup" aria-label="Compromiso">
              {[1,2,3,4,5].map(n => (
                <Likert
                  key={n}
                  name="compromiso"
                  value={n}
                  state={compromiso}
                  onChange={setCompromiso}
                />
              ))}
            </div>
            <div className="likert-legend">
              <span className="lk-muted">Bajo</span>
              <span className="lk-muted">Alto</span>
            </div>
          </div>

          <div className="lk-block">
            <label className="lk-muted" htmlFor="lk-comment">Comentario (opcional)</label>
            <textarea
              id="lk-comment"
              ref={textareaRef}
              rows={3}
              maxLength={maxChars}
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="¿Algo que te haya gustado o te haya costado?"
              className="lk-textarea"
              disabled={enviando}
            />
            <div className="lk-row" style={{ justifyContent:'space-between', marginTop: 6 }}>
              <span className="lk-muted" style={{ fontSize: 12 }}>Gracias por tu retroalimentación 🙌</span>
              <span className="lk-muted" style={{ fontSize: 12 }}>{restante} / {maxChars}</span>
            </div>
          </div>

          {error && (
            <div className="lk-badge lk-badge-danger" role="status">
              {error}
            </div>
          )}
        </div>

        <div className="lk-row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="lk-btn" onClick={onClose} disabled={enviando}>Cerrar</button>
          <button className="lk-btn lk-btn-primary" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando…' : (ok ? '¡Gracias!' : 'Enviar')}
          </button>
        </div>
      </div>

      {/* Estilos locales, respetando tus CSS vars */}
      <style>{`
        .lk-modal-backdrop{
          position:fixed; inset:0;
          background:rgba(0,0,0,.28);
          display:flex; align-items:center; justify-content:center;
          z-index:999;
          padding: 16px;
        }
        .lk-modal{
          background:var(--surface, #fff);
          color:var(--text, #111);
          border-radius:14px;
          max-width:620px; width:100%;
          padding:20px 20px 16px;
          box-shadow: var(--shadow-2, 0 10px 30px rgba(0,0,0,.15));
          border: var(--border, 1px solid #e5e7eb);
        }
        .lk-title{ margin:0 0 4px 0; }
        .lk-muted{ color: var(--muted, #6b7280); }
        .lk-stack > * + * { margin-top: 14px; }
        .lk-row { display:flex; align-items:center; }
        .lk-block { display:block; }

        .likert-row{
          display:flex; gap:10px; margin-top:8px; flex-wrap:wrap;
        }
        .likert-legend{
          display:flex; justify-content:space-between; margin-top:6px;
        }

        .likert-btn{
          min-width:42px; height:42px;
          border-radius:12px;
          border: var(--border, 1px solid #e5e7eb);
          background: var(--surface, #fff);
          color: var(--text, #111);
          font-weight: 600;
          cursor: pointer;
          display:flex; align-items:center; justify-content:center;
          box-shadow: none;
          transition: transform .06s ease, box-shadow .12s ease, background .12s ease;
        }
        .likert-btn:hover{ transform: translateY(-1px); box-shadow: var(--shadow-1, 0 4px 12px rgba(0,0,0,.06)); }
        .likert-btn:focus{ outline: 2px solid rgba(99,102,241,.35); outline-offset: 2px; }
        .likert-btn.is-selected{
          background: rgba(99,102,241,.10);
          border-color: rgba(99,102,241,.55);
          box-shadow: var(--shadow-1, 0 4px 12px rgba(0,0,0,.06));
        }
        .lk-textarea{
          width:100%;
          border: var(--border, 1px solid #e5e7eb);
          background: var(--surface, #fff);
          color: var(--text, #111);
          border-radius:10px;
          padding:10px 12px;
          resize: vertical;
        }

        .lk-btn{
          border: var(--border, 1px solid #d1d5db);
          background: var(--surface, #fff);
          color: var(--text, #111);
          padding:8px 12px; border-radius:10px; cursor:pointer;
          transition: background .12s ease, box-shadow .12s ease, transform .06s ease;
        }
        .lk-btn:hover{ box-shadow: var(--shadow-1, 0 4px 12px rgba(0,0,0,.06)); transform: translateY(-1px); }
        .lk-btn:disabled{ opacity:.6; cursor:not-allowed; transform:none; }

        .lk-btn-primary{
          background: var(--brand, #6366f1);
          color:#fff;
          border-color: var(--brand, #6366f1);
        }

        .lk-badge{
          border: 1px solid var(--brand, #6366f1);
          background: rgba(99,102,241,.10);
          padding: 8px 10px;
          border-radius: 10px;
          color: var(--text, #111);
        }
        .lk-badge-danger{
          border-color: var(--danger, #ef4444);
          background: rgba(239,68,68,.10);
        }
      `}</style>
    </div>
  );
}
